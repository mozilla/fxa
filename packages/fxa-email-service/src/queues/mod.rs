// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, you can obtain one at https://mozilla.org/MPL/2.0/.

use std::{
    boxed::Box, error::Error, fmt::{self, Debug, Display, Formatter},
};

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
    bounce: Box<Incoming + 's>,
    complaint: Box<Incoming + 's>,
    delivery: Box<Incoming + 's>,
    notification: Box<Outgoing + 's>,
    db: DbClient,
}

pub trait Incoming: Debug + Sync {
    fn receive(&self) -> Result<Vec<Message>, QueueError>;
    fn delete(&self, message: Message) -> Result<(), QueueError>;
}

pub trait Outgoing: Debug + Sync {
    fn send(&self, body: &Notification) -> Result<String, QueueError>;
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
        Q: Incoming + Outgoing + Factory<'s>,
    {
        Queues {
            bounce: Box::new(Q::new(ids.bounce, settings)),
            complaint: Box::new(Q::new(ids.complaint, settings)),
            delivery: Box::new(Q::new(ids.delivery, settings)),
            notification: Box::new(Q::new(ids.notification, settings)),
            db: DbClient::new(settings),
        }
    }

    pub fn process(&self) -> Result<usize, QueueError> {
        let mut count = self.process_queue(&self.bounce, &|notification: &Notification| {
            if let Some(ref bounce) = notification.bounce {
                for recipient in bounce.bounced_recipients.iter() {
                    self.db.create_bounce(
                        &recipient.email_address,
                        From::from(bounce.bounce_type),
                        From::from(bounce.bounce_subtype),
                    )?;
                }
                Ok(())
            } else {
                Err(QueueError::new(format!(
                    "Unexpected notification type in bounce queue: {:?}",
                    notification.notification_type
                )))
            }
        })?;

        count += self.process_queue(&self.complaint, &|notification: &Notification| {
            if let Some(ref complaint) = notification.complaint {
                for recipient in complaint.complained_recipients.iter() {
                    let bounce_subtype =
                        if let Some(complaint_type) = complaint.complaint_feedback_type {
                            From::from(complaint_type)
                        } else {
                            BounceSubtype::Unmapped
                        };
                    self.db.create_bounce(
                        &recipient.email_address,
                        BounceType::Complaint,
                        bounce_subtype,
                    )?;
                }
                Ok(())
            } else {
                Err(QueueError::new(format!(
                    "Unexpected notification type in complaint queue: {:?}",
                    notification.notification_type
                )))
            }
        })?;

        count += self.process_queue(&self.delivery, &|_notification| Ok(()))?;

        Ok(count)
    }

    fn process_queue(
        &self,
        queue: &Box<Incoming + 's>,
        handler: &Fn(&Notification) -> Result<(), QueueError>,
    ) -> Result<usize, QueueError> {
        let messages = queue.receive()?;
        let mut count = 0;
        for message in messages.into_iter() {
            if message.notification.notification_type != NotificationType::Null {
                self.handle_notification(&message.notification, handler)?;
                queue.delete(message)?;
                count += 1;
            }
        }
        Ok(count)
    }

    fn handle_notification(
        &self,
        notification: &Notification,
        handler: &Fn(&Notification) -> Result<(), QueueError>,
    ) -> Result<(), QueueError> {
        handler(&notification)?;
        if let Err(error) = self.notification.send(&notification) {
            // Errors sending to this queue are non-fatal because it's only used
            // for logging. We still want to delete the message from the queue.
            println!("{:?}", error);
        }
        Ok(())
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
