// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, you can obtain one at https://mozilla.org/MPL/2.0/.

//! Serialization functions
//! for use with serde's `serialize_with` attribute.

use serde::ser;

#[cfg(test)]
mod test;

/// Serialize an `Option`
/// containing sensitive data
/// to either of the strings
/// `"[hidden]"` or `"[not set]"`.
pub fn hidden_or_not_set<T, S>(ref item: &Option<T>, serializer: S) -> Result<S::Ok, S::Error>
where
    S: ser::Serializer,
{
    if let Some(_) = item {
        serializer.serialize_str("[hidden]")
    } else {
        serializer.serialize_str("[not set]")
    }
}

/// Serialize any sensitive data
/// to `"[hidden]"`.
pub fn hidden<T, S>(ref _item: &T, serializer: S) -> Result<S::Ok, S::Error>
where
    S: ser::Serializer,
{
    serializer.serialize_str("[hidden]")
}
