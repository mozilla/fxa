// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, you can obtain one at https://mozilla.org/MPL/2.0/.

use std::{borrow::Cow, collections::HashMap};

use rocket::{
    data::{self, FromData}, http::Status, response::Failure, Data, Outcome, Request,
};
use rocket_contrib::{Json, Value};
use validator::{self, Validate, ValidationError};

use auth_db::DbClient;
use bounces::Bounces;
use providers::Providers;
use settings::Settings;
use validate;

#[cfg(test)]
mod test;

lazy_static! {
    static ref SETTINGS: Settings = Settings::new().expect("config error");
    static ref DB: DbClient = DbClient::new(&SETTINGS);
    static ref BOUNCES: Bounces<'static> = Bounces::new(&SETTINGS, Box::new(&*DB));
    static ref PROVIDERS: Providers<'static> = Providers::new(&SETTINGS);
}

#[derive(Debug, Deserialize)]
struct Body {
    text: String,
    html: Option<String>,
}

#[derive(Debug, Deserialize, Validate)]
struct Email {
    #[validate(email)]
    to: String,
    cc: Option<Vec<String>>,
    subject: String,
    body: Body,
    provider: Option<String>,
}

impl FromData for Email {
    type Error = ValidationError;

    fn from_data(request: &Request, data: Data) -> data::Outcome<Self, Self::Error> {
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

fn validate(email: &Email) -> bool {
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

fn fail() -> data::Outcome<Email, ValidationError> {
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
fn handler(email: Email) -> Result<Json<Value>, Failure> {
    let to = email.to.as_ref();
    BOUNCES.check(to)?;

    let cc = if let Some(ref cc) = email.cc {
        let mut refs = Vec::new();
        for address in cc.iter() {
            BOUNCES.check(address)?;
            refs.push(address.as_ref());
        }
        refs
    } else {
        Vec::new()
    };

    PROVIDERS
        .send(
            email.to.as_ref(),
            cc.as_ref(),
            email.subject.as_ref(),
            email.body.text.as_ref(),
            email.body.html.as_ref().map(|html| html.as_ref()),
            email.provider.as_ref().map(|provider| provider.as_ref()),
        )
        .map(|message_id| Json(json!({ "messageId": message_id })))
        .map_err(|error| {
            println!("{}", error);
            Failure(Status::InternalServerError)
        })
}
