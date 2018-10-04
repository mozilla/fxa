// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, you can obtain one at https://mozilla.org/MPL/2.0/.

use std::error::Error;

use serde_json;

use super::*;

#[test]
fn deserialize_notification_type() {
    let notification_type: NotificationType =
        serde_json::from_value(From::from("Bounce")).expect("JSON error");
    assert_eq!(notification_type, NotificationType::Bounce);
    let notification_type: NotificationType =
        serde_json::from_value(From::from("Complaint")).expect("JSON error");
    assert_eq!(notification_type, NotificationType::Complaint);
    let notification_type: NotificationType =
        serde_json::from_value(From::from("Delivery")).expect("JSON error");
    assert_eq!(notification_type, NotificationType::Delivery);
}

#[test]
fn deserialize_invalid_notification_type() {
    match serde_json::from_value::<NotificationType>(From::from("bounce")) {
        Ok(_) => assert!(false, "serde_json::from_value should have failed"),
        Err(error) => assert_eq!(error.description(), "JSON error"),
    }
    match serde_json::from_value::<NotificationType>(From::from("Bouncex")) {
        Ok(_) => assert!(false, "serde_json::from_value should have failed"),
        Err(error) => assert_eq!(error.description(), "JSON error"),
    }
    match serde_json::from_value::<NotificationType>(From::from("BBounce")) {
        Ok(_) => assert!(false, "serde_json::from_value should have failed"),
        Err(error) => assert_eq!(error.description(), "JSON error"),
    }
}

#[test]
fn serialize_notification_type() {
    let json = serde_json::to_string(&NotificationType::Bounce).expect("JSON error");
    assert_eq!(json, "\"Bounce\"");
    let json = serde_json::to_string(&NotificationType::Complaint).expect("JSON error");
    assert_eq!(json, "\"Complaint\"");
    let json = serde_json::to_string(&NotificationType::Delivery).expect("JSON error");
    assert_eq!(json, "\"Delivery\"");
}

#[test]
fn serialize_null_notification_type() {
    match serde_json::to_string(&NotificationType::Null) {
        Ok(_) => assert!(false, "serde_json::to_string should have failed"),
        Err(error) => assert_eq!(error.description(), "JSON error"),
    }
}

#[test]
fn bounce_type_to_auth_db() {
    let db_bounce_type: AuthDbBounceType = From::from(BounceType::Undetermined);
    assert_eq!(db_bounce_type, AuthDbBounceType::Soft);
    let db_bounce_type: AuthDbBounceType = From::from(BounceType::Permanent);
    assert_eq!(db_bounce_type, AuthDbBounceType::Hard);
    let db_bounce_type: AuthDbBounceType = From::from(BounceType::Transient);
    assert_eq!(db_bounce_type, AuthDbBounceType::Soft);
}

#[test]
fn deserialize_bounce_type() {
    let bounce_type: BounceType =
        serde_json::from_value(From::from("Undetermined")).expect("JSON error");
    assert_eq!(bounce_type, BounceType::Undetermined);
    let bounce_type: BounceType =
        serde_json::from_value(From::from("Permanent")).expect("JSON error");
    assert_eq!(bounce_type, BounceType::Permanent);
    let bounce_type: BounceType =
        serde_json::from_value(From::from("Transient")).expect("JSON error");
    assert_eq!(bounce_type, BounceType::Transient);
    let bounce_type: BounceType = serde_json::from_value(From::from("wibble")).expect("JSON error");
    assert_eq!(bounce_type, BounceType::Undetermined);
    let bounce_type: BounceType =
        serde_json::from_value(From::from("Permanentx")).expect("JSON error");
    assert_eq!(bounce_type, BounceType::Undetermined);
    let bounce_type: BounceType =
        serde_json::from_value(From::from("PPermanent")).expect("JSON error");
    assert_eq!(bounce_type, BounceType::Undetermined);
}

#[test]
fn serialize_bounce_type() {
    let json = serde_json::to_string(&BounceType::Undetermined).expect("JSON error");
    assert_eq!(json, "\"Undetermined\"");
    let json = serde_json::to_string(&BounceType::Permanent).expect("JSON error");
    assert_eq!(json, "\"Permanent\"");
    let json = serde_json::to_string(&BounceType::Transient).expect("JSON error");
    assert_eq!(json, "\"Transient\"");
}

