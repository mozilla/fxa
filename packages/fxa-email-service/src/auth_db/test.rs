// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, you can obtain one at https://mozilla.org/MPL/2.0/.

use serde_json;

use super::*;

#[test]
fn deserialize_bounce_type() {
    let bounce_type: BounceType = serde_json::from_value(From::from(0)).expect("JSON error");
    assert_eq!(bounce_type, BounceType::Soft);
    let bounce_type: BounceType = serde_json::from_value(From::from(1)).expect("JSON error");
    assert_eq!(bounce_type, BounceType::Hard);
    let bounce_type: BounceType = serde_json::from_value(From::from(2)).expect("JSON error");
    assert_eq!(bounce_type, BounceType::Soft);
    let bounce_type: BounceType = serde_json::from_value(From::from(3)).expect("JSON error");
    assert_eq!(bounce_type, BounceType::Complaint);
}

#[test]
fn deserialize_invalid_bounce_type() {
    match serde_json::from_value::<BounceType>(From::from(4)) {
        Ok(_) => assert!(false, "serde_json::from_value should have failed"),
        Err(error) => assert_eq!(error.description(), "JSON error"),
    }
    match serde_json::from_value::<BounceType>(From::from(-1)) {
        Ok(_) => assert!(false, "serde_json::from_value should have failed"),
        Err(error) => assert_eq!(error.description(), "JSON error"),
    }
}

#[test]
fn deserialize_bounce_subtype() {
    let bounce_type: BounceSubtype = serde_json::from_value(From::from(0)).expect("JSON error");
    assert_eq!(bounce_type, BounceSubtype::Unmapped);
    let bounce_type: BounceSubtype = serde_json::from_value(From::from(1)).expect("JSON error");
    assert_eq!(bounce_type, BounceSubtype::Undetermined);
    let bounce_type: BounceSubtype = serde_json::from_value(From::from(2)).expect("JSON error");
    assert_eq!(bounce_type, BounceSubtype::General);
    let bounce_type: BounceSubtype = serde_json::from_value(From::from(3)).expect("JSON error");
    assert_eq!(bounce_type, BounceSubtype::NoEmail);
    let bounce_type: BounceSubtype = serde_json::from_value(From::from(4)).expect("JSON error");
    assert_eq!(bounce_type, BounceSubtype::Suppressed);
    let bounce_type: BounceSubtype = serde_json::from_value(From::from(5)).expect("JSON error");
    assert_eq!(bounce_type, BounceSubtype::MailboxFull);
    let bounce_type: BounceSubtype = serde_json::from_value(From::from(6)).expect("JSON error");
    assert_eq!(bounce_type, BounceSubtype::MessageTooLarge);
    let bounce_type: BounceSubtype = serde_json::from_value(From::from(7)).expect("JSON error");
    assert_eq!(bounce_type, BounceSubtype::ContentRejected);
    let bounce_type: BounceSubtype = serde_json::from_value(From::from(8)).expect("JSON error");
    assert_eq!(bounce_type, BounceSubtype::AttachmentRejected);
    let bounce_type: BounceSubtype = serde_json::from_value(From::from(9)).expect("JSON error");
    assert_eq!(bounce_type, BounceSubtype::Abuse);
    let bounce_type: BounceSubtype = serde_json::from_value(From::from(10)).expect("JSON error");
    assert_eq!(bounce_type, BounceSubtype::AuthFailure);
    let bounce_type: BounceSubtype = serde_json::from_value(From::from(11)).expect("JSON error");
    assert_eq!(bounce_type, BounceSubtype::Fraud);
    let bounce_type: BounceSubtype = serde_json::from_value(From::from(12)).expect("JSON error");
    assert_eq!(bounce_type, BounceSubtype::NotSpam);
    let bounce_type: BounceSubtype = serde_json::from_value(From::from(13)).expect("JSON error");
    assert_eq!(bounce_type, BounceSubtype::Other);
    let bounce_type: BounceSubtype = serde_json::from_value(From::from(14)).expect("JSON error");
    assert_eq!(bounce_type, BounceSubtype::Virus);
}

#[test]
fn deserialize_invalid_bounce_subtype() {
    match serde_json::from_value::<BounceSubtype>(From::from(15)) {
        Ok(_) => assert!(false, "serde_json::from_value should have failed"),
        Err(error) => assert_eq!(error.description(), "JSON error"),
    }
    match serde_json::from_value::<BounceSubtype>(From::from(-1)) {
        Ok(_) => assert!(false, "serde_json::from_value should have failed"),
        Err(error) => assert_eq!(error.description(), "JSON error"),
    }
}

#[test]
fn get_bounces() {
    let settings = Settings::new().expect("config error");
    let db = DbClient::new(&settings);
    if let Err(error) = db.get_bounces("foo@example.com") {
        assert!(false, error.description().to_string());
    }
}

#[test]
fn get_bounces_invalid_address() {
    let settings = Settings::new().expect("config error");
    let db = DbClient::new(&settings);
    match db.get_bounces("") {
        Ok(_) => assert!(false, "DbClient::get_bounces should have failed"),
        Err(error) => assert_eq!(error.description(), "auth db response: 400 Bad Request"),
    }
}
