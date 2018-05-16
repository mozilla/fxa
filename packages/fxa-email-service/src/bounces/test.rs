// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, you can obtain one at https://mozilla.org/MPL/2.0/.

use serde_json::{self, Value as Json};

use super::*;
use auth_db::{Db, DbError};
use settings::Settings;

const SECOND: u64 = 1000;
const MINUTE: u64 = SECOND * 60;
const HOUR: u64 = MINUTE * 60;
const DAY: u64 = HOUR * 24;
const WEEK: u64 = DAY * 7;
const MONTH: u64 = DAY * 30;

#[test]
fn check_no_bounces() {
    let settings = create_settings(json!({
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
  }));
    let db = DbMockNoBounce;
    let bounces = Bounces::new(&settings, Box::new(&db));
    if let Err(error) = bounces.check("foo@example.com") {
        assert!(false, error.description().to_string());
    }
}

fn create_settings(bounce_limits: Json) -> Settings {
    let mut settings = Settings::default();
    settings.bouncelimits = serde_json::from_value(bounce_limits).expect("JSON error");
    settings
}

pub struct DbMockNoBounce;

impl Db for DbMockNoBounce {
    fn get_email_bounces(&self, _address: &str) -> Result<Vec<BounceRecord>, DbError> {
        let now = now_as_milliseconds();
        Ok(vec![
            BounceRecord {
                bounce_type: BounceType::Soft,
                created_at: now - DAY - 1,
            },
            BounceRecord {
                bounce_type: BounceType::Hard,
                created_at: now - WEEK - 1,
            },
            BounceRecord {
                bounce_type: BounceType::Complaint,
                created_at: now - MONTH - 1,
            },
        ])
    }
}

fn now_as_milliseconds() -> u64 {
    let now = SystemTime::now()
        .duration_since(SystemTime::UNIX_EPOCH)
        .expect("system time error");
    now.as_secs() * 1000
}

#[test]
fn check_soft_bounce() {
    let settings = create_settings(json!({
    "enabled": true,
    "soft": [
      { "period": "day", "limit": 0 }
    ],
    "hard": [],
    "complaint": []
  }));
    let db = DbMockBounceSoft;
    let bounces = Bounces::new(&settings, Box::new(&db));
    match bounces.check("foo@example.com") {
        Ok(_) => assert!(false, "Bounces::check should have failed"),
        Err(error) => {
            assert_eq!(
                error.description(),
                "email address violated soft bounce limit"
            );
            assert_eq!(error.address, "foo@example.com");
            if let Some(bounce) = error.bounce {
                assert_eq!(bounce.bounce_type, BounceType::Soft);
            } else {
                assert!(false, "Error::bounce should be set");
            }
        }
    }
}

pub struct DbMockBounceSoft;

impl Db for DbMockBounceSoft {
    fn get_email_bounces(&self, _address: &str) -> Result<Vec<BounceRecord>, DbError> {
        let now = now_as_milliseconds();
        Ok(vec![BounceRecord {
            bounce_type: BounceType::Soft,
            created_at: now - DAY + SECOND * 2,
        }])
    }
}

#[test]
fn check_hard_bounce() {
    let settings = create_settings(json!({
    "enabled": true,
    "soft": [],
    "hard": [
      { "period": "week", "limit": 0 }
    ],
    "complaint": []
  }));
    let db = DbMockBounceHard;
    let bounces = Bounces::new(&settings, Box::new(&db));
    match bounces.check("bar@example.com") {
        Ok(_) => assert!(false, "Bounces::check should have failed"),
        Err(error) => {
            assert_eq!(
                error.description(),
                "email address violated hard bounce limit"
            );
            assert_eq!(error.address, "bar@example.com");
            if let Some(bounce) = error.bounce {
                assert_eq!(bounce.bounce_type, BounceType::Hard);
            } else {
                assert!(false, "Error::bounce should be set");
            }
        }
    }
}

pub struct DbMockBounceHard;

impl Db for DbMockBounceHard {
    fn get_email_bounces(&self, _address: &str) -> Result<Vec<BounceRecord>, DbError> {
        let now = now_as_milliseconds();
        Ok(vec![BounceRecord {
            bounce_type: BounceType::Hard,
            created_at: now - WEEK + SECOND * 2,
        }])
    }
}

#[test]
fn check_complaint() {
    let settings = create_settings(json!({
    "enabled": true,
    "soft": [],
    "hard": [],
    "complaint": [
      { "period": "month", "limit": 0 }
    ]
  }));
    let db = DbMockComplaint;
    let bounces = Bounces::new(&settings, Box::new(&db));
    match bounces.check("baz@example.com") {
        Ok(_) => assert!(false, "Bounces::check should have failed"),
        Err(error) => {
            assert_eq!(
                error.description(),
                "email address violated complaint limit"
            );
            assert_eq!(error.address, "baz@example.com");
            if let Some(bounce) = error.bounce {
                assert_eq!(bounce.bounce_type, BounceType::Complaint);
            } else {
                assert!(false, "Error::bounce should be set");
            }
        }
    }
}

