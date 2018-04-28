use std::{borrow::Cow, collections::HashMap};

use rocket::{
  data::{self, FromData},
  http::Status,
  Data,
  Outcome,
  Request,
};
use rocket_contrib::{Json, Value};
use validator::{self, Validate, ValidationError};

use settings::Settings;

#[cfg(test)]
mod test;

lazy_static! {
  static ref SETTINGS: Settings = Settings::new().expect("Config error");
}

#[derive(Debug, Deserialize)]
struct Body
{
  text: String,
  html: Option<String>,
}

#[derive(Debug, Deserialize, Validate)]
struct Email
{
  #[validate(email)]
  to: String,
  cc: Option<Vec<String>>,
  subject: String,
  body: Body,
}

impl FromData for Email
{
  type Error = ValidationError;

  fn from_data(request: &Request, data: Data) -> data::Outcome<Self, Self::Error>
  {
    let result = Json::<Email>::from_data(request, data);
    match result {
      Outcome::Success(json) => {
        let email = json.into_inner();
        if validate(&email) {
          Outcome::Success(email)
        } else {
          fail()
        }
      }
      Outcome::Failure(_error) => fail(),
      Outcome::Forward(forward) => Outcome::Forward(forward),
    }
  }
}

fn validate(email: &Email) -> bool
{
  if let Some(ref cc) = email.cc {
    for address in cc {
      if !validator::validate_email(&address) {
        return false;
      }
    }
  }

  true
}

fn fail() -> data::Outcome<Email, ValidationError>
{
  Outcome::Failure((
    Status::BadRequest,
    ValidationError {
      code: Cow::from("400"),
      message: None,
      params: HashMap::new(),
    },
  ))
}

#[post("/send", format = "application/json", data = "<_email>")]
fn handler(_email: Email) -> Json<Value>
{
  Json(json!({ "messageId": 0 }))
}
