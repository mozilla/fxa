// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, you can obtain one at https://mozilla.org/MPL/2.0/.

//! Application settings.

mod serialize;
#[cfg(test)]
mod test;

use std::{
    convert::TryFrom,
    env,
    fmt::{self, Display},
};

use config::{Config, ConfigError, Environment, File};
use rocket::config::{
    Config as RocketConfig, ConfigError as RocketConfigError, Environment as RocketEnvironment,
    LoggingLevel as RocketLoggingLevel,
};
use serde::de::{Deserialize, Deserializer, Error, Unexpected};

use crate::{
    logging::MozlogLogger,
    types::{
        duration::Duration,
        email_address::EmailAddress,
        env::Env,
        logging::{LogFormat, LogLevel},
        provider::Provider as ProviderType,
        validate,
    },
};

macro_rules! deserialize_and_validate {
    ($(#[$docs:meta] ($type:ident, $validator:ident, $expected:expr)),+) => ($(
        #[$docs]
        #[derive(Clone, Debug, Default, Serialize, PartialEq)]
        pub struct $type(pub String);

        impl AsRef<str> for $type {
            fn as_ref(&self) -> &str {
                self.0.as_str()
            }
        }

        impl Display for $type {
            fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
                f.write_str(&self.0)
            }
        }

        impl<'d> Deserialize<'d> for $type {
            fn deserialize<D>(deserializer: D) -> Result<Self, D::Error>
            where
                D: Deserializer<'d>,
            {
                let value: String = Deserialize::deserialize(deserializer)?;
                if validate::$validator(&value) {
                    Ok($type(value))
                } else {
                    let expected = $expected;
                    Err(D::Error::invalid_value(Unexpected::Str(&value), &expected))
                }
            }
        }
    )*);
}

deserialize_and_validate! {
    /// AWS access key type.
    (AwsAccess, aws_access, "AWS access key"),
    /// AWS region type.
    (AwsRegion, aws_region, "AWS region"),
    /// AWS secret key type.
    (AwsSecret, aws_secret, "AWS secret key"),
    /// Base URI type.
    (BaseUri, base_uri, "base URI"),
    /// Host name or IP address type.
    (Host, host, "host name or IP address"),
    /// Sender name type.
    (SenderName, sender_name, "sender name"),
    /// Sendgrid API key type.
    (SendgridApiKey, sendgrid_api_key, "Sendgrid API key"),
    /// Sentry DSN type.
    (SentryDsn, sentry_dsn, "sentry dsn"),
    /// AWS SQS queue URL type.
    (SqsUrl, sqs_url, "SQS queue URL")
}

/// Settings related to `fxa-auth-db-mysql`,
/// which is used to store
/// bounce, complaint and delivery notifications.
#[derive(Debug, Default, Deserialize, Serialize)]
pub struct AuthDb {
    /// The base URI for the `fxa-auth-db-mysql` instance.
    pub baseuri: BaseUri,
}

/// Settings for AWS.
#[derive(Debug, Default, Deserialize, Serialize)]
pub struct Aws {
    /// Controls the access and secret keys for connecting to AWS.
    #[serde(serialize_with = "serialize::hidden_or_not_set")]
    pub keys: Option<AwsKeys>,

    /// The AWS region for SES and SQS.
    pub region: AwsRegion,

    /// URLs for SQS queues.
    pub sqsurls: Option<SqsUrls>,
}

/// AWS keys.
/// These are sensitive data
/// and will not be logged.
#[derive(Debug, Default, Deserialize, Serialize)]
pub struct AwsKeys {
    /// The AWS access key.
    pub access: AwsAccess,

    /// The AWS secret key.
    pub secret: AwsSecret,
}

/// A definition object for a bounce/complaint limit.
#[derive(Clone, Debug, Default, Deserialize, Serialize)]
pub struct DeliveryProblemLimit {
    /// The time period
    /// within which to limit bounces/complaints.
    pub period: Duration,

    /// The maximum number of bounces/complaints
    /// to permit within the specified time period.
    pub limit: u8,
}

/// Controls the thresholds and behaviour
/// for bounce and complaint reports.
#[derive(Clone, Debug, Default, Deserialize, Serialize)]
pub struct DeliveryProblemLimits {
    /// Controls whether to enable delivery problem limits.
    /// If set to `false`,
    /// bounce and complaint records in the database
    /// are ignored.
    pub enabled: bool,

