// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, you can obtain one at https://mozilla.org/MPL/2.0/.

//! Application settings.

use std::env;

use config::{Config, ConfigError, Environment, File};

use deserialize;
use logging::MozlogLogger;
use serialize;

#[cfg(test)]
mod test;

/// Settings related to `fxa-auth-db-mysql`,
/// which is used to store
/// bounce, complaint and delivery notifications.
#[derive(Debug, Default, Deserialize, Serialize)]
pub struct AuthDb {
    /// The base URI for the `fxa-auth-db-mysql` instance.
    #[serde(deserialize_with = "deserialize::base_uri")]
    pub baseuri: String,
}

/// Settings for AWS.
#[derive(Debug, Default, Deserialize, Serialize)]
pub struct Aws {
    /// Controls the access and secret keys for connecting to AWS.
    #[serde(serialize_with = "serialize::hidden_or_not_set")]
    pub keys: Option<AwsKeys>,

    /// The AWS region for SES and SQS.
    #[serde(deserialize_with = "deserialize::aws_region")]
    pub region: String,

    /// URLs for SQS queues.
    pub sqsurls: Option<SqsUrls>,
}

/// AWS keys.
/// These are sensitive data
/// and will not be logged.
#[derive(Debug, Default, Deserialize, Serialize)]
pub struct AwsKeys {
    /// The AWS access key.
    #[serde(deserialize_with = "deserialize::aws_access")]
    pub access: String,

    /// The AWS secret key.
    #[serde(deserialize_with = "deserialize::aws_secret")]
    pub secret: String,
}

/// A definition object for a bounce/complaint limit.
#[derive(Clone, Debug, Default, Deserialize, Serialize)]
pub struct BounceLimit {
    /// The time period
    /// within which to limit bounces/complaints.
    /// Deserialized from a string
    /// of the format `"{number} {period}"`,
    /// e.g. `"1 hour"` or `"10 minutes"`.
    #[serde(deserialize_with = "deserialize::duration")]
    pub period: u64,

    /// The maximum number of bounces/complaints
    /// to permit within the specified time period.
    pub limit: u8,
}

/// Controls the thresholds and behaviour
/// for bounce and complaint reports.
#[derive(Clone, Debug, Default, Deserialize, Serialize)]
pub struct BounceLimits {
    /// Controls whether to enable bounce limits.
    /// If set to `false`,
    /// bounce and complaint records in the database
    /// are ignored.
    pub enabled: bool,

    /// Limits for complaints/spam reports.
    pub complaint: Vec<BounceLimit>,

    /// Limits for hard (permanent) bounces.
    pub hard: Vec<BounceLimit>,

    /// Limits for soft (transient) bounces.
    pub soft: Vec<BounceLimit>,
}

/// Settings for Redis.
#[derive(Debug, Default, Deserialize, Serialize)]
pub struct Redis {
    /// The host name or IP address.
    #[serde(deserialize_with = "deserialize::host")]
    pub host: String,

    /// TCP port number.
    pub port: u16,
}

/// Controls the name and email address
/// that are used for the `From` and `Sender`
/// email headers.
#[derive(Clone, Debug, Default, Deserialize, Serialize)]
pub struct Sender {
    /// The email address.
    #[serde(deserialize_with = "deserialize::email_address")]
    pub address: String,

    /// The name
    /// (may contain spaces).
    #[serde(deserialize_with = "deserialize::sender_name")]
    pub name: String,
}

/// Settings for Sendgrid.
#[derive(Debug, Default, Deserialize, Serialize)]
pub struct Sendgrid {
    /// The API key.
    /// This is sensitive data
    /// and will not be logged.
    #[serde(deserialize_with = "deserialize::sendgrid_api_key")]
    pub key: String,
}

/// URLs for SQS queues.
/// Note that these are separate queues right now
/// for consistency with the auth server.
/// Long term,
/// there is nothing preventing us
/// from handling all incoming notification types
/// with a single queue.
#[derive(Debug, Default, Deserialize, Serialize)]
pub struct SqsUrls {
    /// The incoming bounce queue URL.
    ///
    /// Queue URLs are specified here
    /// for consistency with the auth server.
    /// However, we could also store queue names instead
    /// and then fetch the URL with rusoto_sqs::GetQueueUrl.
    /// Then we might be allowed to include
    /// the production queue names in default config?
    #[serde(deserialize_with = "deserialize::sqs_url")]
    pub bounce: String,

    /// The incoming complaint queue URL.
    #[serde(deserialize_with = "deserialize::sqs_url")]
    pub complaint: String,

    /// The incoming delivery queue URL.
    #[serde(deserialize_with = "deserialize::sqs_url")]
    pub delivery: String,

    /// The outgoing notification queue URL,
    /// used to forward notifications
    /// for additional processing by callers.
    #[serde(deserialize_with = "deserialize::sqs_url")]
    pub notification: String,
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
    /// If bounce limits are enabled,
    /// emails sent to offending addresses
    /// will fail with a `429` error.
    pub bouncelimits: BounceLimits,

    /// The HMAC key to use internally
    /// for hashing message ids.
    /// This is sensitive data
    /// and will not be logged.
    pub hmackey: String,

    /// The logging format to use,
    /// can be `"mozlog"`, `"pretty"` or `"null"`.
    pub logging: String,

    /// The default email provider to use,
    /// can be `"ses"`, `"sendgrid"` or `"mock"`.
    /// Note that this setting can be overridden
    /// on a per-request basis.
    #[serde(deserialize_with = "deserialize::provider")]
    pub provider: String,

    /// Settings for Redis,
    /// which is used to store metadata
    /// associated with a message.
    pub redis: Redis,

    /// Controls the name and email address
    /// that are used for the `From` and `Sender`
    /// email headers.
    pub sender: Sender,

    /// Settings for Sendgrid.
    #[serde(serialize_with = "serialize::hidden_or_not_set")]
    pub sendgrid: Option<Sendgrid>,
}

impl Settings {
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
    pub fn new() -> Result<Self, ConfigError> {
        let mut config = Config::new();

        config.merge(File::with_name("config/default"))?;

        if let Ok(node_env) = env::var("NODE_ENV") {
            config.merge(File::with_name(&format!("config/{}", node_env)).required(false))?;
        }

        config.merge(File::with_name("config/local").required(false))?;
        let mut env = Environment::with_prefix("fxa_email");
        // Event though "_" is the default separator for config-rs right now,
        // that is going to change for the next versions.
        // https://github.com/mehcode/config-rs/commit/536f52fed4a22ed158681edce08211845abff985
        env.separator("_".to_string());
        config.merge(env)?;

        match config.try_into::<Settings>() {
            Ok(settings) => {
                if let Ok(rocket_env) = env::var("ROCKET_ENV") {
                    if rocket_env == "production" && &settings.hmackey == "YOU MUST CHANGE ME" {
                        panic!("Please set a valid HMAC key.")
                    }
                }

                let logger =
                    MozlogLogger::new(&settings).expect("Unable to create MozlogLogger instance.");
                slog_info!(logger, "Settings::new"; "settings" => &settings);
                Ok(settings)
            }
            Err(error) => Err(error),
        }
    }
}
