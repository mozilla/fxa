// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, you can obtain one at https://mozilla.org/MPL/2.0/.

use std::boxed::Box;

use base64;
use bytes::Bytes;
use roxmltree::Document as XmlDocument;
use rusoto_core::{request::HttpClient, Region, RusotoError};
use rusoto_credential::StaticProvider;
use rusoto_ses::{RawMessage, SendRawEmailError, SendRawEmailRequest, Ses, SesClient};

use super::{build_multipart_mime, Headers, Provider};
use crate::{
    settings::Settings,
    types::error::{AppError, AppErrorKind, AppResult},
};

#[cfg(test)]
mod test;

pub struct SesProvider {
    client: Box<dyn Ses>,
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

        let client: Box<dyn Ses> = if let Some(ref keys) = settings.aws.keys {
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
        let encoded_message = base64::encode(&message.to_string());
        let mut request = SendRawEmailRequest::default();
        request.raw_message = RawMessage {
            data: Bytes::from(encoded_message),
        };

        self.client
            .send_raw_email(request)
            .sync()
            .map(|response| response.message_id)
            .map_err(From::from)
    }
}

impl From<RusotoError<SendRawEmailError>> for AppError {
    fn from(error: RusotoError<SendRawEmailError>) -> Self {
        let transformed_error =
            if let RusotoError::Service(SendRawEmailError::MessageRejected(ref body)) = error {
                parse_rusoto_error_xml(body)
            } else if let RusotoError::Unknown(ref response) = error {
                if let Ok(body) = std::str::from_utf8(&response.body) {
                    parse_rusoto_error_xml(body)
                } else {
                    None
                }
            } else {
                None
            };
        transformed_error.unwrap_or_else(|| AppErrorKind::Internal(error.to_string()).into())
    }
}

fn parse_rusoto_error_xml(body: &str) -> Option<AppError> {
    if let Ok(xml) = XmlDocument::parse(body) {
        for child in xml.root_element().children() {
            if child.is_element() && child.tag_name().name() == "Error" {
                let mut is_invalid_payload = false;
                let mut error_message = None;
                let mut error_property = None;

                for grandchild in child.children() {
                    if grandchild.is_element() {
                        match grandchild.tag_name().name() {
                            "Code" => {
                                is_invalid_payload =
                                    grandchild.text() == Some("InvalidParameterValue")
                            }
                            "Message" => {
                                error_message = grandchild.text().map(|message| message.to_owned())
                            }
                            "Type" => {
                                error_property =
                                    grandchild.text().map(|property| property.to_owned())
                            }
                            _ => {}
                        }
                    }
                }

                if is_invalid_payload {
                    return Some(
                        AppErrorKind::InvalidPayload(error_message.unwrap_or_else(|| {
                            format!(
                                "Invalid {}",
                                error_property.unwrap_or_else(|| "parameter".to_owned())
                            )
                        }))
                        .into(),
                    );
                }
            }
        }
    }

    None
}
