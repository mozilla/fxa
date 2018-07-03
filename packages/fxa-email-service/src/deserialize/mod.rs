// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, you can obtain one at https://mozilla.org/MPL/2.0/.

//! Deserialization functions
//! for use with serde's `deserialize_with` attribute.

use std::convert::TryFrom;

use serde::de::{Deserialize, Deserializer, Error, Unexpected};

use duration::Duration;
use validate;

#[cfg(test)]
mod test;

/// Validate and deserialize an AWS region.
pub fn aws_region<'d, D>(deserializer: D) -> Result<String, D::Error>
where
    D: Deserializer<'d>,
{
    deserialize(deserializer, validate::aws_region, "AWS region")
}

/// Validate and deserialize an AWS access key.
pub fn aws_access<'d, D>(deserializer: D) -> Result<String, D::Error>
where
    D: Deserializer<'d>,
{
    deserialize(deserializer, validate::aws_access, "AWS access key")
}

/// Validate and deserialize an AWS secret key.
pub fn aws_secret<'d, D>(deserializer: D) -> Result<String, D::Error>
where
    D: Deserializer<'d>,
{
    deserialize(deserializer, validate::aws_secret, "AWS secret key")
}

/// Validate and deserialize a base URI.
pub fn base_uri<'d, D>(deserializer: D) -> Result<String, D::Error>
where
    D: Deserializer<'d>,
{
    deserialize(deserializer, validate::base_uri, "base URI")
}

/// Validate and deserialize an email address.
pub fn email_address<'d, D>(deserializer: D) -> Result<String, D::Error>
where
    D: Deserializer<'d>,
{
    let email = deserialize(deserializer, validate::email_address, "email address")?;
    Ok(email.to_lowercase())
}

/// Validate and deserialize a duration.
pub fn duration<'d, D>(deserializer: D) -> Result<u64, D::Error>
where
    D: Deserializer<'d>,
{
    let value: String = Deserialize::deserialize(deserializer)?;
    Duration::try_from(value.as_str())
        .map(From::from)
        .map_err(|_| D::Error::invalid_value(Unexpected::Str(&value), &"duration"))
}

/// Validate and deserialize a host name or IP address.
pub fn host<'d, D>(deserializer: D) -> Result<String, D::Error>
where
    D: Deserializer<'d>,
{
    deserialize(deserializer, validate::host, "host name or IP address")
}

/// Validate and deserialize a provider name.
pub fn provider<'d, D>(deserializer: D) -> Result<String, D::Error>
where
    D: Deserializer<'d>,
{
    deserialize(deserializer, validate::provider, "'ses' or 'sendgrid'")
}

/// Validate and deserialize a sender name.
pub fn sender_name<'d, D>(deserializer: D) -> Result<String, D::Error>
where
    D: Deserializer<'d>,
{
    deserialize(deserializer, validate::sender_name, "sender name")
}

/// Validate and deserialize a Sendgrid API key.
pub fn sendgrid_api_key<'d, D>(deserializer: D) -> Result<String, D::Error>
where
    D: Deserializer<'d>,
{
    deserialize(deserializer, validate::sendgrid_api_key, "Sendgrid API key")
}

/// Validate and deserialize an AWS SQS URL.
pub fn sqs_url<'d, D>(deserializer: D) -> Result<String, D::Error>
where
    D: Deserializer<'d>,
{
    deserialize(deserializer, validate::sqs_url, "SQS queue URL")
}

fn deserialize<'d, D>(
    deserializer: D,
    validator: fn(&str) -> bool,
    expected: &str,
) -> Result<String, D::Error>
where
    D: Deserializer<'d>,
{
    let value: String = Deserialize::deserialize(deserializer)?;
    if validator(&value) {
        Ok(value)
    } else {
        Err(D::Error::invalid_value(Unexpected::Str(&value), &expected))
    }
}
