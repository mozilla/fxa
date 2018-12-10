// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, you can obtain one at https://mozilla.org/MPL/2.0/.

//! Regex types.

use regex::Regex;
use serde::{
    de::{Deserialize, Deserializer, Error as SerdeError, Unexpected},
    ser::{Serialize, Serializer},
};

#[cfg(test)]
mod test;

/// A regex wrapper
/// that can be (de)serialized.
#[derive(Clone, Debug)]
pub struct SerializableRegex(pub Regex);

impl<'d> Deserialize<'d> for SerializableRegex {
    fn deserialize<D>(deserializer: D) -> Result<Self, D::Error>
    where
        D: Deserializer<'d>,
    {
        let value: String = Deserialize::deserialize(deserializer)?;
        Regex::new(&value)
            .map(SerializableRegex)
            .map_err(|_| D::Error::invalid_value(Unexpected::Str(&value), &"regular expression"))
    }
}

impl PartialEq for SerializableRegex {
    fn eq(&self, rhs: &Self) -> bool {
        self.0.as_str() == rhs.0.as_str()
    }
}

impl Serialize for SerializableRegex {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: Serializer,
    {
        serializer.serialize_str(self.0.as_str())
    }
}
