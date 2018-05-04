// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, you can obtain one at https://mozilla.org/MPL/2.0/.

use std::{
  collections::{HashMap, HashSet},
  env,
  error::Error,
  sync::{LockResult, Mutex, MutexGuard},
};

use super::*;

lazy_static! {
  // HACK: mutex to prevent tests clobbering each other's environment variables
  static ref ENVIRONMENT_MUTEX: Mutex<bool> = Mutex::new(true);
}

struct CleanEnvironment<'e>
{
  vars_to_reinstate: HashMap<String, String>,
  keys_to_clear: HashSet<String>,
  _lock: LockResult<MutexGuard<'e, bool>>,
}

impl<'e> CleanEnvironment<'e>
{
  pub fn new(keys: Vec<&str>) -> CleanEnvironment
  {
    let mut snapshot = CleanEnvironment {
      vars_to_reinstate: HashMap::new(),
      keys_to_clear: HashSet::new(),
      _lock: ENVIRONMENT_MUTEX.lock(),
    };

    snapshot.initialise(keys);

    snapshot
  }

  fn initialise(&mut self, keys: Vec<&str>)
  {
    for key in keys {
      if let Ok(value) = env::var(key) {
        self.vars_to_reinstate.insert(String::from(key), value);
        env::remove_var(key);
      } else {
        self.keys_to_clear.insert(String::from(key));
      }
    }
  }
}

impl<'e> Drop for CleanEnvironment<'e>
{
  fn drop(&mut self)
  {
    for (key, value) in &self.vars_to_reinstate {
      env::set_var(key, &value);
    }

    for key in &self.keys_to_clear {
      env::remove_var(key);
    }
  }
}

#[test]
fn env_vars_take_precedence()
{
  let _clean_env = CleanEnvironment::new(vec![
    "FXA_EMAIL_PROVIDER",
    "FXA_EMAIL_SENDER",
    "FXA_EMAIL_SES_REGION",
    "FXA_EMAIL_SMTP_HOST",
    "FXA_EMAIL_SMTP_PORT",
    "FXA_EMAIL_SMTP_USER",
    "FXA_EMAIL_SMTP_PASSWORD",
  ]);

  match Settings::new() {
    Ok(settings) => {
      let provider = if settings.provider == "ses" {
        "smtp"
      } else {
        "ses"
      };
      let sender = format!("{}{}", "1", &settings.sender);
      let ses_region = if settings.ses.region == "us-east-1" {
        "eu-west-1"
      } else {
        "us-east-1"
      };
      let smtp_host = format!("{}{}", &settings.smtp.host, "2");
      let smtp_port = settings.smtp.port + 3;
      let smtp_user = if let Some(ref user) = settings.smtp.user {
        format!("{}{}", user, "4")
      } else {
        String::from("4")
      };
      let smtp_password = if let Some(ref password) = settings.smtp.password {
        format!("{}{}", password, "5")
      } else {
        String::from("5")
      };

      env::set_var("FXA_EMAIL_PROVIDER", &provider);
      env::set_var("FXA_EMAIL_SENDER", &sender);
      env::set_var("FXA_EMAIL_SES_REGION", &ses_region);
      env::set_var("FXA_EMAIL_SMTP_HOST", &smtp_host);
      env::set_var("FXA_EMAIL_SMTP_PORT", &smtp_port.to_string());
      env::set_var("FXA_EMAIL_SMTP_USER", &smtp_user);
      env::set_var("FXA_EMAIL_SMTP_PASSWORD", &smtp_password);

      match Settings::new() {
        Ok(env_settings) => {
          assert_eq!(env_settings.provider, provider);
          assert_eq!(env_settings.sender, sender);
          assert_eq!(env_settings.ses.region, ses_region);
          assert_eq!(env_settings.smtp.host, smtp_host);
          assert_eq!(env_settings.smtp.port, smtp_port);

          if let Some(env_user) = env_settings.smtp.user {
            assert_eq!(env_user, smtp_user);
          } else {
            assert!(false, "smtp.user was not set");
          }

          if let Some(env_password) = env_settings.smtp.password {
            assert_eq!(env_password, smtp_password);
          } else {
            assert!(false, "smtp.password was not set");
          }
        }
        Err(error) => {
          println!("{}", error);
          assert!(false);
        }
      }
    }
    Err(error) => {
      println!("{}", error);
      assert!(false);
    }
  }
}

#[test]
fn invalid_provider()
{
  let _clean_env = CleanEnvironment::new(vec!["FXA_EMAIL_PROVIDER"]);
  env::set_var("FXA_EMAIL_PROVIDER", "smtps");

  match Settings::new() {
    Ok(_settings) => assert!(false, "Settings::new should have failed"),
    Err(error) => assert_eq!(error.description(), "configuration error"),
  }
}

#[test]
fn invalid_sender()
{
  let _clean_env = CleanEnvironment::new(vec!["FXA_EMAIL_SENDER"]);
  env::set_var("FXA_EMAIL_SENDER", "foo bar@example.com");

  match Settings::new() {
    Ok(_settings) => assert!(false, "Settings::new should have failed"),
    Err(error) => assert_eq!(error.description(), "configuration error"),
  }
}

#[test]
fn invalid_ses_region()
{
  let _clean_env = CleanEnvironment::new(vec!["FXA_EMAIL_SES_REGION"]);
  env::set_var("FXA_EMAIL_SES_REGION", "us-east-1a");

  match Settings::new() {
    Ok(_settings) => assert!(false, "Settings::new should have failed"),
    Err(error) => assert_eq!(error.description(), "configuration error"),
  }
}

#[test]
fn invalid_smtp_host()
{
  let _clean_env = CleanEnvironment::new(vec!["FXA_EMAIL_SMTP_HOST"]);
  env::set_var("FXA_EMAIL_SMTP_HOST", "https://mail.google.com/");

  match Settings::new() {
    Ok(_settings) => assert!(false, "Settings::new should have failed"),
    Err(error) => assert_eq!(error.description(), "configuration error"),
  }
}
