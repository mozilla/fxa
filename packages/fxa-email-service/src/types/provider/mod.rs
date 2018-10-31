// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, you can obtain one at https://mozilla.org/MPL/2.0/.

//! Email provider type.

#[cfg(test)]
mod test;

use std::{
    convert::TryFrom,
    fmt::{self, Display, Formatter},
};

use serde::{
    de::{Deserialize, Deserializer, Error as SerdeError, Unexpected},
    ser::{Serialize, Serializer},
};

use types::error::{AppError, AppErrorKind};

/// Identifies the underlying email provider.
#[derive(Clone, Copy, Debug, Eq, Hash, PartialEq)]
pub enum Provider {
    Mock,
    Sendgrid,
    Ses,
    Smtp,
    SocketLabs,
}

impl AsRef<str> for Provider {
    /// Return the provider as a string slice.
    fn as_ref(&self) -> &str {
        match *self {
            Provider::Mock => "mock",
            Provider::Sendgrid => "sendgrid",
            Provider::Ses => "ses",
            Provider::Smtp => "smtp",
            Provider::SocketLabs => "socketlabs",
        }
    }
}

impl Default for Provider {
    fn default() -> Self {
        Provider::Ses
    }
}

impl Display for Provider {
    /// Format the provider as a `String`.
    fn fmt(&self, formatter: &mut Formatter) -> fmt::Result {
        write!(formatter, "{}", self.as_ref())
    }
}

impl<'d> Deserialize<'d> for Provider {
    /// Deserialize a provider from its string representation.
    fn deserialize<D>(deserializer: D) -> Result<Self, D::Error>
    where
        D: Deserializer<'d>,
    {
        let value: String = Deserialize::deserialize(deserializer)?;
        Provider::try_from(value.as_str())
            .map_err(|_| D::Error::invalid_value(Unexpected::Str(&value), &"provider"))
    }
}

impl Serialize for Provider {
    /// Serialize a provider.
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: Serializer,
    {
        serializer.serialize_str(self.as_ref())
    }
}

impl<'v> TryFrom<&'v str> for Provider {
    type Error = AppError;

    /// Parse a provider from its string representation.
    fn try_from(value: &str) -> Result<Self, AppError> {
        match value {
            "mock" => Ok(Provider::Mock),
            "sendgrid" => Ok(Provider::Sendgrid),
            "ses" => Ok(Provider::Ses),
            "smtp" => Ok(Provider::Smtp),
            "socketlabs" => Ok(Provider::SocketLabs),
            _ => Err(AppErrorKind::InvalidPayload(format!(
                "provider `{}`",
                value
            )))?,
        }
    }
}
