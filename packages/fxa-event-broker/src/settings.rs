// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, you can obtain one at https://mozilla.org/MPL/2.0/.

//! Application settings.

#[cfg(test)]
mod test;

use std::{convert::TryFrom, env};

use config::{Config, ConfigError, Environment, File};
use serde::{Deserialize, Serialize};

use crate::types::{
    aws::{AccessKey, Region, SecretKey, SqsUrl},
    env::Env,
};

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
    pub region: Region,

    /// URLs for SQS queues.
    pub sqsurls: Option<SqsUrls>,
}

/// AWS keys.
#[derive(Debug, Default, Deserialize, Serialize)]
pub struct AwsKeys {
    /// The AWS access key.
    pub access: AccessKey,

    /// The AWS secret key.
    pub secret: SecretKey,
}

/// URLs for SQS queues.
#[derive(Debug, Default, Deserialize, Serialize)]
pub struct SqsUrls {
    /// The incoming queue URL.
    pub incoming: SqsUrl,
}
