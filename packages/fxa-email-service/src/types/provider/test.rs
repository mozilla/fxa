// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, you can obtain one at https://mozilla.org/MPL/2.0/.

use super::*;

#[test]
fn try_from() {
    match Provider::try_from("mock") {
        Ok(provider) => assert_eq!(provider, Provider::Mock),
        Err(error) => assert!(false, error.to_string()),
    }
    match Provider::try_from("sendgrid") {
        Ok(provider) => assert_eq!(provider, Provider::Sendgrid),
        Err(error) => assert!(false, error.to_string()),
    }
    match Provider::try_from("ses") {
        Ok(provider) => assert_eq!(provider, Provider::Ses),
        Err(error) => assert!(false, error.to_string()),
    }
    match Provider::try_from("smtp") {
        Ok(provider) => assert_eq!(provider, Provider::Smtp),
        Err(error) => assert!(false, error.to_string()),
    }
    match Provider::try_from("socketlabs") {
        Ok(provider) => assert_eq!(provider, Provider::SocketLabs),
        Err(error) => assert!(false, error.to_string()),
    }
    match Provider::try_from("wibble") {
        Ok(_) => assert!(false, "Provider::try_from should have failed"),
        Err(error) => {
            assert_eq!(error.to_string(), "Invalid payload: provider `wibble`");
        }
    }
}

#[test]
fn as_ref() {
    assert_eq!(Provider::Mock.as_ref(), "mock");
    assert_eq!(Provider::Sendgrid.as_ref(), "sendgrid");
    assert_eq!(Provider::Ses.as_ref(), "ses");
    assert_eq!(Provider::Smtp.as_ref(), "smtp");
    assert_eq!(Provider::SocketLabs.as_ref(), "socketlabs");
}
