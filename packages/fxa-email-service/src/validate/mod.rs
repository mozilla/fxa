// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, you can obtain one at https://mozilla.org/MPL/2.0/.

use regex::Regex;
use rusoto_core::Region;

#[cfg(test)]
mod test;

lazy_static! {
  static ref HOST_FORMAT: Regex = Regex::new("^[A-Za-z0-9-]+(?:\\.[A-Za-z0-9-]+)*$").unwrap();
  static ref PROVIDER_FORMAT: Regex = Regex::new("^(?:mock|ses|smtp)$").unwrap();
  static ref SENDER_FORMAT: Regex = Regex::new(
    "^[A-Za-z0-9-]+(?: [A-Za-z0-9-]+)* <[a-z0-9-]+@[a-z0-9-]+(?:\\.[a-z0-9-]+)+>$"
  ).unwrap();
}

pub fn aws_region(value: &str) -> bool
{
  value.parse::<Region>().is_ok()
}

pub fn host(value: &str) -> bool
{
  HOST_FORMAT.is_match(value)
}

pub fn provider(value: &str) -> bool
{
  PROVIDER_FORMAT.is_match(value)
}

pub fn sender(value: &str) -> bool
{
  SENDER_FORMAT.is_match(value)
}
