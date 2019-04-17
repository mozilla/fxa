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

use lazy_static::lazy_static;
use regex::Regex;
use rusoto_core::Region;

#[cfg(test)]
mod test;

lazy_static! {
    static ref AWS_ACCESS_FORMAT: Regex = Regex::new("^[A-Z0-9]+$").unwrap();
    static ref AWS_SECRET_FORMAT: Regex = Regex::new("^[A-Za-z0-9+/=]+$").unwrap();
    static ref SQS_URL_FORMAT: Regex =
        Regex::new(r"^https://sqs\.[a-z0-9-]+\.amazonaws\.com/[0-9]+/[A-Za-z0-9-]+$").unwrap();
}

/// Validate an AWS region.
pub fn aws_region(value: &str) -> bool {
    value.parse::<Region>().is_ok()
}

/// Validate an AWS access key.
pub fn aws_access_key(value: &str) -> bool {
    AWS_ACCESS_FORMAT.is_match(value)
}

/// Validate an AWS secret key.
pub fn aws_secret_key(value: &str) -> bool {
    AWS_SECRET_FORMAT.is_match(value)
}

/// Validate an AWS SQS URL.
pub fn sqs_url(value: &str) -> bool {
    SQS_URL_FORMAT.is_match(value)
}
