// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, you can obtain one at https://mozilla.org/MPL/2.0/.

use crate::types::validate;

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
    assert!(validate::aws_access_key("A0"));
    assert!(validate::aws_access_key("Z9"));
    assert!(validate::aws_access_key(
        "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
    ));
}

#[test]
fn invalid_aws_access() {
    assert_eq!(validate::aws_access_key("a0"), false);
    assert_eq!(validate::aws_access_key("z9"), false);
    assert_eq!(validate::aws_access_key("A0 "), false);
    assert_eq!(validate::aws_access_key(" Z9"), false);
    assert_eq!(validate::aws_access_key("A+"), false);
    assert_eq!(validate::aws_access_key("Z/"), false);
    assert_eq!(validate::aws_access_key("A="), false);
}

#[test]
fn aws_secret() {
    assert!(validate::aws_secret_key("09"));
    assert!(validate::aws_secret_key("AZ"));
    assert!(validate::aws_secret_key("az"));
    assert!(validate::aws_secret_key("09AZaz+/=="));
}

#[test]
fn invalid_aws_secret() {
    assert_eq!(validate::aws_secret_key("AZ "), false);
    assert_eq!(validate::aws_secret_key(" az"), false);
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
