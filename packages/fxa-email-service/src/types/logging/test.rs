// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, you can obtain one at https://mozilla.org/MPL/2.0/.

use std::convert::TryFrom;

use super::*;

#[test]
fn level_try_from() {
    let result: Result<LogLevel, AppError> = TryFrom::try_from("normal");
    assert!(result.is_ok());
    assert_eq!(result.unwrap(), LogLevel::Normal);

    let result: Result<LogLevel, AppError> = TryFrom::try_from("debug");
    assert!(result.is_ok());
    assert_eq!(result.unwrap(), LogLevel::Debug);

    let result: Result<LogLevel, AppError> = TryFrom::try_from("critical");
    assert!(result.is_ok());
    assert_eq!(result.unwrap(), LogLevel::Critical);

    let result: Result<LogLevel, AppError> = TryFrom::try_from("off");
    assert!(result.is_ok());
    assert_eq!(result.unwrap(), LogLevel::Off);

    let result: Result<LogLevel, AppError> = TryFrom::try_from("wibble");
    assert!(result.is_err());
    assert_eq!(result.unwrap_err().to_string(), "Invalid log level: wibble");
}

#[test]
fn level_as_ref() {
    assert_eq!(LogLevel::Normal.as_ref(), "normal");
    assert_eq!(LogLevel::Debug.as_ref(), "debug");
    assert_eq!(LogLevel::Critical.as_ref(), "critical");
    assert_eq!(LogLevel::Off.as_ref(), "off");
}

#[test]
fn format_try_from() {
    let result: Result<LogFormat, AppError> = TryFrom::try_from("mozlog");
    assert!(result.is_ok());
    assert_eq!(result.unwrap(), LogFormat::Mozlog);

    let result: Result<LogFormat, AppError> = TryFrom::try_from("pretty");
    assert!(result.is_ok());
    assert_eq!(result.unwrap(), LogFormat::Pretty);

    let result: Result<LogFormat, AppError> = TryFrom::try_from("wibble");
    assert!(result.is_err());
    assert_eq!(
        result.unwrap_err().to_string(),
        "Invalid log format: wibble"
    );
}

#[test]
fn format_as_ref() {
    assert_eq!(LogFormat::Mozlog.as_ref(), "mozlog");
    assert_eq!(LogFormat::Pretty.as_ref(), "pretty");
}
