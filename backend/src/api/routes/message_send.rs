use std::collections::HashMap;

use actix_web::post;
use actix_web::web::{Json, ReqData};
use data_url::DataUrl;
use lazy_static::lazy_static;
use twilight_model::channel::ChannelType;
use twilight_model::guild::{Member, Permissions};
use twilight_model::http::attachment::Attachment;
use twilight_model::id::Id;

use crate::api::response::{MessageSendError, RouteError, RouteResult};
use crate::api::wire::{MessageSendRequestWire, MessageSendResponseWire, MessageSendTargetWire};
use crate::bot::message::MessagePayload;
use crate::bot::message::{MessageHashIntegrity, MessageVariablesReplace, ToMessageVariables};
use crate::bot::permissions::get_member_permissions_for_channel;
use crate::bot::webhooks::{get_webhooks_for_channel, CachedWebhook};
use crate::bot::{DISCORD_CACHE, DISCORD_HTTP};
use crate::config::CONFIG;
use crate::db::models::{ChannelMessageAuthorModel, ChannelMessageModel, GuildsWithAccessModel};
use crate::tokens::TokenClaims;
use crate::util::unix_now_mongodb;

const ICON_BYTES: &[u8] = include_bytes!("../../../../frontend/public/logo128.png");

lazy_static! {
    static ref ICON_DATA_URL: String =
        format!("data:image/png;base64,{}", base64::encode(ICON_BYTES));
}

