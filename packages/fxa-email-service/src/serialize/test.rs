// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, you can obtain one at https://mozilla.org/MPL/2.0/.

use serde_test::{assert_ser_tokens, Token};
use serialize;

#[derive(Serialize)]
struct TestStruct {
    #[serde(serialize_with = "serialize::hidden_or_not_set")]
    a: Option<String>,
}

#[test]
fn option_not_set() {
    let s = TestStruct { a: None };
    assert_ser_tokens(
        &s,
        &[
            Token::Struct {
                name: "TestStruct",
                len: 1,
            },
            Token::Str("a"),
            Token::Str("[not set]"),
            Token::StructEnd,
        ],
    );
}

#[test]
fn option_set_but_hidden() {
    let s = TestStruct {
        a: Some(String::from("sensitive data!")),
    };
    assert_ser_tokens(
        &s,
        &[
            Token::Struct {
                name: "TestStruct",
                len: 1,
            },
            Token::Str("a"),
            Token::Str("[hidden]"),
            Token::StructEnd,
        ],
    );
}
