// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, you can obtain one at https://mozilla.org/MPL/2.0/.

//! Error definitions.

use std::{
    fmt::{self, Display, Formatter},
    result,
};

use failure::{Backtrace, Context, Fail};
use serde::ser::{Serialize, SerializeMap, Serializer};

#[cfg(test)]
mod test;

pub type AppResult<T> = result::Result<T, AppError>;

/// The main error type
/// used by this service.
///
/// Errors are serialised with a JSON body
/// that honours the same format
/// used by other FxA services:
///
/// `{ errno, message }`
#[derive(Debug)]
pub struct AppError {
    inner: Context<AppErrorKind>,
}

impl AppError {
    pub fn errno(&self) -> Option<u16> {
        self.inner.get_context().errno()
    }
}

impl Display for AppError {
    fn fmt(&self, formatter: &mut Formatter) -> fmt::Result {
        Display::fmt(&self.inner, formatter)
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

impl From<AppErrorKind> for AppError {
    fn from(kind: AppErrorKind) -> AppError {
        let error = AppError {
            inner: Context::new(kind).into(),
        };

        sentry::integrations::failure::capture_fail(&error);

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

        if let Some(ref errno) = kind.errno() {
            map.serialize_entry("errno", errno)?;
        }

        map.serialize_entry("message", &self.to_string())?;

        map.end()
    }
}

/// The specific kind of error that can occur.
#[derive(Clone, Debug, Eq, Fail, PartialEq)]
pub enum AppErrorKind {
    #[fail(display = "Not implemented: {}", _0)]
    NotImplemented(String),

    #[fail(display = "Invalid event: {}", _0)]
    InvalidEvent(String),

    #[fail(display = "{}", _0)]
    QueueError(String),

    #[fail(display = "Invalid environment: {}", _0)]
    InvalidEnv(String),

    #[fail(display = "Invalid AWS region: {}", _0)]
    InvalidAwsRegion(String),

    #[fail(display = "Invalid AWS access key: {}", _0)]
    InvalidAwsAccessKey(String),

    #[fail(display = "Invalid AWS secret key: {}", _0)]
    InvalidAwsSecretKey(String),

    #[fail(display = "Invalid SQS URL: {}", _0)]
    InvalidSqsUrl(String),
}

impl AppErrorKind {
    pub fn errno(&self) -> Option<u16> {
        match self {
            AppErrorKind::NotImplemented(_) => Some(100),
            AppErrorKind::QueueError(_) => Some(101),
            AppErrorKind::InvalidEvent(_) => Some(102),
            AppErrorKind::InvalidEnv(_) => Some(103),
            AppErrorKind::InvalidAwsRegion(_) => Some(104),
            AppErrorKind::InvalidAwsAccessKey(_) => Some(105),
            AppErrorKind::InvalidAwsSecretKey(_) => Some(106),
            AppErrorKind::InvalidSqsUrl(_) => Some(107),
        }
    }
}
