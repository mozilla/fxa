// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, you can obtain one at https://mozilla.org/MPL/2.0/.

//! Environment type.

#[cfg(test)]
mod test;

use serde::de::Error;

use crate::types::error::{AppError, AppErrorKind};

enum_boilerplate!(Env ("env", Dev, InvalidEnv) {
    // These values are consistent with the conventions followed by other FxA repos.
    Dev => "dev",
    Prod => "production",
    Test => "test",
});
