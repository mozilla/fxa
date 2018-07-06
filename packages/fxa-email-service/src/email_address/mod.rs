// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, you can obtain one at https://mozilla.org/MPL/2.0/.

//! Email address type.

use serde::de::{Deserialize, Deserializer, Error, Unexpected};

use validate;

#[cfg(test)]
mod test;

#[derive(Clone, Debug, Default, Serialize, PartialEq)]
pub struct EmailAddress(pub String);

/// Email address type.
///
/// Validates and then lowercases the address during deserialization.
impl<'d> Deserialize<'d> for EmailAddress {
    fn deserialize<D>(deserializer: D) -> Result<Self, D::Error>
    where
        D: Deserializer<'d>,
    {
        let value: String = Deserialize::deserialize(deserializer)?;
        if validate::email_address(&value) {
            Ok(EmailAddress(value.to_lowercase()))
        } else {
            Err(D::Error::invalid_value(
                Unexpected::Str(&value),
                &"email address",
            ))
        }
    }
}
