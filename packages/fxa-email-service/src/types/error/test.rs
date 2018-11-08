// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, you can obtain one at https://mozilla.org/MPL/2.0/.

use chrono::Utc;

use super::*;
use db::delivery_problems::{ProblemSubtype, ProblemType};

#[test]
fn internal() {
    let error: AppError = AppErrorKind::Internal("wibble".to_owned()).into();
    assert_eq!(error.code(), 500);
    assert_eq!(error.error(), "Internal Server Error");
    assert_eq!(error.errno().unwrap(), 100);
    assert_eq!(error.to_string(), "wibble");
    assert_eq!(error.additional_fields().len(), 0);
}

#[test]
fn not_implemented() {
    let error: AppError = AppErrorKind::NotImplemented("wibble".to_owned()).into();
    assert_eq!(error.code(), 500);
    assert_eq!(error.error(), "Internal Server Error");
    assert_eq!(error.errno().unwrap(), 101);
    assert_eq!(error.to_string(), "Not implemented: wibble");
    assert_eq!(error.additional_fields().len(), 0);
}

#[test]
fn invalid_payload() {
    let error: AppError = AppErrorKind::InvalidPayload("wibble".to_owned()).into();
    assert_eq!(error.code(), 400);
    assert_eq!(error.error(), "Bad Request");
    assert_eq!(error.errno().unwrap(), 102);
    assert_eq!(error.to_string(), "Invalid payload: wibble");
    assert_eq!(error.additional_fields().len(), 0);
}

#[test]
fn invalid_notification() {
    let error: AppError = AppErrorKind::InvalidNotification("wibble".to_owned()).into();
    assert_eq!(error.code(), 500);
    assert_eq!(error.error(), "Internal Server Error");
    assert_eq!(error.errno().unwrap(), 103);
    assert_eq!(error.to_string(), "Invalid notification: wibble");
    assert_eq!(error.additional_fields().len(), 0);
}

#[test]
fn queue_error() {
    let error: AppError = AppErrorKind::QueueError("wibble".to_owned()).into();
    assert_eq!(error.code(), 500);
    assert_eq!(error.error(), "Internal Server Error");
    assert_eq!(error.errno().unwrap(), 104);
    assert_eq!(error.to_string(), "wibble");
    assert_eq!(error.additional_fields().len(), 0);
}

#[test]
fn invalid_duration() {
    let error: AppError = AppErrorKind::InvalidDuration("wibble".to_owned()).into();
    assert_eq!(error.code(), 500);
    assert_eq!(error.error(), "Internal Server Error");
    assert_eq!(error.errno().unwrap(), 105);
    assert_eq!(error.to_string(), "Invalid duration: wibble");
    assert_eq!(error.additional_fields().len(), 0);
}

#[test]
fn complaint() {
    let error: AppError = AppErrorKind::Complaint {
        address: "baz@example.com".parse().unwrap(),
        time: 3,
        problem: DeliveryProblem {
            address: "baz@example.com".parse().unwrap(),
            problem_type: ProblemType::Complaint,
            problem_subtype: ProblemSubtype::Fraud,
            created_at: Utc::now(),
        },
    }
    .into();
    assert_eq!(error.code(), 429);
    assert_eq!(error.error(), "Too Many Requests");
    assert_eq!(error.errno().unwrap(), 106);
    assert_eq!(error.to_string(), "Complaint limit violated");
    assert_eq!(error.additional_fields().len(), 3);
    assert_eq!(error.additional_fields()["address"], "baz@example.com");
    assert_eq!(error.additional_fields()["time"], 3);
}

#[test]
fn soft_bounce() {
    let error: AppError = AppErrorKind::SoftBounce {
        address: "foo@example.com".parse().unwrap(),
        time: 1,
        problem: DeliveryProblem {
            address: "foo@example.com".parse().unwrap(),
            problem_type: ProblemType::SoftBounce,
            problem_subtype: ProblemSubtype::MailboxFull,
            created_at: Utc::now(),
        },
    }
    .into();
    assert_eq!(error.code(), 429);
    assert_eq!(error.error(), "Too Many Requests");
    assert_eq!(error.errno().unwrap(), 107);
    assert_eq!(error.to_string(), "Soft-bounce limit violated");
    assert_eq!(error.additional_fields().len(), 3);
    assert_eq!(error.additional_fields()["address"], "foo@example.com");
    assert_eq!(error.additional_fields()["time"], 1);
}

#[test]
fn hard_bounce() {
    let error: AppError = AppErrorKind::HardBounce {
        address: "bar@example.com".parse().unwrap(),
        time: 2,
        problem: DeliveryProblem {
            address: "bar@example.com".parse().unwrap(),
            problem_type: ProblemType::HardBounce,
            problem_subtype: ProblemSubtype::NoEmail,
            created_at: Utc::now(),
        },
    }
    .into();
    assert_eq!(error.code(), 429);
    assert_eq!(error.error(), "Too Many Requests");
    assert_eq!(error.errno().unwrap(), 108);
    assert_eq!(error.to_string(), "Hard-bounce limit violated");
    assert_eq!(error.additional_fields().len(), 3);
    assert_eq!(error.additional_fields()["address"], "bar@example.com");
    assert_eq!(error.additional_fields()["time"], 2);
}
