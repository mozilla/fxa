// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, you can obtain one at https://mozilla.org/MPL/2.0/.

//! Parent scope
//! for modules that implement
//! miscellaneous generally-used types.

macro_rules! enum_boilerplate {
    ($name:ident ($description:expr, $error:ident) {
        $($variant:ident => $serialization:expr,)+
    }) => {
        #[derive(Clone, Copy, Debug, Eq, Hash, PartialEq)]
        pub enum $name {
            $($variant,
            )+
        }

        impl AsRef<str> for $name {
            fn as_ref(&self) -> &str {
                match *self {
                    $($name::$variant => $serialization,
                    )+
                }
            }
        }

        impl std::fmt::Display for $name {
            fn fmt(&self, formatter: &mut std::fmt::Formatter) -> std::fmt::Result {
                write!(formatter, "{}", self.as_ref())
            }
        }

        impl<'d> serde::de::Deserialize<'d> for $name {
            fn deserialize<D>(deserializer: D) -> Result<Self, D::Error>
            where
                D: serde::de::Deserializer<'d>,
            {
                let value: String = serde::de::Deserialize::deserialize(deserializer)?;
                std::convert::TryFrom::try_from(value.as_str())
                    .map_err(|_| D::Error::invalid_value(serde::de::Unexpected::Str(&value), &$description))
            }
        }

        impl serde::ser::Serialize for $name {
            fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
            where
                S: serde::ser::Serializer,
            {
                serializer.serialize_str(self.as_ref())
            }
        }

        impl<'v> std::convert::TryFrom<&'v str> for $name {
            type Error = AppError;

            fn try_from(value: &str) -> Result<Self, Self::Error> {
                match value {
                    $($serialization => Ok($name::$variant),
                    )+
                    _ => Err(AppErrorKind::$error(value.to_owned()))?,
                }
            }
        }
    }
}

pub mod duration;
pub mod email_address;
pub mod env;
pub mod error;
pub mod headers;
pub mod logging;
pub mod provider;
pub mod validate;
