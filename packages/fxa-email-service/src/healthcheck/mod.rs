// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, you can obtain one at https://mozilla.org/MPL/2.0/.

//! Route handlers for our heathcheck endpoints:
//! for the `GET /__version__` endpoint,
//! for the `GET /__lbheartbeat__` endpoint and
//! for the `GET /__heartbeat__` endpoint,

use reqwest::Client as RequestClient;
use rocket::State;
use rocket_contrib::{Json, JsonValue};
use serde_json;

use app_errors::{AppErrorKind, AppResult};
use settings::Settings;

#[cfg(test)]
mod test;

#[get("/__version__")]
fn version() -> Json<JsonValue> {
    Json(serde_json::from_str(include_str!("../../version.json")).unwrap())
}

#[get("/__lbheartbeat__")]
fn lbheartbeat() -> Json<JsonValue> {
    Json(json!({}))
}

#[get("/__heartbeat__")]
fn heartbeat(settings: State<Settings>) -> AppResult<Json<JsonValue>> {
    let db = RequestClient::new()
        .get(&format!("{}__heartbeat__", settings.authdb.baseuri))
        .send();

    match db {
        Ok(_) => Ok(Json(json!({}))),
        Err(err) => Err(AppErrorKind::DbError(format!("{}", err)).into()),
    }
}
