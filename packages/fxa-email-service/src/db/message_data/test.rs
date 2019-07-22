// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, you can obtain one at https://mozilla.org/MPL/2.0/.

use std::time::SystemTime;

use super::*;
use crate::db::core::test::TestFixture;

#[test]
fn set() {
    let settings = Settings::new().unwrap();
    let message_data = MessageData::new(&settings);
    let key = create_key("set");
    let mut test = TestFixture::setup(&settings, &key, DataType::MessageData);

    if let Err(error) = message_data.set(&key, "wibble") {
        assert!(false, format!("{:?}", error));
    } else {
        test.assert_data(String::from("wibble"));
    }
}

#[test]
fn consume() {
    let settings = Settings::new().unwrap();
    let message_data = MessageData::new(&settings);
    let key = create_key("consume");
    let mut test = TestFixture::setup(&settings, &key, DataType::MessageData);

    message_data.set(&key, "blee").unwrap();

    assert_eq!(message_data.consume(&key).unwrap().unwrap(), "blee");
    test.assert_not_set();

    assert!(message_data.consume(&key).unwrap().is_none());
}

fn create_key(test: &str) -> String {
    format!("fxa-email-service.test.msg.{}.{}", test, now())
}

fn now() -> u64 {
    let now = SystemTime::now()
        .duration_since(SystemTime::UNIX_EPOCH)
        .expect("system time error");
    now.as_secs() * 1000 + u64::from(now.subsec_millis())
}
