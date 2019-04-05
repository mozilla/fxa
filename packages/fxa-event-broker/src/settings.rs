// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, you can obtain one at https://mozilla.org/MPL/2.0/.

//! Application settings.

#[cfg(test)]
mod test;

use std::{
    convert::TryFrom,
    env,
    fmt::{self, Display},
};

use config::{Config, ConfigError, Environment, File};
use serde::{
    de::{Error, Unexpected},
    Deserialize, Deserializer, Serialize,
};

use crate::types::{env::Env, validate};

/// The root settings object.
#[derive(Debug, Default, Deserialize, Serialize)]
pub struct Settings {
    /// Settings for AWS,
    /// including region, access keys
    /// and URLs for SQS queues.
    pub aws: Aws,

    /// The environment,
    /// defaults to `dev` if not set.
    pub env: Env,
}

impl Settings {
    /// Construct a `Settings` instance, populating it with data from the file
    /// system and local environment.
    ///
    /// Precedence (earlier items override later ones):
    ///
    ///   1. Environment variables: `$FXA_EVENT_BROKER_<UPPERCASE_KEY_NAME>`
    ///   2. File: `config/local.json` (optional)
    ///   3. File: `config/<$FXA_EVENT_BROKER_ENV>.json` (optional)
    ///   4. File: `config/default.json`
    ///
    /// This follows the precedence set by node-convict in the other FxA repos.
    pub fn new() -> Result<Self, ConfigError> {
        let mut config = Config::new();

        config.merge(File::with_name("config/default"))?;

        let current_env: Env = match env::var("FXA_EVENT_BROKER_ENV") {
            Ok(env) => TryFrom::try_from(env.as_str()).unwrap(),
            _ => Env::default(),
        };
        config
            .merge(File::with_name(&format!("config/{}", current_env.as_ref())).required(false))?;
        config.set_default("env", Env::default().as_ref())?;

        config.merge(File::with_name("config/local").required(false))?;
        let env = Environment::with_prefix("fxa_event_broker").ignore_empty(true);
        config.merge(env.separator("_"))?;

        config.try_into::<Settings>()
    }
}

/// Settings for AWS.
#[derive(Debug, Default, Deserialize, Serialize)]
pub struct Aws {
    /// Controls the access and secret keys for connecting to AWS.
    pub keys: Option<AwsKeys>,

    /// The AWS region for SES and SQS.
    pub region: AwsRegion,

    /// URLs for SQS queues.
    pub sqsurls: Option<SqsUrls>,
}

/// AWS keys.
#[derive(Debug, Default, Deserialize, Serialize)]
pub struct AwsKeys {
    /// The AWS access key.
    pub access: AwsAccess,

    /// The AWS secret key.
    pub secret: AwsSecret,
}

/// URLs for SQS queues.
#[derive(Debug, Default, Deserialize, Serialize)]
pub struct SqsUrls {
    /// The incoming queue URL.
    pub incoming: SqsUrl,
}

macro_rules! settings_strings {
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

settings_strings! {
    /// AWS access key type.
    (AwsAccess, aws_access, "AWS access key"),
    /// AWS region type.
    (AwsRegion, aws_region, "AWS region"),
    /// AWS secret key type.
    (AwsSecret, aws_secret, "AWS secret key"),
    /// AWS SQS queue URL type.
    (SqsUrl, sqs_url, "SQS queue URL")
}
