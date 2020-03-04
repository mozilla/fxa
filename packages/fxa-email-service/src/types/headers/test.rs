// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, you can obtain one at https://mozilla.org/MPL/2.0/.

use super::*;

#[test]
fn content_language() {
    let header = ContentLanguage::new("en-gb".to_owned());
    assert_eq!(header.to_string(), "en-gb");
    assert_eq!(ContentLanguage::header_name(), "Content-Language");
}

#[test]
fn device_id() {
    let header = DeviceId::new("wibble".to_owned());
    assert_eq!(header.to_string(), "wibble");
    assert_eq!(DeviceId::header_name(), "X-Device-Id");

    let header = DeviceId::new("blee".to_owned());
    assert_eq!(header.to_string(), "blee");

    let header: DeviceId = FromStr::from_str("foo").unwrap();
    assert_eq!(header.to_string(), "foo");
}

#[test]
fn email_sender() {
    let header = EmailSender::new("bar".to_owned());
    assert_eq!(header.to_string(), "bar");
    assert_eq!(EmailSender::header_name(), "X-Email-Sender");
}

#[test]
fn email_service() {
    let header = EmailService::new("baz".to_owned());
    assert_eq!(header.to_string(), "baz");
    assert_eq!(EmailService::header_name(), "X-Email-Service");
}

#[test]
fn flow_begin_time() {
    let header = FlowBeginTime::new("qux".to_owned());
    assert_eq!(header.to_string(), "qux");
    assert_eq!(FlowBeginTime::header_name(), "X-Flow-Begin-Time");
}

#[test]
fn flow_id() {
    let header = FlowId::new("wibble".to_owned());
    assert_eq!(header.to_string(), "wibble");
    assert_eq!(FlowId::header_name(), "X-Flow-Id");
}

#[test]
fn link() {
    let header = Link::new("blee".to_owned());
    assert_eq!(header.to_string(), "blee");
    assert_eq!(Link::header_name(), "X-Link");
}

#[test]
fn recovery_code() {
    let header = RecoveryCode::new("foo".to_owned());
    assert_eq!(header.to_string(), "foo");
    assert_eq!(RecoveryCode::header_name(), "X-Recovery-Code");
}

#[test]
fn report_signin_link() {
    let header = ReportSigninLink::new("bar".to_owned());
    assert_eq!(header.to_string(), "bar");
    assert_eq!(ReportSigninLink::header_name(), "X-Report-Signin-Link");
}

#[test]
fn service_id() {
    let header = ServiceId::new("baz".to_owned());
    assert_eq!(header.to_string(), "baz");
    assert_eq!(ServiceId::header_name(), "X-Service-Id");
}

#[test]
fn ses_configuration_set() {
    let header = SesConfigurationSet::new("qux".to_owned());
    assert_eq!(header.to_string(), "qux");
    assert_eq!(
        SesConfigurationSet::header_name(),
        "X-SES-CONFIGURATION-SET"
    );
}

#[test]
fn ses_message_tags() {
    let header = SesMessageTags::new("wibble".to_owned());
    assert_eq!(header.to_string(), "wibble");
    assert_eq!(SesMessageTags::header_name(), "X-SES-MESSAGE-TAGS");
}

#[test]
fn signin_verify_code() {
    let header = SigninVerifyCode::new("blee".to_owned());
    assert_eq!(header.to_string(), "blee");
    assert_eq!(SigninVerifyCode::header_name(), "X-Signin-Verify-Code");
}

#[test]
fn template_name() {
    let header = TemplateName::new("foo".to_owned());
    assert_eq!(header.to_string(), "foo");
    assert_eq!(TemplateName::header_name(), "X-Template-Name");
}

#[test]
fn template_version() {
    let header = TemplateVersion::new("bar".to_owned());
    assert_eq!(header.to_string(), "bar");
    assert_eq!(TemplateVersion::header_name(), "X-Template-Version");
}

#[test]
fn uid() {
    let header = Uid::new("baz".to_owned());
    assert_eq!(header.to_string(), "baz");
    assert_eq!(Uid::header_name(), "X-Uid");
}

#[test]
fn unblock_code() {
    let header = UnblockCode::new("qux".to_owned());
    assert_eq!(header.to_string(), "qux");
    assert_eq!(UnblockCode::header_name(), "X-Unblock-Code");
}

#[test]
fn verify_code() {
    let header = VerifyCode::new("wibble".to_owned());
    assert_eq!(header.to_string(), "wibble");
    assert_eq!(VerifyCode::header_name(), "X-Verify-Code");
}

#[test]
fn any_header_length() {
    // No header value should be longer than 998 characters, minus the length of the header name
    let header = Link::new(std::iter::repeat("X").take(999).collect::<String>().to_owned());
    assert!(header.to_string().chars().count() <= HEADER_MAX_LENGTH - Link::header_name().len());

    let header = DeviceId::new(std::iter::repeat("X").take(999).collect::<String>().to_owned());
    assert!(header.to_string().chars().count() <= HEADER_MAX_LENGTH - DeviceId::header_name().len());

    let header = ReportSigninLink::new(std::iter::repeat("X").take(999).collect::<String>().to_owned());
    assert!(header.to_string().chars().count() <= HEADER_MAX_LENGTH - ReportSigninLink::header_name().len());
}
