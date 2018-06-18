// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, you can obtain one at https://mozilla.org/MPL/2.0/.

use std::collections::HashMap;

use rocket_contrib::Json;

#[cfg(test)]
mod test;

#[error(400)]
pub fn bad_request() -> Json<ApplicationError> {
    Json(ApplicationError::new(400, "Bad Request"))
}

#[error(404)]
pub fn not_found() -> Json<ApplicationError> {
    Json(ApplicationError::new(404, "Not Found"))
}

#[error(405)]
pub fn method_not_allowed() -> Json<ApplicationError> {
    Json(ApplicationError::new(405, "Method Not Allowed"))
}

#[error(422)]
pub fn unprocessable_entity() -> Json<ApplicationError> {
    Json(ApplicationError::new(422, "Unprocessable Entity"))
}

#[error(429)]
pub fn too_many_requests() -> Json<ApplicationError> {
    Json(ApplicationError::new(429, "Too Many Requests"))
}

#[error(500)]
pub fn internal_server_error() -> Json<ApplicationError> {
    Json(ApplicationError::new(500, "Internal Server Error"))
}

#[derive(Debug, Deserialize, PartialEq, Serialize)]
pub struct ApplicationError {
    pub status: u16,
    pub error: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub errno: Option<u8>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub message: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub data: Option<HashMap<String, String>>,
}

impl ApplicationError {
    pub fn new(status: u16, error: &str) -> ApplicationError {
        // TODO: Set errno, message and data when rocket#596 is resolved
        //       (https://github.com/SergioBenitez/Rocket/issues/596)
        ApplicationError {
            status,
            error: error.to_string(),
            errno: None,
            message: None,
            data: None,
        }
    }
}
