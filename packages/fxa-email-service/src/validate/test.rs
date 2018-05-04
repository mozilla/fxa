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
