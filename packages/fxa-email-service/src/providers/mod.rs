// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, you can obtain one at https://mozilla.org/MPL/2.0/.

//! Generic abstraction of specific email providers.

use std::{boxed::Box, collections::HashMap, convert::TryFrom};

use emailmessage::{header::ContentType, Mailbox, Message, MessageBuilder, MultiPart, SinglePart};

use self::{
    mock::MockProvider as Mock, sendgrid::SendgridProvider as Sendgrid, ses::SesProvider as Ses,
    smtp::SmtpProvider as Smtp, socketlabs::SocketLabsProvider as SocketLabs,
};
use crate::{
    settings::Settings,
    types::{
        error::{AppErrorKind, AppResult},
        headers::*,
        provider::Provider as ProviderType,
    },
};

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
fn build_multipart_mime<'a>(
    sender: &str,
    to: &str,
    cc: &[&str],
    headers: Option<&Headers>,
    subject: &str,
    body_text: &'a str,
    body_html: Option<&'a str>,
) -> AppResult<Message<MultiPart<&'a str>>> {
    let sender: Mailbox = sender
        .parse()
        .map_err(|_| AppErrorKind::InvalidPayload(format!("`from` address \"{}\"", sender)))?;
    let mut message = Message::builder()
        .sender(sender.clone())
        .from(sender)
        .to(to
            .parse()
            .map_err(|_| AppErrorKind::InvalidPayload(format!("`to` address \"{}\"", to)))?)
        .subject(subject)
        .mime_1_0();

    if cc.len() > 0 {
        for address in cc.iter() {
            message = message.cc(address.parse().map_err(|_| {
                AppErrorKind::InvalidPayload(format!("`cc` address \"{}\"", address))
            })?);
        }
    }

    if let Some(headers) = headers {
        for (name, value) in headers {
            message = set_custom_header(message, name, value);
        }
    }

    let mut body = MultiPart::alternative().singlepart(
        SinglePart::quoted_printable()
            .header(ContentType::text_utf8())
            .body(body_text),
    );
    if let Some(body_html) = body_html {
        body = body.multipart(
            MultiPart::related().singlepart(
                SinglePart::base64()
                    .header(ContentType("text/html; charset=utf-8".parse()?))
                    .body(body_html),
            ),
        );
    }

    Ok(message.mime_body(MultiPart::mixed().multipart(body)))
}

fn set_custom_header(message: MessageBuilder, name: &str, value: &str) -> MessageBuilder {
    let lowercase_name = name.to_lowercase();
    match lowercase_name.as_str() {
        "content-language" => message.header(ContentLanguage::new(value.to_owned())),
        "x-device-id" => message.header(DeviceId::new(value.to_owned())),
        "x-email-sender" => message.header(EmailSender::new(value.to_owned())),
        "x-email-service" => message.header(EmailService::new(value.to_owned())),
        "x-flow-begin-time" => message.header(FlowBeginTime::new(value.to_owned())),
        "x-flow-id" => message.header(FlowId::new(value.to_owned())),
        "x-link" => message.header(Link::new(value.to_owned())),
        "x-recovery-code" => message.header(RecoveryCode::new(value.to_owned())),
        "x-report-signin-link" => message.header(ReportSigninLink::new(value.to_owned())),
        "x-service-id" => message.header(ServiceId::new(value.to_owned())),
        "x-ses-configuration-set" => message.header(SesConfigurationSet::new(value.to_owned())),
        "x-ses-message-tags" => message.header(SesMessageTags::new(value.to_owned())),
        "x-signin-verify-code" => message.header(SigninVerifyCode::new(value.to_owned())),
        "x-template-name" => message.header(TemplateName::new(value.to_owned())),
        "x-template-version" => message.header(TemplateVersion::new(value.to_owned())),
        "x-uid" => message.header(Uid::new(value.to_owned())),
        "x-unblock-code" => message.header(UnblockCode::new(value.to_owned())),
        "x-verify-code" => message.header(VerifyCode::new(value.to_owned())),
        "x-verify-short-code" => message.header(VerifyShortCode::new(value.to_owned())),
        _ => message,
    }
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
    default_provider: ProviderType,
    force_default_provider: bool,
    providers: HashMap<ProviderType, Box<dyn Provider>>,
}

impl Providers {
    /// Instantiate the provider clients.
    pub fn new(settings: &Settings) -> Providers {
        let mut providers: HashMap<ProviderType, Box<dyn Provider>> = HashMap::new();

        macro_rules! set_provider {
            ($type:expr, $constructor:expr) => {
                if !settings.provider.forcedefault || settings.provider.default == $type {
                    providers.insert($type, Box::new($constructor));
                }
            };
        }

        set_provider!(ProviderType::Mock, Mock);
        set_provider!(ProviderType::Ses, Ses::new(settings));
        set_provider!(ProviderType::Smtp, Smtp::new(settings));

        if let Some(ref sendgrid) = settings.sendgrid {
            set_provider!(ProviderType::Sendgrid, Sendgrid::new(sendgrid, settings));
        }

        if settings.socketlabs.is_some() {
            set_provider!(ProviderType::SocketLabs, SocketLabs::new(settings));
        }

        Providers {
            default_provider: settings.provider.default,
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
            self.default_provider
        } else {
            if let Some(provider_id) = provider_id {
                ProviderType::try_from(provider_id)?
            } else {
                self.default_provider
            }
        };

        self.providers
            .get(&resolved_provider_id)
            .ok_or_else(|| {
                AppErrorKind::InvalidPayload(format!(
                    "provider `{}` is not enabled",
                    resolved_provider_id
                ))
                .into()
            })
            .and_then(|provider| provider.send(to, cc, headers, subject, body_text, body_html))
            .map(|message_id| format!("{}:{}", resolved_provider_id, message_id))
    }
}

unsafe impl Sync for Providers {}

unsafe impl Send for Providers {}
