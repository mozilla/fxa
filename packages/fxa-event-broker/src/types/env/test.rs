// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, you can obtain one at https://mozilla.org/MPL/2.0/.

use std::convert::TryFrom;

use super::*;

#[test]
fn try_from() {
    let result: Result<Env, AppError> = TryFrom::try_from("dev");
    assert!(result.is_ok());

    let result: Result<Env, AppError> = TryFrom::try_from("production");
    assert!(result.is_ok());

    let result: Result<Env, AppError> = TryFrom::try_from("test");
    assert!(result.is_ok());

    let result: Result<Env, AppError> = TryFrom::try_from("prod");
    assert!(result.is_err());
    assert_eq!(result.unwrap_err().to_string(), "Invalid environment: prod");
}

#[test]
fn as_ref() {
    assert_eq!(Env::Dev.as_ref(), "dev");
    assert_eq!(Env::Prod.as_ref(), "production");
    assert_eq!(Env::Test.as_ref(), "test");
}
