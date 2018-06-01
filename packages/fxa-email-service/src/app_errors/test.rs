// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, you can obtain one at https://mozilla.org/MPL/2.0/.

use super::ApplicationError;

#[test]
fn bad_request() {
    assert_eq!(
        super::bad_request().into_inner(),
        ApplicationError::new(400, "Bad Request")
    );
}

#[test]
fn not_found() {
    assert_eq!(
        super::not_found().into_inner(),
        ApplicationError::new(404, "Not Found")
    );
}

#[test]
fn method_not_allowed() {
    assert_eq!(
        super::method_not_allowed().into_inner(),
        ApplicationError::new(405, "Method Not Allowed")
    );
}

#[test]
fn unprocessable_entity() {
    assert_eq!(
        super::unprocessable_entity().into_inner(),
        ApplicationError::new(422, "Unprocessable Entity")
    );
}

#[test]
fn too_many_requests() {
    assert_eq!(
        super::too_many_requests().into_inner(),
        ApplicationError::new(429, "Too Many Requests")
    );
}

#[test]
fn internal_server_error() {
    assert_eq!(
        super::internal_server_error().into_inner(),
        ApplicationError::new(500, "Internal Server Error")
    );
}
