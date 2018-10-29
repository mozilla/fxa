// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, you can obtain one at https://mozilla.org/MPL/2.0/.

//! Concrete trait implementations
//! for AWS SQS queues.

use std::{
    boxed::Box,
    fmt::{self, Debug, Formatter},
};

use futures::future::{self, Future};
use md5;
use rusoto_core::{request::HttpClient, Region};
use rusoto_credential::StaticProvider;
use rusoto_sqs::{
    DeleteMessageError, DeleteMessageRequest, Message as SqsMessage, ReceiveMessageError,
    ReceiveMessageRequest, SendMessageError, SendMessageRequest, Sqs, SqsClient,
};
use serde_json::{self, Error as JsonError, Value as JsonValue};
use slog_scope;

use self::notification::Notification as SqsNotification;
use super::{
    notification::Notification, DeleteFuture, Factory, Incoming, Message, Outgoing, ReceiveFuture,
    SendFuture,
};
use app_errors::{AppError, AppErrorKind, AppResult};
use logging::MozlogLogger;
use settings::Settings;

pub mod notification;

/// An AWS SQS queue type.
pub struct Queue {
    client: Box<Sqs>,
    url: String,
    receive_request: ReceiveMessageRequest,
}

impl Queue {
    fn parse_message(&self, message: SqsMessage) -> AppResult<Message> {
        let body = message.body.unwrap_or_else(|| String::from(""));
        if body == "" {
            return Err(AppErrorKind::MissingSqsMessageFields {
                field: "body".to_string(),
                queue: self.url.clone(),
            }.into());
        }

        if let Some(hash) = message.md5_of_body {
            if hash != format!("{:x}", md5::compute(&body)) {
                return Err(AppErrorKind::SqsMessageHashMismatch {
                    queue: self.url.clone(),
                    hash,
                    body,
                }.into());
            }
        }

        let receipt_handle = message.receipt_handle.unwrap_or_else(String::new);
        if receipt_handle == "" {
            return Err(AppErrorKind::MissingSqsMessageFields {
                field: "receipt_handle".to_string(),
                queue: self.url.clone(),
            }.into());
        }

        if let Some(ref message) = serde_json::from_str::<JsonValue>(&body)?["Message"].as_str() {
            serde_json::from_str(message)
                .map(|notification: SqsNotification| {
                    info!(
                        "Successfully parsed SQS message";
                        "queue" => &self.url.clone(), 
                        "receipt_handle" => &receipt_handle, 
                        "notification_type" => &format!("{}", notification.notification_type)
                    );
                    Message {
                        notification: From::from(notification),
                        id: receipt_handle,
                    }
                }).map_err(|error| {
                    AppErrorKind::SqsMessageParsingError {
                        message: format!("{:?}", error),
                        queue: self.url.clone(),
                        body: format!("{}", body),
                    }.into()
                })
        } else {
            Err(AppErrorKind::SqsMessageParsingError {
                message: format!("{}", "Unexpected SQS message structure"),
                queue: self.url.clone(),
                body: format!("{}", body),
            }.into())
        }
    }
}

impl Factory for Queue {
    fn new(id: String, settings: &Settings) -> Queue {
        let region = settings
            .aws
            .region
            .as_ref()
            .parse::<Region>()
            .expect("invalid region");

        let client: Box<Sqs> = if let Some(ref keys) = settings.aws.keys {
            let creds =
                StaticProvider::new(keys.access.to_string(), keys.secret.to_string(), None, None);
            Box::new(SqsClient::new_with(
                HttpClient::new().expect("Couldn't start HTTP Client."),
                creds,
                region,
            ))
        } else {
            Box::new(SqsClient::new(region))
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
            .receive_message(self.receive_request.clone())
            .map(|result| result.messages.unwrap_or_default())
            .map(move |messages| {
                messages
                    .into_iter()
                    .map(|message| {
                        self.parse_message(message).unwrap_or_else(|error| {
                            // At this point any parse errors are message-specific.
                            // Log them but don't fail the broader call to receive,
                            // because other messages might be fine.
                            let logger = MozlogLogger(slog_scope::logger());
                            let log = MozlogLogger::with_app_error(&logger, &error)
                                .expect("MozlogLogger::with_app_error error");
                            slog_error!(log, "{}", "Error receiving from queue"; "url" => self.url.clone());
                            Message::default()
                        })
                    }).collect()
            }).map_err(From::from);

        Box::new(future)
    }

    fn delete(&'static self, message: Message) -> DeleteFuture {
        let request = DeleteMessageRequest {
            queue_url: self.url.to_string(),
            receipt_handle: message.id,
        };

        let future = self.client.delete_message(request).map_err(move |error| {
            let error: AppError = error.into();
            let logger = MozlogLogger(slog_scope::logger());
            let log = MozlogLogger::with_app_error(&logger, &error)
                .expect("MozlogLogger::with_app_error error");
            slog_error!(log, "{}", "Error deleting from queue"; "url" => self.url.clone());
            error
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
            .send_message(request)
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

impl From<ReceiveMessageError> for AppError {
    fn from(error: ReceiveMessageError) -> AppError {
        AppErrorKind::QueueError(format!("SQS ReceiveMessage error: {:?}", error)).into()
    }
}

impl From<SendMessageError> for AppError {
    fn from(error: SendMessageError) -> AppError {
        AppErrorKind::QueueError(format!("SQS SendMessage error: {:?}", error)).into()
    }
}

impl From<DeleteMessageError> for AppError {
    fn from(error: DeleteMessageError) -> AppError {
        AppErrorKind::QueueError(format!("SQS DeleteMessage error: {:?}", error)).into()
    }
}

impl From<JsonError> for AppError {
    fn from(error: JsonError) -> AppError {
        AppErrorKind::JsonError(format!("JSON error: {:?}", error)).into()
    }
}
