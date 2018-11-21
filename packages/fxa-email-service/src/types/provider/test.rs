// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, you can obtain one at https://mozilla.org/MPL/2.0/.

use std::convert::TryFrom;

use super::*;

#[test]
fn try_from() {
    let result: Result<Provider, AppError> = TryFrom::try_from("mock");
    assert!(result.is_ok());
    assert_eq!(result.unwrap(), Provider::Mock);

    let result: Result<Provider, AppError> = TryFrom::try_from("sendgrid");
    assert!(result.is_ok());
    assert_eq!(result.unwrap(), Provider::Sendgrid);

    let result: Result<Provider, AppError> = TryFrom::try_from("ses");
    assert!(result.is_ok());
    assert_eq!(result.unwrap(), Provider::Ses);

    let result: Result<Provider, AppError> = TryFrom::try_from("smtp");
    assert!(result.is_ok());
    assert_eq!(result.unwrap(), Provider::Smtp);

    let result: Result<Provider, AppError> = TryFrom::try_from("socketlabs");
    assert!(result.is_ok());
    assert_eq!(result.unwrap(), Provider::SocketLabs);

    let result: Result<Provider, AppError> = TryFrom::try_from("wibble");
    assert!(result.is_err());
    assert_eq!(result.unwrap_err().to_string(), "Invalid payload: wibble");
}

#[test]
fn as_ref() {
    assert_eq!(Provider::Mock.as_ref(), "mock");
    assert_eq!(Provider::Sendgrid.as_ref(), "sendgrid");
    assert_eq!(Provider::Ses.as_ref(), "ses");
    assert_eq!(Provider::Smtp.as_ref(), "smtp");
    assert_eq!(Provider::SocketLabs.as_ref(), "socketlabs");
}
