use rocket::{
  self,
  http::{ContentType, Status},
  local::Client,
};

fn setup() -> Client
{
  let server = rocket::ignite().mount("/", routes![super::handler]);

  Client::new(server).unwrap()
}

#[test]
fn single_recipient()
{
  let client = setup();

  let mut response = client
    .post("/send")
    .header(ContentType::JSON)
    .body(
      r#"{
      "to": [ "foo@example.com" ],
      "cc": [],
      "subject": "bar",
      "body": {
        "text": "baz",
        "html": "<a>qux</a>"
      }
    }"#,
    )
    .dispatch();

  assert_eq!(response.status(), Status::Ok);

  let body = response.body().unwrap().into_string().unwrap();
  assert_eq!(body, json!({ "messageId": 0 }).to_string());
}

#[test]
fn multiple_recipients()
{
  let client = setup();

  let mut response = client
    .post("/send")
    .header(ContentType::JSON)
    .body(
      r#"{
      "to": [ "foo@example.com", "bar@example.com" ],
      "cc": [ "baz@example.com", "qux@example.com" ],
      "subject": "wibble",
      "body": {
        "text": "blee",
        "html": ""
      }
    }"#,
    )
    .dispatch();

  assert_eq!(response.status(), Status::Ok);

  let body = response.body().unwrap().into_string().unwrap();
  assert_eq!(body, json!({ "messageId": 0 }).to_string());
}

#[test]
fn without_optional_data()
{
  let client = setup();

  let mut response = client
    .post("/send")
    .header(ContentType::JSON)
    .body(
      r#"{
      "to": [ "foo@example.com" ],
      "subject": "bar",
      "body": {
        "text": "baz"
      }
    }"#,
    )
    .dispatch();

  assert_eq!(response.status(), Status::Ok);

  let body = response.body().unwrap().into_string().unwrap();
  assert_eq!(body, json!({ "messageId": 0 }).to_string());
}

#[test]
fn missing_to_field()
{
  let client = setup();

  let response = client
    .post("/send")
    .header(ContentType::JSON)
    .body(
      r#"{
      "subject": "bar",
      "body": {
        "text": "baz"
      }
    }"#,
    )
    .dispatch();

  assert_eq!(response.status(), Status::BadRequest);
}

#[test]
fn missing_subject_field()
{
  let client = setup();

  let response = client
    .post("/send")
    .header(ContentType::JSON)
    .body(
      r#"{
      "to": [ "foo@example.com" ],
      "body": {
        "text": "baz"
      }
    }"#,
    )
    .dispatch();

  assert_eq!(response.status(), Status::BadRequest);
}

#[test]
fn missing_body_text_field()
{
  let client = setup();

  let response = client
    .post("/send")
    .header(ContentType::JSON)
    .body(
      r#"{
      "to": [ "foo@example.com" ],
      "subject": "bar",
      "body": {
        "html": "<a>qux</a>"
      }
    }"#,
    )
    .dispatch();

  assert_eq!(response.status(), Status::BadRequest);
}

#[test]
fn empty_to_field()
{
  let client = setup();

  let response = client
    .post("/send")
    .header(ContentType::JSON)
    .body(
      r#"{
      "to": [],
      "subject": "bar",
      "body": {
        "text": "baz"
      }
    }"#,
    )
    .dispatch();

  assert_eq!(response.status(), Status::BadRequest);
}

#[test]
fn invalid_to_field()
{
  let client = setup();

  let response = client
    .post("/send")
    .header(ContentType::JSON)
    .body(
      r#"{
      "to": [ "foo" ],
      "subject": "bar",
      "body": {
        "text": "baz"
      }
    }"#,
    )
    .dispatch();

  assert_eq!(response.status(), Status::BadRequest);
}

#[test]
fn invalid_cc_field()
{
  let client = setup();

  let response = client
    .post("/send")
    .header(ContentType::JSON)
    .body(
      r#"{
      "to": [ "foo@example.com" ],
      "cc": [ "bar" ],
      "subject": "baz",
      "body": {
        "text": "qux"
      }
    }"#,
    )
    .dispatch();

  assert_eq!(response.status(), Status::BadRequest);
}
