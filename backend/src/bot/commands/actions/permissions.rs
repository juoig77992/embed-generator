use twilight_model::guild::Permissions;
use twilight_model::id::marker::UserMarker;
use twilight_model::id::Id;

use crate::bot::commands::InteractionError;
use crate::bot::message::MessageAction;
use crate::bot::DISCORD_CACHE;
use crate::db::models::{ChannelMessageAuthorModel, MessageModel};

pub struct DerivedActionPermissionsContext {
    user_id: Id<UserMarker>,
    permissions: Permissions,
    highest_role_position: i64,
}

pub enum ActionPermissionsContext {
    Allow,
    Deny,
    Derived(DerivedActionPermissionsContext),
}

impl From<&ChannelMessageAuthorModel> for ActionPermissionsContext {
    fn from(a: &ChannelMessageAuthorModel) -> Self {
        Self::Derived(DerivedActionPermissionsContext {
            user_id: a.id,
            permissions: a.permissions,
            highest_role_position: a
                .role_ids
                .iter()
                .flat_map(|i| DISCORD_CACHE.role(*i).map(|r| r.position))
                .max()
                .unwrap_or(0),
        })
    }
}

impl ActionPermissionsContext {
    pub async fn check_action(
        &self,
        action: &MessageAction,
    ) -> Result<Result<(), String>, InteractionError> {
        let ctx = match self {
            ActionPermissionsContext::Derived(ctx) => ctx,
            ActionPermissionsContext::Allow => return Ok(Ok(())),
            ActionPermissionsContext::Deny => {
                return Ok(Err("This message can't perform any actions.".to_string()))
            }
        };

        match action {
            MessageAction::ResponseSavedMessage { message_id, .. } => {
                if !MessageModel::exists_by_owner_id_and_id(ctx.user_id, message_id).await? {
                    return Ok(Err("The response message doesn't exist.".to_string()));
                }
            }
            MessageAction::RoleToggle { role_id } => match DISCORD_CACHE.role(*role_id) {
                Some(role) => {
                    if !ctx.permissions.contains(Permissions::MANAGE_ROLES)
                        || role.position > ctx.highest_role_position
                    {
                        return Ok(Err(format!("The original author (<@{}>) of this message doesn't have permissions to toggle this role.", ctx.user_id)));
                    }
                }
                None => return Ok(Err("Role to toggle doesn't exist.".to_string())),
            },
            MessageAction::Unknown => {}
        }

        Ok(Ok(()))
    }
}
