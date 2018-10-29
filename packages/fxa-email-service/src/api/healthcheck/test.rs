// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, you can obtain one at https://mozilla.org/MPL/2.0/.

use std::env;

use rocket::{self, http::Status, local::Client};
use serde_json::{self, Value};

use db::{auth_db::DbClient, delivery_problems::DeliveryProblems, message_data::MessageData};
use logging::MozlogLogger;
use providers::Providers;
use settings::Settings;

fn setup() -> Client {
    let settings = Settings::new().unwrap();
    let db = DbClient::new(&settings);
    let delivery_problems = DeliveryProblems::new(&settings, db);
    let logger = MozlogLogger::new(&settings).expect("MozlogLogger::init error");
    let message_data = MessageData::new(&settings);
    let providers = Providers::new(&settings);
    let server = rocket::ignite()
        .manage(settings)
        .manage(delivery_problems)
        .manage(logger)
        .manage(message_data)
        .manage(providers)
        .mount(
            "/",
            routes![super::heartbeat, super::lbheartbeat, super::version],
        );

    Client::new(server).unwrap()
}

#[test]
fn successful_lbheartbeat() {
    let client = setup();
    let mut response = client.get("/__lbheartbeat__").dispatch();
    let body = response.body().unwrap().into_string().unwrap();
    assert_eq!(body, json!({}).to_string());
    assert_eq!(response.status(), Status::Ok);
}

#[test]
fn successful_heartbeat() {
    let client = setup();
    let mut response = client.get("/__heartbeat__").dispatch();
    let body = response.body().unwrap().into_string().unwrap();
    assert_eq!(body, json!({}).to_string());
    assert_eq!(response.status(), Status::Ok);
}

#[test]
fn unsuccessful_heartbeat() {
    let baseuri = env::var("FXA_EMAIL_AUTHDB_BASEURI");
    env::set_var("FXA_EMAIL_AUTHDB_BASEURI", "http://wrong.path/");
    let client = setup();
    if let Ok(baseuri) = baseuri {
        env::set_var("FXA_EMAIL_AUTHDB_BASEURI", baseuri);
    } else {
        env::remove_var("FXA_EMAIL_AUTHDB_BASEURI");
    }

    let mut response = client.get("/__heartbeat__").dispatch();
    let body: Value =
        serde_json::from_str(&response.body().unwrap().into_string().unwrap()).unwrap();
    assert_eq!(body["code"], 500);
    assert_eq!(body["errno"], 109);
    assert_eq!(body["error"], "Internal Server Error");
    assert_eq!(response.status(), Status::InternalServerError);
}

#[test]
fn successful_version() {
    let client = setup();
    let mut response = client.get("/__version__").dispatch();
    let body = response.body().unwrap().into_string().unwrap();
    assert_eq!(
        body,
        json!({
        "build": "TBD",
        "commit": "TBD",
        "source": "https://github.com/mozilla/fxa-email-service",
        "version": "TBD"
    })
        .to_string()
    );
    assert_eq!(response.status(), Status::Ok);
}
