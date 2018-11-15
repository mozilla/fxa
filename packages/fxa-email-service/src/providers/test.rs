// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, you can obtain one at https://mozilla.org/MPL/2.0/.

use std::collections::HashMap;

use super::*;

#[test]
fn build_mime_without_optional_data() {
    let message = build_multipart_mime(
        "Wibble Blee <a@a.com>",
        "b@b.com",
        &[],
        None,
        "subject",
        "body",
        None,
    )
    .unwrap();
    let message: Vec<String> = format!("{}", message)
        .split("\r\n")
        .map(|s| s.to_owned())
        .collect();
    assert_eq!("Sender: Wibble Blee <a@a.com>", &message[0]);
    assert_eq!("From: Wibble Blee <a@a.com>", &message[1]);
    assert_eq!("To: b@b.com", &message[2]);
    assert_eq!("Subject: subject", &message[3]);
    assert_eq!("MIME-Version: 1.0", &message[4]);
    assert_eq!("Content-Transfer-Encoding: quoted-printable", &message[11]);
    assert_eq!("Content-Type: text/plain; charset=utf-8", &message[12]);
    assert_eq!("body", &message[14]);
}

#[test]
fn build_mime_with_cc_headers() {
    let mut headers = HashMap::new();
    headers.insert("Content-Language".to_owned(), "en-gb".to_owned());
    headers.insert("x-verify-code".to_owned(), "wibble".to_owned());
    let message = build_multipart_mime(
        "a@a.com",
        "b@b.com",
        &["c@c.com", "d@d.com"],
        Some(&headers),
        "subject",
        "body",
        None,
    )
    .unwrap();
    let message: Vec<String> = format!("{}", message)
        .split("\r\n")
        .map(|s| s.to_owned())
        .collect();
    assert_eq!("Sender: a@a.com", &message[0]);
    assert_eq!("From: a@a.com", &message[1]);
    assert_eq!("To: b@b.com", &message[2]);
    assert_eq!("Subject: subject", &message[3]);
    assert_eq!("MIME-Version: 1.0", &message[4]);
    assert_eq!("Cc: c@c.com, d@d.com", &message[5]);
    if message[6] == "Content-Language: en-gb" {
        assert_eq!("X-Verify-Code: wibble", &message[7]);
    } else {
        assert_eq!("X-Verify-Code: wibble", &message[6]);
        assert_eq!("Content-Language: en-gb", &message[7]);
    }
    assert_eq!("Content-Transfer-Encoding: quoted-printable", &message[14]);
    assert_eq!("Content-Type: text/plain; charset=utf-8", &message[15]);
    assert_eq!("body", &message[17]);
}

#[test]
fn build_mime_with_custom_headers() {
    let mut custom_headers = HashMap::new();
    custom_headers.insert("x-foo".to_string(), "bar".to_string());
    custom_headers.insert("x-device-id".to_string(), "baz".to_string());
    let message = build_multipart_mime(
        "a@a.com",
        "b@b.com",
        &[],
        Some(&custom_headers),
        "subject",
        "body",
        None,
    )
    .unwrap();
    let message: Vec<String> = format!("{}", message)
        .split("\r\n")
        .map(|s| s.to_owned())
        .collect();
    assert_eq!("Sender: a@a.com", &message[0]);
    assert_eq!("From: a@a.com", &message[1]);
    assert_eq!("To: b@b.com", &message[2]);
    assert_eq!("Subject: subject", &message[3]);
    assert_eq!("MIME-Version: 1.0", &message[4]);
    assert_eq!("X-Device-Id: baz", &message[5]);
    assert_eq!("Content-Transfer-Encoding: quoted-printable", &message[12]);
    assert_eq!("Content-Type: text/plain; charset=utf-8", &message[13]);
    assert_eq!("body", &message[15]);
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
    )
    .unwrap();
    let message: Vec<String> = format!("{}", message)
        .split("\r\n")
        .map(|s| s.to_owned())
        .collect();
    assert_eq!("Sender: a@a.com", &message[0]);
    assert_eq!("From: a@a.com", &message[1]);
    assert_eq!("To: b@b.com", &message[2]);
    assert_eq!("Subject: subject", &message[3]);
    assert_eq!("MIME-Version: 1.0", &message[4]);
    assert_eq!("Content-Transfer-Encoding: quoted-printable", &message[11]);
    assert_eq!("Content-Type: text/plain; charset=utf-8", &message[12]);
    assert_eq!("body", &message[14]);
    assert_eq!("Content-Transfer-Encoding: base64", &message[19]);
    assert_eq!("Content-Type: text/html; charset=utf-8", &message[20]);
    assert_eq!("PHA+Ym9keTwvcD4=", &message[22]);
}

#[test]
fn constructor() {
    let mut settings = Settings::new().expect("config error");
    settings.provider.forcedefault = false;
    let providers = Providers::new(&settings);
    assert!(providers.providers.len() > 1);
    assert_eq!(providers.force_default_provider, false);

    settings = Settings::new().expect("config error");
    settings.provider.forcedefault = true;
    let providers = Providers::new(&settings);
    assert_eq!(providers.providers.len(), 1);
    assert_eq!(providers.force_default_provider, true);
}

#[test]
fn send() {
    let mut settings = Settings::new().expect("config error");
    settings.provider.forcedefault = true;
    settings.provider.default = ProviderType::Mock;
    let providers = Providers::new(&settings);
    let result = providers.send("foo", &vec![], None, "bar", "baz", None, Some("ses"));
    assert!(result.is_ok(), "Providers::send should not have failed");
    if let Ok(ref message_id) = result {
        assert_eq!(message_id, "mock:deadbeef");
    }

    settings.provider.forcedefault = false;
    settings.provider.default = ProviderType::Ses;
    let providers = Providers::new(&settings);
    let result = providers.send("foo", &vec![], None, "bar", "baz", None, Some("mock"));
    assert!(result.is_ok(), "Providers::send should not have failed");
    if let Ok(ref message_id) = result {
        assert_eq!(message_id, "mock:deadbeef");
    }
}
