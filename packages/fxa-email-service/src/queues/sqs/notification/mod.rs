// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, you can obtain one at https://mozilla.org/MPL/2.0/.

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
use auth_db::{BounceSubtype as AuthDbBounceSubtype, BounceType as AuthDbBounceType};

#[cfg(test)]
mod test;

// This module is a direct encoding of the SES notification format documented
// here:
//
//   https://docs.aws.amazon.com/ses/latest/DeveloperGuide/notification-contents.html
//
// It also receives synthesized events from our Sendgrid event proxy:
//
//   https://github.com/mozilla/fxa-sendgrid-event-proxy
//
// Because we don't have all of the data to fill out an entire Notification
// struct with the data that Sendgrid provides, many of the fields which are
// not optional in the spec are Option-wrapped anyway.

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

impl From<NotificationType> for String {
    fn from(notification_type: NotificationType) -> String {
        String::from(match notification_type {
            NotificationType::Bounce => "Bounce",
            NotificationType::Complaint => "Complaint",
            NotificationType::Delivery => "Delivery",
            NotificationType::Null => "",
        })
    }
}

impl Display for NotificationType {
    fn fmt(&self, formatter: &mut Formatter) -> fmt::Result {
        write!(formatter, "{}", From::from(*self): String)
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
        let string: String = From::from(*self);
        if string == "" {
            Err(S::Error::custom("notification type not set"))
        } else {
            serializer.serialize_str(&string)
        }
    }
}

#[derive(Debug, Deserialize)]
pub struct Mail {
    timestamp: DateTime<Utc>,
    #[serde(rename = "messageId")]
    message_id: String,
    source: Option<String>,
    #[serde(rename = "sourceArn")]
    source_arn: Option<String>,
    #[serde(rename = "sourceIp")]
    source_ip: Option<String>,
    #[serde(rename = "sendingAccountId")]
    sending_account_id: Option<String>,
    destination: Option<Vec<String>>,
    #[serde(rename = "headersTruncated")]
    headers_truncated: Option<String>,
    headers: Option<Vec<Header>>,
    #[serde(rename = "commonHeaders")]
    common_headers: Option<Vec<Header>>,
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
    pub bounced_recipients: Vec<BouncedRecipient>,
    pub timestamp: DateTime<Utc>,
    #[serde(rename = "feedbackId")]
    pub feedback_id: String,
    #[serde(rename = "remoteMtaIp")]
    pub remote_mta_ip: Option<String>,
    #[serde(rename = "reportingMTA")]
    pub reporting_mta: Option<String>,
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

impl From<BounceType> for AuthDbBounceType {
    fn from(bounce_type: BounceType) -> AuthDbBounceType {
        match bounce_type {
            BounceType::Undetermined => {
                println!("Mapped SesBounceType::Undetermined to AuthDbBounceType::Soft");
                AuthDbBounceType::Soft
            }
            BounceType::Permanent => AuthDbBounceType::Hard,
            BounceType::Transient => AuthDbBounceType::Soft,
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
                println!(
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

impl From<BounceSubtype> for AuthDbBounceSubtype {
    fn from(bounce_subtype: BounceSubtype) -> AuthDbBounceSubtype {
        match bounce_subtype {
            BounceSubtype::Undetermined => AuthDbBounceSubtype::Undetermined,
            BounceSubtype::General => AuthDbBounceSubtype::General,
            BounceSubtype::NoEmail => AuthDbBounceSubtype::NoEmail,
            BounceSubtype::Suppressed => AuthDbBounceSubtype::Suppressed,
            BounceSubtype::MailboxFull => AuthDbBounceSubtype::MailboxFull,
            BounceSubtype::MessageTooLarge => AuthDbBounceSubtype::MessageTooLarge,
            BounceSubtype::ContentRejected => AuthDbBounceSubtype::ContentRejected,
            BounceSubtype::AttachmentRejected => AuthDbBounceSubtype::AttachmentRejected,
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
                println!(
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
    pub email_address: String,
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
    #[serde(rename = "userAgent")]
    pub user_agent: Option<String>,
    #[serde(rename = "complaintFeedbackType")]
    pub complaint_feedback_type: Option<ComplaintFeedbackType>,
    #[serde(rename = "arrivalDate")]
    pub arrival_date: Option<DateTime<Utc>>,
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
    pub email_address: String,
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

impl From<ComplaintFeedbackType> for AuthDbBounceSubtype {
    fn from(complaint_feedback_type: ComplaintFeedbackType) -> AuthDbBounceSubtype {
        match complaint_feedback_type {
            ComplaintFeedbackType::Abuse => AuthDbBounceSubtype::Abuse,
            ComplaintFeedbackType::AuthFailure => AuthDbBounceSubtype::AuthFailure,
            ComplaintFeedbackType::Fraud => AuthDbBounceSubtype::Fraud,
            ComplaintFeedbackType::NotSpam => AuthDbBounceSubtype::NotSpam,
            ComplaintFeedbackType::Other => AuthDbBounceSubtype::Other,
            ComplaintFeedbackType::Virus => AuthDbBounceSubtype::Virus,
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
                println!("Mapped unrecognised SES complaintFeedbackType `{}` to ComplaintFeedbackType::Other", value.as_str());
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
    #[serde(rename = "processingTimeMillis")]
    pub processing_time_millis: Option<u32>,
    pub recipients: Vec<String>,
    #[serde(rename = "smtpResponse")]
    pub smtp_response: Option<String>,
    #[serde(rename = "remoteMtaIp")]
    pub remote_mta_ip: Option<String>,
    #[serde(rename = "reportingMTA")]
    pub reporting_mta: Option<String>,
}

impl From<Delivery> for GenericDelivery {
    fn from(delivery: Delivery) -> GenericDelivery {
        GenericDelivery {
            timestamp: delivery.timestamp,
            recipients: delivery.recipients,
        }
    }
}
