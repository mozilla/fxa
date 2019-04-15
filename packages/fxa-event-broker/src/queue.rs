// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, you can obtain one at https://mozilla.org/MPL/2.0/.

//! Queue-processing abstractions.

use std::{boxed::Box, fmt::Debug};

use futures::future::{self, Future};

use slog_scope;
use crate::{
    settings::Settings,
    types::{
        error::{AppError, AppErrorKind, AppResult},
        event::{Envelope, Event},
    },
};

mod mock;
pub mod sqs;
#[cfg(test)]
mod test;

/// The main incoming event queue.
#[derive(Debug)]
pub struct InQueue {
    queue: Box<Incoming>,
}

/// A generic incoming queue interface.
pub trait Incoming: Debug + Sync {
    fn receive(&'static self) -> ReceiveFuture;
    fn delete(&'static self, message: Message) -> DeleteFuture;
}

type ReceiveFuture = Box<Future<Item = Vec<Envelope>, Error = AppError>>;
type DeleteFuture = Box<Future<Item = (), Error = AppError>>;

/// A generic queue factory interface.
pub trait Factory {
    fn new(id: String, settings: &Settings) -> Self;
}

// PHIL!
impl InQueue {
    /// Instantiate the queue clients.
    pub fn new<Q: 'static>(url: QueueIds, settings: &Settings) -> Queues
    where
        Q: Incoming + Factory,
    {
        Queues {
            queue: Box::new(Q::new(ids.bounce, settings)),
        }
    }

    /// Poll all queues and handle any notifications.
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
                let mut futures: Vec<Box<Future<Item = (), Error = AppError>>> = Vec::new();
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
    ) -> Box<Future<Item = (), Error = AppError>> {
        let result = match notification.notification_type {
            NotificationType::Bounce => self.record_bounce(notification),
            NotificationType::Complaint => self.record_complaint(notification),
            NotificationType::Delivery => Ok(()),
            NotificationType::Null => {
                Err(AppErrorKind::InvalidNotification("null type".to_owned()).into())
            }
        };
        match result {
            Ok(_) => {
                notification.metadata = self
                    .message_data
                    .consume(&notification.mail.message_id)
                    .ok()
                    .unwrap_or(None);
                let future = self
                    .notification_queue
                    .send(&notification)
                    .map(|id| {
                        info!("{}", "Sent message to notification queue"; "id" => id);
                        ()
                    })
                    .or_else(|error| {
                        // Errors sending to this queue are non-fatal because it's only used
                        // for logging. We still want to delete the message from the queue.
                        let logger = MozlogLogger(slog_scope::logger());
                        let log = MozlogLogger::with_app_error(&logger, &error)
                            .expect("MozlogLogger::with_app_error error");
                        slog_error!(log, "{}", "Error sending notification to queue");
                        Ok(())
                    });
                Box::new(future)
            }
            Err(error) => Box::new(future::err(error)),
        }
    }

    fn record_bounce(&'static self, notification: &Notification) -> AppResult<()> {
        if let Some(ref bounce) = notification.bounce {
            for recipient in &bounce.bounced_recipients {
                self.delivery_problems.record_bounce(
                    &recipient,
                    bounce.bounce_type,
                    bounce.bounce_subtype,
                    bounce.timestamp,
                )?;
            }
            Ok(())
        } else {
            Err(AppErrorKind::InvalidNotification(
                "missing bounce payload".to_owned(),
            ))?
        }
    }

    fn record_complaint(&'static self, notification: &Notification) -> AppResult<()> {
        if let Some(ref complaint) = notification.complaint {
            for recipient in &complaint.complained_recipients {
                self.delivery_problems.record_complaint(
                    &recipient,
                    complaint.complaint_feedback_type,
                    complaint.timestamp,
                )?;
            }
            Ok(())
        } else {
            Err(AppErrorKind::InvalidNotification(
                "missing complaint payload".to_owned(),
            ))?
        }
    }
}

type QueueFuture = Box<Future<Item = usize, Error = AppError>>;
