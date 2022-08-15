use std::collections::HashMap;

use twilight_http::client::InteractionClient;
use twilight_model::application::interaction::Interaction;
use twilight_model::channel::message::MessageFlags;
use twilight_model::http::interaction::{
    InteractionResponse, InteractionResponseData, InteractionResponseType,
};

pub use permissions::*;

use crate::bot::commands::{simple_response, InteractionResult};
use crate::bot::message::{
    MessageAction, MessagePayload, MessageVariablesReplace, ResponseSavedMessageFlags,
    ToMessageVariables,
};
use crate::bot::DISCORD_HTTP;
use crate::db::models::MessageModel;

mod permissions;

pub async fn handle_component_actions(
    http: &InteractionClient<'_>,
    interaction: &Interaction,
    actions: Vec<MessageAction>,
    perm_ctx: ActionPermissionsContext,
) -> InteractionResult {
    for action in actions {
        if let Err(e) = perm_ctx.check_action(&action).await? {
            simple_response(
                http,
                interaction.id,
                &interaction.token,
                e,
            )
            .await?;
            return Ok(())
        }

        match action {
            MessageAction::Unknown => {}
            MessageAction::ResponseSavedMessage { message_id, flags } => {
                match MessageModel::find_by_id(&message_id).await? {
                    Some(model) => {
                        match serde_json::from_str::<MessagePayload>(&model.payload_json) {
                            Ok(mut payload) => {
                                let mut variables = HashMap::new();
                                interaction.to_message_variables(&mut variables);
                                payload.replace_variables(&variables);

                                let response_kind =
                                    if flags.contains(ResponseSavedMessageFlags::EDIT) {
                                        InteractionResponseType::UpdateMessage
                                    } else {
                                        InteractionResponseType::ChannelMessageWithSource
                                    };

                                http.create_response(
                                    interaction.id,
                                    &interaction.token,
                                    &InteractionResponse {
                                        kind: response_kind,
                                        data: Some(InteractionResponseData {
                                            content: payload.content,
                                            components: Some(payload.components),
                                            embeds: Some(
                                                payload
                                                    .embeds
                                                    .into_iter()
                                                    .map(|e| e.into())
                                                    .collect(),
                                            ),
                                            flags: Some(MessageFlags::EPHEMERAL),
                                            ..Default::default()
                                        }),
                                    },
                                )
                                .exec()
                                .await?;
                            }
                            Err(_) => {
                                simple_response(
                                    http,
                                    interaction.id,
                                    &interaction.token,
                                    "Invalid response message".into(),
                                )
                                .await?;
                            }
                        };
                    }
                    None => {
                        simple_response(
                            http,
                            interaction.id,
                            &interaction.token,
                            "Response message not found".into(),
                        )
                        .await?;
                    }
                }
            }
            MessageAction::RoleToggle { role_id } => {
                let member = interaction.member.as_ref().unwrap();
                let user_id = member.user.as_ref().unwrap().id;
                let guild_id = interaction.guild_id.unwrap();
                if member.roles.contains(&role_id) {
                    match DISCORD_HTTP
                        .remove_guild_member_role(guild_id, user_id, role_id)
                        .exec()
                        .await
                    {
                        Ok(_) => {
                            simple_response(
                                http,
                                interaction.id,
                                &interaction.token,
                                format!("You no longer have the <@&{}> role", role_id),
                            )
                            .await?;
                        }
                        Err(_) => {
                            simple_response(
                                http,
                                interaction.id,
                                &interaction.token,
                                "Failed to remove role. Does the bot have permissions to remove this role?".into(),
                            )
                            .await?;
                        }
                    }
                } else {
                    match DISCORD_HTTP
                        .add_guild_member_role(guild_id, user_id, role_id)
                        .exec()
                        .await
                    {
                        Ok(_) => {
                            simple_response(
                                http,
                                interaction.id,
                                &interaction.token,
                                format!("You now have the <@&{}> role", role_id),
                            )
                            .await?;
                        }
                        Err(_) => {
                            simple_response(
                                http,
                                interaction.id,
                                &interaction.token,
                                "Failed to add role. Does the bot have permissions to remove this role?".into(),
                            )
                            .await?;
                        }
                    }
                }
            }
        }
    }

    Ok(())
}
