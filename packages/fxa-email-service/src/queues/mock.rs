// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, you can obtain one at https://mozilla.org/MPL/2.0/.

use chrono::Utc;
use futures::future::{self, Future};

use super::{
    notification::{
        Bounce, BounceSubtype, BounceType, Complaint, Delivery, Notification, NotificationType,
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

impl<'s> Incoming<'s> for Queue<'s> {
    fn receive(&'s self) -> Box<Future<Item = Vec<Message>, Error = QueueError> + 's> {
        let message = match self.id {
            "incoming-bounce" => {
                let mut bounce_message = Message::default();
                bounce_message.notification.notification_type = NotificationType::Bounce;
                bounce_message.notification.bounce = Some(Bounce {
                    bounce_type: BounceType::Permanent,
                    bounce_subtype: BounceSubtype::General,
                    bounced_recipients: vec![String::from(
                        "fxa-email-service.queues.mock.bounce@example.com",
                    )],
                    timestamp: Utc::now(),
                });
                bounce_message
            }

            "incoming-complaint" => {
                let mut complaint_message = Message::default();
                complaint_message.notification.notification_type = NotificationType::Complaint;
                complaint_message.notification.complaint = Some(Complaint {
                    complained_recipients: vec![String::from(
                        "fxa-email-service.queues.mock.complaint@example.com",
                    )],
                    timestamp: Utc::now(),
                    complaint_feedback_type: None,
                });
                complaint_message
            }

            "incoming-delivery" => {
                let mut delivery_message = Message::default();
                delivery_message.notification.notification_type = NotificationType::Delivery;
                delivery_message.notification.delivery = Some(Delivery {
                    timestamp: Utc::now(),
                    recipients: vec![String::from(
                        "fxa-email-service.queues.mock.delivery@example.com",
                    )],
                });
                delivery_message
            }

            "incoming-bounce-error" => {
                let mut invalid_message = Message::default();
                invalid_message.notification.notification_type = NotificationType::Bounce;
                invalid_message.notification.complaint = Some(Complaint {
                    complained_recipients: vec![String::from(
                        "fxa-email-service.queues.mock.complaint@example.com",
                    )],
                    timestamp: Utc::now(),
                    complaint_feedback_type: None,
                });
                invalid_message
            }

            _ => {
                return Box::new(future::err(QueueError::new(String::from(
                    "Not implemented",
                ))))
            }
        };

        Box::new(future::ok(vec![message]))
    }

    fn delete(&'s self, _message: Message) -> Box<Future<Item = (), Error = QueueError> + 's> {
        if self.id == "outgoing" {
            Box::new(future::err(QueueError::new(String::from(
                "Not implemented",
            ))))
        } else {
            Box::new(future::ok(()))
        }
    }
}

impl<'s> Outgoing<'s> for Queue<'s> {
    fn send(&'s self, _body: &Notification) -> Box<Future<Item = String, Error = QueueError> + 's> {
        if self.id == "outgoing" {
            Box::new(future::ok(String::from("deadbeef")))
        } else {
            Box::new(future::err(QueueError::new(String::from(
                "Not implemented",
            ))))
        }
    }
}
