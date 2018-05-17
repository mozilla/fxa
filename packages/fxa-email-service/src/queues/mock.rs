// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, you can obtain one at https://mozilla.org/MPL/2.0/.

use chrono::Utc;

use super::{
    notification::{
        Bounce, BounceSubtype, BounceType, BouncedRecipient, ComplainedRecipient, Complaint,
        Delivery, Notification, NotificationType,
    },
    Factory, Incoming, Message, Outgoing, QueueError,
};
use settings::Settings;

#[derive(Debug)]
pub struct Queue<'s> {
    id: &'s str,
}

impl<'s> Factory<'s> for Queue<'s> {
    fn new(id: &'s str, _settings: &Settings) -> Queue<'s> {
        Queue { id }
    }
}

impl<'s> Incoming for Queue<'s> {
    fn receive(&self) -> Result<Vec<Message>, QueueError> {
        let message = match self.id {
            "incoming-bounce" => {
                let mut bounce_message = Message::default();
                bounce_message.notification.notification_type = NotificationType::Bounce;
                bounce_message.notification.bounce = Some(Bounce {
                    bounce_type: BounceType::Permanent,
                    bounce_subtype: BounceSubtype::General,
                    bounced_recipients: vec![BouncedRecipient {
                        email_address: String::from(
                            "fxa-email-service.queues.mock.bounce@example.com",
                        ),
                        action: None,
                        status: None,
                        diagnostic_code: None,
                    }],
                    timestamp: Utc::now(),
                    feedback_id: String::from(""),
                    remote_mta_ip: None,
                    reporting_mta: None,
                });
                bounce_message
            }

            "incoming-complaint" => {
                let mut complaint_message = Message::default();
                complaint_message.notification.notification_type = NotificationType::Complaint;
                complaint_message.notification.complaint = Some(Complaint {
                    complained_recipients: vec![ComplainedRecipient {
                        email_address: String::from(
                            "fxa-email-service.queues.mock.complaint@example.com",
                        ),
                    }],
                    timestamp: Utc::now(),
                    feedback_id: String::from(""),
                    user_agent: None,
                    complaint_feedback_type: None,
                    arrival_date: Utc::now(),
                });
                complaint_message
            }

            "incoming-delivery" => {
                let mut delivery_message = Message::default();
                delivery_message.notification.notification_type = NotificationType::Delivery;
                delivery_message.notification.delivery = Some(Delivery {
                    timestamp: Utc::now(),
                    processing_time_millis: 0,
                    recipients: vec![String::from(
                        "fxa-email-service.queues.mock.delivery@example.com",
                    )],
                    smtp_response: String::from(""),
                    remote_mta_ip: None,
                    reporting_mta: None,
                });
                delivery_message
            }

            _ => return Err(QueueError::new(String::from("Not implemented"))),
        };

        Ok(vec![message])
    }

    fn delete(&self, _message: Message) -> Result<(), QueueError> {
        if self.id == "outgoing" {
            Err(QueueError::new(String::from("Not implemented")))
        } else {
            Ok(())
        }
    }
}

impl<'s> Outgoing for Queue<'s> {
    fn send(&self, _body: &Notification) -> Result<String, QueueError> {
        if self.id == "outgoing" {
            Ok(String::from("deadbeef"))
        } else {
            Err(QueueError::new(String::from("Not implemented")))
        }
    }
}
