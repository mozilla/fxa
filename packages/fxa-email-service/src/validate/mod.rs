// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, you can obtain one at https://mozilla.org/MPL/2.0/.

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
        "^[a-z0-9\\-!#\\$%\\&`\\*\\+/=\\?\\^{\\|}~]+@[a-z0-9-]+(?:\\.[a-z0-9-]+)+$"
    ).unwrap();
    static ref HOST_FORMAT: Regex = Regex::new("^[A-Za-z0-9-]+(?:\\.[A-Za-z0-9-]+)*$").unwrap();
    static ref PROVIDER_FORMAT: Regex = Regex::new("^(?:mock|sendgrid|ses)$").unwrap();
    static ref SENDER_NAME_FORMAT: Regex =
        Regex::new("^[A-Za-z0-9-]+(?: [A-Za-z0-9-]+)*$").unwrap();
    static ref SENDGRID_API_KEY_FORMAT: Regex = Regex::new("^[A-Za-z0-9._-]+$").unwrap();
    static ref SQS_URL_FORMAT: Regex =
        Regex::new("^https://sqs\\.[a-z0-9-]+\\.amazonaws\\.com/[0-9]+/[A-Za-z0-9-]+$").unwrap();
}

pub fn aws_region(value: &str) -> bool {
    value.parse::<Region>().is_ok()
}

pub fn aws_access(value: &str) -> bool {
    AWS_ACCESS_FORMAT.is_match(value)
}

pub fn aws_secret(value: &str) -> bool {
    AWS_SECRET_FORMAT.is_match(value)
}

pub fn base_uri(value: &str) -> bool {
    BASE_URI_FORMAT.is_match(value)
}

pub fn email_address(value: &str) -> bool {
    value.len() < 254 && EMAIL_ADDRESS_FORMAT.is_match(value)
}

pub fn host(value: &str) -> bool {
    HOST_FORMAT.is_match(value)
}

pub fn provider(value: &str) -> bool {
    PROVIDER_FORMAT.is_match(value)
}

pub fn sender_name(value: &str) -> bool {
    SENDER_NAME_FORMAT.is_match(value)
}

pub fn sendgrid_api_key(value: &str) -> bool {
    SENDGRID_API_KEY_FORMAT.is_match(value)
}

pub fn sqs_url(value: &str) -> bool {
    SQS_URL_FORMAT.is_match(value)
}
