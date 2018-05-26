// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, you can obtain one at https://mozilla.org/MPL/2.0/.

use std::{
    boxed::Box, error::Error, fmt::{self, Debug, Display, Formatter},
};

use futures::future::{self, Future};

use self::notification::{Notification, NotificationType};
pub use self::sqs::Queue as Sqs;
use auth_db::{BounceSubtype, BounceType, Db, DbClient, DbError};
use settings::Settings;

mod mock;
mod notification;
pub mod sqs;
#[cfg(test)]
mod test;

#[derive(Debug)]
pub struct Queues<'s> {
    bounce: Box<Incoming<'s> + 's>,
    complaint: Box<Incoming<'s> + 's>,
    delivery: Box<Incoming<'s> + 's>,
    notification: Box<Outgoing<'s> + 's>,
    db: DbClient,
}

// The return types for these traits are really ugly
// but I couldn't work out how to alias them because
// of the lifetime that's needed to make the boxing
// work. When trait aliases become a thing, we'll be
// able to alias the Future<...> part, see:
//
// * https://github.com/rust-lang/rfcs/pull/1733
// * https://github.com/rust-lang/rust/issues/41517
pub trait Incoming<'s>: Debug + Sync {
    fn receive(&'s self) -> Box<Future<Item = Vec<Message>, Error = QueueError> + 's>;
    fn delete(&'s self, message: Message) -> Box<Future<Item = (), Error = QueueError> + 's>;
}

pub trait Outgoing<'s>: Debug + Sync {
    fn send(&'s self, body: &Notification) -> Box<Future<Item = String, Error = QueueError> + 's>;
}

pub trait Factory<'s> {
    fn new(id: &'s str, settings: &Settings) -> Self;
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
pub struct QueueIds<'s> {
    pub bounce: &'s str,
    pub complaint: &'s str,
    pub delivery: &'s str,
    pub notification: &'s str,
}

impl<'s> Queues<'s> {
    pub fn new<Q: 's>(ids: &QueueIds<'s>, settings: &Settings) -> Queues<'s>
    where
        Q: Incoming<'s> + Outgoing<'s> + Factory<'s>,
    {
        Queues {
            bounce: Box::new(Q::new(ids.bounce, settings)),
            complaint: Box::new(Q::new(ids.complaint, settings)),
            delivery: Box::new(Q::new(ids.delivery, settings)),
            notification: Box::new(Q::new(ids.notification, settings)),
            db: DbClient::new(settings),
        }
    }

    pub fn process(&'s self) -> Box<Future<Item = usize, Error = QueueError> + 's> {
        let joined_futures = self
            .process_queue(&self.bounce)
            .join3(
                self.process_queue(&self.complaint),
                self.process_queue(&self.delivery),
            )
            .map(|results| results.0 + results.1 + results.2);

        Box::new(joined_futures)
    }

    fn process_queue(
        &'s self,
        queue: &'s Box<Incoming<'s> + 's>,
    ) -> Box<Future<Item = usize, Error = QueueError> + 's> {
        let future = queue
            .receive()
            .and_then(move |messages| {
                let mut futures: Vec<
                    Box<Future<Item = (), Error = QueueError> + 's>,
                > = Vec::new();
                for message in messages.into_iter() {
                    if message.notification.notification_type != NotificationType::Null {
                        let future = self
                            .handle_notification(&message.notification)
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
        &'s self,
        notification: &Notification,
    ) -> Box<Future<Item = (), Error = QueueError> + 's> {
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
                let future = self
                    .notification
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

    fn record_bounce(&'s self, notification: &Notification) -> Result<(), QueueError> {
        if let Some(ref bounce) = notification.bounce {
            for recipient in bounce.bounced_recipients.iter() {
                self.db.create_bounce(
                    &recipient,
                    From::from(bounce.bounce_type),
                    From::from(bounce.bounce_subtype),
                )?;
            }
            Ok(())
        } else {
            Err(QueueError::new(String::from(
                "Missing payload in bounce notification",
            )))
        }
    }

    fn record_complaint(&'s self, notification: &Notification) -> Result<(), QueueError> {
        if let Some(ref complaint) = notification.complaint {
            for recipient in complaint.complained_recipients.iter() {
                let bounce_subtype = if let Some(complaint_type) = complaint.complaint_feedback_type
                {
                    From::from(complaint_type)
                } else {
                    BounceSubtype::Unmapped
                };
                self.db
                    .create_bounce(&recipient, BounceType::Complaint, bounce_subtype)?;
            }
            Ok(())
        } else {
            Err(QueueError::new(String::from(
                "Missing payload in complaint notification",
            )))
        }
    }
}

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

impl From<DbError> for QueueError {
    fn from(error: DbError) -> QueueError {
        QueueError::new(format!("database error: {:?}", error))
    }
}
