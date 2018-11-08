// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, you can obtain one at https://mozilla.org/MPL/2.0/.

//! Route handler
//! for the `POST /send` endpoint.

use rocket::{
    data::{self, FromData},
    http::Status,
    Data, Request, State,
};
use rocket_contrib::Json;

use db::{auth_db::DbClient, delivery_problems::DeliveryProblems, message_data::MessageData};
use logging::MozlogLogger;
use providers::{Headers, Providers};
use types::{
    email_address::EmailAddress,
    error::{AppError, AppErrorKind, AppResult},
};

#[cfg(test)]
mod test;

#[derive(Debug, Deserialize)]
struct Body {
    text: String,
    html: Option<String>,
}

#[derive(Debug, Deserialize)]
struct Email {
    to: EmailAddress,
    cc: Option<Vec<EmailAddress>>,
    headers: Option<Headers>,
    subject: String,
    body: Body,
    provider: Option<String>,
    metadata: Option<String>,
}

impl FromData for Email {
    type Error = AppError;

    fn from_data(request: &Request, data: Data) -> data::Outcome<Self, Self::Error> {
        Json::<Email>::from_data(request, data)
            .map_failure(|(_status, error)| {
                (
                    Status::BadRequest,
                    AppErrorKind::InvalidPayload(error.to_string()).into(),
                )
            })
            .map(|json| json.into_inner())
    }
}

#[post("/send", format = "application/json", data = "<email>")]
fn handler(
    email: AppResult<Email>,
    bounces: State<DeliveryProblems<DbClient>>,
    logger: State<MozlogLogger>,
    message_data: State<MessageData>,
    providers: State<Providers>,
) -> AppResult<Json> {
    let email = email?;

    bounces.check(&email.to)?;

    let cc = if let Some(ref cc) = email.cc {
        let mut refs = Vec::new();
        for address in cc.iter() {
            bounces.check(&address)?;
            refs.push(address.as_ref());
        }
        refs
    } else {
        Vec::new()
    };

    providers
        .send(
            email.to.as_ref(),
            cc.as_ref(),
            email.headers.as_ref(),
            email.subject.as_ref(),
            email.body.text.as_ref(),
            email.body.html.as_ref().map(|html| html.as_ref()),
            email.provider.as_ref().map(|provider| provider.as_ref()),
        )
        .map(|message_id| {
            email
                .metadata
                .as_ref()
                .and_then(|metadata| message_data.set(message_id.as_str(), metadata).err())
                .map(|error| {
                    let log = MozlogLogger::with_app_error(&logger, &error)
                        .expect("MozlogLogger::with_request error");
                    slog_error!(log, "{}", "Request errored");
                });
            Json(json!({ "messageId": message_id }))
        })
        .map_err(|error| error)
}
