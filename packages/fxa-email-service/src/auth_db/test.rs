// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, you can obtain one at https://mozilla.org/MPL/2.0/.

use serde_json;

use super::*;

#[test]
fn get_email_bounces() {
    let settings = Settings::new().expect("config error");
    let db = DbClient::new(&settings);
    if let Err(error) = db.get_email_bounces("foo@example.com") {
        assert!(false, error.description().to_string());
    }
}

#[test]
fn get_email_bounces_invalid_address() {
    let settings = Settings::new().expect("config error");
    let db = DbClient::new(&settings);
    match db.get_email_bounces("") {
        Ok(_) => assert!(false, "DbClient::get_email_bounces should have failed"),
        Err(error) => assert_eq!(error.description(), "auth db response: 400 Bad Request"),
    }
}

#[test]
fn deserialize_bounce_type() {
    let bounce_type: BounceType = serde_json::from_value(json!(0)).expect("JSON error");
    assert_eq!(bounce_type, BounceType::Soft);
    let bounce_type: BounceType = serde_json::from_value(json!(1)).expect("JSON error");
    assert_eq!(bounce_type, BounceType::Hard);
    let bounce_type: BounceType = serde_json::from_value(json!(2)).expect("JSON error");
    assert_eq!(bounce_type, BounceType::Soft);
    let bounce_type: BounceType = serde_json::from_value(json!(3)).expect("JSON error");
    assert_eq!(bounce_type, BounceType::Complaint);
}

#[test]
fn deserialize_invalid_bounce_type() {
    match serde_json::from_value::<BounceType>(json!(4)) {
        Ok(_) => assert!(false, "serde_json::from_value should have failed"),
        Err(error) => assert_eq!(error.description(), "JSON error"),
    }
    match serde_json::from_value::<BounceType>(json!(-1)) {
        Ok(_) => assert!(false, "serde_json::from_value should have failed"),
        Err(error) => assert_eq!(error.description(), "JSON error"),
    }
}
