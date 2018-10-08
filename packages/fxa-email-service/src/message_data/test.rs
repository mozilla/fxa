// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, you can obtain one at https://mozilla.org/MPL/2.0/.

use std::time::SystemTime;

use hmac::{Hmac, Mac};
use redis::{Client as RedisClient, Commands};
use sha2::Sha256;

use super::*;
use settings::Settings;

#[derive(Debug)]
struct TestFixture {
    pub unhashed_key: String,
    pub internal_key: String,
    pub message_data: MessageData,
    pub redis_client: RedisClient,
}

#[test]
fn set() {
    let test = TestFixture::setup("set");
    if let Err(error) = test.message_data.set(test.unhashed_key.as_str(), "wibble") {
        assert!(false, format!("{}", error));
    } else {
        let key_exists: bool = test
            .redis_client
            .exists(test.unhashed_key.as_str())
            .unwrap();
        assert!(!key_exists, "unhashed key should not exist in redis");
        let value: String = test.redis_client.get(test.internal_key.as_str()).unwrap();
        assert_eq!(value, "\"wibble\"");
    }
}

#[test]
fn consume() {
    let test = TestFixture::setup("consume");
    test.message_data
        .set(test.unhashed_key.as_str(), "blee")
        .unwrap();
    assert_eq!(
        test.message_data.consume(&test.unhashed_key).unwrap(),
        "blee"
    );
    let key_exists: bool = test
        .redis_client
        .exists(test.internal_key.as_str())
        .unwrap();
    assert!(
        !key_exists,
        "internal key should not exist in redis after being consumed"
    );
    match test.message_data.consume(&test.unhashed_key) {
        Ok(_) => assert!(false, "consume should fail when called a second time"),
        Err(error) => assert_eq!(format!("{}", error), "Redis error: Response was of incompatible type: \"Response type not string compatible.\" (response was nil)"),
    }
}

impl TestFixture {
    pub fn setup(test: &str) -> TestFixture {
        let settings = Settings::new().expect("config error");
        let unhashed_key = format!("fxa-email-service.test.message-data.{}.{}", test, now());
        let mut hmac = Hmac::<Sha256>::new_varkey(settings.hmackey.as_bytes()).unwrap();
        hmac.input(unhashed_key.as_bytes());
        let internal_key = format!("msg:{:x}", hmac.result().code());
        TestFixture {
            unhashed_key,
            internal_key,
            message_data: MessageData::new(&settings),
            redis_client: RedisClient::open(
                format!("redis://{}:{}/", settings.redis.host, settings.redis.port).as_str(),
            ).unwrap(),
        }
    }
}

fn now() -> u64 {
    let now = SystemTime::now()
        .duration_since(SystemTime::UNIX_EPOCH)
        .expect("system time error");
    now.as_secs() * 1000 + u64::from(now.subsec_millis())
}
