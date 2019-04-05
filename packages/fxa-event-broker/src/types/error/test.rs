// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, you can obtain one at https://mozilla.org/MPL/2.0/.

use super::*;

#[test]
fn not_implemented() {
    let error: AppError = AppErrorKind::NotImplemented("wibble".to_owned()).into();
    assert_eq!(error.errno().unwrap(), 100);
    assert_eq!(error.to_string(), "Not implemented: wibble");
}

#[test]
fn queue_error() {
    let error: AppError = AppErrorKind::QueueError("wibble".to_owned()).into();
    assert_eq!(error.errno().unwrap(), 101);
    assert_eq!(error.to_string(), "wibble");
}

#[test]
fn invalid_event() {
    let error: AppError = AppErrorKind::InvalidEvent("wibble".to_owned()).into();
    assert_eq!(error.errno().unwrap(), 102);
    assert_eq!(error.to_string(), "Invalid event: wibble");
}

#[test]
fn invalid_env() {
    let error: AppError = AppErrorKind::InvalidEnv("wibble".to_owned()).into();
    assert_eq!(error.errno().unwrap(), 103);
    assert_eq!(error.to_string(), "Invalid environment: wibble");
}
