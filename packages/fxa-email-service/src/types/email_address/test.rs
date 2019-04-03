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
    let email_address = result.unwrap();
    assert_eq!(email_address, EmailAddress(String::from("foo@example.com")));
    assert_eq!(email_address.as_ref(), "foo@example.com");
    assert_eq!(email_address.to_string(), "foo@example.com");
}

#[test]
fn parse_invalid() {
    let result = "foo@".parse::<EmailAddress>();
    assert!(result.is_err());
    assert_eq!(
        result.unwrap_err().description(),
        "invalid value: string \"foo@\", expected email address"
    );
}

#[test]
fn parse_uppercase() {
    let result = "BAR@EXAMPLE.COM".parse::<EmailAddress>();
    assert!(result.is_ok());
    assert_eq!(result.unwrap().as_ref(), "bar@example.com");
}

#[test]
fn parse_with_unicode() {
    let result = "٢fooΔ@example.com".parse::<EmailAddress>();
    assert!(result.is_ok());
    assert_eq!(result.unwrap().as_ref(), "٢fooδ@example.com");
}

#[test]
fn parse_with_whitespace() {
    let result = "  foo@example.com  ".parse::<EmailAddress>();
    assert!(result.is_ok());
    assert_eq!(result.unwrap().as_ref(), "foo@example.com");
}

#[test]
fn parse_with_display_name() {
    let result = "Foo Bar <baz@example.com>".parse::<EmailAddress>();
    assert!(result.is_ok());
    assert_eq!(result.unwrap().as_ref(), "baz@example.com");
}

#[test]
fn parse_with_display_name_and_whitespace() {
    let result = "< wibble@example.com >".parse::<EmailAddress>();
    assert!(result.is_ok());
    assert_eq!(result.unwrap().as_ref(), "wibble@example.com");
}

#[test]
fn parse_with_invalid_display_name() {
    let result = "Foo Bar >baz@example.com<".parse::<EmailAddress>();
    assert!(result.is_err());
}

#[test]
fn deserialize() {
    let expected = EmailAddress(String::from("foo@example.com"));

    assert_de_tokens(&expected, &[Token::Str("foo@example.com")]);

    assert_de_tokens(&expected, &[Token::Str("FOO@EXAMPLE.COM")]);
}
