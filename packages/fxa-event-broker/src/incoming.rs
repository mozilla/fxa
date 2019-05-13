// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, you can obtain one at https://mozilla.org/MPL/2.0/.

//! Logic to read events
//! from the incoming queue.

use futures::future::Future;
use md5;
use rusoto_core::{request::HttpClient, Region};
use rusoto_credential::StaticProvider;
use rusoto_sqs::{
    DeleteMessageError, DeleteMessageRequest, Message, ReceiveMessageError, ReceiveMessageRequest,
    Sqs, SqsClient,
};
use serde::Deserialize;
use serde_json::{self, Value};

use crate::{
    settings::Settings,
    types::{
        aws::SqsUrl,
        error::{AppError, AppErrorKind, AppResult},
        event::Event,
    },
};

pub trait ReadFuture: Future<Item = Vec<IncomingEvent>, Error = AppError> {}
impl<T: Future<Item = Vec<IncomingEvent>, Error = AppError>> ReadFuture for T {}

pub trait DeleteFuture: Future<Item = (), Error = AppError> {}
impl<T: Future<Item = (), Error = AppError>> DeleteFuture for T {}

#[derive(Debug, Deserialize)]
pub struct IncomingEvent {
    pub event: Event,
    pub receipt_handle: String,
}

pub struct Incoming {
    client: SqsClient,
    url: SqsUrl,
}

impl Incoming {
    pub fn new(settings: &Settings) -> Self {
        let region = settings.aws.region.as_ref().parse::<Region>().unwrap();

        let client = if let Some(ref keys) = settings.aws.keys {
            let creds =
                StaticProvider::new(keys.access.to_string(), keys.secret.to_string(), None, None);
            SqsClient::new_with(HttpClient::new().unwrap(), creds, region)
        } else {
            SqsClient::new(region)
        };

        Self {
            client,
            url: settings.aws.incomingqueue.clone(),
        }
    }

    pub fn read(&self) -> impl ReadFuture {
        self.client
            .receive_message(ReceiveMessageRequest {
                max_number_of_messages: Some(10),
                queue_url: self.url.as_ref().to_owned(),
                ..ReceiveMessageRequest::default()
            })
            .map(|result| result.messages.unwrap_or_default())
            .map(|messages| {
                messages
                    .into_iter()
                    .fold(Vec::new(), |mut events, message| {
                        let _ = parse_event(message)
                            .and_then(|event| {
                                events.push(event);
                                Ok(())
                            })
                            .or_else(|error| {
                                // TODO: Proper logging
                                println!("{:?}", error);
                                Err(())
                            });
                        events
                    })
            })
            .map_err(From::from)
    }

    pub fn delete(&self, receipt_handle: &str) -> impl DeleteFuture {
        self.client
            .delete_message(DeleteMessageRequest {
                queue_url: self.url.as_ref().to_owned(),
                receipt_handle: receipt_handle.to_owned(),
            })
            .map_err(|error| {
                // TODO: Proper logging
                println!("{:?}", error);
                error.into()
            })
    }
}

fn parse_event(message: Message) -> AppResult<IncomingEvent> {
    let body = message.body.unwrap_or_else(String::new);
    if body == "" {
        Err(AppErrorKind::InvalidEvent("missing body".to_owned()))?;
    }

    if let Some(hash) = message.md5_of_body {
        if hash != format!("{:x}", md5::compute(&body)) {
            Err(AppErrorKind::InvalidEvent("bad hash".to_owned()))?;
        }
    }

    let receipt_handle = message.receipt_handle.unwrap_or_else(String::new);
    if receipt_handle == "" {
        Err(AppErrorKind::InvalidEvent(
            "missing receipt handle".to_owned(),
        ))?;
    }

    if let Some(ref message) = serde_json::from_str::<Value>(&body)
        .map_err(|error| AppErrorKind::InvalidEvent(format!("{:?}", error)).into(): AppError)?
        ["Message"]
        .as_str()
    {
        serde_json::from_str(message)
            .map(|event| IncomingEvent {
                event,
                receipt_handle,
            })
            .map_err(|error| AppErrorKind::InvalidEvent(format!("{:?}", error)).into())
    } else {
        Err(AppErrorKind::InvalidEvent("unparseable message".to_owned()))?
    }
}

impl From<ReceiveMessageError> for AppError {
    fn from(error: ReceiveMessageError) -> AppError {
        AppErrorKind::QueueError(format!("SQS ReceiveMessage error: {:?}", error)).into()
    }
}

impl From<DeleteMessageError> for AppError {
    fn from(error: DeleteMessageError) -> AppError {
        AppErrorKind::QueueError(format!("SQS DeleteMessage error: {:?}", error)).into()
    }
}