    /// Limits for complaints/spam reports.
    pub complaint: Vec<DeliveryProblemLimit>,

    /// Limits for hard (permanent) bounces.
    pub hard: Vec<DeliveryProblemLimit>,

    /// Limits for soft (transient) bounces.
    pub soft: Vec<DeliveryProblemLimit>,
}

/// Settings for logging.
#[derive(Debug, Default, Deserialize, Serialize)]
pub struct Log {
    /// The logging level.
    pub level: LogLevel,

    /// The logging format.
    pub format: LogFormat,
}

/// Email provider settings.
#[derive(Debug, Default, Deserialize, Serialize)]
pub struct Provider {
    /// The default email provider to use,
    /// can be `"ses"`, `"sendgrid"`, `"socketlabs"`, `"smtp"` or `"mock"`.
    /// Note that this setting can be overridden
    /// on a per-request basis
    /// unless `forcedefault` is `true`.
    pub default: ProviderType,

    /// Flag indicating whether the default provider should be enforced
    /// in preference to the per-request `provider` param.
    pub forcedefault: bool,
}

/// Settings for Redis.
#[derive(Debug, Default, Deserialize, Serialize)]
pub struct Redis {
    /// The host name or IP address.
    pub host: Host,

    /// TCP port number.
    pub port: u16,
}

/// Controls the name and email address
/// that are used for the `From` and `Sender`
/// email headers.
#[derive(Clone, Debug, Default, Deserialize, Serialize)]
pub struct Sender {
    /// The email address.
    pub address: EmailAddress,

    /// The name
    /// (may contain spaces).
    pub name: SenderName,
}

/// Settings for Sendgrid.
#[derive(Debug, Default, Deserialize, Serialize)]
pub struct Sendgrid {
    /// The API key.
    /// This is sensitive data
    /// and will not be logged.
    pub key: SendgridApiKey,
}

/// Settings for Sentry.
#[derive(Debug, Default, Deserialize, Serialize)]
pub struct Sentry {
    /// The Sentry Data Source Name
    pub dsn: SentryDsn,
}

/// Settings for SMTP custom provider.
#[derive(Debug, Default, Deserialize, Serialize)]
pub struct Smtp {
    /// SMTP host IP address.
    pub host: Host,

    /// SMTP host port.
    pub port: u16,

    /// Optional SMTP credentials.
    pub credentials: Option<SmtpCredentials>,
}

/// Settings for SMTP custom provider optional credentials.
#[derive(Clone, Debug, Default, Deserialize, Serialize)]
pub struct SmtpCredentials {
    ///SMTP user.
    pub user: String,

    ///SMTP password.
    #[serde(serialize_with = "serialize::hidden")]
    pub password: String,
}

/// Settings for SocketLabs.
#[derive(Clone, Debug, Default, Deserialize, Serialize)]
pub struct SocketLabs {
    /// The server ID.
    /// This is sensitive data
    /// and will not be logged.
    pub serverid: u16,

    /// The API key.
    /// This is sensitive data
    /// and will not be logged.
    pub key: String,
}

/// URLs for SQS queues.
///
/// Note that these are separate queues right now
/// for consistency with the auth server.
/// Long term,
/// there is nothing preventing us
/// from handling all incoming notification types
/// with a single queue.
///
/// Queue URLs are specified
/// for consistency with the auth server.
/// However, we could also store queue names instead
/// and then fetch the URL with rusoto_sqs::GetQueueUrl.
/// Then we might be allowed to include
/// the production queue names in default config?
#[derive(Debug, Default, Deserialize, Serialize)]
pub struct SqsUrls {
    /// The incoming bounce queue URL.
    pub bounce: SqsUrl,

    /// The incoming complaint queue URL.
    pub complaint: SqsUrl,

    /// The incoming delivery queue URL.
    pub delivery: SqsUrl,

    /// The outgoing notification queue URL,
    /// used to forward notifications
    /// for additional processing by callers.
    pub notification: SqsUrl,
}

/// The root settings object.
#[derive(Debug, Default, Deserialize, Serialize)]
pub struct Settings {
    /// Settings related to `fxa-auth-db-mysql`,
    /// which is used to store
    /// bounce, complaint and delivery notifications.
    pub authdb: AuthDb,

    /// Settings for AWS,
    /// including region, access keys
    /// and URLs for SQS queues.
    pub aws: Aws,

