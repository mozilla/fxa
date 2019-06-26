// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, you can obtain one at https://mozilla.org/MPL/2.0/.

use lettre::{ClientSecurity, SmtpClient, SmtpTransport, Transport};
use lettre_email::{EmailBuilder, Header as LettreHeader};

use super::{Headers, Provider};
use crate::{
    settings::{Settings, SmtpCredentials},
    types::error::{AppErrorKind, AppResult},
};

pub struct SmtpProvider {
    host: String,
    port: u16,
    // TODO: Authenticated SMTP server option.
    _credentials: Option<SmtpCredentials>,
    sender: (String, String),
}

impl SmtpProvider {
    pub fn new(settings: &Settings) -> SmtpProvider {
        SmtpProvider {
            host: settings.smtp.host.to_string(),
            port: settings.smtp.port,
            _credentials: settings.smtp.credentials.clone(),
            sender: (
                settings.sender.address.to_string(),
                settings.sender.name.to_string(),
            ),
        }
    }
}

impl Provider for SmtpProvider {
    fn send(
        &self,
        to: &str,
        cc: &[&str],
        headers: Option<&Headers>,
        subject: &str,
        body_text: &str,
        body_html: Option<&str>,
    ) -> AppResult<String> {
        let mut email = EmailBuilder::new()
            .to(to)
            .from(self.sender.clone())
            .subject(subject)
            .text(body_text);

        for address in cc {
            email = email.cc(*address);
        }

        if let Some(headers) = headers {
            for (name, value) in headers {
                email = email.header(LettreHeader::new(name.clone(), value.clone()));
            }
        }

        if let Some(body_html) = body_html {
            email = email.html(body_html);
        }

        let message = email.build()?;
        SmtpTransport::new(SmtpClient::new(
            &format!("{}:{}", self.host, self.port),
            ClientSecurity::None,
        )?)
        .send(message.into())
        .map(|result| format!("{}", &result.code))
        .map_err(|error| AppErrorKind::Internal(error.to_string()).into())
    }
}
