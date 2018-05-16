// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, you can obtain one at https://mozilla.org/MPL/2.0/.

use validate;

#[test]
fn aws_region()
{
  assert!(validate::aws_region("us-east-1"));
  assert!(validate::aws_region("us-east-2"));
  assert!(validate::aws_region("us-west-1"));
  assert!(validate::aws_region("eu-west-1"));
}

#[test]
fn invalid_aws_region()
{
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
fn aws_access()
{
  assert!(validate::aws_access("A0"));
  assert!(validate::aws_access("Z9"));
  assert!(validate::aws_access("ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"));
}

#[test]
fn invalid_aws_access()
{
  assert_eq!(validate::aws_access("a0"), false);
  assert_eq!(validate::aws_access("z9"), false);
  assert_eq!(validate::aws_access("A0 "), false);
  assert_eq!(validate::aws_access(" Z9"), false);
  assert_eq!(validate::aws_access("A+"), false);
  assert_eq!(validate::aws_access("Z/"), false);
  assert_eq!(validate::aws_access("A="), false);
}

#[test]
fn aws_secret()
{
  assert!(validate::aws_secret("09"));
  assert!(validate::aws_secret("AZ"));
  assert!(validate::aws_secret("az"));
  assert!(validate::aws_secret("09AZaz+/=="));
}

#[test]
fn invalid_aws_secret()
{
  assert_eq!(validate::aws_secret("AZ "), false);
  assert_eq!(validate::aws_secret(" az"), false);
}

#[test]
fn base_uri()
{
  assert!(validate::base_uri("http://localhost/"));
  assert!(validate::base_uri("http://localhost:8080/"));
  assert!(validate::base_uri("http://127.0.0.1/"));
  assert!(validate::base_uri("https://localhost/"));
  assert!(validate::base_uri("http://localhost/foo/"));
}

#[test]
fn invalid_base_uri()
{
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
fn host()
{
  assert!(validate::host("foo"));
  assert!(validate::host("foo.bar"));
  assert!(validate::host("127.0.0.1"));
}

#[test]
fn invalid_host()
{
  assert_eq!(validate::host("foo/bar"), false);
  assert_eq!(validate::host("foo:bar"), false);
  assert_eq!(validate::host("foo bar"), false);
  assert_eq!(validate::host("foo "), false);
  assert_eq!(validate::host(" foo"), false);
  assert_eq!(validate::host("127.0.0.1:25"), false);
}

#[test]
fn provider()
{
  assert!(validate::provider("mock"));
  assert!(validate::provider("ses"));
  assert!(validate::provider("smtp"));
}

#[test]
fn invalid_provider()
{
  assert_eq!(validate::provider("sses"), false);
  assert_eq!(validate::provider("smtps"), false);
  assert_eq!(validate::provider("ses "), false);
  assert_eq!(validate::provider(" smtp"), false);
}

#[test]
fn sender()
{
  assert!(validate::sender("foo <bar@example.com>"));
  assert!(validate::sender("Firefox Accounts <accounts@firefox.com>"));
}

#[test]
fn invalid_sender()
{
  assert_eq!(validate::sender("foo@example.com"), false);
  assert_eq!(validate::sender("<foo@example.com>"), false);
  assert_eq!(validate::sender(" <foo@example.com>"), false);
  assert_eq!(validate::sender("foo <bar@example.com> "), false);
  assert_eq!(validate::sender("foo <bar@example.com> baz"), false);
}
