// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, you can obtain one at https://mozilla.org/MPL/2.0/.

//! Type definition macros.

/// Defines an `enum`,
/// with implementations for
/// `AsRef<str>`, `Default`, `Deserialize`, `Display`, `Serialize` and `TryFrom`.
macro_rules! enum_type {
    (#[$docs:meta] $type:ident ($description:expr, $default:ident, $error:ident) {
        $($variant:ident => $serialization:expr,)+
    }) => {
        #[$docs]
        #[derive(Clone, Copy, Debug, Eq, Hash, PartialEq)]
        pub enum $type {
            $($variant,
            )+
        }

        impl AsRef<str> for $type {
            fn as_ref(&self) -> &str {
                match *self {
                    $($type::$variant => $serialization,
                    )+
                }
            }
        }

        impl std::default::Default for $type {
            fn default() -> Self {
                $type::$default
            }
        }

        impl<'d> serde::de::Deserialize<'d> for $type {
            fn deserialize<D>(deserializer: D) -> Result<Self, D::Error>
            where
                D: serde::de::Deserializer<'d>,
            {
                let value: String = serde::de::Deserialize::deserialize(deserializer)?;
                std::convert::TryFrom::try_from(value.as_str())
                    .map_err(|_| D::Error::invalid_value(serde::de::Unexpected::Str(&value), &$description))
            }
        }

        impl std::fmt::Display for $type {
            fn fmt(&self, formatter: &mut std::fmt::Formatter) -> std::fmt::Result {
                formatter.write_str(self.as_ref())
            }
        }

        impl serde::ser::Serialize for $type {
            fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
            where
                S: serde::ser::Serializer,
            {
                serializer.serialize_str(self.as_ref())
            }
        }

        impl<'v> std::convert::TryFrom<&'v str> for $type {
            type Error = crate::types::error::AppError;

            fn try_from(value: &str) -> Result<Self, Self::Error> {
                match value {
                    $($serialization => Ok($type::$variant),
                    )+
                    _ => Err(crate::types::error::AppErrorKind::$error(value.to_owned()))?,
                }
            }
        }
    }
}

/// Defines a newtype `String` wrapper,
/// with implementations for
/// `AsRef<str>`, `Deserialize`, `Display` and `TryFrom`.
macro_rules! string_type {
    (#[$docs:meta] $type:ident ($validator:ident, $description:expr, $error:ident)) => {
        #[$docs]
        #[derive(Clone, Debug, Default, Eq, Hash, Serialize, PartialEq)]
        pub struct $type(pub String);

        impl AsRef<str> for $type {
            fn as_ref(&self) -> &str {
                self.0.as_str()
            }
        }

        impl<'d> serde::de::Deserialize<'d> for $type {
            fn deserialize<D>(deserializer: D) -> Result<Self, D::Error>
            where
                D: serde::de::Deserializer<'d>,
            {
                let value: String = serde::de::Deserialize::deserialize(deserializer)?;
                //let expected = $description;
                std::convert::TryFrom::try_from(value.as_str()).map_err(|_| {
                    D::Error::invalid_value(serde::de::Unexpected::Str(&value), &$description)
                })
            }
        }

        impl std::fmt::Display for $type {
            fn fmt(&self, formatter: &mut std::fmt::Formatter) -> std::fmt::Result {
                formatter.write_str(self.as_ref())
            }
        }

        impl<'v> std::convert::TryFrom<&'v str> for $type {
            type Error = crate::types::error::AppError;

            fn try_from(value: &str) -> Result<Self, Self::Error> {
                if crate::types::validate::$validator(value) {
                    Ok($type(value.to_owned()))
                } else {
                    Err(crate::types::error::AppErrorKind::$error(value.to_owned()))?
                }
            }
        }
    };
}

/// Aggregates multiple `string_type!` invocations.
macro_rules! string_types {
    ($(#[$docs:meta] $type:ident ($validator:ident, $description:expr, $error:ident),)+) => ($(
        string_type! {
            #[$docs]
            $type ($validator, $description, $error)
        }
    )+)
}
