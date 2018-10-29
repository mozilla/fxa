// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, you can obtain one at https://mozilla.org/MPL/2.0/.

//! SQS queue notification types.

use std::fmt::{self, Display, Formatter};

use chrono::{DateTime, Utc};
use serde::{
    de::{Deserialize, Deserializer, Error as DeserializeError, Unexpected},
    ser::{Error as SerializeError, Serialize, Serializer},
};

use super::super::notification::{
    Bounce as GenericBounce, Complaint as GenericComplaint, Delivery as GenericDelivery,
    Mail as GenericMail, Notification as GenericNotification,
};
use db::delivery_problems::{ProblemSubtype, ProblemType};
use types::email_address::EmailAddress;

#[cfg(test)]
mod test;

/// The root SQS queue notification type.
///
/// This type is a direct encoding
/// of the [SES notification format][format].
///
/// It also receives synthesized notifications
/// from our [Sendgrid event proxy][proxy].
/// Because we don't have all of the data
/// necessary to fill out an entire `Notification`
/// from the data that Sendgrid provides,
/// many of the fields
/// which are not optional in the spec
/// are `Option`-wrapped anyway.
///
/// [format]: https://docs.aws.amazon.com/ses/latest/DeveloperGuide/notification-contents.html
/// [proxy]: https://github.com/mozilla/fxa-sendgrid-event-proxy
#[derive(Debug, Deserialize)]
pub struct Notification {
    #[serde(rename = "notificationType")]
    pub notification_type: NotificationType,
    pub mail: Mail,
    pub bounce: Option<Bounce>,
    pub complaint: Option<Complaint>,
    pub delivery: Option<Delivery>,
}

impl From<Notification> for GenericNotification {
    fn from(notification: Notification) -> GenericNotification {
        GenericNotification {
            notification_type: notification.notification_type,
            mail: From::from(notification.mail),
            metadata: None,
            bounce: notification.bounce.map(From::from),
            complaint: notification.complaint.map(From::from),
            delivery: notification.delivery.map(From::from),
        }
    }
}

#[derive(Clone, Copy, Debug, PartialEq)]
pub enum NotificationType {
    Bounce,
    Complaint,
    Delivery,
    Null,
}

impl AsRef<str> for NotificationType {
    fn as_ref(&self) -> &str {
        match *self {
            NotificationType::Bounce => "Bounce",
            NotificationType::Complaint => "Complaint",
            NotificationType::Delivery => "Delivery",
            NotificationType::Null => "",
        }
    }
}

impl Display for NotificationType {
    fn fmt(&self, formatter: &mut Formatter) -> fmt::Result {
        write!(formatter, "{}", self.as_ref())
    }
}

impl Default for NotificationType {
    fn default() -> NotificationType {
        NotificationType::Null
    }
}

impl<'d> Deserialize<'d> for NotificationType {
    fn deserialize<D>(deserializer: D) -> Result<Self, D::Error>
    where
        D: Deserializer<'d>,
    {
        let value: String = Deserialize::deserialize(deserializer)?;
        match value.as_str() {
            "Bounce" => Ok(NotificationType::Bounce),
            "Complaint" => Ok(NotificationType::Complaint),
            "Delivery" => Ok(NotificationType::Delivery),
            _ => Err(D::Error::invalid_value(
                Unexpected::Str(&value),
                &"SES notificiation type",
            )),
        }
    }
}

impl Serialize for NotificationType {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: Serializer,
    {
        let string = self.as_ref();
        if string == "" {
            Err(S::Error::custom("notification type not set"))
        } else {
            serializer.serialize_str(string)
        }
    }
}

#[derive(Debug, Deserialize)]
pub struct Mail {
    timestamp: DateTime<Utc>,
    #[serde(rename = "messageId")]
    message_id: String,
    source: Option<String>,
    destination: Option<Vec<String>>,
    headers: Option<Vec<Header>>,
}

impl From<Mail> for GenericMail {
    fn from(mail: Mail) -> GenericMail {
        GenericMail {
            timestamp: mail.timestamp,
            message_id: mail.message_id,
            source: mail.source,
            destination: mail.destination,
            headers: mail.headers,
        }
    }
}

#[derive(Debug, Deserialize, Serialize)]
pub struct Header {
    name: String,
    value: HeaderValue,
}

