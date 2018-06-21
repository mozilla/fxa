// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, you can obtain one at https://mozilla.org/MPL/2.0/.

use std::{
    boxed::Box,
    collections::HashMap,
    error::Error,
    fmt::{self, Display, Formatter},
};

use self::{
    mock::MockProvider as Mock, sendgrid::SendgridProvider as Sendgrid, ses::SesProvider as Ses,
};
use settings::Settings;

mod mock;
mod sendgrid;
mod ses;

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
    ) -> Result<String, ProviderError>;
}

#[derive(Debug)]
pub struct ProviderError {
    description: String,
}

impl ProviderError {
    pub fn new(description: String) -> ProviderError {
        ProviderError { description }
    }
}

impl From<String> for ProviderError {
    fn from(error: String) -> Self {
        ProviderError::new(error)
    }
}

impl Error for ProviderError {
    fn description(&self) -> &str {
        &self.description
    }
}

impl Display for ProviderError {
    fn fmt(&self, formatter: &mut Formatter) -> fmt::Result {
        write!(formatter, "{}", self.description)
    }
}

pub struct Providers {
    default_provider: String,
    providers: HashMap<String, Box<Provider>>,
}

impl Providers {
    pub fn new(settings: &Settings) -> Providers {
        let mut providers: HashMap<String, Box<Provider>> = HashMap::new();

        providers.insert(String::from("mock"), Box::new(Mock));
        providers.insert(String::from("ses"), Box::new(Ses::new(settings)));

        if let Some(ref sendgrid) = settings.sendgrid {
            providers.insert(
                String::from("sendgrid"),
                Box::new(Sendgrid::new(sendgrid, settings)),
            );
        }

        Providers {
            default_provider: settings.provider.clone(),
            providers,
        }
    }

    pub fn send(
        &self,
        to: &str,
        cc: &[&str],
        headers: Option<&Headers>,
        subject: &str,
        body_text: &str,
        body_html: Option<&str>,
        provider_id: Option<&str>,
    ) -> Result<String, ProviderError> {
        let resolved_provider_id = provider_id.unwrap_or(&self.default_provider);

        self.providers
            .get(resolved_provider_id)
            .ok_or_else(|| {
                ProviderError::new(format!("Invalid provider `{}`", resolved_provider_id))
            })
            .and_then(|provider| provider.send(to, cc, headers, subject, body_text, body_html))
            .map(|message_id| format!("{}:{}", resolved_provider_id, message_id))
    }
}

unsafe impl Sync for Providers {}

unsafe impl Send for Providers {}
