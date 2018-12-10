// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, you can obtain one at https://mozilla.org/MPL/2.0/.

use super::*;

#[test]
fn serialize_deserialize() {
    let regex = SerializableRegex(Regex::new("foo").unwrap());
    let serialized = serde_json::to_string(&regex).unwrap();
    assert_eq!(serialized, "\"foo\"");

    let regex: SerializableRegex = serde_json::from_str(&serialized).unwrap();
    assert_eq!(regex.0.as_str(), "foo");
}
