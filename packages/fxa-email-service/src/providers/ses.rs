// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, you can obtain one at https://mozilla.org/MPL/2.0/.

use std::boxed::Box;

use base64::encode;
use emailmessage::{header, Mailbox, Message, MultiPart, SinglePart};
use rusoto_core::{reactor::RequestDispatcher, Region};
use rusoto_credential::StaticProvider;
use rusoto_ses::{RawMessage, SendRawEmailError, SendRawEmailRequest, Ses, SesClient};

use super::{Headers, Provider, ProviderError};
use settings::Settings;

pub struct SesProvider {
    client: Box<Ses>,
    sender: String,
}

impl SesProvider {
    pub fn new(settings: &Settings) -> SesProvider {
        let region = settings
            .aws
            .region
            .parse::<Region>()
            .expect("invalid region");

        let client: Box<Ses> = if let Some(ref keys) = settings.aws.keys {
            let creds =
                StaticProvider::new(keys.access.to_string(), keys.secret.to_string(), None, None);
            Box::new(SesClient::new(RequestDispatcher::default(), creds, region))
        } else {
            Box::new(SesClient::simple(region))
        };

        SesProvider {
            client,
            sender: format!("{} <{}>", settings.sender.name, settings.sender.address),
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
    ) -> Result<String, ProviderError> {
        let mut all_headers = header::Headers::new();
        all_headers.set(header::From(vec![self.sender.parse::<Mailbox>()?]));
        all_headers.set(header::To(vec![to.parse::<Mailbox>()?]));
        all_headers.set(header::Subject(subject.into()));
        all_headers.set(header::MIME_VERSION_1_0);

        if cc.len() > 0 {
            let mut parsed_cc: Vec<Mailbox> = Vec::new();
            for address in cc.iter() {
                parsed_cc.push(address.parse::<Mailbox>()?)
            }
            all_headers.set(header::Cc(parsed_cc))
        }

        if let Some(headers) = headers {
            for (name, value) in headers {
                all_headers.append_raw(name.to_owned(), value.to_owned())
            }
        }

        let mut message: Message<MultiPart<String>> = Message::new().with_headers(all_headers);

        let mut body: MultiPart<String> = MultiPart::alternative().with_singlepart(
            SinglePart::quoted_printable()
                .with_header(header::ContentType(
                    "text/plain; charset=utf8".parse().unwrap(),
                ))
                .with_body(body_text.to_owned()),
        );
        if let Some(body_html) = body_html {
            body = body.with_multipart(
                MultiPart::related().with_singlepart(
                    SinglePart::eight_bit()
                        .with_header(header::ContentType(
                            "text/html; charset=utf8".parse().unwrap(),
                        ))
                        .with_body(body_html.to_owned()),
                ),
            )
        }

        message = message.with_body(MultiPart::mixed().with_multipart(body));

        let encoded_message = encode(&format!("{}", message));
        let mut request = SendRawEmailRequest::default();
        request.raw_message = RawMessage {
            data: format!("{}", encoded_message).as_bytes().to_vec(),
        };

        self.client
            .send_raw_email(&request)
            .sync()
            .map(|response| response.message_id)
            .map_err(From::from)
    }
}

impl From<SendRawEmailError> for ProviderError {
    fn from(error: SendRawEmailError) -> ProviderError {
        ProviderError {
            description: format!("SES error: {:?}", error),
        }
    }
}
