// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, you can obtain one at https://mozilla.org/MPL/2.0/.

use chrono::{DateTime, Utc};

pub use super::sqs::notification::{
    BounceSubtype, BounceType, ComplaintFeedbackType, Header, HeaderValue, NotificationType,
};

// This "generic" notification type is actually just a subset of the SQS
// notification type in src/queues/sqs/notification/mod.rs. That's mostly
// so we can easily interface with existing auth server code that already
// knows about the SQS message format. Longer-term we can do whatever we
// want in here.

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
    pub source: String,
    pub destination: Vec<String>,
    pub headers: Option<Vec<Header>>,
}

impl Default for Mail {
    fn default() -> Mail {
        Mail {
            timestamp: Utc::now(),
            message_id: String::from(""),
            source: String::from(""),
            destination: Vec::new(),
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
    pub bounced_recipients: Vec<String>,
    pub timestamp: DateTime<Utc>,
}

#[derive(Debug, Serialize)]
pub struct Complaint {
    #[serde(rename = "complainedRecipients")]
    pub complained_recipients: Vec<String>,
    #[serde(rename = "complaintFeedbackType")]
    pub complaint_feedback_type: Option<ComplaintFeedbackType>,
    pub timestamp: DateTime<Utc>,
}

#[derive(Debug, Serialize)]
pub struct Delivery {
    pub timestamp: DateTime<Utc>,
    pub recipients: Vec<String>,
}
