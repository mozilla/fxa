// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, you can obtain one at https://mozilla.org/MPL/2.0/.

use std::{
  boxed::Box, collections::HashMap, error::Error, fmt::{self, Display, Formatter},
};

use self::{mock::MockProvider as Mock, ses::SesProvider as Ses};
use settings::Settings;

mod mock;
mod ses;

trait Provider
{
  fn send(
    &self,
    to: &str,
    cc: &[&str],
    subject: &str,
    body_text: &str,
    body_html: Option<&str>,
  ) -> Result<String, ProviderError>;
}

#[derive(Debug)]
pub struct ProviderError
{
  description: String,
}

impl ProviderError
{
  pub fn new(description: String) -> ProviderError
  {
    ProviderError { description }
  }
}

impl Error for ProviderError
{
  fn description(&self) -> &str
  {
    &self.description
  }
}

impl Display for ProviderError
{
  fn fmt(&self, formatter: &mut Formatter) -> fmt::Result
  {
    write!(formatter, "{}", self.description)
  }
}

pub struct Providers<'s>
{
  default_provider: &'s str,
  providers: HashMap<String, Box<Provider>>,
}

impl<'s> Providers<'s>
{
  pub fn new(settings: &'s Settings) -> Providers
  {
    let mut instance = Providers {
      default_provider: &settings.provider,
      providers: HashMap::new(),
    };
    instance
      .providers
      .insert(String::from("mock"), Box::new(Mock));
    instance
      .providers
      .insert(String::from("ses"), Box::new(Ses::new(settings)));
    instance
  }

  pub fn send(
    &self,
    to: &str,
    cc: &[&str],
    subject: &str,
    body_text: &str,
    body_html: Option<&str>,
    provider_id: Option<&str>,
  ) -> Result<String, ProviderError>
  {
    let resolved_provider_id = if let Some(id) = provider_id {
      id
    } else {
      self.default_provider
    };

    match self.providers.get(resolved_provider_id) {
      Some(ref provider) => match provider.send(to, cc, subject, body_text, body_html) {
        Ok(message_id) => Ok(format!("{}:{}", resolved_provider_id, message_id)),
        Err(error) => Err(error),
      },
      None => Err(ProviderError::new(format!(
        "invalid provider '{}'",
        resolved_provider_id
      ))),
    }
  }
}

unsafe impl<'s> Sync for Providers<'s> {}
