// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, you can obtain one at https://mozilla.org/MPL/2.0/.

//! Temporary storage for message metadata.

use std::{
    error::Error,
    fmt::{self, Display, Formatter},
};

use hmac::{crypto_mac::InvalidKeyLength, Hmac, Mac};
use redis::{Client as RedisClient, Commands, RedisError};
use sha2::Sha256;

use settings::Settings;

#[cfg(test)]
mod test;

/// Message data store.
///
/// Currently uses Redis
/// under the hood,
/// although that may not
/// always be the case.
///
/// Data is keyed by
/// a hash of the message id.
#[derive(Debug)]
pub struct MessageData {
    client: RedisClient,
    hmac_key: String,
}

impl MessageData {
    /// Instantiate a storage client.
    pub fn new(settings: &Settings) -> MessageData {
        MessageData {
            client: RedisClient::open(
                format!("redis://{}:{}/", settings.redis.host, settings.redis.port).as_str(),
            ).expect("redis connection error"),
            hmac_key: settings.hmackey.clone(),
        }
    }

    /// Consume (read and delete) message metadata.
    ///
    /// This is a destructive operation.
    /// Once consumed,
    /// the data is permanently destroyed.
    pub fn consume(&self, message_id: &str) -> Result<String, MessageDataError> {
        let key = self.generate_key(message_id)?;
        let key_str = key.as_str();
        self.client
            .get(key_str)
            .map(|metadata| {
                self.client.del::<&str, u8>(key_str).ok();
                metadata
            })
            .map_err(From::from)
    }

    /// Store message metadata.
    ///
    /// Any data previously stored for the message id
    /// will be replaced.
    pub fn set(&self, message_id: &str, metadata: &str) -> Result<(), MessageDataError> {
        let key = self.generate_key(message_id)?;
        self.client.set(key.as_str(), metadata).map_err(From::from)
    }

    fn generate_key(&self, message_id: &str) -> Result<String, MessageDataError> {
        let mut hmac = Hmac::<Sha256>::new_varkey(self.hmac_key.as_bytes())?;
        hmac.input(message_id.as_bytes());
        Ok(format!("msg:{:x}", hmac.result().code()))
    }
}

/// The error type returned by `MessageData` methods.
#[derive(Debug)]
pub struct MessageDataError {
    description: String,
}

impl Error for MessageDataError {
    fn description(&self) -> &str {
        &self.description
    }
}

impl Display for MessageDataError {
    fn fmt(&self, formatter: &mut Formatter) -> fmt::Result {
        write!(formatter, "{}", self.description)
    }
}

impl From<RedisError> for MessageDataError {
    fn from(error: RedisError) -> MessageDataError {
        MessageDataError {
            description: format!("redis error: {:?}", error),
        }
    }
}

impl From<InvalidKeyLength> for MessageDataError {
    fn from(error: InvalidKeyLength) -> MessageDataError {
        MessageDataError {
            description: format!("hmac key error: {:?}", error),
        }
    }
}
