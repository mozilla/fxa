// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, you can obtain one at https://mozilla.org/MPL/2.0/.

//! Email provider type.

#[cfg(test)]
mod test;

use serde::de::Error;

use types::error::{AppError, AppErrorKind};

enum_boilerplate!(Provider ("env", Ses, InvalidPayload) {
    Mock => "mock",
    Sendgrid => "sendgrid",
    Ses => "ses",
    Smtp => "smtp",
    SocketLabs => "socketlabs",
});
