use std::{borrow::Cow, collections::HashMap};

use rocket::{
  data::{self, FromData},
  http::Status,
  Data,
  Outcome,
  Request,
};
use rocket_contrib::{Json, Value};
use validator::{self, ValidationError};

#[cfg(test)]
mod test;

#[derive(Debug, Deserialize)]
struct Body
{
  text: String,
  html: Option<String>,
}

#[derive(Debug, Deserialize)]
struct Email
{
  to: Vec<String>,
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
    match result
    {
      Outcome::Success(json) =>
      {
        let email = json.into_inner();

        if email.to.len() == 0
        {
          return fail();
        }

        if let Some(outcome) = validate_addresses(&email.to)
        {
          return outcome;
        }

        if let Some(ref cc) = email.cc
        {
          if let Some(outcome) = validate_addresses(&cc)
          {
            return outcome;
          }
        }

        Outcome::Success(email)
      },
      Outcome::Failure(_error) => fail(),
      Outcome::Forward(forward) => Outcome::Forward(forward),
    }
  }
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

fn validate_addresses(addresses: &[String]) -> Option<data::Outcome<Email, ValidationError>>
{
  for address in addresses
  {
    if !validator::validate_email(&address)
    {
      return Some(fail());
    }
  }

  None
}

#[post("/send", format = "application/json", data = "<_email>")]
fn handler(_email: Email) -> Json<Value>
{
  Json(json!({ "messageId": 0 }))
}
