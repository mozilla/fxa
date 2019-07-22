// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, you can obtain one at https://mozilla.org/MPL/2.0/.

//! Error definitions.

use std::{
    fmt::{self, Display, Formatter},
    result,
    str::Utf8Error,
    sync::{MutexGuard, TryLockError},
};

use failure::{Backtrace, Context, Fail};
use hmac::crypto_mac::InvalidKeyLength;
use http::header::ToStrError;
use hyperx::mime::FromStrError;
use lettre::smtp::error::Error as SmtpError;
use lettre_email::error::Error as EmailError;
use redis::{Client as RedisClient, RedisError};
use reqwest::{Error as RequestError, UrlError};
use rocket::{
    http::Status,
    response::{self, Responder, Response},
    Outcome, Request, State,
};
use rocket_contrib::json::Json;
use sendgrid::errors::SendgridError;
use serde::ser::{Serialize, SerializeMap, Serializer};
use serde_json::{map::Map, ser::to_string, Error as JsonError, Value};
use socketlabs::error::Error as SocketLabsError;

use super::email_address::EmailAddress;
use crate::{db::delivery_problems::DeliveryProblem, logging::MozlogLogger};

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
    pub fn code(&self) -> u16 {
        self.inner.get_context().http_status().code
    }

    pub fn error(&self) -> &'static str {
        self.inner.get_context().http_status().reason
    }

    pub fn errno(&self) -> Option<u16> {
        self.inner.get_context().errno()
    }

    pub fn additional_fields(&self) -> Map<String, Value> {
        self.inner.get_context().additional_fields()
    }
}

impl Display for AppError {
    fn fmt(&self, formatter: &mut Formatter) -> fmt::Result {
        Display::fmt(&self.inner, formatter)
    }
}

impl Fail for AppError {
    fn cause(&self) -> Option<&dyn Fail> {
        self.inner.cause()
    }

    fn backtrace(&self) -> Option<&Backtrace> {
        self.inner.backtrace()
    }
}

impl From<AppErrorKind> for AppError {
    fn from(kind: AppErrorKind) -> AppError {
        let capture_in_sentry = kind.http_status() == Status::InternalServerError;

        let error = AppError {
            inner: Context::new(kind).into(),
        };

        if capture_in_sentry {
            sentry::integrations::failure::capture_fail(&error);
        }

        error
    }
}

impl Serialize for AppError {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: Serializer,
    {
        let kind = self.inner.get_context();

        let mut map = serializer.serialize_map(None)?;

        let status = kind.http_status();
        map.serialize_entry("code", &status.code)?;
        map.serialize_entry("error", status.reason)?;

        if let Some(ref errno) = kind.errno() {
            map.serialize_entry("errno", errno)?;
        }

        map.serialize_entry("message", &self.to_string())?;

        for (field, value) in kind.additional_fields().iter() {
            map.serialize_entry(field, value)?;
        }

        map.end()
    }
}

/// Generate HTTP error responses for AppErrors
impl<'r> Responder<'r> for AppError {
    fn respond_to(self, request: &Request) -> response::Result<'r> {
        match request.guard::<State<MozlogLogger>>() {
            Outcome::Success(logger) => {
                let log = MozlogLogger::with_app_error(&logger, &self)
                    .map_err(|_| Status::InternalServerError)?;
                slog_error!(log, "{}", "Request errored");
            }
            _ => panic!("Internal error: No managed MozlogLogger"),
        }

        let status = self.inner.get_context().http_status();
        Response::build_from(Json(self).respond_to(request)?)
            .status(status)
            .ok()
    }
}

/// The specific kind of error that can occur.
#[derive(Clone, Debug, Eq, Fail, PartialEq)]
pub enum AppErrorKind {
    #[fail(display = "{}", _0)]
    Internal(String),

    #[fail(display = "Not implemented: {}", _0)]
    NotImplemented(String),

    #[fail(display = "Invalid payload: {}", 0)]
    InvalidPayload(String),

