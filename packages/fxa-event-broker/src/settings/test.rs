// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, you can obtain one at https://mozilla.org/MPL/2.0/.

use std::{
    collections::{HashMap, HashSet},
    env,
    error::Error,
};

use super::*;

#[test]
fn env_vars_take_precedence() {
    let _clean_env = CleanEnvironment::new(vec![
        "FXA_EVENT_BROKER_AWS_REGION",
        "FXA_EVENT_BROKER_AWS_KEYS_ACCESS",
        "FXA_EVENT_BROKER_AWS_KEYS_SECRET",
        "FXA_EVENT_BROKER_AWS_SQSURLS_INCOMING",
        "FXA_EVENT_BROKER_ENV",
    ]);

    match Settings::new() {
        Ok(settings) => {
            let aws_keys = if let Some(ref keys) = settings.aws.keys {
                AwsKeys {
                    access: AccessKey(format!("{}A", keys.access)),
                    secret: SecretKey(format!("{}s", keys.secret)),
                }
            } else {
                AwsKeys {
                    access: AccessKey(String::from("A")),
                    secret: SecretKey(String::from("s")),
                }
            };
            let aws_region = if settings.aws.region.0 == "us-east-1" {
                "eu-west-1"
            } else {
                "us-east-1"
            };
            let aws_sqs_urls = if let Some(ref urls) = settings.aws.sqsurls {
                SqsUrls {
                    incoming: SqsUrl(format!("{}i", urls.incoming)),
                }
            } else {
                SqsUrls {
                    incoming: SqsUrl(String::from(
                        "https://sqs.us-east-1.amazonaws.com/123456789012/incoming",
                    )),
                }
            };
            let current_env = if settings.env == Env::Dev {
                Env::Prod
            } else {
                Env::Dev
            };

            env::set_var("FXA_EVENT_BROKER_AWS_REGION", &aws_region);
            env::set_var("FXA_EVENT_BROKER_AWS_KEYS_ACCESS", &aws_keys.access.0);
            env::set_var("FXA_EVENT_BROKER_AWS_KEYS_SECRET", &aws_keys.secret.0);
            env::set_var(
                "FXA_EVENT_BROKER_AWS_SQSURLS_INCOMING",
                &aws_sqs_urls.incoming.0,
            );
            env::set_var("FXA_EVENT_BROKER_ENV", current_env.as_ref());

            match Settings::new() {
                Ok(env_settings) => {
                    assert_eq!(env_settings.aws.region, Region(aws_region.to_string()));

                    if let Some(env_keys) = env_settings.aws.keys {
                        assert_eq!(env_keys.access, aws_keys.access);
                        assert_eq!(env_keys.secret, aws_keys.secret);
                    } else {
                        assert!(false, "aws.keys were not set");
                    }

                    if let Some(env_sqs_urls) = env_settings.aws.sqsurls {
                        assert_eq!(env_sqs_urls.incoming, aws_sqs_urls.incoming);
                    } else {
                        assert!(false, "aws.sqsurls were not set");
                    }

                    assert_eq!(env_settings.env, current_env);
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
fn default_env() {
    let _clean_env = CleanEnvironment::new(vec!["FXA_EVENT_BROKER_ENV"]);

    match Settings::new() {
        Ok(settings) => assert_eq!(settings.env, Env::Dev),
        Err(_error) => assert!(false, "Settings::new shouldn't have failed"),
    }
}

#[test]
fn invalid_aws_region() {
    let _clean_env = CleanEnvironment::new(vec!["FXA_EVENT_BROKER_AWS_REGION"]);
    env::set_var("FXA_EVENT_BROKER_AWS_REGION", "us-east-1a");

    match Settings::new() {
        Ok(_settings) => assert!(false, "Settings::new should have failed"),
        Err(error) => assert_eq!(error.description(), "configuration error"),
    }
}

#[test]
fn invalid_aws_access_key() {
    let _clean_env = CleanEnvironment::new(vec!["FXA_EVENT_BROKER_AWS_KEYS_ACCESS"]);
    env::set_var("FXA_EVENT_BROKER_AWS_KEYS_ACCESS", "DEADBEEF DEADBEEF");

    match Settings::new() {
        Ok(_settings) => assert!(false, "Settings::new should have failed"),
        Err(error) => assert_eq!(error.description(), "configuration error"),
    }
}

#[test]
fn invalid_aws_secret_key() {
    let _clean_env = CleanEnvironment::new(vec!["FXA_EVENT_BROKER_AWS_KEYS_SECRET"]);
    env::set_var("FXA_EVENT_BROKER_AWS_KEYS_SECRET", "DEADBEEF DEADBEEF");

    match Settings::new() {
        Ok(_settings) => assert!(false, "Settings::new should have failed"),
        Err(error) => assert_eq!(error.description(), "configuration error"),
    }
}

#[test]
fn invalid_aws_incoming_queue_url() {
    let _clean_env = CleanEnvironment::new(vec!["FXA_EVENT_BROKER_AWS_SQSURLS_INCOMING"]);
    env::set_var(
        "FXA_EVENT_BROKER_AWS_SQSURLS_INCOMING",
        "http://sqs.us-east-1.amazonaws.com/123456789012/incoming",
    );

    match Settings::new() {
        Ok(_settings) => assert!(false, "Settings::new should have failed"),
        Err(error) => assert_eq!(error.description(), "configuration error"),
    }
}

#[test]
fn empty_env_vars_are_ignored() {
    let _clean_env = CleanEnvironment::new(vec!["FXA_EVENT_BROKER_AWS_REGION"]);

    env::set_var("FXA_EVENT_BROKER_AWS_REGION", "");

    assert!(Settings::new().is_ok());
}

struct CleanEnvironment {
    vars_to_reinstate: HashMap<String, String>,
    keys_to_clear: HashSet<String>,
}

impl CleanEnvironment {
    pub fn new(keys: Vec<&str>) -> CleanEnvironment {
        let mut snapshot = CleanEnvironment {
            vars_to_reinstate: HashMap::new(),
            keys_to_clear: HashSet::new(),
        };

        snapshot.initialise(keys);

        snapshot
    }

    fn initialise(&mut self, keys: Vec<&str>) {
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

impl Drop for CleanEnvironment {
    fn drop(&mut self) {
        for (key, value) in &self.vars_to_reinstate {
            env::set_var(key, &value);
        }

        for key in &self.keys_to_clear {
            env::remove_var(key);
        }
    }
}
