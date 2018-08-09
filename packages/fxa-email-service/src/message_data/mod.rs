// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, you can obtain one at https://mozilla.org/MPL/2.0/.

//! Temporary storage for message metadata.

use hmac::{crypto_mac::InvalidKeyLength, Hmac, Mac};
use redis::{Client as RedisClient, Commands, RedisError};
use sha2::Sha256;

use app_errors::{AppError, AppErrorKind, AppResult};
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
    pub fn consume(&self, message_id: &str) -> AppResult<String> {
        let key = self.generate_key(message_id)?;
        let key_str = key.as_str();
        self.client
            .get(key_str)
            .map(|metadata| {
                self.client.del::<&str, u8>(key_str).ok();
                metadata
            }).map_err(From::from)
    }

    /// Store message metadata.
    ///
    /// Any data previously stored for the message id
    /// will be replaced.
    pub fn set(&self, message_id: &str, metadata: &str) -> AppResult<()> {
        let key = self.generate_key(message_id)?;
        self.client.set(key.as_str(), metadata).map_err(From::from)
    }

    fn generate_key(&self, message_id: &str) -> AppResult<String> {
        let mut hmac = Hmac::<Sha256>::new_varkey(self.hmac_key.as_bytes())?;
        hmac.input(message_id.as_bytes());
        Ok(format!("msg:{:x}", hmac.result().code()))
    }
}

impl From<RedisError> for AppError {
    fn from(error: RedisError) -> AppError {
        AppErrorKind::MessageDataError(format!("redis error: {:?}", error)).into()
    }
}

impl From<InvalidKeyLength> for AppError {
    fn from(error: InvalidKeyLength) -> AppError {
        AppErrorKind::MessageDataError(format!("hmac key error: {:?}", error)).into()
    }
}
