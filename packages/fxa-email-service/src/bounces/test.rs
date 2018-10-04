// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, you can obtain one at https://mozilla.org/MPL/2.0/.

use rocket::http::Status;
use serde_json::{self, Value as Json};

use super::*;
use app_errors::{AppErrorKind, AppResult};
use auth_db::{
    BounceRecord, BounceSubtype as DbBounceSubtype, BounceType as DbBounceType, Db, DbClient,
};
use queues::notification::{BounceSubtype, BounceType, ComplaintFeedbackType};
use settings::Settings;

const SECOND: u64 = 1000;
const MINUTE: u64 = SECOND * 60;
const HOUR: u64 = MINUTE * 60;
const DAY: u64 = HOUR * 24;
const WEEK: u64 = DAY * 7;
const MONTH: u64 = DAY * 30;

#[test]
fn check_no_bounces() {
    let bounce_settings: Json = serde_json::from_str(
        r#"{
        "enabled": true,
        "soft": [
        { "period": "day", "limit": 0 }
        ],
        "hard": [
        { "period": "week", "limit": 0 }
        ],
        "complaint": [
        { "period": "month", "limit": 0 }
        ]
        }"#,
    ).expect("Unexpected json parsing error");
    let settings = create_settings(bounce_settings);
    let db = DbMockNoBounce;
    let bounces = Bounces::new(&settings, db);
    if let Err(error) = bounces.check("foo@example.com") {
        assert!(false, format!("{}", error));
    }
}

fn create_settings(bounce_limits: Json) -> Settings {
    let mut settings = Settings::default();
    settings.bouncelimits = serde_json::from_value(bounce_limits).expect("JSON error");
    settings
}

#[derive(Debug)]
pub struct DbMockNoBounce;

impl Db for DbMockNoBounce {
    fn get_bounces(&self, _address: &str) -> AppResult<Vec<BounceRecord>> {
        let now = now_as_milliseconds();
        Ok(vec![
            BounceRecord {
                address: String::from("foo@example.com"),
                bounce_type: DbBounceType::Soft,
                bounce_subtype: DbBounceSubtype::Undetermined,
                created_at: now - DAY - 1000,
            },
            BounceRecord {
                address: String::from("foo@example.com"),
                bounce_type: DbBounceType::Hard,
                bounce_subtype: DbBounceSubtype::Undetermined,
                created_at: now - WEEK - 1000,
            },
            BounceRecord {
                address: String::from("foo@example.com"),
                bounce_type: DbBounceType::Complaint,
                bounce_subtype: DbBounceSubtype::Undetermined,
                created_at: now - MONTH - 1000,
            },
        ])
    }
}

fn now_as_milliseconds() -> u64 {
    let now = SystemTime::now()
        .duration_since(SystemTime::UNIX_EPOCH)
        .expect("system time error");
    now.as_secs() * 1000 + u64::from(now.subsec_millis())
}

#[test]
fn check_soft_bounce() {
    let bounce_settings: Json = serde_json::from_str(
        r#"{
        "enabled": true,
        "soft": [
        { "period": "day", "limit": 0 }
        ],
        "hard": [],
        "complaint": []
        }"#,
    ).expect("Unexpected json parsing error");
    let settings = create_settings(bounce_settings);
    let db = DbMockBounceSoft;
    let bounces = Bounces::new(&settings, db);
    match bounces.check("foo@example.com") {
        Ok(_) => assert!(false, "Bounces::check should have failed"),
        Err(error) => {
            assert_eq!(format!("{}", error), "Email account soft bounced");
            let err_data = error.kind().additional_fields();
            let address = err_data.get("address");
            if let Some(ref address) = address {
                assert_eq!("foo@example.com", address.as_str().unwrap());
            } else {
                assert!(false, "Error::address should be set");
            }
            let bounce = err_data.get("bounce");
            if let Some(ref bounce) = bounce {
                let record: Json = serde_json::from_str(bounce.as_str().unwrap()).unwrap();
                assert_eq!(record["bounceType"], 2);
                assert_eq!(&record["createdAt"], err_data.get("bouncedAt").unwrap());
            } else {
                assert!(false, "Error::bounce should be set");
            }
            assert_eq!(error.kind().http_status(), Status::TooManyRequests);
        }
    }
}

#[derive(Debug)]
pub struct DbMockBounceSoft;

