// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, you can obtain one at https://mozilla.org/MPL/2.0/.

extern crate rusoto_mock;

use self::rusoto_mock::{MockCredentialsProvider, MockRequestDispatcher};
use rusoto_core::Region;
use rusoto_ses::SesClient;

use super::{Provider, SesProvider};

#[test]
fn ses_send_handles_ok_response() {
    let body = r#"
        <SendRawEmailResponse xmlns="http://ses.amazonaws.com/doc/2010-12-01/">
            <SendRawEmailResult>
                <MessageId>woopwoop</MessageId>
            </SendRawEmailResult>
            <ResponseMetadata>
                <RequestId>random-id</RequestId>
            </ResponseMetadata>
        </SendRawEmailResponse>
    "#;
    let mock_dispatcher = MockRequestDispatcher::with_status(200).with_body(&body);
    let mock_ses = SesProvider {
        client: Box::new(SesClient::new(
            mock_dispatcher,
            MockCredentialsProvider,
            Region::SaEast1,
        )),
        sender: "Foo Bar <a@a.com>".to_string(),
    };
    match mock_ses.send("b@b.com", &[], None, "subject", "body", None) {
        Ok(response) => assert_eq!("woopwoop", response),
        Err(error) => assert!(false, format!("{}", error)),
    }
}

#[test]
fn ses_send_handles_unicode_characters() {
    let body = r#"
        <SendRawEmailResponse xmlns="http://ses.amazonaws.com/doc/2010-12-01/">
            <SendRawEmailResult>
                <MessageId>woopwoop</MessageId>
            </SendRawEmailResult>
            <ResponseMetadata>
                <RequestId>random-id</RequestId>
            </ResponseMetadata>
        </SendRawEmailResponse>
    "#;
    let mock_dispatcher = MockRequestDispatcher::with_status(200).with_body(&body);
    let mock_ses = SesProvider {
        client: Box::new(SesClient::new(
            mock_dispatcher,
            MockCredentialsProvider,
            Region::SaEast1,
        )),
        sender: "Foo Bar <٢fooΔ@a.com>".to_string(),
    };
    match mock_ses.send(
        "시험@b.com",
        &[],
        None,
        "🦀 시험 🦀",
        "🦀 시험 🦀",
        None,
    ) {
        Ok(response) => assert_eq!("woopwoop", response),
        Err(error) => assert!(false, format!("{}", error)),
    }
}

#[test]
fn ses_send_handles_error_response() {
    let body = "FREAKOUT";
    let mock_dispatcher = MockRequestDispatcher::with_status(500).with_body(&body);
    let mock_ses = SesProvider {
        client: Box::new(SesClient::new(
            mock_dispatcher,
            MockCredentialsProvider,
            Region::SaEast1,
        )),
        sender: "Foo Bar <a@a.com>".to_string(),
    };
    match mock_ses.send("b@b.com", &[], None, "subject", "body", None) {
        Ok(_) => assert!(false, "Request should have failed."),
        Err(error) => {
            let error = error.json();
            assert_eq!("500", &error["code"]);
            assert_eq!("104", &error["errno"]);
            assert_eq!("Internal Server Error", &error["error"]);
            assert_eq!("Unknown(\"FREAKOUT\")", &error["message"]);
            assert_eq!("SES", &error["name"]);
        }
    }
}
