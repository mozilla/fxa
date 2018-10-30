// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, you can obtain one at https://mozilla.org/MPL/2.0/.

use std::boxed::Box;

use base64::encode;
use rusoto_core::{request::HttpClient, Region};
use rusoto_credential::StaticProvider;
use rusoto_ses::{RawMessage, SendRawEmailError, SendRawEmailRequest, Ses, SesClient};

use super::{build_multipart_mime, Headers, Provider};
use settings::Settings;
use types::error::{AppError, AppErrorKind, AppResult};

#[cfg(test)]
mod test;

pub struct SesProvider {
    client: Box<Ses>,
    sender: String,
}

impl SesProvider {
    pub fn new(settings: &Settings) -> SesProvider {
        let region = settings
            .aws
            .region
            .as_ref()
            .parse::<Region>()
            .expect("invalid region");

        let client: Box<Ses> = if let Some(ref keys) = settings.aws.keys {
            let creds =
                StaticProvider::new(keys.access.to_string(), keys.secret.to_string(), None, None);
            Box::new(SesClient::new_with(
                HttpClient::new().expect("Couldn't start HTTP Client."),
                creds,
                region,
            ))
        } else {
            Box::new(SesClient::new(region))
        };

        SesProvider {
            client,
            sender: format!(
                "{} <{}>",
                settings.sender.name,
                settings.sender.address.as_ref()
            ),
        }
    }
}

impl Provider for SesProvider {
    fn send(
        &self,
        to: &str,
        cc: &[&str],
        headers: Option<&Headers>,
        subject: &str,
        body_text: &str,
        body_html: Option<&str>,
    ) -> AppResult<String> {
        let message =
            build_multipart_mime(&self.sender, to, cc, headers, subject, body_text, body_html)?;
        let encoded_message = encode(&format!("{}", message));
        let mut request = SendRawEmailRequest::default();
        request.raw_message = RawMessage {
            data: format!("{}", encoded_message).as_bytes().to_vec(),
        };

        self.client
            .send_raw_email(request)
            .sync()
            .map(|response| response.message_id)
            .map_err(From::from)
    }
}

impl From<String> for AppError {
    fn from(error: String) -> Self {
        AppErrorKind::EmailParsingError(format!("{:?}", error)).into()
    }
}

impl From<SendRawEmailError> for AppError {
    fn from(error: SendRawEmailError) -> AppError {
        AppErrorKind::ProviderError {
            name: String::from("SES"),
            description: format!("{:?}", error),
        }
        .into()
    }
}