    /// Controls the thresholds and behaviour
    /// for bounce and complaint reports.
    /// If delivery problem limits are enabled,
    /// emails sent to offending addresses
    /// will fail with a `429` error.
    pub deliveryproblemlimits: DeliveryProblemLimits,

    /// The env sets which environment we are in.
    /// It defaults to `dev` if not set.
    pub env: Env,

    /// The HMAC key to use internally
    /// for hashing message ids.
    /// This is sensitive data
    /// and will not be logged.
    pub hmackey: String,

    pub host: Host,

    /// The logging settings,
    /// about level and formatting.
    pub log: Log,

    /// The port this application is listening to.
    pub port: u16,

    /// Settings controlling the default email provider.
    pub provider: Provider,

    /// Settings for Redis,
    /// which is used to store metadata
    /// associated with a message.
    pub redis: Redis,

    /// Setting for a secret key
    /// used by Rocket.
    #[serde(serialize_with = "serialize::hidden")]
    pub secretkey: String,

    /// Controls the name and email address
    /// that are used for the `From` and `Sender`
    /// email headers.
    pub sender: Sender,

    /// Settings for Sendgrid.
    #[serde(serialize_with = "serialize::hidden_or_not_set")]
    pub sendgrid: Option<Sendgrid>,

    /// Settings for Sentry.
    #[serde(serialize_with = "serialize::hidden_or_not_set")]
    pub sentry: Option<Sentry>,

    /// Settings for SMTP custom provider.
    pub smtp: Smtp,

    /// Settings for SocketLabs.
    #[serde(serialize_with = "serialize::hidden_or_not_set")]
    pub socketlabs: Option<SocketLabs>,
}

impl Settings {
    /// Construct a `Settings` instance, populating it with data from the file
    /// system and local environment.
    ///
    /// Precedence (earlier items override later ones):
    ///
    ///   1. Environment variables: `$FXA_EMAIL_<UPPERCASE_KEY_NAME>`
    ///   2. File: `config/local.json`
    ///   3. File: `config/<$FXA_EMAIL_ENV>.json`
    ///   4. File: `config/default.json`
    ///
    /// Immediately before returning, the parsed config object will be logged to
    /// the console.
    pub fn new() -> Result<Self, ConfigError> {
        let mut config = Config::new();

        config.merge(File::with_name("config/default"))?;

        let current_env: Env = match env::var("FXA_EMAIL_ENV") {
            Ok(env) => TryFrom::try_from(env.as_str()).unwrap(),
            _ => Env::default(),
        };
        config
            .merge(File::with_name(&format!("config/{}", current_env.as_ref())).required(false))?;
        config.set_default("env", Env::default().as_ref())?;

        config.merge(File::with_name("config/local").required(false))?;
        let env = Environment::with_prefix("fxa_email").ignore_empty(true);
        config.merge(env.separator("_"))?;

        match config.try_into::<Settings>() {
            Ok(settings) => {
                if current_env == Env::Prod {
                    if &settings.hmackey == "YOU MUST CHANGE ME" {
                        panic!("Please set a valid HMAC key")
                    }
                    if &settings.secretkey == "youmustchangethisfortheproductionenvironment" {
                        panic!("Please set a valid secret key. It must be a 256-bit base64 encoded string")
                    }
                }

                let logger = MozlogLogger::new(&settings);
                slog_info!(logger, "Settings::new"; "settings" => &settings);
                Ok(settings)
            }
            Err(error) => Err(error),
        }
    }

    /// Create rocket configuration based on the environment
    /// variable. Defaults to `dev` mode if `FXA_EMAIL_ENV` is not set.
    pub fn build_rocket_config(&self) -> Result<RocketConfig, RocketConfigError> {
        let log_level = match self.log.level {
            LogLevel::Off => RocketLoggingLevel::Off,
            LogLevel::Debug => RocketLoggingLevel::Debug,
            LogLevel::Critical => RocketLoggingLevel::Critical,
            _ => RocketLoggingLevel::Normal,
        };
        let rocket_config = match self.env {
            Env::Prod => RocketEnvironment::Production,
            _ => RocketEnvironment::Development,
        };
        RocketConfig::build(rocket_config)
            .secret_key(self.secretkey.clone())
            .address(self.host.0.clone())
            .port(self.port.clone())
            .log_level(log_level)
            .finalize()
    }
}
