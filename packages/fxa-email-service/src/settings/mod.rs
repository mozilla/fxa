// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, you can obtain one at https://mozilla.org/MPL/2.0/.

use std::env;

use config::{Config, ConfigError, Environment, File};

use deserialize;

#[cfg(test)]
mod test;

#[derive(Debug, Deserialize)]
pub struct Ses
{
  #[serde(deserialize_with = "deserialize::aws_region")]
  pub region: String,
}

#[derive(Debug, Deserialize)]
pub struct Smtp
{
  #[serde(deserialize_with = "deserialize::host")]
  pub host: String,
  pub port: u16,
  pub user: Option<String>,
  pub password: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct Settings
{
  #[serde(deserialize_with = "deserialize::provider")]
  pub provider: String,
  #[serde(deserialize_with = "deserialize::sender")]
  pub sender: String,
  pub ses: Ses,
  pub smtp: Smtp,
}

impl Settings
{
  /// Construct a `Settings` instance, populating it with data from the file
  /// system and local environment.
  ///
  /// Precedence (earlier items override later ones):
  ///
  ///   1. Environment variables: `$FXA_EMAIL_<UPPERCASE_KEY_NAME>`
  ///   2. File: `config/local.json`
  ///   3. File: `config/<$NODE_ENV>.json`
  ///   4. File: `config/default.json`
  ///
  /// `$NODE_ENV` is used so that this service automatically picks up the
  /// appropriate state from our existing node.js ecosystem, without needing
  /// to manage an extra environment variable.
  ///
  /// Immediately before returning, the parsed config object will be logged to
  /// the console.
  pub fn new() -> Result<Self, ConfigError>
  {
    let mut config = Config::new();

    config.merge(File::with_name("config/default"))?;

    if let Ok(node_env) = env::var("NODE_ENV") {
      config.merge(File::with_name(&format!("config/{}", node_env)).required(false))?;
    }

    config.merge(File::with_name("config/local").required(false))?;

    config.merge(Environment::with_prefix("fxa_email"))?;

    match config.try_into::<Settings>() {
      Ok(settings) => {
        // TODO: replace this with proper logging when we have it
        println!("config: {:?}", settings);
        Ok(settings)
      }
      Err(error) => Err(error),
    }
  }
}
