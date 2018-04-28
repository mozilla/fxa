use std::env;

use config::{Config, ConfigError, Environment, File};
use regex::Regex;
use serde::de::{Error, Unexpected};

#[cfg(test)]
mod test;

lazy_static! {
  static ref HOST_FORMAT: Regex = Regex::new("^[A-Za-z0-9-]+(?:\\.[A-Za-z0-9-]+)*$").unwrap();
  static ref SENDER_FORMAT: Regex = Regex::new(
    "^[A-Za-z0-9-]+(?: [A-Za-z0-9-]+)* <[a-z0-9-]+@[a-z0-9-]+(?:\\.[a-z0-9-]+)+>$"
  ).unwrap();
}

#[derive(Debug, Deserialize)]
pub struct Smtp
{
  host: String,
  port: u16,
  user: Option<String>,
  password: Option<String>,
  sender: String,
}

#[derive(Debug, Deserialize)]
pub struct Settings
{
  smtp: Smtp,
}

impl Settings
{
  /// Construct a `Settings` instance, populating it with data from the file
  /// system and local environment.
  ///
  /// Precedence (earlier items override later ones):
  ///
  ///   1. Environment variables: `$FXA_<UPPERCASE_KEY_NAME>`
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

    config.merge(Environment::with_prefix("fxa"))?;

    match config.try_into::<Settings>() {
      Ok(settings) => {
        if !HOST_FORMAT.is_match(&settings.smtp.host) {
          return Err(ConfigError::invalid_value(
            Unexpected::Str(&settings.smtp.host),
            &"host name or IP address",
          ));
        }

        if !SENDER_FORMAT.is_match(&settings.smtp.sender) {
          return Err(ConfigError::invalid_value(
            Unexpected::Str(&settings.smtp.sender),
            &"name and email address",
          ));
        }

        // TODO: replace this with proper logging when we have it
        println!("config: {:?}", settings);
        Ok(settings)
      }
      Err(error) => Err(error),
    }
  }
}