    #[fail(display = "Invalid notification: {}", _0)]
    InvalidNotification(String),

    #[fail(display = "{}", _0)]
    QueueError(String),

    #[fail(display = "Invalid duration: {}", _0)]
    InvalidDuration(String),

    #[fail(display = "Soft-bounce limit violated")]
    SoftBounce {
        address: EmailAddress,
        time: u64,
        problem: DeliveryProblem,
    },

    #[fail(display = "Hard-bounce limit violated")]
    HardBounce {
        address: EmailAddress,
        time: u64,
        problem: DeliveryProblem,
    },

    #[fail(display = "Complaint limit violated")]
    Complaint {
        address: EmailAddress,
        time: u64,
        problem: DeliveryProblem,
    },

    #[fail(display = "Invalid environment: {}", _0)]
    InvalidEnv(String),

    #[fail(display = "Invalid log level: {}", _0)]
    InvalidLogLevel(String),

    #[fail(display = "Invalid log format: {}", _0)]
    InvalidLogFormat(String),
}

impl AppErrorKind {
    /// Return a rocket response Status to be rendered for an error
    pub fn http_status(&self) -> Status {
        match self {
            AppErrorKind::InvalidPayload(_) => Status::BadRequest,
            AppErrorKind::Complaint { .. } => Status::TooManyRequests,
            AppErrorKind::SoftBounce { .. } => Status::TooManyRequests,
            AppErrorKind::HardBounce { .. } => Status::TooManyRequests,
            _ => Status::InternalServerError,
        }
    }

    pub fn errno(&self) -> Option<u16> {
        match self {
            AppErrorKind::Internal(_) => Some(100),
            AppErrorKind::NotImplemented(_) => Some(101),
            AppErrorKind::InvalidPayload(_) => Some(102),
            AppErrorKind::InvalidNotification(_) => Some(103),
            AppErrorKind::QueueError(_) => Some(104),
            AppErrorKind::InvalidDuration(_) => Some(105),
            AppErrorKind::Complaint { .. } => Some(106),
            AppErrorKind::SoftBounce { .. } => Some(107),
            AppErrorKind::HardBounce { .. } => Some(108),
            AppErrorKind::InvalidEnv { .. } => Some(109),
            AppErrorKind::InvalidLogLevel { .. } => Some(110),
            AppErrorKind::InvalidLogFormat { .. } => Some(111),
        }
    }

    pub fn additional_fields(&self) -> Map<String, Value> {
        let mut fields = Map::new();
        match self {
            AppErrorKind::Complaint {
                ref address,
                ref time,
                ref problem,
            }
            | AppErrorKind::SoftBounce {
                ref address,
                ref time,
                ref problem,
            }
            | AppErrorKind::HardBounce {
                ref address,
                ref time,
                ref problem,
            } => {
                fields.insert(String::from("address"), Value::String(address.to_string()));
                fields.insert(String::from("time"), Value::Number(time.clone().into()));
                fields.insert(
                    String::from("problem"),
                    Value::String(to_string(problem).unwrap_or(String::from("{}"))),
                );
            }

            _ => (),
        }
        fields
    }
}

macro_rules! to_internal_error {
    ($from:ty) => {
        impl From<$from> for AppError {
            fn from(error: $from) -> AppError {
                AppErrorKind::Internal(format!("{:?}", error)).into()
            }
        }
    };
}

to_internal_error!(EmailError);
to_internal_error!(FromStrError);
to_internal_error!(InvalidKeyLength);
to_internal_error!(JsonError);
to_internal_error!(TryLockError<MutexGuard<'_, RedisClient>>);
to_internal_error!(RedisError);
to_internal_error!(RequestError);
to_internal_error!(SendgridError);
to_internal_error!(SmtpError);
to_internal_error!(SocketLabsError);
to_internal_error!(ToStrError);
to_internal_error!(UrlError);
to_internal_error!(Utf8Error);
