// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, you can obtain one at https://mozilla.org/MPL/2.0/.

use std::{
    collections::{HashMap, HashSet},
    env,
    error::Error,
};

use serde_json::{self, Value};

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
        "FXA_EMAIL_ENV",
        "FXA_EMAIL_LOG_LEVEL",
        "FXA_EMAIL_LOG_FORMAT",
        "FXA_EMAIL_MESSAGEDATA_HMACKEY",
        "FXA_EMAIL_PROVIDER",
        "FXA_EMAIL_REDIS_HOST",
        "FXA_EMAIL_REDIS_PORT",
        "FXA_EMAIL_SENDER_ADDRESS",
        "FXA_EMAIL_SENDER_NAME",
        "FXA_EMAIL_SENDGRID_KEY",
        "FXA_EMAIL_SMTP_HOST",
        "FXA_EMAIL_SMTP_PORT",
        "FXA_EMAIL_SMTP_USER",
        "FXA_EMAIL_SMTP_PASSWORD",
        "FXA_EMAIL_SOCKETLABS_SERVERID",
        "FXA_EMAIL_SOCKETLABS_KEY",
    ]);

    match Settings::new() {
        Ok(settings) => {
            let auth_db_base_uri = format!("{}foo/", &settings.authdb.baseuri);
            let aws_keys = if let Some(ref keys) = settings.aws.keys {
                AwsKeys {
                    access: AwsAccess(format!("{}A", keys.access)),
                    secret: AwsSecret(format!("{}s", keys.secret)),
                }
            } else {
                AwsKeys {
                    access: AwsAccess(String::from("A")),
                    secret: AwsSecret(String::from("s")),
                }
            };
            let aws_region = if settings.aws.region.0 == "us-east-1" {
                "eu-west-1"
            } else {
                "us-east-1"
            };
            let aws_sqs_urls = if let Some(ref urls) = settings.aws.sqsurls {
                SqsUrls {
                    bounce: SqsUrl(format!("{}B", urls.bounce)),
                    complaint: SqsUrl(format!("{}C", urls.complaint)),
                    delivery: SqsUrl(format!("{}D", urls.delivery)),
                    notification: SqsUrl(format!("{}N", urls.notification)),
                }
            } else {
                SqsUrls {
                    bounce: SqsUrl(String::from(
                        "https://sqs.us-east-1.amazonaws.com/123456789012/Bounce",
                    )),
                    complaint: SqsUrl(String::from(
                        "https://sqs.us-east-1.amazonaws.com/123456789012/Complaint",
                    )),
                    delivery: SqsUrl(String::from(
                        "https://sqs.us-east-1.amazonaws.com/123456789012/Delivery",
                    )),
                    notification: SqsUrl(String::from(
                        "https://sqs.us-east-1.amazonaws.com/123456789012/Notification",
                    )),
                }
            };
            let bounce_limits_enabled = !settings.bouncelimits.enabled;
            let current_env = Env(String::from("test"));
            let hmac_key = String::from("something else");
            let provider = if settings.provider == Provider("ses".to_string()) {
                "sendgrid"
            } else {
                "ses"
            };
            let redis_host = format!("{}1", &settings.redis.host);
            let redis_port = settings.redis.port + 1;
            let sender_address = format!("1{}", &settings.sender.address.0);
            let sender_name = format!("{}1", &settings.sender.name);
            let sendgrid_api_key = String::from(
                "000000000000000000000000000000000000000000000000000000000000000000000",
            );
            let smtp_host = format!("{}2", &settings.smtp.host);
            let smtp_port = settings.smtp.port + 3;
            let smtp_credentials = if let Some(ref credentials) = settings.smtp.credentials {
                SmtpCredentials {
                    user: format!("{}4", credentials.user),
                    password: format!("{}5", credentials.password),
                }
            } else {
                SmtpCredentials {
                    user: String::from("4"),
                    password: String::from("5"),
                }
            };

            let socketlabs = if let Some(ref socketlabs) = settings.socketlabs {
                SocketLabs {
                    serverid: socketlabs.serverid + 1,
                    key: format!("{}key", socketlabs.key),
                }
            } else {
                SocketLabs {
                    serverid: 99,
                    key: "key".to_string(),
                }
            };

            let log = Log {
                level: if settings.log.level == LoggingLevel("debug".to_string()) {
                    LoggingLevel("off".to_string())
                } else {
                    LoggingLevel("debug".to_string())
                },
                format: if settings.log.format == LoggingFormat("null".to_string()) {
                    LoggingFormat("pretty".to_string())
                } else {
                    LoggingFormat("null".to_string())
                },
            };

            env::set_var("FXA_EMAIL_AUTHDB_BASEURI", &auth_db_base_uri);
            env::set_var("FXA_EMAIL_AWS_REGION", &aws_region);
            env::set_var("FXA_EMAIL_AWS_KEYS_ACCESS", &aws_keys.access.0);
            env::set_var("FXA_EMAIL_AWS_KEYS_SECRET", &aws_keys.secret.0);
            env::set_var("FXA_EMAIL_AWS_SQSURLS_BOUNCE", &aws_sqs_urls.bounce.0);
            env::set_var("FXA_EMAIL_AWS_SQSURLS_COMPLAINT", &aws_sqs_urls.complaint.0);
            env::set_var("FXA_EMAIL_AWS_SQSURLS_DELIVERY", &aws_sqs_urls.delivery.0);
            env::set_var(
                "FXA_EMAIL_AWS_SQSURLS_NOTIFICATION",
                &aws_sqs_urls.notification.0,
            );
            env::set_var(
                "FXA_EMAIL_BOUNCELIMITS_ENABLED",
                &bounce_limits_enabled.to_string(),
            );
            env::set_var("FXA_EMAIL_HMACKEY", &hmac_key.to_string());
            env::set_var("FXA_EMAIL_ENV", &current_env.0);
            env::set_var("FXA_EMAIL_LOG_LEVEL", &log.level.0);
            env::set_var("FXA_EMAIL_LOG_FORMAT", &log.format.0);
            env::set_var("FXA_EMAIL_PROVIDER", &provider);
            env::set_var("FXA_EMAIL_REDIS_HOST", &redis_host);
            env::set_var("FXA_EMAIL_REDIS_PORT", &redis_port.to_string());
            env::set_var("FXA_EMAIL_SENDER_ADDRESS", &sender_address);
            env::set_var("FXA_EMAIL_SENDER_NAME", &sender_name);
            env::set_var("FXA_EMAIL_SENDGRID_KEY", &sendgrid_api_key);
            env::set_var("FXA_EMAIL_SMTP_HOST", &smtp_host);
            env::set_var("FXA_EMAIL_SMTP_PORT", &smtp_port.to_string());
            env::set_var("FXA_EMAIL_SMTP_CREDENTIALS_USER", &smtp_credentials.user);
            env::set_var(
                "FXA_EMAIL_SMTP_CREDENTIALS_PASSWORD",
                &smtp_credentials.password,
            );
            env::set_var(
                "FXA_EMAIL_SOCKETLABS_SERVERID",
                &socketlabs.serverid.to_string(),
            );
            env::set_var("FXA_EMAIL_SOCKETLABS_KEY", &socketlabs.key);

            match Settings::new() {
                Ok(env_settings) => {
                    assert_eq!(env_settings.authdb.baseuri, BaseUri(auth_db_base_uri));
                    assert_eq!(env_settings.aws.region, AwsRegion(aws_region.to_string()));
                    assert_eq!(env_settings.bouncelimits.enabled, bounce_limits_enabled);
                    assert_eq!(env_settings.env, current_env);
                    assert_eq!(env_settings.hmackey, hmac_key);
                    assert_eq!(env_settings.log.level, log.level);
                    assert_eq!(env_settings.log.format, log.format);
                    assert_eq!(env_settings.provider, Provider(provider.to_string()));
                    assert_eq!(env_settings.redis.host, Host(redis_host));
                    assert_eq!(env_settings.redis.port, redis_port);
                    assert_eq!(env_settings.sender.address, EmailAddress(sender_address));
                    assert_eq!(env_settings.sender.name, SenderName(sender_name));
                    assert_eq!(env_settings.smtp.host, Host(smtp_host));
                    assert_eq!(env_settings.smtp.port, smtp_port);

                    if let Some(env_sendgrid) = env_settings.sendgrid {
                        assert_eq!(env_sendgrid.key, SendgridApiKey(sendgrid_api_key));
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

                    if let Some(env_smtp_credentials) = env_settings.smtp.credentials {
                        assert_eq!(env_smtp_credentials.user, smtp_credentials.user);
                        assert_eq!(env_smtp_credentials.password, smtp_credentials.password);
                    } else {
                        assert!(false, "smtp.credentials was not set");
                    }

                    if let Some(env_socketlabs) = env_settings.socketlabs {
                        assert_eq!(env_socketlabs.serverid, socketlabs.serverid);
                        assert_eq!(env_socketlabs.key, socketlabs.key);
                    } else {
                        assert!(false, "smtp.credentials was not set");
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
fn default_env() {
    let _clean_env = CleanEnvironment::new(vec!["FXA_EMAIL_ENV"]);

    match Settings::new() {
        Ok(settings) => assert_eq!(settings.env, Env("dev".to_string())),
        Err(_error) => assert!(false, "Settings::new shouldn't have failed"),
    }
}

#[test]
fn hidden_sensitive_data() {
    let _clean_env = CleanEnvironment::new(vec![
        "FXA_EMAIL_AWS_KEYS_ACCESS",
        "FXA_EMAIL_AWS_KEYS_SECRET",
        "FXA_EMAIL_SENDGRID_KEY",
        "FXA_EMAIL_SOCKETLABS_SERVERID",
        "FXA_EMAIL_SOCKETLABS_KEY",
    ]);

    let aws_keys = AwsKeys {
        access: AwsAccess(String::from("A")),
        secret: AwsSecret(String::from("s")),
    };

    let sendgrid_api_key =
        String::from("000000000000000000000000000000000000000000000000000000000000000000000");

    let socketlabs = SocketLabs {
        serverid: 99,
        key: "key".to_string(),
    };

    env::set_var("FXA_EMAIL_AWS_KEYS_ACCESS", &aws_keys.access.0);
    env::set_var("FXA_EMAIL_AWS_KEYS_SECRET", &aws_keys.secret.0);
    env::set_var("FXA_EMAIL_SENDGRID_KEY", &sendgrid_api_key);
    env::set_var(
        "FXA_EMAIL_SOCKETLABS_SERVERID",
        &socketlabs.serverid.to_string(),
    );
    env::set_var("FXA_EMAIL_SOCKETLABS_KEY", &socketlabs.key);
    match Settings::new() {
        Ok(settings) => {
            let json = serde_json::to_string(&settings).unwrap();
            let s: Value = serde_json::from_str(&json).unwrap();
            assert_eq!(s["aws"]["keys"], "[hidden]");
            assert_eq!(s["sendgrid"], "[hidden]");
            assert_eq!(s["socketlabs"], "[hidden]");
        }
        Err(_error) => assert!(false, "Settings::new shouldn't have failed"),
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
fn invalid_smtp_host() {
    let _clean_env = CleanEnvironment::new(vec!["FXA_EMAIL_SMTP_HOST"]);
    env::set_var("FXA_EMAIL_SMTP_HOST", "https://mail.google.com/");

    match Settings::new() {
        Ok(_settings) => assert!(false, "Settings::new should have failed"),
        Err(error) => assert_eq!(error.description(), "configuration error"),
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
fn invalid_redis_host() {
    let _clean_env = CleanEnvironment::new(vec!["FXA_EMAIL_REDIS_HOST"]);
    env::set_var("FXA_EMAIL_REDIS_HOST", "foo bar");

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
