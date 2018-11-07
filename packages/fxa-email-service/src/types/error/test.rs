// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, you can obtain one at https://mozilla.org/MPL/2.0/.

use super::*;

#[test]
fn bad_request() {
    let error: AppError = AppErrorKind::BadRequest.into();
    assert_eq!(error.code(), 400);
    assert_eq!(error.error(), "Bad Request");
    assert!(error.errno().is_none());
    assert_eq!(error.additional_fields().len(), 0);
}

#[test]
fn not_found() {
    let error: AppError = AppErrorKind::NotFound.into();
    assert_eq!(error.code(), 404);
    assert_eq!(error.error(), "Not Found");
    assert!(error.errno().is_none());
    assert_eq!(error.additional_fields().len(), 0);
}

#[test]
fn method_not_allowed() {
    let error: AppError = AppErrorKind::MethodNotAllowed.into();
    assert_eq!(error.code(), 405);
    assert_eq!(error.error(), "Method Not Allowed");
    assert!(error.errno().is_none());
    assert_eq!(error.additional_fields().len(), 0);
}

#[test]
fn unprocessable_entity() {
    let error: AppError = AppErrorKind::UnprocessableEntity.into();
    assert_eq!(error.code(), 422);
    assert_eq!(error.error(), "Unprocessable Entity");
    assert!(error.errno().is_none());
    assert_eq!(error.additional_fields().len(), 0);
}

#[test]
fn too_many_requests() {
    let error: AppError = AppErrorKind::TooManyRequests.into();
    assert_eq!(error.code(), 429);
    assert_eq!(error.error(), "Too Many Requests");
    assert!(error.errno().is_none());
    assert_eq!(error.additional_fields().len(), 0);
}

#[test]
fn internal_server_error() {
    let error: AppError = AppErrorKind::InternalServerError.into();
    assert_eq!(error.code(), 500);
    assert_eq!(error.error(), "Internal Server Error");
    assert!(error.errno().is_none());
    assert_eq!(error.additional_fields().len(), 0);
}
