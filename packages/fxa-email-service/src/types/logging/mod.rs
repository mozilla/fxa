// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, you can obtain one at https://mozilla.org/MPL/2.0/.

//! Logging types.

#[cfg(test)]
mod test;

use serde::de::Error;

use types::error::{AppError, AppErrorKind};

enum_boilerplate!(LogLevel ("log level", InvalidLogLevel) {
    Normal => "normal",
    Debug => "debug",
    Critical => "critical",
    Off => "off",
});

impl Default for LogLevel {
    fn default() -> Self {
        LogLevel::Normal
    }
}

enum_boilerplate!(LogFormat ("log format", InvalidLogFormat) {
    Mozlog => "mozlog",
    Pretty => "pretty",
});

impl Default for LogFormat {
    fn default() -> Self {
        LogFormat::Mozlog
    }
}
