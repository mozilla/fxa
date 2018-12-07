// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, you can obtain one at https://mozilla.org/MPL/2.0/.

//! Storage for message metadata.

use super::core::{Client as DbClient, DataType};
use crate::{settings::Settings, types::error::AppResult};

#[cfg(test)]
mod test;

/// Message data store.
///
/// Data is keyed by message id.
#[derive(Debug)]
pub struct MessageData {
    client: DbClient,
}

impl MessageData {
    /// Instantiate a storage client.
    pub fn new(settings: &Settings) -> Self {
        Self {
            client: DbClient::new(settings),
        }
    }

    /// Consume (read and delete) message metadata.
    ///
    /// This is a destructive operation.
    /// Once consumed,
    /// the data is permanently destroyed.
    pub fn consume(&self, message_id: &str) -> AppResult<Option<String>> {
        self.client.consume(message_id, DataType::MessageData)
    }

    /// Store message metadata.
    ///
    /// Any data previously stored for the message id
    /// will be replaced.
    pub fn set(&self, message_id: &str, metadata: &str) -> AppResult<()> {
        self.client
            .set(message_id, &metadata, DataType::MessageData)
    }
}