#[derive(Debug, Deserialize, Serialize)]
#[serde(untagged)]
pub enum HeaderValue {
    Single(String),
    Multiple(Vec<String>),
}

#[derive(Debug, Deserialize)]
pub struct Bounce {
    #[serde(rename = "bounceType")]
    pub bounce_type: BounceType,
    #[serde(rename = "bounceSubType")]
    pub bounce_subtype: BounceSubtype,
    #[serde(rename = "bouncedRecipients")]
    pub bounced_recipients: Vec<BouncedRecipient>,
    pub timestamp: DateTime<Utc>,
    #[serde(rename = "feedbackId")]
    pub feedback_id: String,
}

impl From<Bounce> for GenericBounce {
    fn from(bounce: Bounce) -> GenericBounce {
        GenericBounce {
            bounce_type: bounce.bounce_type,
            bounce_subtype: bounce.bounce_subtype,
            bounced_recipients: bounce
                .bounced_recipients
                .into_iter()
                .map(|recipient| recipient.email_address)
                .collect(),
            timestamp: bounce.timestamp,
        }
    }
}

#[derive(Copy, Clone, Debug, PartialEq, Serialize)]
pub enum BounceType {
    Undetermined,
    Permanent,
    Transient,
}

impl From<BounceType> for ProblemType {
    fn from(bounce_type: BounceType) -> ProblemType {
        match bounce_type {
            BounceType::Undetermined => {
                info!("Mapped SesBounceType::Undetermined to ProblemType::Soft");
                ProblemType::SoftBounce
            }
            BounceType::Permanent => ProblemType::HardBounce,
            BounceType::Transient => ProblemType::SoftBounce,
        }
    }
}

impl<'d> Deserialize<'d> for BounceType {
    fn deserialize<D>(deserializer: D) -> Result<Self, D::Error>
    where
        D: Deserializer<'d>,
    {
        let value: String = Deserialize::deserialize(deserializer)?;
        match value.as_str() {
            "Undetermined" => Ok(BounceType::Undetermined),
            "Permanent" => Ok(BounceType::Permanent),
            "Transient" => Ok(BounceType::Transient),
            _ => {
                info!(
                    "Mapped unrecognised SES bounceType `{}` to BounceType::Undetermined",
                    value.as_str()
                );
                Ok(BounceType::Undetermined)
            }
        }
    }
}

#[derive(Copy, Clone, Debug, PartialEq, Serialize)]
pub enum BounceSubtype {
    Undetermined,
    General,
    NoEmail,
    Suppressed,
    MailboxFull,
    MessageTooLarge,
    ContentRejected,
    AttachmentRejected,
}

impl From<BounceSubtype> for ProblemSubtype {
    fn from(bounce_subtype: BounceSubtype) -> ProblemSubtype {
        match bounce_subtype {
            BounceSubtype::Undetermined => ProblemSubtype::Undetermined,
            BounceSubtype::General => ProblemSubtype::General,
            BounceSubtype::NoEmail => ProblemSubtype::NoEmail,
            BounceSubtype::Suppressed => ProblemSubtype::Suppressed,
            BounceSubtype::MailboxFull => ProblemSubtype::MailboxFull,
            BounceSubtype::MessageTooLarge => ProblemSubtype::MessageTooLarge,
            BounceSubtype::ContentRejected => ProblemSubtype::ContentRejected,
            BounceSubtype::AttachmentRejected => ProblemSubtype::AttachmentRejected,
        }
    }
}

impl<'d> Deserialize<'d> for BounceSubtype {
    fn deserialize<D>(deserializer: D) -> Result<Self, D::Error>
    where
        D: Deserializer<'d>,
    {
        let value: String = Deserialize::deserialize(deserializer)?;
        match value.as_str() {
            "Undetermined" => Ok(BounceSubtype::Undetermined),
            "General" => Ok(BounceSubtype::General),
            "NoEmail" => Ok(BounceSubtype::NoEmail),
            "Suppressed" => Ok(BounceSubtype::Suppressed),
            "MailboxFull" => Ok(BounceSubtype::MailboxFull),
            "MessageTooLarge" => Ok(BounceSubtype::MessageTooLarge),
            "ContentRejected" => Ok(BounceSubtype::ContentRejected),
            "AttachmentRejected" => Ok(BounceSubtype::AttachmentRejected),
            _ => {
                info!(
                    "Mapped unrecognised SES bounceSubType `{}` to BounceSubtype::Undetermined",
                    value.as_str()
                );
                Ok(BounceSubtype::Undetermined)
            }
        }
    }
}

