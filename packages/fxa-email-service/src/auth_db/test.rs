// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, you can obtain one at https://mozilla.org/MPL/2.0/.

use std::time::SystemTime;

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
        Err(error) => assert_eq!(
            format!("{}", error),
            "invalid value: integer `4`, expected bounce type"
        ),
    }
    match serde_json::from_value::<BounceType>(From::from(-1)) {
        Ok(_) => assert!(false, "serde_json::from_value should have failed"),
        Err(error) => assert_eq!(
            format!("{}", error),
            "invalid value: integer `-1`, expected u8"
        ),
    }
}

#[test]
fn serialize_bounce_type() {
    let json = serde_json::to_string(&BounceType::Hard).expect("JSON error");
    assert_eq!(json, "1");
    let json = serde_json::to_string(&BounceType::Soft).expect("JSON error");
    assert_eq!(json, "2");
    let json = serde_json::to_string(&BounceType::Complaint).expect("JSON error");
    assert_eq!(json, "3");
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
        Err(error) => assert_eq!(
            format!("{}", error),
            "invalid value: integer `15`, expected bounce subtype"
        ),
    }
    match serde_json::from_value::<BounceSubtype>(From::from(-1)) {
        Ok(_) => assert!(false, "serde_json::from_value should have failed"),
        Err(error) => assert_eq!(
            format!("{}", error),
            "invalid value: integer `-1`, expected u8"
        ),
    }
}

#[test]
fn serialize_bounce_subtype() {
    let json = serde_json::to_string(&BounceSubtype::Unmapped).expect("JSON error");
    assert_eq!(json, "0");
    let json = serde_json::to_string(&BounceSubtype::Undetermined).expect("JSON error");
    assert_eq!(json, "1");
    let json = serde_json::to_string(&BounceSubtype::General).expect("JSON error");
    assert_eq!(json, "2");
    let json = serde_json::to_string(&BounceSubtype::NoEmail).expect("JSON error");
    assert_eq!(json, "3");
    let json = serde_json::to_string(&BounceSubtype::Suppressed).expect("JSON error");
    assert_eq!(json, "4");
    let json = serde_json::to_string(&BounceSubtype::MailboxFull).expect("JSON error");
    assert_eq!(json, "5");
    let json = serde_json::to_string(&BounceSubtype::MessageTooLarge).expect("JSON error");
    assert_eq!(json, "6");
    let json = serde_json::to_string(&BounceSubtype::ContentRejected).expect("JSON error");
    assert_eq!(json, "7");
    let json = serde_json::to_string(&BounceSubtype::AttachmentRejected).expect("JSON error");
    assert_eq!(json, "8");
    let json = serde_json::to_string(&BounceSubtype::Abuse).expect("JSON error");
    assert_eq!(json, "9");
    let json = serde_json::to_string(&BounceSubtype::AuthFailure).expect("JSON error");
    assert_eq!(json, "10");
    let json = serde_json::to_string(&BounceSubtype::Fraud).expect("JSON error");
    assert_eq!(json, "11");
    let json = serde_json::to_string(&BounceSubtype::NotSpam).expect("JSON error");
    assert_eq!(json, "12");
    let json = serde_json::to_string(&BounceSubtype::Other).expect("JSON error");
    assert_eq!(json, "13");
    let json = serde_json::to_string(&BounceSubtype::Virus).expect("JSON error");
    assert_eq!(json, "14");
}

#[test]
fn get_bounces() {
    let settings = Settings::new().expect("config error");
    let db = DbClient::new(&settings);
    if let Err(error) = db.get_bounces("foo@example.com") {
        assert!(false, format!("{}", error));
    }
}

#[test]
fn get_bounces_invalid_address() {
    let settings = Settings::new().expect("config error");
    let db = DbClient::new(&settings);
    match db.get_bounces("") {
        Ok(_) => assert!(false, "DbClient::get_bounces should have failed"),
        Err(error) => assert_eq!(format!("{}", error), "\"400 Bad Request\""),
    }
}

#[test]
fn create_bounce() {
    let settings = Settings::new().expect("config error");
    let db = DbClient::new(&settings);
    let email_addresses = vec![generate_email_address("foo"), generate_email_address("bar")];

    let bounces_before = db.get_bounces(&email_addresses[0]).expect("db error");
    let bounces_after =
        db.create_bounce(
            &email_addresses[0],
            BounceType::Hard,
            BounceSubtype::General,
        ).and_then(|_| db.get_bounces(&email_addresses[0]))
            .expect("db error");
    let now = now_as_milliseconds();

    // The next assertion is conditional because fxa-auth-db-mysql limits
    // the results from the fetchEmailBounce stored procedure to 20 rows.
    if bounces_before.len() == 20 {
        assert_eq!(bounces_after.len(), bounces_before.len());
    } else {
        assert_eq!(bounces_after.len(), bounces_before.len() + 1);
    }

    let bounce = &bounces_after[0];
    assert_eq!(bounce.address, email_addresses[0]);
    assert_eq!(bounce.bounce_type, BounceType::Hard);
    assert_eq!(bounce.bounce_subtype, BounceSubtype::General);
    assert!(bounce.created_at > now - 1000);

    let bounces_after =
        db.create_bounce(
            &email_addresses[1],
            BounceType::Soft,
            BounceSubtype::MailboxFull,
        ).and_then(|_| db.get_bounces(&email_addresses[1]))
            .expect("db error");
    let now = now_as_milliseconds();

    let second_bounce = &bounces_after[0];
    assert_eq!(second_bounce.address, email_addresses[1]);
    assert_eq!(second_bounce.bounce_type, BounceType::Soft);
    assert_eq!(second_bounce.bounce_subtype, BounceSubtype::MailboxFull);
    assert!(second_bounce.created_at > now - 1000);
    assert!(second_bounce.created_at > bounce.created_at);
}

fn generate_email_address(variant: &str) -> String {
    format!(
        "fxa-email-service.test.auth-db.{}.{}@example.com",
        variant,
        now_as_milliseconds()
    )
}

fn now_as_milliseconds() -> u64 {
    let now = SystemTime::now()
        .duration_since(SystemTime::UNIX_EPOCH)
        .expect("system time error");
    now.as_secs() * 1000
}
