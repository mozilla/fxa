// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, you can obtain one at https://mozilla.org/MPL/2.0/.

//! Common validation logic.
//!
//! All functions are predicates,
//! returning `true` if a value is valid
//! and `false` if it isn't.
//! Note that the intention is not to provide
//! perfect validation in each case.
//! Mostly it is to rule out obvious mistakes
//! when setting values in config
//! or wiring in request parameters.

use regex::Regex;
use rusoto_core::Region;

#[cfg(test)]
mod test;

lazy_static! {
    static ref AWS_ACCESS_FORMAT: Regex = Regex::new("^[A-Z0-9]+$").unwrap();
    static ref AWS_SECRET_FORMAT: Regex = Regex::new("^[A-Za-z0-9+/=]+$").unwrap();
    static ref BASE_URI_FORMAT: Regex = Regex::new(
        "^https?://[A-Za-z0-9-]+(?:\\.[A-Za-z0-9-]+)*(?::[0-9]+)?/(?:[A-Za-z0-9-]+/)*$"
    ).unwrap();
    static ref EMAIL_ADDRESS_FORMAT: Regex = Regex::new(
        "^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]{1,64}@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,253}[a-zA-Z0-9])?(?:\\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,253}[a-zA-Z0-9])?)+$"
    ).unwrap();
    static ref HOST_FORMAT: Regex = Regex::new("^[A-Za-z0-9-]+(?:\\.[A-Za-z0-9-]+)*$").unwrap();
    static ref LOGGING_FORMAT: Regex = Regex::new("^(?:mozlog|pretty|null)$").unwrap();
    static ref PROVIDER_FORMAT: Regex = Regex::new("^(?:mock|sendgrid|ses|smtp|socketlabs)$").unwrap();
    static ref SENDER_NAME_FORMAT: Regex =
        Regex::new("^[A-Za-z0-9-]+(?: [A-Za-z0-9-]+)*$").unwrap();
    static ref SENDGRID_API_KEY_FORMAT: Regex = Regex::new("^[A-Za-z0-9._-]+$").unwrap();
    static ref SQS_URL_FORMAT: Regex =
        Regex::new("^https://sqs\\.[a-z0-9-]+\\.amazonaws\\.com/[0-9]+/[A-Za-z0-9-]+$").unwrap();
}

/// Validate an AWS region.
pub fn aws_region(value: &str) -> bool {
    value.parse::<Region>().is_ok()
}

/// Validate an AWS access key.
pub fn aws_access(value: &str) -> bool {
    AWS_ACCESS_FORMAT.is_match(value)
}

/// Validate an AWS secret key.
pub fn aws_secret(value: &str) -> bool {
    AWS_SECRET_FORMAT.is_match(value)
}

/// Validate a base URI.
pub fn base_uri(value: &str) -> bool {
    BASE_URI_FORMAT.is_match(value)
}

/// Validate an email address.
pub fn email_address(value: &str) -> bool {
    value.len() < 254 && EMAIL_ADDRESS_FORMAT.is_match(value)
}

/// Validate a host name or IP address.
pub fn host(value: &str) -> bool {
    HOST_FORMAT.is_match(value)
}

/// Validate logging level.
pub fn logging(value: &str) -> bool {
    LOGGING_FORMAT.is_match(value)
}

/// Validate an email provider.
pub fn provider(value: &str) -> bool {
    PROVIDER_FORMAT.is_match(value)
}

/// Validate a sender name.
pub fn sender_name(value: &str) -> bool {
    SENDER_NAME_FORMAT.is_match(value)
}

/// Validate a Sendgrid API key.
pub fn sendgrid_api_key(value: &str) -> bool {
    SENDGRID_API_KEY_FORMAT.is_match(value)
}

/// Validate an AWS SQS URL.
pub fn sqs_url(value: &str) -> bool {
    SQS_URL_FORMAT.is_match(value)
}
