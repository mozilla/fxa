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
        client: Box::new(SesClient::new_with(
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
        client: Box::new(SesClient::new_with(
            mock_dispatcher,
            MockCredentialsProvider,
            Region::SaEast1,
        )),
        sender: "Foo Bar <٢fooΔ@a.com>".to_string(),
    };
    match mock_ses.send("시험@b.com", &[], None, "🦀 시험 🦀", "🦀 시험 🦀", None) {
        Ok(response) => assert_eq!("woopwoop", response),
        Err(error) => assert!(false, format!("{}", error)),
    }
}

#[test]
fn ses_send_handles_error_response() {
    let body = "FREAKOUT";
    let mock_dispatcher = MockRequestDispatcher::with_status(500).with_body(&body);
    let mock_ses = SesProvider {
        client: Box::new(SesClient::new_with(
            mock_dispatcher,
            MockCredentialsProvider,
            Region::SaEast1,
        )),
        sender: "Foo Bar <a@a.com>".to_string(),
    };
    let result = mock_ses.send("b@b.com", &[], None, "subject", "body", None);
    assert!(result.is_err());
    let error = result.unwrap_err();
    assert_eq!(error.code(), 500);
    assert_eq!(error.errno().unwrap(), 100);
    assert_eq!(error.error(), "Internal Server Error");
    assert_eq!(error.to_string(), "FREAKOUT");
}

#[test]
fn ses_send_handles_invalid_domain_response() {
    let body = r#"
        <ErrorResponse xmlns="http://ses.amazonaws.com/doc/2010-12-01/">
          <Error>
            <Type>Sender</Type>
            <Code>InvalidParameterValue</Code>
            <Message>Invalid domain name: gmail.com.com</Message>
          </Error>
          <RequestId>f972bc68-f90c-11e8-90d8-9f9fb80f3486</RequestId>
        </ErrorResponse>
    "#;
    let mock_dispatcher = MockRequestDispatcher::with_status(500).with_body(&body);
    let mock_ses = SesProvider {
        client: Box::new(SesClient::new_with(
            mock_dispatcher,
            MockCredentialsProvider,
            Region::SaEast1,
        )),
        sender: "Wibble <blee@example.com>".to_string(),
    };
    let result = mock_ses.send("blee@gmail.com.com", &[], None, "subject", "body", None);
    assert!(result.is_err());
    let error = result.unwrap_err();
    assert_eq!(error.code(), 400);
    assert_eq!(error.errno().unwrap(), 102);
    assert_eq!(error.error(), "Bad Request");
    assert_eq!(
        error.to_string(),
        "Invalid payload: Invalid domain name: gmail.com.com"
    );
}
