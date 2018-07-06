// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// // file, you can obtain one at https://mozilla.org/MPL/2.0/.

use serde_test::{assert_de_tokens, Token};

use super::*;

#[derive(Serialize, Deserialize, PartialEq, Debug)]
struct TestEmailStruct {
    email: EmailAddress,
}

#[test]
fn always_lowercase_email() {
    let expected = TestEmailStruct {
        email: EmailAddress(String::from("foo@example.com")),
    };
    assert_de_tokens(
        &expected,
        &[
            Token::Struct {
                name: "TestEmailStruct",
                len: 1,
            },
            Token::Str("email"),
            Token::Str("foo@example.com"),
            Token::StructEnd,
        ],
    );
    assert_de_tokens(
        &expected,
        &[
            Token::Struct {
                name: "TestEmailStruct",
                len: 1,
            },
            Token::Str("email"),
            Token::Str("FOO@EXAMPLE.COM"),
            Token::StructEnd,
        ],
    );
}
