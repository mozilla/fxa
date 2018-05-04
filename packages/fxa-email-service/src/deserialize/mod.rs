// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, you can obtain one at https://mozilla.org/MPL/2.0/.

use regex::Regex;
use serde::de::{Deserialize, Deserializer, Error, Unexpected};

lazy_static! {
  static ref HOST_FORMAT: Regex = Regex::new("^[A-Za-z0-9-]+(?:\\.[A-Za-z0-9-]+)*$").unwrap();
  static ref SENDER_FORMAT: Regex = Regex::new(
    "^[A-Za-z0-9-]+(?: [A-Za-z0-9-]+)* <[a-z0-9-]+@[a-z0-9-]+(?:\\.[a-z0-9-]+)+>$"
  ).unwrap();
}

pub fn host<'d, D>(deserializer: D) -> Result<String, D::Error>
where
  D: Deserializer<'d>,
{
  deserialize(deserializer, &HOST_FORMAT, "host name or IP address")
}

pub fn sender<'d, D>(deserializer: D) -> Result<String, D::Error>
where
  D: Deserializer<'d>,
{
  deserialize(
    deserializer,
    &SENDER_FORMAT,
    "sender name and email address",
  )
}

fn deserialize<'d, D>(deserializer: D, format: &Regex, expected: &str) -> Result<String, D::Error>
where
  D: Deserializer<'d>,
{
  let value: String = Deserialize::deserialize(deserializer)?;
  if format.is_match(&value) {
    Ok(value)
  } else {
    Err(D::Error::invalid_value(Unexpected::Str(&value), &expected))
  }
}
