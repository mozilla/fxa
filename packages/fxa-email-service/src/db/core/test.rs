// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, you can obtain one at https://mozilla.org/MPL/2.0/.

//! Test logic for `db` consumers.

use std::fmt::Debug;

use super::*;

/// A test fixture for `db` consumers,
/// with logic for asserting
/// that data is being written
/// to the underlying store correctly.
#[derive(Debug)]
pub struct TestFixture {
    unhashed_key: String,
    internal_key: String,
    redis_client: RedisClient,
}

impl TestFixture {
    pub fn setup(settings: &Settings, unhashed_key: &str, data_type: DataType) -> Self {
        let mut hmac = Hmac::<Sha256>::new_varkey(settings.hmackey.as_bytes()).unwrap();
        hmac.input(unhashed_key.as_bytes());
        let internal_key = format!("{}:{:x}", data_type.as_ref(), hmac.result().code());
        Self {
            unhashed_key: String::from(unhashed_key),
            internal_key,
            redis_client: RedisClient::open(
                format!("redis://{}:{}/", settings.redis.host, settings.redis.port).as_str(),
            )
            .unwrap(),
        }
    }

    pub fn assert_not_set(&mut self) {
        let exists: bool = self.redis_client.exists(&self.internal_key).unwrap();
        assert!(!exists);
    }

    pub fn assert_set(&mut self) {
        let exists: bool = self.redis_client.exists(&self.internal_key).unwrap();
        assert!(exists);

        let exists: bool = self.redis_client.exists(&self.unhashed_key).unwrap();
        assert!(!exists);
    }

    pub fn assert_data<D>(&mut self, expected: D)
    where
        D: Debug + DeserializeOwned + PartialEq,
    {
        self.assert_set();

        let data: D = self
            .redis_client
            .get(&self.internal_key)
            .map(|value: String| serde_json::from_str(&value).unwrap())
            .unwrap();
        assert_eq!(data, expected);
    }
}