#[derive(Debug, Deserialize)]
pub struct BouncedRecipient {
    #[serde(rename = "emailAddress")]
    pub email_address: EmailAddress,
    pub action: Option<String>,
    pub status: Option<String>,
    #[serde(rename = "diagnosticCode")]
    pub diagnostic_code: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct Complaint {
    #[serde(rename = "complainedRecipients")]
    pub complained_recipients: Vec<ComplainedRecipient>,
    pub timestamp: DateTime<Utc>,
    #[serde(rename = "feedbackId")]
    pub feedback_id: String,
    #[serde(rename = "complaintFeedbackType")]
    pub complaint_feedback_type: Option<ComplaintFeedbackType>,
}

impl From<Complaint> for GenericComplaint {
    fn from(complaint: Complaint) -> GenericComplaint {
        GenericComplaint {
            complained_recipients: complaint
                .complained_recipients
                .into_iter()
                .map(|recipient| recipient.email_address)
                .collect(),
            complaint_feedback_type: complaint.complaint_feedback_type,
            timestamp: complaint.timestamp,
        }
    }
}

#[derive(Debug, Deserialize)]
pub struct ComplainedRecipient {
    #[serde(rename = "emailAddress")]
    pub email_address: EmailAddress,
}

#[derive(Copy, Clone, Debug, PartialEq)]
pub enum ComplaintFeedbackType {
    Abuse,
    AuthFailure,
    Fraud,
    NotSpam,
    Other,
    Virus,
}

impl From<ComplaintFeedbackType> for ProblemSubtype {
    fn from(complaint_feedback_type: ComplaintFeedbackType) -> ProblemSubtype {
        match complaint_feedback_type {
            ComplaintFeedbackType::Abuse => ProblemSubtype::Abuse,
            ComplaintFeedbackType::AuthFailure => ProblemSubtype::AuthFailure,
            ComplaintFeedbackType::Fraud => ProblemSubtype::Fraud,
            ComplaintFeedbackType::NotSpam => ProblemSubtype::NotSpam,
            ComplaintFeedbackType::Other => ProblemSubtype::Other,
            ComplaintFeedbackType::Virus => ProblemSubtype::Virus,
        }
    }
}

impl<'d> Deserialize<'d> for ComplaintFeedbackType {
    fn deserialize<D>(deserializer: D) -> Result<Self, D::Error>
    where
        D: Deserializer<'d>,
    {
        let value: String = Deserialize::deserialize(deserializer)?;
        match value.as_str() {
            "abuse" => Ok(ComplaintFeedbackType::Abuse),
            "auth-failure" => Ok(ComplaintFeedbackType::AuthFailure),
            "fraud" => Ok(ComplaintFeedbackType::Fraud),
            "not-spam" => Ok(ComplaintFeedbackType::NotSpam),
            "other" => Ok(ComplaintFeedbackType::Other),
            "virus" => Ok(ComplaintFeedbackType::Virus),
            _ => {
                info!("Mapped unrecognised SES complaintFeedbackType `{}` to ComplaintFeedbackType::Other", value.as_str());
                Ok(ComplaintFeedbackType::Other)
            }
        }
    }
}

impl Serialize for ComplaintFeedbackType {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: Serializer,
    {
        let value = match self {
            ComplaintFeedbackType::Abuse => "abuse",
            ComplaintFeedbackType::AuthFailure => "auth-failure",
            ComplaintFeedbackType::Fraud => "fraud",
            ComplaintFeedbackType::NotSpam => "not-spam",
            ComplaintFeedbackType::Other => "other",
            ComplaintFeedbackType::Virus => "virus",
        };
        serializer.serialize_str(value)
    }
}

#[derive(Debug, Deserialize)]
pub struct Delivery {
    pub timestamp: DateTime<Utc>,
    pub recipients: Vec<EmailAddress>,
}

impl From<Delivery> for GenericDelivery {
    fn from(delivery: Delivery) -> GenericDelivery {
        GenericDelivery {
            timestamp: delivery.timestamp,
            recipients: delivery.recipients,
        }
    }
}
