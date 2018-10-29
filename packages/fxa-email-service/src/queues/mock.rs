// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, you can obtain one at https://mozilla.org/MPL/2.0/.

use chrono::Utc;
use futures::future;

use super::{
    notification::{
        Bounce, BounceSubtype, BounceType, Complaint, Delivery, Notification, NotificationType,
    },
    DeleteFuture, Factory, Incoming, Message, Outgoing, ReceiveFuture, SendFuture,
};
use app_errors::AppErrorKind;
use settings::Settings;

#[derive(Debug)]
pub struct Queue {
    id: String,
}

impl Factory for Queue {
    fn new(id: String, _settings: &Settings) -> Queue {
        Queue { id }
    }
}

impl Incoming for Queue {
    fn receive(&'static self) -> ReceiveFuture {
        let message = match self.id.as_ref() {
            "incoming-bounce" => {
                let mut bounce_message = Message::default();
                bounce_message.notification.notification_type = NotificationType::Bounce;
                bounce_message.notification.bounce = Some(Bounce {
                    bounce_type: BounceType::Permanent,
                    bounce_subtype: BounceSubtype::General,
                    bounced_recipients: vec!["fxa-email-service.queues.mock.bounce@example.com"
                        .parse()
                        .unwrap()],
                    timestamp: Utc::now(),
                });
                bounce_message
            }

            "incoming-complaint" => {
                let mut complaint_message = Message::default();
                complaint_message.notification.notification_type = NotificationType::Complaint;
                complaint_message.notification.complaint = Some(Complaint {
                    complained_recipients: vec![
                        "fxa-email-service.queues.mock.complaint@example.com"
                            .parse()
                            .unwrap(),
                    ],
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
                    recipients: vec!["fxa-email-service.queues.mock.delivery@example.com"
                        .parse()
                        .unwrap()],
                });
                delivery_message
            }

            "incoming-bounce-error" => {
                let mut invalid_message = Message::default();
                invalid_message.notification.notification_type = NotificationType::Bounce;
                invalid_message.notification.complaint = Some(Complaint {
                    complained_recipients: vec![
                        "fxa-email-service.queues.mock.complaint@example.com"
                            .parse()
                            .unwrap(),
                    ],
                    timestamp: Utc::now(),
                    complaint_feedback_type: None,
                });
                invalid_message
            }

            _ => return Box::new(future::err(AppErrorKind::NotImplemented.into())),
        };

        Box::new(future::ok(vec![message]))
    }

    fn delete(&'static self, _message: Message) -> DeleteFuture {
        if self.id == "outgoing" {
            Box::new(future::err(AppErrorKind::NotImplemented.into()))
        } else {
            Box::new(future::ok(()))
        }
    }
}

impl Outgoing for Queue {
    fn send(&'static self, _body: &Notification) -> SendFuture {
        if self.id == "outgoing" {
            Box::new(future::ok(String::from("deadbeef")))
        } else {
            Box::new(future::err(AppErrorKind::NotImplemented.into()))
        }
    }
}
