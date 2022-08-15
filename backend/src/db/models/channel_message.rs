use futures_util::StreamExt;
use mongodb::bson::{DateTime, doc};
use mongodb::error::Error as MongoError;
use mongodb::options::UpdateOptions;
use mongodb::results::{DeleteResult, UpdateResult};
use serde::{Deserialize, Serialize};
use twilight_model::guild::Permissions;
use twilight_model::id::Id;
use twilight_model::id::marker::{ChannelMarker, MessageMarker, RoleMarker, UserMarker};

use crate::db::get_collection;

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct ChannelMessageAuthorModel {
    pub id: Id<UserMarker>,
    pub is_owner: bool,
    pub permissions: Permissions,
    pub role_ids: Vec<Id<RoleMarker>>,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct ChannelMessageModel {
    pub channel_id: Id<ChannelMarker>,
    pub message_id: Id<MessageMarker>,
    pub hash: String,
    pub created_at: DateTime,
    pub updated_at: DateTime,

    #[serde(default)]
    pub author: Option<ChannelMessageAuthorModel>,
}

impl ChannelMessageModel {
    pub async fn update_or_create(&self) -> Result<UpdateResult, MongoError> {
        get_collection::<Self>("channel_messages")
            .update_one(
                doc! {"message_id": self.message_id.to_string()},
                doc! {
                    "$set": {
                        "hash": &self.hash,
                        "updated_at": self.updated_at,
                    },
                    "$setOnInsert": {
                        "channel_id": self.channel_id.to_string(),
                        "message_id": self.message_id.to_string(),
                        "created_at": self.created_at,
                    }
                },
                UpdateOptions::builder().upsert(true).build(),
            )
            .await
    }

    pub async fn _exists_by_message_id_and_hash(
        message_id: Id<MessageMarker>,
        hash: &str,
    ) -> Result<bool, MongoError> {
        get_collection::<Self>("channel_messages")
            .count_documents(
                doc! {"message_id": message_id.to_string(), "hash": hash},
                None,
            )
            .await
            .map(|count| count > 0)
    }

    pub async fn find_by_message_id(
        message_id: Id<MessageMarker>,
    ) -> Result<Option<Self>, MongoError> {
        get_collection::<Self>("channel_messages")
            .find_one(doc! {"message_id": message_id.to_string()}, None)
            .await
    }

    pub async fn find_by_channel_id(
        channel_id: Id<ChannelMarker>,
    ) -> Result<Vec<Result<Self, MongoError>>, MongoError> {
        let cursor = get_collection::<Self>("channel_messages")
            .find(doc! {"channel_id": channel_id.to_string()}, None)
            .await?;

        Ok(cursor.collect().await)
    }

    pub async fn delete_by_message_id(
        message_id: Id<MessageMarker>,
    ) -> Result<DeleteResult, MongoError> {
        get_collection::<Self>("channel_messages")
            .delete_one(doc! {"message_id": message_id.to_string()}, None)
            .await
    }
}
