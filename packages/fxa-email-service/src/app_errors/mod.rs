// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, you can obtain one at https://mozilla.org/MPL/2.0/.

//! Error definitions.

use std::{fmt, result};

use failure::{Backtrace, Context, Fail};
use rocket::{
    self,
    http::Status,
    response::{self, Responder, Response},
    Request,
};
use rocket_contrib::{Json, JsonValue};
use serde_json::{map::Map, ser::to_string, Value};

use auth_db::BounceRecord;
use logging::MozlogLogger;

#[cfg(test)]
mod test;

pub type AppResult<T> = result::Result<T, AppError>;

/// The main error type
/// returned by this service.
///
/// Error responses are serialised with a JSON body
/// that honours the same format
/// used by other FxA services:
///
/// `{ code, error, errno, message }`
#[derive(Debug)]
pub struct AppError {
    inner: Context<AppErrorKind>,
}

impl AppError {
    pub fn json(&self) -> JsonValue {
        let kind = self.kind();
        let status = kind.http_status();

        let mut fields = Map::new();
        fields.insert(
            String::from("code"),
            Value::String(format!("{}", status.code)),
        );
        fields.insert(
            String::from("error"),
            Value::String(format!("{}", status.reason)),
        );
        let errno = kind.errno();
        if let Some(ref errno) = errno {
            fields.insert(String::from("errno"), Value::String(format!("{}", errno)));
            fields.insert(String::from("message"), Value::String(format!("{}", self)));
        };
        let additional_fields = kind.additional_fields();
        for (field, value) in additional_fields.iter() {
            fields.insert(field.clone(), value.clone());
        }

        json!(fields)
    }

    pub fn kind(&self) -> &AppErrorKind {
        self.inner.get_context()
    }
}

impl Fail for AppError {
    fn cause(&self) -> Option<&Fail> {
        self.inner.cause()
    }

    fn backtrace(&self) -> Option<&Backtrace> {
        self.inner.backtrace()
    }
}

impl fmt::Display for AppError {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        self.inner.fmt(f)
    }
}

/// The specific kind of error that can occur.
#[derive(Clone, Debug, Eq, Fail, PartialEq)]
pub enum AppErrorKind {
    /// 400 Bad Request
    #[fail(display = "Bad Request")]
    BadRequest,
    /// 404 Not Found
    #[fail(display = "Not Found")]
    NotFound,
    /// 405 Method Not Allowed
    #[fail(display = "Method Not Allowed")]
    MethodNotAllowed,
    /// 422 Unprocessable Entity
    #[fail(display = "Unprocessable Entity")]
    UnprocessableEntity,
    /// 429 Too Many Requests,
    #[fail(display = "Too Many Requests")]
    TooManyRequests,
    /// 500 Internal Server Error
    #[fail(display = "Internal Server Error")]
    InternalServerError,
    // Unexpected rocket error
    #[fail(display = "{:?}", _0)]
    RocketError(rocket::Error),

    /// An error for invalid email params in the /send handler.
    #[fail(display = "Error validating email params.")]
    InvalidEmailParams,
    /// An error for missing email params in the /send handler.
    #[fail(display = "Missing email params.")]
    MissingEmailParams(String),

    /// An error for invalid provider names.
    #[fail(display = "Invalid provider name: {}", _0)]
    InvalidProvider(String),
    /// An error for when we get an error from a provider.
    #[fail(display = "{}", description)]
    ProviderError { name: String, description: String },
    /// An error for when we have trouble parsing the email message.
    #[fail(display = "{:?}", _0)]
    EmailParsingError(String),

    /// An error for when a bounce violation happens.
    #[fail(display = "Email account sent complaint.")]
    BounceComplaintError {
        address: String,
        bounce: Option<BounceRecord>,
    },
    #[fail(display = "Email account soft bounced.")]
    BounceSoftError {
        address: String,
        bounce: Option<BounceRecord>,
    },
    #[fail(display = "Email account hard bounced.")]
    BounceHardError {
        address: String,
        bounce: Option<BounceRecord>,
    },

    /// An error for when an error happens on a request to the db.
    #[fail(display = "{:?}", _0)]
    DbError(String),

    /// An error for when we try to access functionality that is not
    /// implemented.
    #[fail(display = "Feature not implemented.")]
    NotImplemented,
}

