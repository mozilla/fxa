// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, you can obtain one at https://mozilla.org/MPL/2.0/.

use serde::ser;

#[cfg(test)]
mod test;

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