#[test]
fn bounce_subtype_to_auth_db() {
    let db_bounce_subtype: AuthDbBounceSubtype = From::from(BounceSubtype::Undetermined);
    assert_eq!(db_bounce_subtype, AuthDbBounceSubtype::Undetermined);
    let db_bounce_subtype: AuthDbBounceSubtype = From::from(BounceSubtype::General);
    assert_eq!(db_bounce_subtype, AuthDbBounceSubtype::General);
    let db_bounce_subtype: AuthDbBounceSubtype = From::from(BounceSubtype::NoEmail);
    assert_eq!(db_bounce_subtype, AuthDbBounceSubtype::NoEmail);
    let db_bounce_subtype: AuthDbBounceSubtype = From::from(BounceSubtype::Suppressed);
    assert_eq!(db_bounce_subtype, AuthDbBounceSubtype::Suppressed);
    let db_bounce_subtype: AuthDbBounceSubtype = From::from(BounceSubtype::MailboxFull);
    assert_eq!(db_bounce_subtype, AuthDbBounceSubtype::MailboxFull);
    let db_bounce_subtype: AuthDbBounceSubtype = From::from(BounceSubtype::MessageTooLarge);
    assert_eq!(db_bounce_subtype, AuthDbBounceSubtype::MessageTooLarge);
    let db_bounce_subtype: AuthDbBounceSubtype = From::from(BounceSubtype::ContentRejected);
    assert_eq!(db_bounce_subtype, AuthDbBounceSubtype::ContentRejected);
    let db_bounce_subtype: AuthDbBounceSubtype = From::from(BounceSubtype::AttachmentRejected);
    assert_eq!(db_bounce_subtype, AuthDbBounceSubtype::AttachmentRejected);
}

#[test]
fn deserialize_bounce_subtype() {
    let bounce_subtype: BounceSubtype =
        serde_json::from_value(From::from("Undetermined")).expect("JSON error");
    assert_eq!(bounce_subtype, BounceSubtype::Undetermined);
    let bounce_subtype: BounceSubtype =
        serde_json::from_value(From::from("General")).expect("JSON error");
    assert_eq!(bounce_subtype, BounceSubtype::General);
    let bounce_subtype: BounceSubtype =
        serde_json::from_value(From::from("NoEmail")).expect("JSON error");
    assert_eq!(bounce_subtype, BounceSubtype::NoEmail);
    let bounce_subtype: BounceSubtype =
        serde_json::from_value(From::from("Suppressed")).expect("JSON error");
    assert_eq!(bounce_subtype, BounceSubtype::Suppressed);
    let bounce_subtype: BounceSubtype =
        serde_json::from_value(From::from("MailboxFull")).expect("JSON error");
    assert_eq!(bounce_subtype, BounceSubtype::MailboxFull);
    let bounce_subtype: BounceSubtype =
        serde_json::from_value(From::from("MessageTooLarge")).expect("JSON error");
    assert_eq!(bounce_subtype, BounceSubtype::MessageTooLarge);
    let bounce_subtype: BounceSubtype =
        serde_json::from_value(From::from("ContentRejected")).expect("JSON error");
    assert_eq!(bounce_subtype, BounceSubtype::ContentRejected);
    let bounce_subtype: BounceSubtype =
        serde_json::from_value(From::from("AttachmentRejected")).expect("JSON error");
    assert_eq!(bounce_subtype, BounceSubtype::AttachmentRejected);
    let bounce_subtype: BounceSubtype =
        serde_json::from_value(From::from("wibble")).expect("JSON error");
    assert_eq!(bounce_subtype, BounceSubtype::Undetermined);
    let bounce_subtype: BounceSubtype =
        serde_json::from_value(From::from("undetermined")).expect("JSON error");
    assert_eq!(bounce_subtype, BounceSubtype::Undetermined);
    let bounce_subtype: BounceSubtype =
        serde_json::from_value(From::from("Undeterminedd")).expect("JSON error");
    assert_eq!(bounce_subtype, BounceSubtype::Undetermined);
    let bounce_subtype: BounceSubtype =
        serde_json::from_value(From::from("UUndetermined")).expect("JSON error");
    assert_eq!(bounce_subtype, BounceSubtype::Undetermined);
}

