// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, you can obtain one at https://mozilla.org/MPL/2.0/.

use std::time::SystemTime;

use hmac::{Hmac, Mac};
use redis::{Client as RedisClient, Commands};
use sha2::Sha256;

use super::*;
use settings::Settings;

#[test]
fn set() {
    let settings = Settings::new().expect("config error");
    let message_data = MessageData::new(&settings);
    let key = &generate_key("set");
    if let Err(error) = message_data.set(key.as_str(), "wibble") {
        assert!(false, error.description().to_string());
    } else {
        let redis_client = RedisClient::open(
            format!("redis://{}:{}/", settings.redis.host, settings.redis.port).as_str(),
        ).unwrap();
        let key_exists: bool = redis_client.exists(key.as_str()).unwrap();
        assert!(!key_exists, "unhashed key should not exist in redis");
        let internal_key =
            generate_internal_key(settings.message_id_hmac_key.as_bytes(), key.as_bytes());
        let value: String = redis_client.get(internal_key.as_str()).unwrap();
        assert_eq!(value, "wibble");
    }
}

fn generate_key(test: &str) -> String {
    format!("fxa-email-service.test.message-data.{}.{}", test, now())
}

fn generate_internal_key(hmac_key: &[u8], unhashed_key: &[u8]) -> String {
    let mut hmac = Hmac::<Sha256>::new_varkey(hmac_key).unwrap();
    hmac.input(unhashed_key);
    format!("msg:{:x}", hmac.result().code())
}

fn now() -> u64 {
    let now = SystemTime::now()
        .duration_since(SystemTime::UNIX_EPOCH)
        .expect("system time error");
    now.as_secs() * 1000 + u64::from(now.subsec_millis())
}
