use twilight_http::client::InteractionClient;
use twilight_model::application::command::{Command, CommandType};
use twilight_model::application::interaction::application_command::CommandData;
use twilight_model::application::interaction::Interaction;
use twilight_util::builder::command::CommandBuilder;

use crate::bot::commands::{simple_response, InteractionResult};
use crate::CONFIG;

pub fn command_definition() -> Command {
    CommandBuilder::new(
        "help",
        "Join our Discord Server to get support",
        CommandType::ChatInput,
    )
    .build()
}

pub async fn handle_command(
    http: InteractionClient<'_>,
    interaction: Interaction,
    _cmd: Box<CommandData>,
) -> InteractionResult {
    simple_response(
        &http,
        interaction.id,
        &interaction.token,
        format!(
            "You can join our Discord Server with the following link: {}",
            CONFIG.links.discord_invite
        ),
    )
    .await?;
    Ok(())
}