#[test]
fn serialize_bounce_subtype() {
    let json = serde_json::to_string(&BounceSubtype::Undetermined).expect("JSON error");
    assert_eq!(json, "\"Undetermined\"");
    let json = serde_json::to_string(&BounceSubtype::General).expect("JSON error");
    assert_eq!(json, "\"General\"");
    let json = serde_json::to_string(&BounceSubtype::NoEmail).expect("JSON error");
    assert_eq!(json, "\"NoEmail\"");
    let json = serde_json::to_string(&BounceSubtype::Suppressed).expect("JSON error");
    assert_eq!(json, "\"Suppressed\"");
    let json = serde_json::to_string(&BounceSubtype::MailboxFull).expect("JSON error");
    assert_eq!(json, "\"MailboxFull\"");
    let json = serde_json::to_string(&BounceSubtype::MessageTooLarge).expect("JSON error");
    assert_eq!(json, "\"MessageTooLarge\"");
    let json = serde_json::to_string(&BounceSubtype::ContentRejected).expect("JSON error");
    assert_eq!(json, "\"ContentRejected\"");
    let json = serde_json::to_string(&BounceSubtype::AttachmentRejected).expect("JSON error");
    assert_eq!(json, "\"AttachmentRejected\"");
}

#[test]
fn complaint_feedback_type_to_auth_db() {
    let db_complaint_feedback_type: AuthDbBounceSubtype = From::from(ComplaintFeedbackType::Abuse);
    assert_eq!(db_complaint_feedback_type, AuthDbBounceSubtype::Abuse);
    let db_complaint_feedback_type: AuthDbBounceSubtype =
        From::from(ComplaintFeedbackType::AuthFailure);
    assert_eq!(db_complaint_feedback_type, AuthDbBounceSubtype::AuthFailure);
    let db_complaint_feedback_type: AuthDbBounceSubtype = From::from(ComplaintFeedbackType::Fraud);
    assert_eq!(db_complaint_feedback_type, AuthDbBounceSubtype::Fraud);
    let db_complaint_feedback_type: AuthDbBounceSubtype =
        From::from(ComplaintFeedbackType::NotSpam);
    assert_eq!(db_complaint_feedback_type, AuthDbBounceSubtype::NotSpam);
    let db_complaint_feedback_type: AuthDbBounceSubtype = From::from(ComplaintFeedbackType::Other);
    assert_eq!(db_complaint_feedback_type, AuthDbBounceSubtype::Other);
    let db_complaint_feedback_type: AuthDbBounceSubtype = From::from(ComplaintFeedbackType::Virus);
    assert_eq!(db_complaint_feedback_type, AuthDbBounceSubtype::Virus);
}

#[test]
fn deserialize_complaint_feedback_type() {
    let complaint_feedback_type: ComplaintFeedbackType =
        serde_json::from_value(From::from("abuse")).expect("JSON error");
    assert_eq!(complaint_feedback_type, ComplaintFeedbackType::Abuse);
    let complaint_feedback_type: ComplaintFeedbackType =
        serde_json::from_value(From::from("auth-failure")).expect("JSON error");
    assert_eq!(complaint_feedback_type, ComplaintFeedbackType::AuthFailure);
    let complaint_feedback_type: ComplaintFeedbackType =
        serde_json::from_value(From::from("fraud")).expect("JSON error");
    assert_eq!(complaint_feedback_type, ComplaintFeedbackType::Fraud);
    let complaint_feedback_type: ComplaintFeedbackType =
        serde_json::from_value(From::from("not-spam")).expect("JSON error");
    assert_eq!(complaint_feedback_type, ComplaintFeedbackType::NotSpam);
    let complaint_feedback_type: ComplaintFeedbackType =
        serde_json::from_value(From::from("other")).expect("JSON error");
    assert_eq!(complaint_feedback_type, ComplaintFeedbackType::Other);
    let complaint_feedback_type: ComplaintFeedbackType =
        serde_json::from_value(From::from("virus")).expect("JSON error");
    assert_eq!(complaint_feedback_type, ComplaintFeedbackType::Virus);
    let complaint_feedback_type: ComplaintFeedbackType =
        serde_json::from_value(From::from("wibble")).expect("JSON error");
    assert_eq!(complaint_feedback_type, ComplaintFeedbackType::Other);
    let complaint_feedback_type: ComplaintFeedbackType =
        serde_json::from_value(From::from("Abuse")).expect("JSON error");
    assert_eq!(complaint_feedback_type, ComplaintFeedbackType::Other);
    let complaint_feedback_type: ComplaintFeedbackType =
        serde_json::from_value(From::from("abusee")).expect("JSON error");
    assert_eq!(complaint_feedback_type, ComplaintFeedbackType::Other);
    let complaint_feedback_type: ComplaintFeedbackType =
        serde_json::from_value(From::from("aabuse")).expect("JSON error");
    assert_eq!(complaint_feedback_type, ComplaintFeedbackType::Other);
}

