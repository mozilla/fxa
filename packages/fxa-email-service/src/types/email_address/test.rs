// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, you can obtain one at https://mozilla.org/MPL/2.0/.

use std::error::Error;

use serde_test::{assert_de_tokens, Token};

use super::*;

#[test]
fn parse() {
    let result = "foo@example.com".parse::<EmailAddress>();
    assert!(result.is_ok());
    match result {
        Ok(email_address) => {
            assert_eq!(email_address, EmailAddress(String::from("foo@example.com")));
            assert_eq!(email_address.as_ref(), "foo@example.com");
            assert_eq!(email_address.to_string(), "foo@example.com");
        }
        _ => {}
    }

    let result = "foo@".parse::<EmailAddress>();
    assert!(result.is_err());
    match result {
        Err(error) => {
            assert_eq!(
                error.description(),
                "invalid value: string \"foo@\", expected email address"
            );
        }
        _ => {}
    }

    let result = "BAR@EXAMPLE.COM".parse::<EmailAddress>();
    assert!(result.is_ok());
    match result {
        Ok(email_address) => {
            assert_eq!(email_address.as_ref(), "bar@example.com");
        }
        _ => {}
    }
}

#[test]
fn deserialize() {
    let expected = EmailAddress(String::from("foo@example.com"));

    assert_de_tokens(&expected, &[Token::Str("foo@example.com")]);

    assert_de_tokens(&expected, &[Token::Str("FOO@EXAMPLE.COM")]);
}
