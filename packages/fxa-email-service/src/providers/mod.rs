// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, you can obtain one at https://mozilla.org/MPL/2.0/.

//! Generic abstraction of specific email providers.

use std::{boxed::Box, collections::HashMap};

use self::{
    mock::MockProvider as Mock, sendgrid::SendgridProvider as Sendgrid, ses::SesProvider as Ses,
    smtp::SmtpProvider as Smtp,
};
use app_errors::{AppErrorKind, AppResult};
use settings::Settings;

mod mock;
mod sendgrid;
mod ses;
mod smtp;

/// Email headers.
pub type Headers = HashMap<String, String>;

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
    providers: HashMap<String, Box<Provider>>,
}

impl Providers {
    /// Instantiate the provider clients.
    pub fn new(settings: &Settings) -> Providers {
        let mut providers: HashMap<String, Box<Provider>> = HashMap::new();

        providers.insert(String::from("smtp"), Box::new(Smtp::new(settings)));
        providers.insert(String::from("mock"), Box::new(Mock));
        providers.insert(String::from("ses"), Box::new(Ses::new(settings)));

        if let Some(ref sendgrid) = settings.sendgrid {
            providers.insert(
                String::from("sendgrid"),
                Box::new(Sendgrid::new(sendgrid, settings)),
            );
        }

        Providers {
            default_provider: settings.provider.0.clone(),
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
        let resolved_provider_id = provider_id.unwrap_or(&self.default_provider);

        self.providers
            .get(resolved_provider_id)
            .ok_or_else(|| AppErrorKind::InvalidProvider(String::from(resolved_provider_id)).into())
            .and_then(|provider| provider.send(to, cc, headers, subject, body_text, body_html))
            .map(|message_id| format!("{}:{}", resolved_provider_id, message_id))
    }
}

unsafe impl Sync for Providers {}

unsafe impl Send for Providers {}
