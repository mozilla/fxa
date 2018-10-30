// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, you can obtain one at https://mozilla.org/MPL/2.0/.

use super::AppErrorKind;

#[test]
fn bad_request() {
    assert_eq!(
        format!("{}", super::bad_request().unwrap_err().kind()),
        format!("{}", AppErrorKind::BadRequest)
    );
}

#[test]
fn not_found() {
    assert_eq!(
        format!("{}", super::not_found().unwrap_err().kind()),
        format!("{}", AppErrorKind::NotFound)
    );
}

#[test]
fn method_not_allowed() {
    assert_eq!(
        format!("{}", super::method_not_allowed().unwrap_err().kind()),
        format!("{}", AppErrorKind::MethodNotAllowed)
    );
}

#[test]
fn unprocessable_entity() {
    assert_eq!(
        format!("{}", super::unprocessable_entity().unwrap_err().kind()),
        format!("{}", AppErrorKind::UnprocessableEntity)
    );
}

#[test]
fn too_many_requests() {
    assert_eq!(
        format!("{}", super::too_many_requests().unwrap_err().kind()),
        format!("{}", AppErrorKind::TooManyRequests)
    );
}

#[test]
fn internal_server_error() {
    assert_eq!(
        format!("{}", super::internal_server_error().unwrap_err().kind()),
        format!("{}", AppErrorKind::InternalServerError)
    );
}
