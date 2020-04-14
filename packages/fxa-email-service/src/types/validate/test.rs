// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, you can obtain one at https://mozilla.org/MPL/2.0/.

use rand::{distributions::Alphanumeric, thread_rng, Rng};

use crate::types::validate;

fn random_alphanum_string(len: usize) -> String {
    thread_rng().sample_iter(&Alphanumeric).take(len).collect()
}

#[test]
fn aws_region() {
    assert!(validate::aws_region("us-east-1"));
    assert!(validate::aws_region("us-east-2"));
    assert!(validate::aws_region("us-west-1"));
    assert!(validate::aws_region("eu-west-1"));
}

#[test]
fn invalid_aws_region() {
    assert_eq!(validate::aws_region("us-east-1a"), false);
    assert_eq!(validate::aws_region("us-east-1 "), false);
    assert_eq!(validate::aws_region(" us-east-1"), false);
    assert_eq!(validate::aws_region("xus-east-1"), false);
    assert_eq!(validate::aws_region("us-east-10"), false);
    assert_eq!(validate::aws_region("us-east-0"), false);
    assert_eq!(validate::aws_region("us-east-3"), false);
    assert_eq!(validate::aws_region("us-north-1"), false);
    assert_eq!(validate::aws_region("eu-east-1"), false);
}

#[test]
fn aws_access() {
    assert!(validate::aws_access("A0"));
    assert!(validate::aws_access("Z9"));
    assert!(validate::aws_access("ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"));
}

#[test]
fn invalid_aws_access() {
    assert_eq!(validate::aws_access("a0"), false);
    assert_eq!(validate::aws_access("z9"), false);
    assert_eq!(validate::aws_access("A0 "), false);
    assert_eq!(validate::aws_access(" Z9"), false);
    assert_eq!(validate::aws_access("A+"), false);
    assert_eq!(validate::aws_access("Z/"), false);
    assert_eq!(validate::aws_access("A="), false);
}

#[test]
fn aws_secret() {
    assert!(validate::aws_secret("09"));
    assert!(validate::aws_secret("AZ"));
    assert!(validate::aws_secret("az"));
    assert!(validate::aws_secret("09AZaz+/=="));
}

#[test]
fn invalid_aws_secret() {
    assert_eq!(validate::aws_secret("AZ "), false);
    assert_eq!(validate::aws_secret(" az"), false);
}

#[test]
fn base_uri() {
    assert!(validate::base_uri("http://localhost/"));
    assert!(validate::base_uri("http://localhost:8080/"));
    assert!(validate::base_uri("http://localhost/"));
    assert!(validate::base_uri("https://localhost/"));
    assert!(validate::base_uri("http://localhost/foo/"));
}

#[test]
fn invalid_base_uri() {
    assert_eq!(validate::base_uri("http://localhost"), false);
    assert_eq!(validate::base_uri("http://localhost/foo"), false);
    assert_eq!(validate::base_uri("http://localhost/foo/?bar=baz"), false);
    assert_eq!(validate::base_uri("http://localhost/foo/#bar"), false);
    assert_eq!(validate::base_uri("localhost/foo/"), false);
    assert_eq!(validate::base_uri("//localhost/foo/"), false);
    assert_eq!(validate::base_uri("ftp://localhost/"), false);
    assert_eq!(validate::base_uri("file:///foo/"), false);
    assert_eq!(
        validate::base_uri("http://localhost/http://localhost/"),
        false
    );
}

#[test]
fn email_address() {
    assert!(validate::email_address("٢fooΔ@example.com"));
    assert!(validate::email_address("foo@example.com"));
    assert!(validate::email_address("foo.bar@example.com"));
    assert!(validate::email_address("foo+bar@example.com"));
    assert!(validate::email_address("foo+this#is$valid!@example.com"));
    assert!(validate::email_address(
        "foo+email%validation&is|a~pain!@example.com"
    ));
    assert!(validate::email_address("accounts@firefox.com"));
    assert!(validate::email_address("verification@latest.dev.lcip.org"));
    assert!(validate::email_address(&format!(
        "{}@example.com",
        random_alphanum_string(64)
    )));
    assert!(validate::email_address(&format!(
        "a@{}.b",
        random_alphanum_string(249)
    )));
    assert!(validate::email_address("a'b@example.com"));
}

