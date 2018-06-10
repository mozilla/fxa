// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, you can obtain one at https://mozilla.org/MPL/2.0/.

use std::{
    boxed::Box,
    fmt::{self, Debug, Formatter},
};

use futures::future::{self, Future};
use md5;
use rusoto_core::{reactor::RequestDispatcher, Region};
use rusoto_credential::StaticProvider;
use rusoto_sqs::{
    DeleteMessageError, DeleteMessageRequest, Message as SqsMessage, ReceiveMessageError,
    ReceiveMessageRequest, SendMessageError, SendMessageRequest, Sqs, SqsClient,
};
use serde_json::{self, Error as JsonError, Value as JsonValue};

use self::notification::Notification as SqsNotification;
use super::{
    notification::Notification, DeleteFuture, Factory, Incoming, Message, Outgoing, QueueError,
    ReceiveFuture, SendFuture,
};
use settings::Settings;

pub mod notification;

pub struct Queue {
    client: Box<Sqs>,
    url: String,
    receive_request: ReceiveMessageRequest,
}

impl Queue {
    fn parse_message(&self, message: SqsMessage) -> Result<Message, QueueError> {
        let body = message.body.unwrap_or(String::from(""));
        if body == "" {
            return Err(QueueError::new(format!(
                "Missing message body, queue=`{}`",
                self.url
            )));
        }

        if let Some(hash) = message.md5_of_body {
            if hash != format!("{:x}", md5::compute(&body)) {
                return Err(QueueError::new(format!(
                    "Message body does not match MD5 hash, queue=`{}`, hash=`{}`, body=`{}`",
                    self.url, hash, body
                )));
            }
        }

        let receipt_handle = message.receipt_handle.unwrap_or(String::from(""));
        if receipt_handle == "" {
            return Err(QueueError::new(format!(
                "Missing receipt handle, queue=`{}`",
                self.url
            )));
        }

        serde_json::from_value(JsonValue::String(body.clone()))
            .map(|notification: SqsNotification| {
                println!(
                    "Successfully parsed SQS message, queue=`{}`, receipt_handle=`{}`, notification_type=`{}`",
                    self.url,
                    receipt_handle,
                    notification.notification_type
                );
                Message {
                    notification: From::from(notification),
                    id: receipt_handle,
                }
            })
            .map_err(|error| {
                QueueError::new(format!(
                    "Unparseable message body, queue=`{}`, error=`{}`, body=`{}`",
                    self.url, error, body
                ))
            })
    }
}

impl Factory for Queue {
    fn new(id: String, settings: &Settings) -> Queue {
        let region = settings
            .aws
            .region
            .parse::<Region>()
            .expect("invalid region");

        let client: Box<Sqs> = if let Some(ref keys) = settings.aws.keys {
            let creds =
                StaticProvider::new(keys.access.to_string(), keys.secret.to_string(), None, None);
            Box::new(SqsClient::new(RequestDispatcher::default(), creds, region))
        } else {
            Box::new(SqsClient::simple(region))
        };

        let mut receive_request = ReceiveMessageRequest::default();
        receive_request.max_number_of_messages = Some(10);
        receive_request.queue_url = id.clone();

        Queue {
            client,
            url: id,
            receive_request,
        }
    }
}

impl Incoming for Queue {
    fn receive(&'static self) -> ReceiveFuture {
        let future = self
            .client
            .receive_message(&self.receive_request)
            .map(|result| result.messages.unwrap_or(Vec::new()))
            .map(move |messages| {
                messages
                    .into_iter()
                    .map(|message| {
                        self.parse_message(message).unwrap_or_else(|error| {
                            // At this point any parse errors are message-specific.
                            // Log them but don't fail the broader call to receive,
                            // because other messages might be fine.
                            println!("Queue error receiving from {}: {:?}", self.url, error);
                            Message::default()
                        })
                    })
                    .collect()
            })
            .map_err(From::from);

        Box::new(future)
    }

    fn delete(&'static self, message: Message) -> DeleteFuture {
        let request = DeleteMessageRequest {
            queue_url: self.url.to_string(),
            receipt_handle: message.id,
        };

        let future = self.client.delete_message(&request).map_err(move |error| {
            println!("Queue error deleting from {}: {:?}", self.url, error);
            From::from(error)
        });

        Box::new(future)
    }
}

impl Outgoing for Queue {
    fn send(&'static self, notification: &Notification) -> SendFuture {
        let mut request = SendMessageRequest::default();
        request.message_body = match serde_json::to_string(notification) {
            Ok(body) => body,
            Err(error) => return Box::new(future::err(From::from(error))),
        };
        request.queue_url = self.url.to_string();

        let future = self
            .client
            .send_message(&request)
            .map(|result| result.message_id.map_or(String::from(""), |id| id.clone()))
            .map_err(From::from);

        Box::new(future)
    }
}

impl Debug for Queue {
    fn fmt(&self, formatter: &mut Formatter) -> fmt::Result {
        write!(formatter, "SQS queue, url=`{}`", self.url)
    }
}

unsafe impl Sync for Queue {}

impl From<ReceiveMessageError> for QueueError {
    fn from(error: ReceiveMessageError) -> QueueError {
        QueueError::new(format!("SQS ReceiveMessage error: {:?}", error))
    }
}

impl From<SendMessageError> for QueueError {
    fn from(error: SendMessageError) -> QueueError {
        QueueError::new(format!("SQS SendMessage error: {:?}", error))
    }
}

impl From<DeleteMessageError> for QueueError {
    fn from(error: DeleteMessageError) -> QueueError {
        QueueError::new(format!("SQS DeleteMessage error: {:?}", error))
    }
}

impl From<JsonError> for QueueError {
    fn from(error: JsonError) -> QueueError {
        QueueError::new(format!("JSON error: {:?}", error))
    }
}