pub struct DbMockComplaint;

impl Db for DbMockComplaint {
    fn get_email_bounces(&self, _address: &str) -> Result<Vec<BounceRecord>, DbError> {
        let now = now_as_milliseconds();
        Ok(vec![BounceRecord {
            bounce_type: BounceType::Complaint,
            created_at: now - MONTH + SECOND * 2,
        }])
    }
}

#[test]
fn check_db_error() {
    let settings = create_settings(json!({
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
  }));
    let db = DbMockError;
    let bounces = Bounces::new(&settings, Box::new(&db));
    match bounces.check("foo@example.com") {
        Ok(_) => assert!(false, "Bounces::check should have failed"),
        Err(error) => {
            assert_eq!(error.description(), "database error: wibble blee");
            assert_eq!(error.address, "");
            if let Some(_) = error.bounce {
                assert!(false, "Error::bounce should not be set");
            }
        }
    }
}

pub struct DbMockError;

impl Db for DbMockError {
    fn get_email_bounces(&self, _address: &str) -> Result<Vec<BounceRecord>, DbError> {
        Err(DbError::new(String::from("wibble blee")))
    }
}

#[test]
fn check_no_bounces_with_nonzero_limits() {
    let settings = create_settings(json!({
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
  }));
    let db = DbMockNoBounceWithNonZeroLimits;
    let bounces = Bounces::new(&settings, Box::new(&db));
    if let Err(error) = bounces.check("foo@example.com") {
        assert!(false, error.description().to_string());
    }
}

pub struct DbMockNoBounceWithNonZeroLimits;

impl Db for DbMockNoBounceWithNonZeroLimits {
    fn get_email_bounces(&self, _address: &str) -> Result<Vec<BounceRecord>, DbError> {
        let now = now_as_milliseconds();
        Ok(vec![
            BounceRecord {
                bounce_type: BounceType::Soft,
                created_at: now - DAY + MINUTE,
            },
            BounceRecord {
                bounce_type: BounceType::Hard,
                created_at: now - WEEK + MINUTE,
            },
            BounceRecord {
                bounce_type: BounceType::Complaint,
                created_at: now - MONTH + MINUTE,
            },
            BounceRecord {
                bounce_type: BounceType::Soft,
                created_at: now - DAY + SECOND * 2,
            },
            BounceRecord {
                bounce_type: BounceType::Hard,
                created_at: now - WEEK + SECOND * 2,
            },
            BounceRecord {
                bounce_type: BounceType::Complaint,
                created_at: now - MONTH + SECOND * 2,
            },
            BounceRecord {
                bounce_type: BounceType::Soft,
                created_at: now - DAY - 1,
            },
            BounceRecord {
                bounce_type: BounceType::Hard,
                created_at: now - WEEK - 1,
            },
            BounceRecord {
                bounce_type: BounceType::Complaint,
                created_at: now - MONTH - 1,
            },
        ])
    }
}

#[test]
fn check_bounce_with_multiple_limits() {
    let settings = create_settings(json!({
    "enabled": true,
    "soft": [
      { "period": "2 seconds", "limit": 0 },
      { "period": "2 minutes", "limit": 1 },
      { "period": "2 hours", "limit": 2 }
    ],
    "hard": [],
    "complaint": []
  }));
    let db = DbMockBounceWithMultipleLimits;
    let bounces = Bounces::new(&settings, Box::new(&db));
    match bounces.check("foo@example.com") {
        Ok(_) => assert!(false, "Bounces::check should have failed"),
        Err(error) => {
            assert_eq!(
                error.description(),
                "email address violated soft bounce limit"
            );
            assert_eq!(error.address, "foo@example.com");
            if let Some(bounce) = error.bounce {
                assert_eq!(bounce.bounce_type, BounceType::Soft);
            } else {
                assert!(false, "Error::bounce should be set");
            }
        }
    }
}

pub struct DbMockBounceWithMultipleLimits;

impl Db for DbMockBounceWithMultipleLimits {
    fn get_email_bounces(&self, _address: &str) -> Result<Vec<BounceRecord>, DbError> {
        let now = now_as_milliseconds();
        Ok(vec![
            BounceRecord {
                bounce_type: BounceType::Soft,
                created_at: now - SECOND * 4,
            },
            BounceRecord {
                bounce_type: BounceType::Soft,
                created_at: now - MINUTE * 2 + SECOND * 4,
            },
            BounceRecord {
                bounce_type: BounceType::Soft,
                created_at: now - MINUTE * 2 + SECOND * 3,
            },
            BounceRecord {
                bounce_type: BounceType::Soft,
                created_at: now - MINUTE * 2 + SECOND * 2,
            },
        ])
    }
}
