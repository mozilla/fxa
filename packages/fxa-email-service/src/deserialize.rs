// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, you can obtain one at https://mozilla.org/MPL/2.0/.

use serde::de::{Deserialize, Deserializer, Error, Unexpected};

use validate;

pub fn aws_region<'d, D>(deserializer: D) -> Result<String, D::Error>
where
  D: Deserializer<'d>,
{
  deserialize(deserializer, validate::aws_region, "AWS region")
}

pub fn host<'d, D>(deserializer: D) -> Result<String, D::Error>
where
  D: Deserializer<'d>,
{
  deserialize(deserializer, validate::host, "host name or IP address")
}

pub fn provider<'d, D>(deserializer: D) -> Result<String, D::Error>
where
  D: Deserializer<'d>,
{
  deserialize(deserializer, validate::provider, "'ses' or 'smtp'")
}

pub fn sender<'d, D>(deserializer: D) -> Result<String, D::Error>
where
  D: Deserializer<'d>,
{
  deserialize(
    deserializer,
    validate::sender,
    "sender name and email address",
  )
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
