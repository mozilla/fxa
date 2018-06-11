// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, you can obtain one at https://mozilla.org/MPL/2.0/.

use std::{
    collections::{HashMap, HashSet},
    env,
    error::Error,
};

use super::*;

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

#[test]
fn env_vars_take_precedence() {
    let _clean_env = CleanEnvironment::new(vec![
        "FXA_EMAIL_AUTHDB_BASEURI",
        "FXA_EMAIL_AWS_REGION",
        "FXA_EMAIL_AWS_KEYS_ACCESS",
        "FXA_EMAIL_AWS_KEYS_SECRET",
        "FXA_EMAIL_AWS_SQSURLS_BOUNCE",
        "FXA_EMAIL_AWS_SQSURLS_COMPLAINT",
        "FXA_EMAIL_AWS_SQSURLS_DELIVERY",
        "FXA_EMAIL_AWS_SQSURLS_NOTIFICATION",
        "FXA_EMAIL_BOUNCELIMITS_ENABLED",
        "FXA_EMAIL_PROVIDER",
        "FXA_EMAIL_SENDER_ADDRESS",
        "FXA_EMAIL_SENDER_NAME",
        "FXA_EMAIL_SENDGRID_KEY",
    ]);

    match Settings::new() {
        Ok(settings) => {
            let auth_db_base_uri = format!("{}foo/", &settings.authdb.baseuri);
            let aws_keys = if let Some(ref keys) = settings.aws.keys {
                AwsKeys {
                    access: format!("{}A", keys.access),
                    secret: format!("{}s", keys.secret),
                }
            } else {
                AwsKeys {
                    access: String::from("A"),
                    secret: String::from("s"),
                }
            };
            let aws_region = if settings.aws.region == "us-east-1" {
                "eu-west-1"
            } else {
                "us-east-1"
            };
            let aws_sqs_urls = if let Some(ref urls) = settings.aws.sqsurls {
                SqsUrls {
                    bounce: format!("{}B", urls.bounce),
                    complaint: format!("{}C", urls.complaint),
                    delivery: format!("{}D", urls.delivery),
                    notification: format!("{}N", urls.notification),
                }
            } else {
                SqsUrls {
                    bounce: String::from("https://sqs.us-east-1.amazonaws.com/123456789012/Bounce"),
                    complaint: String::from(
                        "https://sqs.us-east-1.amazonaws.com/123456789012/Complaint",
                    ),
                    delivery: String::from(
                        "https://sqs.us-east-1.amazonaws.com/123456789012/Delivery",
                    ),
                    notification: String::from(
                        "https://sqs.us-east-1.amazonaws.com/123456789012/Notification",
                    ),
                }
            };
            let bounce_limits_enabled = !settings.bouncelimits.enabled;
            let provider = if settings.provider == "ses" {
                "sendgrid"
            } else {
                "ses"
            };
            let sender_address = format!("1{}", &settings.sender.address);
            let sender_name = format!("{}1", &settings.sender.name);
            let sendgrid_api_key = String::from(
                "000000000000000000000000000000000000000000000000000000000000000000000",
            );

            env::set_var("FXA_EMAIL_AUTHDB_BASEURI", &auth_db_base_uri);
            env::set_var("FXA_EMAIL_AWS_REGION", &aws_region);
            env::set_var("FXA_EMAIL_AWS_KEYS_ACCESS", &aws_keys.access);
            env::set_var("FXA_EMAIL_AWS_KEYS_SECRET", &aws_keys.secret);
            env::set_var("FXA_EMAIL_AWS_SQSURLS_BOUNCE", &aws_sqs_urls.bounce);
            env::set_var("FXA_EMAIL_AWS_SQSURLS_COMPLAINT", &aws_sqs_urls.complaint);
            env::set_var("FXA_EMAIL_AWS_SQSURLS_DELIVERY", &aws_sqs_urls.delivery);
            env::set_var(
                "FXA_EMAIL_AWS_SQSURLS_NOTIFICATION",
                &aws_sqs_urls.notification,
            );
            env::set_var(
                "FXA_EMAIL_BOUNCELIMITS_ENABLED",
                &bounce_limits_enabled.to_string(),
            );
            env::set_var("FXA_EMAIL_PROVIDER", &provider);
            env::set_var("FXA_EMAIL_SENDER_ADDRESS", &sender_address);
            env::set_var("FXA_EMAIL_SENDER_NAME", &sender_name);
            env::set_var("FXA_EMAIL_SENDGRID_KEY", &sendgrid_api_key);

            match Settings::new() {
                Ok(env_settings) => {
                    assert_eq!(env_settings.authdb.baseuri, auth_db_base_uri);
                    assert_eq!(env_settings.aws.region, aws_region);
                    assert_eq!(env_settings.bouncelimits.enabled, bounce_limits_enabled);
                    assert_eq!(env_settings.provider, provider);
                    assert_eq!(env_settings.sender.address, sender_address);
                    assert_eq!(env_settings.sender.name, sender_name);

                    if let Some(env_sendgrid) = env_settings.sendgrid {
                        assert_eq!(env_sendgrid.key, sendgrid_api_key);
                    } else {
                        assert!(false, "settings.sendgrid was not set");
                    }

                    if let Some(env_keys) = env_settings.aws.keys {
                        assert_eq!(env_keys.access, aws_keys.access);
                        assert_eq!(env_keys.secret, aws_keys.secret);
                    } else {
                        assert!(false, "aws.keys were not set");
                    }

                    if let Some(env_sqs_urls) = env_settings.aws.sqsurls {
                        assert_eq!(env_sqs_urls.bounce, aws_sqs_urls.bounce);
                        assert_eq!(env_sqs_urls.complaint, aws_sqs_urls.complaint);
                        assert_eq!(env_sqs_urls.delivery, aws_sqs_urls.delivery);
                        assert_eq!(env_sqs_urls.notification, aws_sqs_urls.notification);
                    } else {
                        assert!(false, "aws.sqsurls were not set");
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
fn invalid_auth_db_base_uri() {
    let _clean_env = CleanEnvironment::new(vec!["FXA_EMAIL_AUTHDB_BASEURI"]);
    env::set_var("FXA_EMAIL_AUTHDB_BASEURI", "http://example.com");

    match Settings::new() {
        Ok(_settings) => assert!(false, "Settings::new should have failed"),
        Err(error) => assert_eq!(error.description(), "configuration error"),
    }
}

#[test]
fn invalid_aws_region() {
    let _clean_env = CleanEnvironment::new(vec!["FXA_EMAIL_AWS_REGION"]);
    env::set_var("FXA_EMAIL_AWS_REGION", "us-east-1a");

    match Settings::new() {
        Ok(_settings) => assert!(false, "Settings::new should have failed"),
        Err(error) => assert_eq!(error.description(), "configuration error"),
    }
}

#[test]
fn invalid_aws_access_key() {
    let _clean_env = CleanEnvironment::new(vec!["FXA_EMAIL_AWS_KEYS_ACCESS"]);
    env::set_var("FXA_EMAIL_AWS_KEYS_ACCESS", "DEADBEEF DEADBEEF");

    match Settings::new() {
        Ok(_settings) => assert!(false, "Settings::new should have failed"),
        Err(error) => assert_eq!(error.description(), "configuration error"),
    }
}

#[test]
fn invalid_aws_secret_key() {
    let _clean_env = CleanEnvironment::new(vec!["FXA_EMAIL_AWS_KEYS_SECRET"]);
    env::set_var("FXA_EMAIL_AWS_KEYS_SECRET", "DEADBEEF DEADBEEF");

    match Settings::new() {
        Ok(_settings) => assert!(false, "Settings::new should have failed"),
        Err(error) => assert_eq!(error.description(), "configuration error"),
    }
}

#[test]
fn invalid_aws_bounce_queue_url() {
    let _clean_env = CleanEnvironment::new(vec!["FXA_EMAIL_AWS_SQSURLS_BOUNCE"]);
    env::set_var(
        "FXA_EMAIL_AWS_SQSURLS_BOUNCE",
        "http://sqs.us-east-1.amazonaws.com/123456789012/Bounce",
    );

    match Settings::new() {
        Ok(_settings) => assert!(false, "Settings::new should have failed"),
        Err(error) => assert_eq!(error.description(), "configuration error"),
    }
}

#[test]
fn invalid_aws_complaint_queue_url() {
    let _clean_env = CleanEnvironment::new(vec!["FXA_EMAIL_AWS_SQSURLS_COMPLAINT"]);
    env::set_var(
        "FXA_EMAIL_AWS_SQSURLS_COMPLAINT",
        "http://sqs.us-east-1.amazonaws.com/123456789012/Complaint",
    );

    match Settings::new() {
        Ok(_settings) => assert!(false, "Settings::new should have failed"),
        Err(error) => assert_eq!(error.description(), "configuration error"),
    }
}

#[test]
fn invalid_aws_delivery_queue_url() {
    let _clean_env = CleanEnvironment::new(vec!["FXA_EMAIL_AWS_SQSURLS_DELIVERY"]);
    env::set_var(
        "FXA_EMAIL_AWS_SQSURLS_DELIVERY",
        "http://sqs.us-east-1.amazonaws.com/123456789012/Delivery",
    );

    match Settings::new() {
        Ok(_settings) => assert!(false, "Settings::new should have failed"),
        Err(error) => assert_eq!(error.description(), "configuration error"),
    }
}

#[test]
fn invalid_aws_notification_queue_url() {
    let _clean_env = CleanEnvironment::new(vec!["FXA_EMAIL_AWS_SQSURLS_NOTIFICATION"]);
    env::set_var(
        "FXA_EMAIL_AWS_SQSURLS_NOTIFICATION",
        "http://sqs.us-east-1.amazonaws.com/123456789012/Notification",
    );

    match Settings::new() {
        Ok(_settings) => assert!(false, "Settings::new should have failed"),
        Err(error) => assert_eq!(error.description(), "configuration error"),
    }
}

#[test]
fn invalid_bouncelimits_enabled() {
    let _clean_env = CleanEnvironment::new(vec!["FXA_EMAIL_BOUNCELIMITS_ENABLED"]);
    env::set_var("FXA_EMAIL_BOUNCELIMITS_ENABLED", "falsey");

    match Settings::new() {
        Ok(_settings) => assert!(false, "Settings::new should have failed"),
        Err(error) => assert_eq!(error.description(), "invalid type"),
    }
}

#[test]
fn invalid_provider() {
    let _clean_env = CleanEnvironment::new(vec!["FXA_EMAIL_PROVIDER"]);
    env::set_var("FXA_EMAIL_PROVIDER", "sess");

    match Settings::new() {
        Ok(_settings) => assert!(false, "Settings::new should have failed"),
        Err(error) => assert_eq!(error.description(), "configuration error"),
    }
}

#[test]
fn invalid_sender_address() {
    let _clean_env = CleanEnvironment::new(vec!["FXA_EMAIL_SENDER_ADDRESS"]);
    env::set_var("FXA_EMAIL_SENDER_ADDRESS", "foo");

    match Settings::new() {
        Ok(_settings) => assert!(false, "Settings::new should have failed"),
        Err(error) => assert_eq!(error.description(), "configuration error"),
    }
}

#[test]
fn invalid_sender_name() {
    let _clean_env = CleanEnvironment::new(vec!["FXA_EMAIL_SENDER_NAME"]);
    env::set_var("FXA_EMAIL_SENDER_NAME", "foo@example.com");

    match Settings::new() {
        Ok(_settings) => assert!(false, "Settings::new should have failed"),
        Err(error) => assert_eq!(error.description(), "configuration error"),
    }
}

#[test]
fn invalid_sendgrid_api_key() {
    let _clean_env = CleanEnvironment::new(vec!["FXA_EMAIL_SENDGRID_KEY"]);
    env::set_var("FXA_EMAIL_SENDGRID_KEY", "foo bar");

    match Settings::new() {
        Ok(_settings) => assert!(false, "Settings::new should have failed"),
        Err(error) => assert_eq!(error.description(), "configuration error"),
    }
}
