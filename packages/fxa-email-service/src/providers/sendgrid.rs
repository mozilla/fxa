// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, you can obtain one at https://mozilla.org/MPL/2.0/.

use http::StatusCode;
use sendgrid::v3::{Content, Email as EmailAddress, Message, Personalization, Sender as Client};

use super::{Headers, Provider};
use crate::{
    settings::{Sender, Sendgrid as SendgridSettings, Settings},
    types::error::{AppErrorKind, AppResult},
};

pub struct SendgridProvider {
    client: Client,
    sender: Sender,
}

impl SendgridProvider {
    pub fn new(sendgrid_settings: &SendgridSettings, settings: &Settings) -> SendgridProvider {
        SendgridProvider {
            client: Client::new(sendgrid_settings.key.to_string()),
            sender: settings.sender.clone(),
        }
    }
}

impl Provider for SendgridProvider {
    fn send(
        &self,
        to: &str,
        cc: &[&str],
        headers: Option<&Headers>,
        subject: &str,
        body_text: &str,
        body_html: Option<&str>,
    ) -> AppResult<String> {
        let from_address = EmailAddress::new()
            .set_email(&self.sender.address.as_ref())
            .set_name(self.sender.name.as_ref());

        let text_content = Content::new()
            .set_content_type("text/plain")
            .set_value(body_text);

        let mut message = Message::new()
            .set_from(from_address)
            .set_subject(subject)
            .add_content(text_content);

        if let Some(body_html) = body_html {
            let html_content = Content::new()
                .set_content_type("text/html")
                .set_value(body_html);
            message = message.add_content(html_content);
        }

        let to_address = EmailAddress::new().set_email(to);
        let mut personalization = Personalization::new().add_to(to_address);
        for cc_item in cc.iter() {
            let cc_address = EmailAddress::new().set_email(cc_item);
            personalization = personalization.add_cc(cc_address);
        }
        if let Some(headers) = headers {
            personalization = personalization.add_headers(headers.clone());
        }
        message = message.add_personalization(personalization);

        self.client
            .send(&message)
            .map_err(From::from)
            .and_then(|mut response| {
                let status = response.status();
                if status == StatusCode::OK || status == StatusCode::ACCEPTED {
                    response
                        .headers()
                        .get("X-Message-Id")
                        .ok_or(
                            AppErrorKind::Internal(
                                "Missing or duplicate X-Message-Id header in Sendgrid response"
                                    .to_owned(),
                            )
                            .into(),
                        )
                        .and_then(|message_id| message_id.to_str().map_err(From::from))
                        .map(|message_id| message_id.to_string())
                } else {
                    Err(AppErrorKind::Internal(format!(
                        "Sendgrid response: {}, \"{}\"",
                        status,
                        response.text().unwrap_or("[no body]".to_owned())
                    )))?
                }
            })
    }
}
