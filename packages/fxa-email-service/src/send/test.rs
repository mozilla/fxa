// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, you can obtain one at https://mozilla.org/MPL/2.0/.

use rocket::{
    self,
    http::{ContentType, Status},
    local::Client,
};

use app_errors::{self, AppError, AppErrorKind};
use auth_db::DbClient;
use bounces::Bounces;
use logging::MozlogLogger;
use message_data::MessageData;
use providers::Providers;
use settings::Settings;

fn setup() -> Client {
    let settings = Settings::new().unwrap();
    let db = DbClient::new(&settings);
    let bounces = Bounces::new(&settings, db);
    let logger = MozlogLogger::new(&settings).expect("MozlogLogger::init error");
    let message_data = MessageData::new(&settings);
    let providers = Providers::new(&settings);
    let server = rocket::ignite()
        .manage(bounces)
        .manage(logger)
        .manage(message_data)
        .manage(providers)
        .mount("/", routes![super::handler])
        .catch(errors![
            app_errors::bad_request,
            app_errors::not_found,
            app_errors::method_not_allowed,
            app_errors::unprocessable_entity,
            app_errors::too_many_requests,
            app_errors::internal_server_error
        ]);

    Client::new(server).unwrap()
}

#[test]
fn single_recipient() {
    let client = setup();

    let mut response = client
        .post("/send")
        .header(ContentType::JSON)
        .body(
            r#"{
      "to": "foo@example.com",
      "cc": [],
      "subject": "bar",
      "body": {
        "text": "baz",
        "html": "<a>qux</a>"
      },
      "provider": "mock"
    }"#,
        )
        .dispatch();

    assert_eq!(response.status(), Status::Ok);

    let body = response.body().unwrap().into_string().unwrap();
    assert_eq!(body, json!({ "messageId": "mock:deadbeef" }).to_string());
}

#[test]
fn multiple_recipients() {
    let client = setup();

    let mut response = client
        .post("/send")
        .header(ContentType::JSON)
        .body(
            r#"{
      "to": "foo@example.com",
      "cc": [ "bar@example.com", "baz@example.com" ],
      "subject": "wibble",
      "body": {
        "text": "blee",
        "html": ""
      },
      "provider": "mock"
    }"#,
        )
        .dispatch();

    assert_eq!(response.status(), Status::Ok);

    let body = response.body().unwrap().into_string().unwrap();
    assert_eq!(body, json!({ "messageId": "mock:deadbeef" }).to_string());
}

#[test]
fn without_optional_data() {
    let client = setup();

    let mut response = client
        .post("/send")
        .header(ContentType::JSON)
        .body(
            r#"{
      "to": "foo@example.com",
      "subject": "bar",
      "body": {
        "text": "baz"
      },
      "provider": "mock"
    }"#,
        )
        .dispatch();

    assert_eq!(response.status(), Status::Ok);

    let body = response.body().unwrap().into_string().unwrap();
    assert_eq!(body, json!({ "messageId": "mock:deadbeef" }).to_string());
}

#[test]
fn missing_to_field() {
    let client = setup();

    let mut response = client
        .post("/send")
        .header(ContentType::JSON)
        .body(
            r#"{
      "subject": "bar",
      "body": {
        "text": "baz"
      },
      "provider": "mock"
    }"#,
        )
        .dispatch();

    assert_eq!(response.status(), Status::BadRequest);

    let body = response.body().unwrap().into_string().unwrap();
    let error: AppError = AppErrorKind::MissingEmailParams(String::from("")).into();
    assert_eq!(body, error.json().to_string());
}

#[test]
fn missing_subject_field() {
    let client = setup();

    let mut response = client
        .post("/send")
        .header(ContentType::JSON)
        .body(
            r#"{
      "to": [ "foo@example.com" ],
      "body": {
        "text": "baz"
      },
      "provider": "mock"
    }"#,
        )
        .dispatch();

    assert_eq!(response.status(), Status::BadRequest);

    let body = response.body().unwrap().into_string().unwrap();
    let error: AppError = AppErrorKind::MissingEmailParams(String::from("")).into();
    assert_eq!(body, error.json().to_string());
}

#[test]
fn missing_body_text_field() {
    let client = setup();

    let mut response = client
        .post("/send")
        .header(ContentType::JSON)
        .body(
            r#"{
      "to": [ "foo@example.com" ],
      "subject": "bar",
      "body": {
        "html": "<a>qux</a>"
      },
      "provider": "mock"
    }"#,
        )
        .dispatch();

    assert_eq!(response.status(), Status::BadRequest);

    let body = response.body().unwrap().into_string().unwrap();
    let error: AppError = AppErrorKind::MissingEmailParams(String::from("")).into();
    assert_eq!(body, error.json().to_string());
}

#[test]
fn invalid_to_field() {
    let client = setup();

    let mut response = client
        .post("/send")
        .header(ContentType::JSON)
        .body(
            r#"{
      "to": [ "foo" ],
      "subject": "bar",
      "body": {
        "text": "baz"
      },
      "provider": "mock"
    }"#,
        )
        .dispatch();

    assert_eq!(response.status(), Status::BadRequest);

    let body = response.body().unwrap().into_string().unwrap();
    let error: AppError = AppErrorKind::MissingEmailParams(String::from("")).into();
    assert_eq!(body, error.json().to_string());
}

#[test]
fn invalid_cc_field() {
    let client = setup();

    let mut response = client
        .post("/send")
        .header(ContentType::JSON)
        .body(
            r#"{
      "to": [ "foo@example.com" ],
      "cc": [ "bar" ],
      "subject": "baz",
      "body": {
        "text": "qux"
      },
      "provider": "mock"
    }"#,
        )
        .dispatch();

    assert_eq!(response.status(), Status::BadRequest);

    let body = response.body().unwrap().into_string().unwrap();
    let error: AppError = AppErrorKind::MissingEmailParams(String::from("")).into();
    assert_eq!(body, error.json().to_string());
}