#[test]
fn invalid_email_address() {
    assert!(!validate::email_address("<foo@example.com>"));
    assert!(!validate::email_address(" foo@example.com"));
    assert!(!validate::email_address("@example.com "));
    assert!(!validate::email_address("foo@"));
    assert!(!validate::email_address("foo@example"));
    assert!(!validate::email_address(&format!(
        "{}@example.com",
        random_alphanum_string(65)
    )));
    assert!(!validate::email_address(&format!(
        "a@{}.b",
        random_alphanum_string(250)
    )));
    assert!(!validate::email_address("a’b@example.com"));
}

#[test]
fn host() {
    assert!(validate::host("foo"));
    assert!(validate::host("foo.bar"));
    assert!(validate::host("localhost"));
}

#[test]
fn invalid_host() {
    assert_eq!(validate::host("foo/bar"), false);
    assert_eq!(validate::host("foo:bar"), false);
    assert_eq!(validate::host("foo bar"), false);
    assert_eq!(validate::host("foo "), false);
    assert_eq!(validate::host(" foo"), false);
    assert_eq!(validate::host("localhost:25"), false);
}

#[test]
fn sender_name() {
    assert!(validate::sender_name("foo"));
    assert!(validate::sender_name("Firefox Accounts"));
}

#[test]
fn invalid_sender_name() {
    assert!(!validate::sender_name("foo@example.com"));
    assert!(!validate::sender_name(" foo"));
    assert!(!validate::sender_name("foo "));
}

#[test]
fn sendgrid_api_key() {
    assert!(validate::sendgrid_api_key(
        "1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz._-"
    ));
}

#[test]
fn invalid_sendgrid_api_key() {
    assert!(!validate::sendgrid_api_key(
        "1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz._- "
    ));
    assert!(!validate::sendgrid_api_key(
        " 1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz._-"
    ));
}

#[test]
fn sentry_dsn() {
    assert!(validate::sentry_dsn(
        "https://lakjhsdf.akdjfasdfa.kajhsdf@kajshfkagshdfa/12341234"
    ));
}

#[test]
fn invalid_sentry_dsn() {
    assert!(!validate::sentry_dsn(
        "lakjhsdf.akdjfasdfa.kajhsdf@kajshfkagshdfa/12341234"
    ));
    assert!(!validate::sentry_dsn(
        " https://lakjhsdf.akdjfasdfa.kajhsdf@kajshfkagshdfa/12341234"
    ));
    assert!(!validate::sentry_dsn(
        "https://lakjhsdf.akdjfasdfa.kajhsdf@kajshfkagshdfa/12341234 "
    ));
    assert!(!validate::sentry_dsn(
        "https://lakjhsdf.akdjfasdfa.kajhsdfkajshfkagshdfa/12341234"
    ));
    assert!(!validate::sentry_dsn(
        "https://lakjhsdf.akdjfasdfa.kajhsdfkajshfkagshdfa/12341asdfa234"
    ));
}

#[test]
fn sqs_url() {
    assert!(validate::sqs_url(
        "https://sqs.us-east-1.amazonaws.com/123456789012/MyQueue"
    ));
    assert!(validate::sqs_url(
        "https://sqs.us-west-2.amazonaws.com/42/fxa-email-bounce-prod"
    ));
}

#[test]
fn invalid_sqs_url() {
    assert!(!validate::sqs_url(
        "http://sqs.us-east-1.amazonaws.com/123456789012/MyQueue"
    ));
    assert!(!validate::sqs_url(
        " https://sqs.us-east-1.amazonaws.com/123456789012/MyQueue"
    ));
    assert!(!validate::sqs_url(
        "https://sqs.us-east-1.amazonaws.com/123456789012/MyQueue "
    ));
    assert!(!validate::sqs_url(
        "https://sqs.us-east-1.wibble.com/123456789012/MyQueue"
    ));
}
