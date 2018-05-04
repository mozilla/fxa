// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, you can obtain one at https://mozilla.org/MPL/2.0/.

use std::{borrow::Cow, collections::HashMap};

use rocket::{
  data::{self, FromData},
  http::Status,
  Data,
  Error,
  Outcome,
  Request,
};
use rocket_contrib::{Json, Value};
use validator::{self, Validate, ValidationError};

use providers::Providers;
use validate;

#[cfg(test)]
mod test;

lazy_static! {
  static ref PROVIDERS: Providers = Providers::new();
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
  provider: Option<String>,
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

  if let Some(ref provider) = email.provider {
    if !validate::provider(provider) {
      return false;
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

#[post("/send", format = "application/json", data = "<email>")]
fn handler(email: Email) -> Result<Json<Value>, Error>
{
  let cc = if let Some(ref cc) = email.cc {
    cc.iter().map(|s| s.as_ref()).collect()
  } else {
    Vec::new()
  };
  let html = if let Some(ref html) = email.body.html {
    Some(html.as_ref())
  } else {
    None
  };
  let provider = if let Some(ref provider) = email.provider {
    Some(provider.as_ref())
  } else {
    None
  };

  match PROVIDERS.send(
    email.to.as_ref(),
    cc.as_ref(),
    email.subject.as_ref(),
    email.body.text.as_ref(),
    html,
    provider,
  ) {
    Ok(message_id) => Ok(Json(json!({ "messageId": message_id }))),
    Err(_error) => Err(Error::Internal),
  }
}