impl Db for DbMockBounceSoft {
    fn get_bounces(&self, _address: &str) -> AppResult<Vec<BounceRecord>> {
        let now = now_as_milliseconds();
        Ok(vec![BounceRecord {
            address: String::from("foo@example.com"),
            bounce_type: DbBounceType::Soft,
            bounce_subtype: DbBounceSubtype::Undetermined,
            created_at: now - DAY + SECOND * 2,
        }])
    }
}

#[test]
fn check_hard_bounce() {
    let bounce_settings: Json = serde_json::from_str(
        r#"{
        "enabled": true,
        "soft": [],
        "hard": [
        { "period": "week", "limit": 0 }
        ],
        "complaint": []
        }"#,
    ).expect("Unexpected json parsing error");
    let settings = create_settings(bounce_settings);
    let db = DbMockBounceHard;
    let bounces = Bounces::new(&settings, db);
    match bounces.check("bar@example.com") {
        Ok(_) => assert!(false, "Bounces::check should have failed"),
        Err(error) => {
            assert_eq!(format!("{}", error), "Email account hard bounced");
            let err_data = error.kind().additional_fields();
            let address = err_data.get("address");
            if let Some(ref address) = address {
                assert_eq!("bar@example.com", address.as_str().unwrap());
            } else {
                assert!(false, "Error::address should be set");
            }
            let bounce = err_data.get("bounce");
            if let Some(ref bounce) = bounce {
                let record: Json = serde_json::from_str(bounce.as_str().unwrap()).unwrap();
                assert_eq!(record["bounceType"], 1);
                assert_eq!(&record["createdAt"], err_data.get("bouncedAt").unwrap());
            } else {
                assert!(false, "Error::bounce should be set");
            }
            assert_eq!(error.kind().http_status(), Status::TooManyRequests);
        }
    }
}

#[derive(Debug)]
pub struct DbMockBounceHard;

impl Db for DbMockBounceHard {
    fn get_bounces(&self, _address: &str) -> AppResult<Vec<BounceRecord>> {
        let now = now_as_milliseconds();
        Ok(vec![BounceRecord {
            address: String::from("bar@example.com"),
            bounce_type: DbBounceType::Hard,
            bounce_subtype: DbBounceSubtype::Undetermined,
            created_at: now - WEEK + SECOND * 2,
        }])
    }
}

#[test]
fn check_complaint() {
    let bounce_settings: Json = serde_json::from_str(
        r#"{
        "enabled": true,
        "soft": [],
        "hard": [],
        "complaint": [
        { "period": "month", "limit": 0 }
        ]
        }"#,
    ).expect("Unexpected json parsing error");
    let settings = create_settings(bounce_settings);
    let db = DbMockComplaint;
    let bounces = Bounces::new(&settings, db);
    match bounces.check("baz@example.com") {
        Ok(_) => assert!(false, "Bounces::check should have failed"),
        Err(error) => {
            assert_eq!(format!("{}", error), "Email account sent complaint");
            let err_data = error.kind().additional_fields();
            let address = err_data.get("address");
            if let Some(ref address) = address {
                assert_eq!("baz@example.com", address.as_str().unwrap());
            } else {
                assert!(false, "Error::address should be set");
            }
            let bounce = err_data.get("bounce");
            if let Some(ref bounce) = bounce {
                let record: Json = serde_json::from_str(bounce.as_str().unwrap()).unwrap();
                assert_eq!(record["bounceType"], 3);
                assert_eq!(&record["createdAt"], err_data.get("bouncedAt").unwrap());
            } else {
                assert!(false, "Error::bounce should be set");
            }
            assert_eq!(error.kind().http_status(), Status::TooManyRequests);
        }
    }
}

#[derive(Debug)]
pub struct DbMockComplaint;

impl Db for DbMockComplaint {
    fn get_bounces(&self, _address: &str) -> AppResult<Vec<BounceRecord>> {
        let now = now_as_milliseconds();
        Ok(vec![BounceRecord {
            address: String::from("baz@example.com"),
            bounce_type: DbBounceType::Complaint,
            bounce_subtype: DbBounceSubtype::Undetermined,
            created_at: now - MONTH + SECOND * 2,
        }])
    }
}

