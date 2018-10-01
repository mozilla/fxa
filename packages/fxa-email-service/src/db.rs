// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, you can obtain one at https://mozilla.org/MPL/2.0/.

//! Database abstractions.
//!
//! Uses Redis under the hood,
//! which is fine because
//! none of the data is relational
//! and we flip all of the
//! Redis persistence switches in prod.
//! You can read more about this decision
//! in [#166](https://github.com/mozilla/fxa-email-service/issues/166).

use std::fmt::{self, Display, Formatter};

use hmac::{crypto_mac::InvalidKeyLength, Hmac, Mac};
use redis::{Client as RedisClient, Commands, RedisError};
use sha2::Sha256;

use app_errors::{AppError, AppErrorKind, AppResult};
use settings::Settings;

/// Database client.
///
/// Really just a thin wrapper
/// around `redis::Client`,
/// with some logic for generating keys via HMAC
/// as a safeguard against leaking PII.
#[derive(Debug)]
pub struct Client {
    client: RedisClient,
    hmac_key: String,
}

impl Client {
    /// Instantiate a db client.
    pub fn new(settings: &Settings) -> Self {
        Self {
            client: RedisClient::open(
                format!("redis://{}:{}/", settings.redis.host, settings.redis.port).as_str(),
            ).expect("redis connection error"),
            hmac_key: settings.hmackey.clone(),
        }
    }

    /// Read data.
    pub fn get(&self, key: &str, data_type: DataType) -> AppResult<String> {
        let key = self.generate_key(key, data_type)?;
        self.client.get(key.as_str()).map_err(From::from)
    }

    /// Read and delete data.
    pub fn consume(&self, key: &str, data_type: DataType) -> AppResult<String> {
        let key = self.generate_key(key, data_type)?;
        let key_str = key.as_str();
        self.client
            .get(key_str)
            .map(|metadata| {
                self.client.del::<&str, u8>(key_str).ok();
                metadata
            }).map_err(From::from)
    }

    /// Store data.
    ///
    /// Any data previously stored for the key
    /// will be clobbered.
    pub fn set(&self, key: &str, data: &str, data_type: DataType) -> AppResult<()> {
        let key = self.generate_key(key, data_type)?;
        self.client.set(key.as_str(), data).map_err(From::from)
    }

    fn generate_key(&self, key: &str, data_type: DataType) -> AppResult<String> {
        let mut hmac: Hmac<Sha256> = Hmac::new_varkey(self.hmac_key.as_bytes())?;
        hmac.input(key.as_bytes());
        Ok(format!("{}:{:x}", data_type, hmac.result().code()))
    }
}

/// Date types included in this store.
#[derive(Clone, Copy, Debug)]
pub enum DataType {
    Configuration,
    DeliveryProblem,
    MessageData,
}

impl Display for DataType {
    fn fmt(&self, formatter: &mut Formatter) -> fmt::Result {
        write!(
            formatter,
            "{}",
            match *self {
                DataType::Configuration => "cfg",
                DataType::DeliveryProblem => "del",
                DataType::MessageData => "msg",
            }
        )
    }
}

impl From<RedisError> for AppError {
    fn from(error: RedisError) -> AppError {
        AppErrorKind::DbError(format!("{:?}", error)).into()
    }
}

impl From<InvalidKeyLength> for AppError {
    fn from(_error: InvalidKeyLength) -> AppError {
        AppErrorKind::HmacError("invalid key length".to_string()).into()
    }
}