#[post("/messages/send")]
pub async fn route_message_send(
    req: Json<MessageSendRequestWire>,
    token: ReqData<TokenClaims>,
) -> RouteResult<MessageSendResponseWire> {
    let req = req.into_inner();

    let attachments: Vec<Attachment> = req
        .attachments
        .into_iter()
        .enumerate()
        .filter_map(|(i, a)| {
            let body = DataUrl::process(&a.data_url)
                .ok()
                .and_then(|d| d.decode_to_vec().ok().map(|b| b.0));

            let filename = a
                .name
                .chars()
                .filter(|c| (c.is_ascii_alphanumeric() || *c == '.' || *c == '-' || *c == '_'))
                .collect();

            match body {
                Some(body) => Some(Attachment {
                    filename,
                    description: a.description,
                    file: body,
                    id: i as u64,
                }),
                None => None,
            }
        })
        .collect();

    let mut variables = HashMap::new();
    let mut payload: MessagePayload = serde_json::from_str(&req.payload_json).unwrap();

    let (webhook_id, webhook_token, thread_id, message_id, model) = match req.target {
        MessageSendTargetWire::Webhook {
            webhook_id,
            webhook_token,
            thread_id,
            message_id,
        } => {
            payload.components = vec![]; // Manual webhooks don't support components
            (webhook_id, webhook_token, thread_id, message_id, None)
        }
        MessageSendTargetWire::Channel {
            guild_id,
            channel_id,
            message_id,
        } => {
            if !GuildsWithAccessModel::check_user_access_to_guild(token.user_id, guild_id).await? {
                return Err(RouteError::MissingGuildAccess);
            }

            let channel = DISCORD_CACHE
                .channel(channel_id)
                .ok_or(RouteError::NotFound {
                    entity: "channel".into(),
                })?;

            if channel.guild_id != Some(guild_id) {
                return Err(RouteError::GuildChannelMismatch);
            }

            let guild = DISCORD_CACHE.guild(guild_id).ok_or(RouteError::NotFound {
                entity: "guild".into(),
            })?;

            let bot_user_id = CONFIG.discord.oauth_client_id.cast();
            let bot_member = DISCORD_CACHE.member(guild_id, CONFIG.discord.oauth_client_id.cast());
            let bot_perms = match bot_member {
                Some(m) => {
                    get_member_permissions_for_channel(bot_user_id, m.roles(), guild_id, channel_id)
                        .unwrap_or(Permissions::empty())
                }
                None => Permissions::empty(),
            };

            if !bot_perms.contains(Permissions::MANAGE_WEBHOOKS) {
                return Err(RouteError::BotMissingChannelAccess);
            }

            let member: Member = DISCORD_HTTP
                .guild_member(guild_id, token.user_id)
                .exec()
                .await?
                .model()
                .await
                .unwrap();

            let perms = get_member_permissions_for_channel(
                token.user_id,
                &member.roles,
                guild_id,
                channel_id,
            )
            .unwrap_or(Permissions::empty());

            if !perms.contains(Permissions::MANAGE_WEBHOOKS) {
                return Err(RouteError::MissingChannelAccess);
            }

            let model = ChannelMessageModel {
                channel_id,
                message_id: Id::new(1),
                hash: payload.integrity_hash(),
                created_at: unix_now_mongodb(),
                updated_at: unix_now_mongodb(),
                author: Some(ChannelMessageAuthorModel {
                    id: token.user_id,
                    is_owner: guild.owner_id() == token.user_id,
                    permissions: perms,
                    role_ids: member.roles.clone(),
                }),
            };

            let (channel_id, thread_id) = match channel.kind {
                ChannelType::GuildPrivateThread
                | ChannelType::GuildPublicThread
                | ChannelType::GuildNewsThread => (channel.parent_id.unwrap(), Some(channel.id)),
                ChannelType::GuildText | ChannelType::GuildNews => (channel.id, None),
                _ => return Err(RouteError::UnsupportedChannelType),
            };

            channel.to_message_variables(&mut variables);
            guild.to_message_variables(&mut variables);

            let existing_webhooks: Vec<CachedWebhook> =
                get_webhooks_for_channel(channel_id).await?;
            let existing_webhook_count = existing_webhooks.len();
            let existing_webhook = existing_webhooks
                .into_iter()
                .find(|w| w.application_id == Some(CONFIG.discord.oauth_client_id));
            if let Some(webhook) = existing_webhook {
                (
                    webhook.id,
                    webhook.token.unwrap(),
                    thread_id,
                    message_id,
                    Some(model),
                )
            } else if existing_webhook_count >= 10 {
                return Err(RouteError::ChannelWebhookLimitReached);
            } else {
                let webhook = DISCORD_HTTP
                    .create_webhook(channel_id, "Embed Generator")
                    .unwrap()
                    .avatar(&ICON_DATA_URL)
                    .exec()
                    .await?
                    .model()
                    .await
                    .unwrap();

                (
                    webhook.id,
                    webhook.token.unwrap(),
                    thread_id,
                    message_id,
                    Some(model),
                )
            }
        }
    };

    payload.replace_variables(&variables);
    let payload_json = serde_json::to_vec(&payload).unwrap();
    let res = if let Some(message_id) = message_id {
        let mut update_req =
            DISCORD_HTTP.update_webhook_message(webhook_id, &webhook_token, message_id);
        if let Some(thread_id) = thread_id {
            update_req = update_req.thread_id(thread_id)
        }

        update_req
            .payload_json(&payload_json)
            .attachments(&attachments)
            .unwrap()
            .exec()
            .await
            .map_err(MessageSendError::from)?;

        Ok(message_id)
    } else {
        let mut exec_req = DISCORD_HTTP.execute_webhook(webhook_id, &webhook_token);
        if let Some(thread_id) = thread_id {
            exec_req = exec_req.thread_id(thread_id);
        }

        let msg = exec_req
            .payload_json(&payload_json)
            .attachments(&attachments)
            .unwrap()
            .wait()
            .exec()
            .await
            .map_err(MessageSendError::from)?
            .model()
            .await
            .unwrap();

        Ok(msg.id)
    };

    match res {
        Ok(message_id) => {
            if let Some(mut model) = model {
                model.message_id = message_id;
                model.update_or_create().await?;
            }

            Ok(Json(MessageSendResponseWire { message_id }.into()))
        }
        Err(e) => Err(e),
    }
}
