// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, you can obtain one at https://mozilla.org/MPL/2.0/.

use deserialize;
use serde_test::{assert_de_tokens, Token};

#[derive(Serialize, Deserialize, PartialEq, Debug)]
struct TestEmailStruct {
    #[serde(deserialize_with = "deserialize::email_address")]
    email: String,
}

#[test]
fn always_lowercase_email() {
    let lowercase = TestEmailStruct {
        email: String::from("foo@example.com"),
    };
    assert_de_tokens(
        &lowercase,
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

    let uppercase = TestEmailStruct {
        email: String::from("foo@example.com"),
    };
    assert_de_tokens(
        &uppercase,
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
