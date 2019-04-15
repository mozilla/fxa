// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, you can obtain one at https://mozilla.org/MPL/2.0/.

use std::convert::TryFrom;

use serde_json::{self, Error as JsonError};

use super::*;
use crate::types::error::AppResult;

#[test]
fn try_from() -> AppResult<()> {
    let env: Env = TryFrom::try_from("dev")?;
    assert_eq!(env, Env::Dev);

    let env: Env = TryFrom::try_from("production")?;
    assert_eq!(env, Env::Prod);

    let env: Env = TryFrom::try_from("test")?;
    assert_eq!(env, Env::Test);

    let result: AppResult<Env> = TryFrom::try_from("prod");
    assert!(result.is_err());
    assert_eq!(result.unwrap_err().to_string(), "Invalid environment: prod");

    Ok(())
}

#[test]
fn serialize_deserialize() -> Result<(), JsonError> {
    let env = Env::Prod;
    let serialized = serde_json::to_string(&env)?;
    assert_eq!(serialized, "\"production\"");

    let env: Env = serde_json::from_str(&serialized)?;
    assert_eq!(env, Env::Prod);

    Ok(())
}

#[test]
fn as_ref() {
    assert_eq!(Env::Dev.as_ref(), "dev");
    assert_eq!(Env::Prod.as_ref(), "production");
    assert_eq!(Env::Test.as_ref(), "test");
}