impl AppErrorKind {
    /// Return a rocket response Status to be rendered for an error
    pub fn http_status(&self) -> Status {
        match self {
            AppErrorKind::NotFound => Status::NotFound,
            AppErrorKind::MethodNotAllowed => Status::MethodNotAllowed,
            AppErrorKind::UnprocessableEntity => Status::UnprocessableEntity,
            AppErrorKind::TooManyRequests => Status::TooManyRequests,
            AppErrorKind::BounceComplaintError { .. }
            | AppErrorKind::BounceSoftError { .. }
            | AppErrorKind::BounceHardError { .. } => Status::TooManyRequests,
            AppErrorKind::BadRequest | AppErrorKind::InvalidEmailParams => Status::BadRequest,
            AppErrorKind::MissingEmailParams(_) => Status::BadRequest,
            AppErrorKind::InternalServerError | _ => Status::InternalServerError,
        }
    }

    pub fn errno(&self) -> Option<i32> {
        match self {
            AppErrorKind::RocketError(_) => Some(100),

            AppErrorKind::MissingEmailParams(_) => Some(101),
            AppErrorKind::InvalidEmailParams => Some(102),

            AppErrorKind::InvalidProvider(_) => Some(103),
            AppErrorKind::ProviderError { .. } => Some(104),
            AppErrorKind::EmailParsingError(_) => Some(105),

            AppErrorKind::BounceComplaintError { .. } => Some(106),
            AppErrorKind::BounceSoftError { .. } => Some(107),
            AppErrorKind::BounceHardError { .. } => Some(108),

            AppErrorKind::DbError(_) => Some(109),

            AppErrorKind::NotImplemented => Some(110),

            AppErrorKind::BadRequest
            | AppErrorKind::NotFound
            | AppErrorKind::MethodNotAllowed
            | AppErrorKind::UnprocessableEntity
            | AppErrorKind::TooManyRequests
            | AppErrorKind::InternalServerError => None,
        }
    }

    pub fn additional_fields(&self) -> Map<String, Value> {
        let mut fields = Map::new();
        match self {
            AppErrorKind::ProviderError { ref name, .. } => {
                fields.insert(String::from("name"), Value::String(format!("{}", name)));
            }

            AppErrorKind::BounceComplaintError {
                ref address,
                ref bounce,
            }
            | AppErrorKind::BounceSoftError {
                ref address,
                ref bounce,
            }
            | AppErrorKind::BounceHardError {
                ref address,
                ref bounce,
            } => {
                fields.insert(
                    String::from("address"),
                    Value::String(format!("{}", address)),
                );
                if let Some(bounce) = bounce {
                    fields.insert(
                        String::from("bounce"),
                        Value::String(to_string(bounce).unwrap_or(String::from("{}"))),
                    );
                }
            }
            _ => (),
        }
        fields
    }
}

impl From<AppErrorKind> for AppError {
    fn from(kind: AppErrorKind) -> AppError {
        Context::new(kind).into()
    }
}

impl From<Context<AppErrorKind>> for AppError {
    fn from(inner: Context<AppErrorKind>) -> AppError {
        AppError { inner }
    }
}

/// Generate HTTP error responses for AppErrors
impl<'r> Responder<'r> for AppError {
    fn respond_to(self, request: &Request) -> response::Result<'r> {
        let status = self.kind().http_status();
        let json = Json(self.json());

        let log = MozlogLogger::with_request(request).map_err(|_| Status::InternalServerError)?;
        slog_error!(log, "{}", json.to_string());

        let mut builder = Response::build_from(json.respond_to(request)?);
        builder.status(status).ok()
    }
}

#[catch(400)]
pub fn bad_request() -> AppResult<()> {
    Err(AppErrorKind::BadRequest)?
}

#[catch(404)]
pub fn not_found() -> AppResult<()> {
    Err(AppErrorKind::NotFound)?
}

#[catch(405)]
pub fn method_not_allowed() -> AppResult<()> {
    Err(AppErrorKind::MethodNotAllowed)?
}

#[catch(422)]
pub fn unprocessable_entity() -> AppResult<()> {
    Err(AppErrorKind::UnprocessableEntity)?
}

#[catch(429)]
pub fn too_many_requests() -> AppResult<()> {
    Err(AppErrorKind::TooManyRequests)?
}

#[catch(500)]
pub fn internal_server_error() -> AppResult<()> {
    Err(AppErrorKind::InternalServerError)?
}
