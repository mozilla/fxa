// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, you can obtain one at https://mozilla.org/MPL/2.0/.

use std::collections::HashMap;

use super::*;

#[test]
fn build_mime_without_optional_data() {
    let message =
        build_multipart_mime("a@a.com", "b@b.com", &[], None, "subject", "body", None).unwrap();
    let message: Vec<String> = format!("{}", message)
        .split("\r\n")
        .map(|s| s.to_owned())
        .collect();
    assert_eq!("From: a@a.com", &message[0]);
    assert_eq!("To: b@b.com", &message[1]);
    assert_eq!("Subject: subject", &message[2]);
    assert_eq!("MIME-Version: 1.0", &message[3]);
    assert_eq!("Content-Transfer-Encoding: quoted-printable", &message[10]);
    assert_eq!("Content-Type: text/plain; charset=utf8", &message[11]);
    assert_eq!("body", &message[13]);
}

#[test]
fn build_mime_with_cc_headers() {
    let message = build_multipart_mime(
        "a@a.com",
        "b@b.com",
        &["c@c.com", "d@d.com"],
        None,
        "subject",
        "body",
        None,
    ).unwrap();
    let message: Vec<String> = format!("{}", message)
        .split("\r\n")
        .map(|s| s.to_owned())
        .collect();
    assert_eq!("From: a@a.com", &message[0]);
    assert_eq!("To: b@b.com", &message[1]);
    assert_eq!("Subject: subject", &message[2]);
    assert_eq!("MIME-Version: 1.0", &message[3]);
    assert_eq!("Cc: c@c.com, d@d.com", &message[4]);
    assert_eq!("Content-Transfer-Encoding: quoted-printable", &message[11]);
    assert_eq!("Content-Type: text/plain; charset=utf8", &message[12]);
    assert_eq!("body", &message[14]);
}

#[test]
fn build_mime_with_custom_headers() {
    let mut custom_headers = HashMap::new();
    custom_headers.insert("x-foo".to_string(), "bar".to_string());
    let message = build_multipart_mime(
        "a@a.com",
        "b@b.com",
        &[],
        Some(&custom_headers),
        "subject",
        "body",
        None,
    ).unwrap();
    let message: Vec<String> = format!("{}", message)
        .split("\r\n")
        .map(|s| s.to_owned())
        .collect();
    assert_eq!("From: a@a.com", &message[0]);
    assert_eq!("To: b@b.com", &message[1]);
    assert_eq!("Subject: subject", &message[2]);
    assert_eq!("MIME-Version: 1.0", &message[3]);
    assert_eq!("x-foo: bar", &message[4]);
    assert_eq!("Content-Transfer-Encoding: quoted-printable", &message[11]);
    assert_eq!("Content-Type: text/plain; charset=utf8", &message[12]);
    assert_eq!("body", &message[14]);
}

#[test]
fn build_mime_with_body_html() {
    let message = build_multipart_mime(
        "a@a.com",
        "b@b.com",
        &[],
        None,
        "subject",
        "body",
        Some("<p>body</p>"),
    ).unwrap();
    let message: Vec<String> = format!("{}", message)
        .split("\r\n")
        .map(|s| s.to_owned())
        .collect();
    assert_eq!("From: a@a.com", &message[0]);
    assert_eq!("To: b@b.com", &message[1]);
    assert_eq!("Subject: subject", &message[2]);
    assert_eq!("MIME-Version: 1.0", &message[3]);
    assert_eq!("Content-Transfer-Encoding: quoted-printable", &message[10]);
    assert_eq!("Content-Type: text/plain; charset=utf8", &message[11]);
    assert_eq!("body", &message[13]);
    assert_eq!("Content-Transfer-Encoding: 8bit", &message[18]);
    assert_eq!("Content-Type: text/html; charset=utf8", &message[19]);
    assert_eq!("<p>body</p>", &message[21]);
}

#[test]
fn constructor() {
    let mut settings = Settings::new().expect("config error");
    settings.forceprovider = false;
    let providers = Providers::new(&settings);
    assert!(providers.providers.len() > 1);
    assert_eq!(providers.force_default_provider, false);

    settings = Settings::new().expect("config error");
    settings.forceprovider = true;
    let providers = Providers::new(&settings);
    assert_eq!(providers.providers.len(), 1);
    assert_eq!(providers.force_default_provider, true);
}

#[test]
fn send() {
    let mut settings = Settings::new().expect("config error");
    settings.forceprovider = true;
    settings.provider = SettingsProvider(String::from("mock"));
    let providers = Providers::new(&settings);
    let result = providers.send("foo", &vec![], None, "bar", "baz", None, Some("ses"));
    assert!(result.is_ok(), "Providers::send should not have failed");
    if let Ok(ref message_id) = result {
        assert_eq!(message_id, "mock:deadbeef");
    }

    settings.forceprovider = false;
    settings.provider = SettingsProvider(String::from("ses"));
    let providers = Providers::new(&settings);
    let result = providers.send("foo", &vec![], None, "bar", "baz", None, Some("mock"));
    assert!(result.is_ok(), "Providers::send should not have failed");
    if let Ok(ref message_id) = result {
        assert_eq!(message_id, "mock:deadbeef");
    }
}