#[test]
fn check_db_error() {
    let bounce_settings: Json = serde_json::from_str(
        r#"{
        "enabled": true,
        "soft": [
        { "period": "day", "limit": 0 }
        ],
        "hard": [
        { "period": "week", "limit": 0 }
        ],
        "complaint": [
        { "period": "month", "limit": 0 }
        ]
        }"#,
    ).expect("Unexpected json parsing error");
    let settings = create_settings(bounce_settings);
    let db = DbMockError;
    let bounces = Bounces::new(&settings, db);
    match bounces.check("foo@example.com") {
        Ok(_) => assert!(false, "Bounces::check should have failed"),
        Err(error) => {
            assert_eq!(format!("{}", error), "wibble blee");
            assert_eq!(error.kind().http_status(), Status::InternalServerError);
        }
    }
}

#[derive(Debug)]
pub struct DbMockError;

impl Db for DbMockError {
    fn get_bounces(&self, _address: &str) -> AppResult<Vec<BounceRecord>> {
        Err(AppErrorKind::AuthDbError(String::from("wibble blee")).into())
    }
}

#[test]
fn check_no_bounces_with_nonzero_limits() {
    let bounce_settings: Json = serde_json::from_str(
        r#"{
        "enabled": true,
        "soft": [
        { "period": "day", "limit": 2 }
        ],
        "hard": [
        { "period": "week", "limit": 2 }
        ],
        "complaint": [
        { "period": "month", "limit": 2 }
        ]
        }"#,
    ).expect("Unexpected json parsing error");
    let settings = create_settings(bounce_settings);
    let db = DbMockNoBounceWithNonZeroLimits;
    let bounces = Bounces::new(&settings, db);
    if let Err(error) = bounces.check("foo@example.com") {
        assert!(false, format!("{}", error));
    }
}

#[derive(Debug)]
pub struct DbMockNoBounceWithNonZeroLimits;

impl Db for DbMockNoBounceWithNonZeroLimits {
    fn get_bounces(&self, _address: &str) -> AppResult<Vec<BounceRecord>> {
        let now = now_as_milliseconds();
        Ok(vec![
            BounceRecord {
                address: String::from("foo@example.com"),
                bounce_type: DbBounceType::Soft,
                bounce_subtype: DbBounceSubtype::Undetermined,
                created_at: now - DAY + MINUTE,
            },
            BounceRecord {
                address: String::from("foo@example.com"),
                bounce_type: DbBounceType::Hard,
                bounce_subtype: DbBounceSubtype::Undetermined,
                created_at: now - WEEK + MINUTE,
            },
            BounceRecord {
                address: String::from("foo@example.com"),
                bounce_type: DbBounceType::Complaint,
                bounce_subtype: DbBounceSubtype::Undetermined,
                created_at: now - MONTH + MINUTE,
            },
            BounceRecord {
                address: String::from("foo@example.com"),
                bounce_type: DbBounceType::Soft,
                bounce_subtype: DbBounceSubtype::Undetermined,
                created_at: now - DAY + SECOND * 2,
            },
            BounceRecord {
                address: String::from("foo@example.com"),
                bounce_type: DbBounceType::Hard,
                bounce_subtype: DbBounceSubtype::Undetermined,
                created_at: now - WEEK + SECOND * 2,
            },
            BounceRecord {
                address: String::from("foo@example.com"),
                bounce_type: DbBounceType::Complaint,
                bounce_subtype: DbBounceSubtype::Undetermined,
                created_at: now - MONTH + SECOND * 2,
            },
            BounceRecord {
                address: String::from("foo@example.com"),
                bounce_type: DbBounceType::Soft,
                bounce_subtype: DbBounceSubtype::Undetermined,
                created_at: now - DAY - 1000,
            },
            BounceRecord {
                address: String::from("foo@example.com"),
                bounce_type: DbBounceType::Hard,
                bounce_subtype: DbBounceSubtype::Undetermined,
                created_at: now - WEEK - 1000,
            },
            BounceRecord {
                address: String::from("foo@example.com"),
                bounce_type: DbBounceType::Complaint,
                bounce_subtype: DbBounceSubtype::Undetermined,
                created_at: now - MONTH - 1000,
            },
        ])
    }
}

