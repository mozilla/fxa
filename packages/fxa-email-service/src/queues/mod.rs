// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, you can obtain one at https://mozilla.org/MPL/2.0/.

use std::{
    boxed::Box,
    error::Error,
    fmt::{self, Debug, Display, Formatter},
};

use futures::future::{self, Future};

use self::notification::{Notification, NotificationType};
pub use self::sqs::Queue as Sqs;
use app_errors::AppError;
use auth_db::DbClient;
use bounces::Bounces;
use message_data::MessageData;
use settings::Settings;

mod mock;
pub mod notification;
pub mod sqs;
#[cfg(test)]
mod test;

#[derive(Debug)]
pub struct Queues {
    bounce_queue: Box<Incoming>,
    complaint_queue: Box<Incoming>,
    delivery_queue: Box<Incoming>,
    notification_queue: Box<Outgoing>,
    bounces: Bounces<DbClient>,
    message_data: MessageData,
}

pub trait Incoming: Debug + Sync {
    fn receive(&'static self) -> ReceiveFuture;
    fn delete(&'static self, message: Message) -> DeleteFuture;
}

type ReceiveFuture = Box<Future<Item = Vec<Message>, Error = QueueError>>;
type DeleteFuture = Box<Future<Item = (), Error = QueueError>>;

pub trait Outgoing: Debug + Sync {
    fn send(&'static self, body: &Notification) -> SendFuture;
}

type SendFuture = Box<Future<Item = String, Error = QueueError>>;

pub trait Factory {
    fn new(id: String, settings: &Settings) -> Self;
}

#[derive(Debug, Default)]
pub struct Message {
    pub id: String,
    pub notification: Notification,
}

#[derive(Debug)]
pub struct QueueError {
    description: String,
}

#[derive(Debug)]
pub struct QueueIds {
    pub bounce: String,
    pub complaint: String,
    pub delivery: String,
    pub notification: String,
}

impl Queues {
    pub fn new<Q: 'static>(ids: QueueIds, settings: &Settings) -> Queues
    where
        Q: Incoming + Outgoing + Factory,
    {
        Queues {
            bounce_queue: Box::new(Q::new(ids.bounce, settings)),
            complaint_queue: Box::new(Q::new(ids.complaint, settings)),
            delivery_queue: Box::new(Q::new(ids.delivery, settings)),
            notification_queue: Box::new(Q::new(ids.notification, settings)),
            bounces: Bounces::new(settings, DbClient::new(settings)),
            message_data: MessageData::new(settings),
        }
    }

    pub fn process(&'static self) -> QueueFuture {
        let joined_futures = self
            .process_queue(&self.bounce_queue)
            .join3(
                self.process_queue(&self.complaint_queue),
                self.process_queue(&self.delivery_queue),
            )
            .map(|results| results.0 + results.1 + results.2);

        Box::new(joined_futures)
    }

    fn process_queue(&'static self, queue: &'static Box<Incoming>) -> QueueFuture {
        let future = queue
            .receive()
            .and_then(move |messages| {
                let mut futures: Vec<Box<Future<Item = (), Error = QueueError>>> = Vec::new();
                for mut message in messages {
                    if message.notification.notification_type != NotificationType::Null {
                        let future = self
                            .handle_notification(&mut message.notification)
                            .and_then(move |_| queue.delete(message));
                        futures.push(Box::new(future));
                    }
                }
                future::join_all(futures.into_iter())
            })
            .map(|results| results.len());
        Box::new(future)
    }

    fn handle_notification(
        &'static self,
        notification: &mut Notification,
    ) -> Box<Future<Item = (), Error = QueueError>> {
        let result = match notification.notification_type {
            NotificationType::Bounce => self.record_bounce(notification),
            NotificationType::Complaint => self.record_complaint(notification),
            NotificationType::Delivery => Ok(()),
            NotificationType::Null => {
                Err(QueueError::new(String::from("Invalid notification type")))
            }
        };
        match result {
            Ok(_) => {
                notification.metadata = self
                    .message_data
                    .consume(&notification.mail.message_id)
                    .ok();
                let future = self
                    .notification_queue
                    .send(&notification)
                    .map(|id| {
                        println!("Sent message to notification queue, id=`{}`", id);
                        ()
                    })
                    .or_else(|error| {
                        // Errors sending to this queue are non-fatal because it's only used
                        // for logging. We still want to delete the message from the queue.
                        println!("{:?}", error);
                        Ok(())
                    });
                Box::new(future)
            }
            Err(error) => Box::new(future::err(error)),
        }
    }

    fn record_bounce(&'static self, notification: &Notification) -> DbResult {
        if let Some(ref bounce) = notification.bounce {
            for recipient in &bounce.bounced_recipients {
                self.bounces
                    .record_bounce(&recipient, bounce.bounce_type, bounce.bounce_subtype)?;
            }
            Ok(())
        } else {
            Err(QueueError::new(String::from(
                "Missing payload in bounce notification",
            )))
        }
    }

    fn record_complaint(&'static self, notification: &Notification) -> DbResult {
        if let Some(ref complaint) = notification.complaint {
            for recipient in &complaint.complained_recipients {
                self.bounces
                    .record_complaint(&recipient, complaint.complaint_feedback_type)?;
            }
            Ok(())
        } else {
            Err(QueueError::new(String::from(
                "Missing payload in complaint notification",
            )))
        }
    }
}

type QueueFuture = Box<Future<Item = usize, Error = QueueError>>;
type DbResult = Result<(), QueueError>;

impl QueueError {
    pub fn new(description: String) -> QueueError {
        QueueError { description }
    }
}

impl Error for QueueError {
    fn description(&self) -> &str {
        &self.description
    }
}

impl Display for QueueError {
    fn fmt(&self, formatter: &mut Formatter) -> fmt::Result {
        write!(formatter, "{}", self.description)
    }
}

impl From<AppError> for QueueError {
    fn from(error: AppError) -> QueueError {
        QueueError::new(format!("bounce error: {:?}", error))
    }
}
