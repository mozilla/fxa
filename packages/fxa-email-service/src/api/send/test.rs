// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, you can obtain one at https://mozilla.org/MPL/2.0/.

use rocket::{
    http::{ContentType, Status},
    local::Client,
};

use db::{auth_db::DbClient, delivery_problems::DeliveryProblems, message_data::MessageData};
use logging::MozlogLogger;
use providers::Providers;
use settings::Settings;
use types::error::{AppError, AppErrorKind};

fn setup() -> Client {
    let mut settings = Settings::new().unwrap();
    settings.provider.forcedefault = false;
    let db = DbClient::new(&settings);
    let delivery_problems = DeliveryProblems::new(&settings, db);
    let logger = MozlogLogger::new(&settings);
    let message_data = MessageData::new(&settings);
    let providers = Providers::new(&settings);
    let server = rocket::ignite()
        .manage(settings)
        .manage(delivery_problems)
        .manage(logger)
        .manage(message_data)
        .manage(providers)
        .mount("/", routes![super::handler]);

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
fn unicode_email_field() {
    let client = setup();

    let mut response = client
        .post("/send")
        .header(ContentType::JSON)
        .body(
            r#"{
      "to": "시험@example.com",
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
fn unicode_message_body() {
    let client = setup();

    let mut response = client
        .post("/send")
        .header(ContentType::JSON)
        .body(
            r#"{
      "to": "foo@example.com",
      "subject": "bar",
      "body": {
        "text": "🦀 시험 🦀",
        "html": "<p>🦀 시험 🦀</p>"
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
fn unicode_message_subject() {
    let client = setup();

    let mut response = client
        .post("/send")
        .header(ContentType::JSON)
        .body(
            r#"{
      "to": "foo@example.com",
      "subject": "🦀 시험 🦀",
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
    let error: AppError =
        AppErrorKind::InvalidPayload(String::from("missing field `to` at line 7 column 5")).into();
    let expected = serde_json::to_string(&error).unwrap();
    assert_eq!(body, expected);
}

#[test]
fn missing_subject_field() {
    let client = setup();

    let mut response = client
        .post("/send")
        .header(ContentType::JSON)
        .body(
            r#"{
      "to": "foo@example.com",
      "body": {
        "text": "baz"
      },
      "provider": "mock"
    }"#,
        )
        .dispatch();

    assert_eq!(response.status(), Status::BadRequest);

    let body = response.body().unwrap().into_string().unwrap();
    let error: AppError =
        AppErrorKind::InvalidPayload(String::from("missing field `subject` at line 7 column 5"))
            .into();
    let expected = serde_json::to_string(&error).unwrap();
    assert_eq!(body, expected);
}

#[test]
fn missing_body_text_field() {
    let client = setup();

    let mut response = client
        .post("/send")
        .header(ContentType::JSON)
        .body(
            r#"{
      "to": "foo@example.com",
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
    let error: AppError =
        AppErrorKind::InvalidPayload(String::from("missing field `text` at line 6 column 7"))
            .into();
    let expected = serde_json::to_string(&error).unwrap();
    assert_eq!(body, expected);
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
    let error: AppError = AppErrorKind::InvalidPayload(String::from(
        "invalid type: sequence, expected a string at line 2 column 12",
    ))
    .into();
    let expected = serde_json::to_string(&error).unwrap();
    assert_eq!(body, expected);
}

#[test]
fn invalid_cc_field() {
    let client = setup();

    let mut response = client
        .post("/send")
        .header(ContentType::JSON)
        .body(
            r#"{
      "to": "foo@example.com",
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
    let error: AppError = AppErrorKind::InvalidPayload(String::from(
        "invalid value: string \"bar\", expected email address at line 3 column 21",
    ))
    .into();
    let expected = serde_json::to_string(&error).unwrap();
    assert_eq!(body, expected);
}
