// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, you can obtain one at https://mozilla.org/MPL/2.0/.

//! Generic abstraction of specific email providers.

use std::{boxed::Box, collections::HashMap};

use emailmessage::{header, Mailbox, Message, MultiPart, SinglePart};

use self::{
    mock::MockProvider as Mock, sendgrid::SendgridProvider as Sendgrid, ses::SesProvider as Ses,
    smtp::SmtpProvider as Smtp, socketlabs::SocketLabsProvider as SocketLabs,
};
use app_errors::{AppErrorKind, AppResult};
use settings::{DefaultProvider, Settings};

mod mock;
mod sendgrid;
mod ses;
mod smtp;
mod socketlabs;
#[cfg(test)]
mod test;

/// Email headers.
pub type Headers = HashMap<String, String>;

/// Build email MIME message.
fn build_multipart_mime(
    sender: &str,
    to: &str,
    cc: &[&str],
    headers: Option<&Headers>,
    subject: &str,
    body_text: &str,
    body_html: Option<&str>,
) -> AppResult<Message<MultiPart<String>>> {
    let mut all_headers = header::Headers::new();
    all_headers.set(header::From(vec![sender.parse::<Mailbox>()?]));
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

    let message: Message<MultiPart<String>> = Message::new().with_headers(all_headers);

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

    Ok(message.with_body(MultiPart::mixed().with_multipart(body)))
}

trait Provider {
    fn send(
        &self,
        to: &str,
        cc: &[&str],
        headers: Option<&Headers>,
        subject: &str,
        body_text: &str,
        body_html: Option<&str>,
    ) -> AppResult<String>;
}

/// Generic provider wrapper.
pub struct Providers {
    default_provider: String,
    force_default_provider: bool,
    providers: HashMap<String, Box<Provider>>,
}

impl Providers {
    /// Instantiate the provider clients.
    pub fn new(settings: &Settings) -> Providers {
        let mut providers: HashMap<String, Box<Provider>> = HashMap::new();

        macro_rules! set_provider {
            ($id:expr, $constructor:expr) => {
                if !settings.provider.forcedefault
                    || settings.provider.default == DefaultProvider(String::from($id))
                {
                    providers.insert(String::from($id), Box::new($constructor));
                }
            };
        }

        set_provider!("mock", Mock);
        set_provider!("ses", Ses::new(settings));
        set_provider!("smtp", Smtp::new(settings));

        if let Some(ref sendgrid) = settings.sendgrid {
            set_provider!("sendgrid", Sendgrid::new(sendgrid, settings));
        }

        if settings.socketlabs.is_some() {
            set_provider!("socketlabs", SocketLabs::new(settings));
        }

        Providers {
            default_provider: settings.provider.default.to_string(),
            force_default_provider: settings.provider.forcedefault,
            providers,
        }
    }

    /// Send an email via an underlying provider.
    pub fn send(
        &self,
        to: &str,
        cc: &[&str],
        headers: Option<&Headers>,
        subject: &str,
        body_text: &str,
        body_html: Option<&str>,
        provider_id: Option<&str>,
    ) -> AppResult<String> {
        let resolved_provider_id = if self.force_default_provider {
            &self.default_provider
        } else {
            provider_id.unwrap_or(&self.default_provider)
        };

        self.providers
            .get(resolved_provider_id)
            .ok_or_else(|| AppErrorKind::InvalidProvider(String::from(resolved_provider_id)).into())
            .and_then(|provider| provider.send(to, cc, headers, subject, body_text, body_html))
            .map(|message_id| format!("{}:{}", resolved_provider_id, message_id))
    }
}

unsafe impl Sync for Providers {}

unsafe impl Send for Providers {}
