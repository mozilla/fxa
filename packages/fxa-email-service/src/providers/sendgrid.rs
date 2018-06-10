// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, you can obtain one at https://mozilla.org/MPL/2.0/.

use std::str::{from_utf8, Utf8Error};

use reqwest::StatusCode;
use sendgrid::{
    errors::SendgridError,
    v3::{
        Content, Email as EmailAddress, Personalization, SGMailV3 as Message, V3Sender as Client,
    },
};

use super::{Provider, ProviderError};
use settings::{Sender, Sendgrid as SendgridSettings, Settings};

pub struct SendgridProvider {
    client: Client,
    sender: Sender,
}

impl SendgridProvider {
    pub fn new(sendgrid_settings: &SendgridSettings, settings: &Settings) -> SendgridProvider {
        SendgridProvider {
            client: Client::new(sendgrid_settings.key.clone()),
            sender: settings.sender.clone(),
        }
    }
}

impl Provider for SendgridProvider {
    fn send(
        &self,
        to: &str,
        cc: &[&str],
        subject: &str,
        body_text: &str,
        body_html: Option<&str>,
    ) -> Result<String, ProviderError> {
        let mut message = Message::new();
        let mut from_address = EmailAddress::new();
        from_address.set_email(&self.sender.address);
        from_address.set_name(&self.sender.name);
        message.set_from(from_address);
        message.set_subject(subject);

        let mut text = Content::new();
        text.set_content_type("text/plain");
        text.set_value(body_text);
        message.add_content(text);

        if let Some(body_html) = body_html {
            let mut html = Content::new();
            html.set_content_type("text/html");
            html.set_value(body_html);
            message.add_content(html);
        }

        let mut personalization = Personalization::new();
        let mut to_address = EmailAddress::new();
        to_address.set_email(to);
        personalization.add_to(to_address);
        cc.iter().for_each(|cc| {
            let mut cc_address = EmailAddress::new();
            cc_address.set_email(cc);
            personalization.add_cc(cc_address);
        });
        message.add_personalization(personalization);

        self.client
            .send(&message)
            .map_err(From::from)
            .and_then(|response| {
                let status = response.status();
                if status == StatusCode::Ok || status == StatusCode::Accepted {
                    response
                        .headers()
                        .get_raw("X-Message-Id")
                        .and_then(|raw_header| raw_header.one())
                        .ok_or(ProviderError {
                            description: String::from(
                                "Missing or duplicate X-Message-Id header in Sendgrid response",
                            ),
                        })
                        .and_then(|message_id| from_utf8(message_id).map_err(From::from))
                        .map(|message_id| message_id.to_string())
                } else {
                    Err(ProviderError {
                        description: format!("Sendgrid response: {}", status),
                    })
                }
            })
    }
}

impl From<SendgridError> for ProviderError {
    fn from(error: SendgridError) -> ProviderError {
        ProviderError {
            description: format!("Sendgrid error: {:?}", error),
        }
    }
}

impl From<Utf8Error> for ProviderError {
    fn from(error: Utf8Error) -> ProviderError {
        ProviderError {
            description: format!("Failed to decode string as UTF-8: {:?}", error),
        }
    }
}