#[test]
fn serialize_complaint_feedback_type() {
    let json = serde_json::to_string(&ComplaintFeedbackType::Abuse).expect("JSON error");
    assert_eq!(json, "\"abuse\"");
    let json = serde_json::to_string(&ComplaintFeedbackType::AuthFailure).expect("JSON error");
    assert_eq!(json, "\"auth-failure\"");
    let json = serde_json::to_string(&ComplaintFeedbackType::Fraud).expect("JSON error");
    assert_eq!(json, "\"fraud\"");
    let json = serde_json::to_string(&ComplaintFeedbackType::NotSpam).expect("JSON error");
    assert_eq!(json, "\"not-spam\"");
    let json = serde_json::to_string(&ComplaintFeedbackType::Other).expect("JSON error");
    assert_eq!(json, "\"other\"");
    let json = serde_json::to_string(&ComplaintFeedbackType::Virus).expect("JSON error");
    assert_eq!(json, "\"virus\"");
}

#[test]
fn deserialize_notification() {
    let json = include_str!("test_notifications.json");
    let notifications: Vec<Notification> = serde_json::from_str(json).expect("JSON error");

    assert_eq!(notifications.len(), 3);

    assert_eq!(notifications[0].notification_type, NotificationType::Bounce);
    assert_eq!(
        notifications[0].mail.source,
        Some("foo@example.com".to_string())
    );
    assert_eq!(
        notifications[0].mail.destination,
        Some(["bar@example.com".to_string()].to_vec())
    );
    assert!(notifications[0].bounce.is_some());
    assert!(notifications[0].complaint.is_none());
    assert!(notifications[0].delivery.is_none());
    let bounce = match notifications[0].bounce {
        Some(ref record) => record,
        _ => panic!("Bounce record should exist."),
    };
    assert_eq!(bounce.bounced_recipients.len(), 3);
    assert_eq!(
        bounce.bounced_recipients[0].email_address.as_ref(),
        "bar@example.com"
    );
    assert_eq!(
        bounce.bounced_recipients[1].email_address.as_ref(),
        "baz@example.com"
    );
    assert_eq!(
        bounce.bounced_recipients[2].email_address.as_ref(),
        "qux@example.com"
    );
    assert_eq!(bounce.bounce_type, BounceType::Permanent);
    assert_eq!(bounce.bounce_subtype, BounceSubtype::General);

    assert_eq!(
        notifications[1].notification_type,
        NotificationType::Complaint
    );
    assert_eq!(
        notifications[1].mail.source,
        Some("qux@example.com".to_string())
    );
    assert_eq!(
        notifications[1].mail.destination,
        Some(["baz@example.com".to_string()].to_vec())
    );
    assert!(notifications[1].bounce.is_none());
    assert!(notifications[1].complaint.is_some());
    assert!(notifications[1].delivery.is_none());
    let complaint = match notifications[1].complaint {
        Some(ref record) => record,
        _ => panic!("Complaint record should exist."),
    };
    assert_eq!(
        complaint.complained_recipients[0].email_address.as_ref(),
        "baz@example.com"
    );
    assert_eq!(
        complaint.complaint_feedback_type,
        Some(ComplaintFeedbackType::Abuse)
    );

    assert_eq!(
        notifications[2].notification_type,
        NotificationType::Delivery
    );
    assert_eq!(
        notifications[2].mail.source,
        Some("quuz@example.com".to_string())
    );
    assert_eq!(
        notifications[2].mail.destination,
        Some(["xyzzy@example.com".to_string()].to_vec())
    );
    assert!(notifications[2].bounce.is_none());
    assert!(notifications[2].complaint.is_none());
    assert!(notifications[2].delivery.is_some());
    let delivery = match notifications[2].delivery {
        Some(ref record) => record,
        _ => panic!("Delivery record should exist."),
    };
    assert_eq!(delivery.recipients[0].as_ref(), "xyzzy@example.com");
}