#[test]
fn check_bounce_with_multiple_limits() {
    let bounce_settings: Json = serde_json::from_str(
        r#"{
        "enabled": true,
        "soft": [
        { "period": "2 seconds", "limit": 0 },
        { "period": "2 minutes", "limit": 1 },
        { "period": "2 hours", "limit": 2 }
        ],
        "hard": [],
        "complaint": []
        }"#,
    ).expect("Unexpected json parsing error");
    let settings = create_settings(bounce_settings);
    let db = DbMockBounceWithMultipleLimits;
    let bounces = Bounces::new(&settings, db);
    match bounces.check("foo@example.com") {
        Ok(_) => assert!(false, "Bounces::check should have failed"),
        Err(error) => {
            assert_eq!(format!("{}", error), "Email account soft bounced");
            let err_data = error.kind().additional_fields();
            let address = err_data.get("address");
            if let Some(ref address) = address {
                assert_eq!("foo@example.com", address.as_str().unwrap());
            } else {
                assert!(false, "Error::address should be set");
            }
            let bounce = err_data.get("bounce");
            if let Some(ref bounce) = bounce {
                let record: Json = serde_json::from_str(bounce.as_str().unwrap()).unwrap();
                assert_eq!(record["bounceType"], 2);
                assert_eq!(&record["createdAt"], err_data.get("bouncedAt").unwrap());
            } else {
                assert!(false, "Error::bounce should be set");
            }
        }
    }
}

#[derive(Debug)]
pub struct DbMockBounceWithMultipleLimits;

impl Db for DbMockBounceWithMultipleLimits {
    fn get_bounces(&self, _address: &str) -> AppResult<Vec<BounceRecord>> {
        let now = now_as_milliseconds();
        Ok(vec![
            BounceRecord {
                address: String::from("foo@example.com"),
                bounce_type: DbBounceType::Soft,
                bounce_subtype: DbBounceSubtype::Undetermined,
                created_at: now - SECOND * 4,
            },
            BounceRecord {
                address: String::from("foo@example.com"),
                bounce_type: DbBounceType::Soft,
                bounce_subtype: DbBounceSubtype::Undetermined,
                created_at: now - MINUTE * 2 + SECOND * 4,
            },
            BounceRecord {
                address: String::from("foo@example.com"),
                bounce_type: DbBounceType::Soft,
                bounce_subtype: DbBounceSubtype::Undetermined,
                created_at: now - MINUTE * 2 + SECOND * 3,
            },
            BounceRecord {
                address: String::from("foo@example.com"),
                bounce_type: DbBounceType::Soft,
                bounce_subtype: DbBounceSubtype::Undetermined,
                created_at: now - MINUTE * 2 + SECOND * 2,
            },
        ])
    }
}

#[test]
fn record_bounce() {
    let settings = Settings::new().unwrap();
    let db = DbClient::new(&settings);
    let bounces = Bounces::new(&settings, db);
    let address = create_address("record_bounce");
    bounces
        .record_bounce(
            &address,
            BounceType::Transient,
            BounceSubtype::AttachmentRejected,
        ).unwrap();
    let db = DbClient::new(&settings);
    let bounce_records = db.get_bounces(&address).unwrap();
    let now = now_as_milliseconds();
    assert_eq!(bounce_records.len(), 1);
    assert_eq!(bounce_records[0].address, address);
    assert_eq!(bounce_records[0].bounce_type, DbBounceType::Soft);
    assert_eq!(
        bounce_records[0].bounce_subtype,
        DbBounceSubtype::AttachmentRejected
    );
    assert!(bounce_records[0].created_at < now);
    assert!(bounce_records[0].created_at > now - 1000);
}

fn create_address(test: &str) -> String {
    format!(
        "fxa-email-service.bounces.test.{}.{}@example.com",
        test,
        now_as_milliseconds()
    )
}

#[test]
fn record_complaint() {
    let settings = Settings::new().unwrap();
    let db = DbClient::new(&settings);
    let bounces = Bounces::new(&settings, db);
    let address = create_address("record_complaint");
    bounces
        .record_complaint(&address, Some(ComplaintFeedbackType::Virus))
        .unwrap();
    let db = DbClient::new(&settings);
    let bounce_records = db.get_bounces(&address).unwrap();
    let now = now_as_milliseconds();
    assert_eq!(bounce_records.len(), 1);
    assert_eq!(bounce_records[0].address, address);
    assert_eq!(bounce_records[0].bounce_type, DbBounceType::Complaint);
    assert_eq!(bounce_records[0].bounce_subtype, DbBounceSubtype::Virus);
    assert!(bounce_records[0].created_at < now);
    assert!(bounce_records[0].created_at > now - 1000);
}
