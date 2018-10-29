// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, you can obtain one at https://mozilla.org/MPL/2.0/.

//! Generic queue notification types.

use chrono::{DateTime, Utc};

pub use super::sqs::notification::{
    BounceSubtype, BounceType, ComplaintFeedbackType, Header, HeaderValue, NotificationType,
};
use email_address::EmailAddress;

/// The root notification type.
///
/// This "generic" type
/// is really just a subset
/// of the [SQS notification type][sqs].
/// That's mostly so we can easily interface
/// with existing auth server code
/// that already knows about
/// the SQS message format.
/// Longer-term we can do whatever we want
/// in here.
///
/// [sqs]: ../sqs/notification/struct.Notification.html
#[derive(Debug, Default, Serialize)]
pub struct Notification {
    #[serde(rename = "notificationType")]
    pub notification_type: NotificationType,
    pub mail: Mail,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub metadata: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub bounce: Option<Bounce>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub complaint: Option<Complaint>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub delivery: Option<Delivery>,
}

#[derive(Debug, Serialize)]
pub struct Mail {
    pub timestamp: DateTime<Utc>,
    #[serde(rename = "messageId")]
    pub message_id: String,
    pub source: Option<String>,
    pub destination: Option<Vec<String>>,
    pub headers: Option<Vec<Header>>,
}

impl Default for Mail {
    fn default() -> Mail {
        Mail {
            timestamp: Utc::now(),
            message_id: String::from(""),
            source: None,
            destination: None,
            headers: None,
        }
    }
}

#[derive(Debug, Serialize)]
pub struct Bounce {
    #[serde(rename = "bounceType")]
    pub bounce_type: BounceType,
    #[serde(rename = "bounceSubType")]
    pub bounce_subtype: BounceSubtype,
    #[serde(rename = "bouncedRecipients")]
    pub bounced_recipients: Vec<EmailAddress>,
    pub timestamp: DateTime<Utc>,
}

#[derive(Debug, Serialize)]
pub struct Complaint {
    #[serde(rename = "complainedRecipients")]
    pub complained_recipients: Vec<EmailAddress>,
    #[serde(rename = "complaintFeedbackType")]
    pub complaint_feedback_type: Option<ComplaintFeedbackType>,
    pub timestamp: DateTime<Utc>,
}

#[derive(Debug, Serialize)]
pub struct Delivery {
    pub timestamp: DateTime<Utc>,
    pub recipients: Vec<EmailAddress>,
}
