// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, you can obtain one at https://mozilla.org/MPL/2.0/.

use std::{
    error::Error, fmt::{self, Display, Formatter},
};

use hex;
use reqwest::{Client as RequestClient, Error as RequestError, StatusCode, Url, UrlError};
use serde::de::{Deserialize, Deserializer, Error as DeserializeError, Unexpected};

use settings::Settings;

#[cfg(test)]
mod test;

#[derive(Clone, Copy, Debug, Eq, Hash, PartialEq)]
pub enum BounceType {
    Hard,
    Soft,
    Complaint,
}

impl<'d> Deserialize<'d> for BounceType {
    fn deserialize<D>(deserializer: D) -> Result<Self, D::Error>
    where
        D: Deserializer<'d>,
    {
        let value: u8 = Deserialize::deserialize(deserializer)?;
        match value {
            // The auth db falls back to zero when it receives a value it doesn't recognise
            0 => {
                println!("Mapped default auth db bounce type to BounceType::Soft");
                Ok(BounceType::Soft)
            }
            1 => Ok(BounceType::Hard),
            2 => Ok(BounceType::Soft),
            3 => Ok(BounceType::Complaint),
            _ => Err(D::Error::invalid_value(
                Unexpected::Unsigned(value as u64),
                &"bounce type",
            )),
        }
    }
}

#[derive(Clone, Copy, Debug, Deserialize)]
pub enum BounceSubtype {
    // Set by the auth db if an input string is not recognised
    Unmapped = 0,
    // These are mapped from the equivalent SES bounceSubType values
    Undetermined = 1,
    General = 2,
    NoEmail = 3,
    Suppressed = 4,
    MailboxFull = 5,
    MessageTooLarge = 6,
    ContentRejected = 7,
    AttachmentRejected = 8,
    // These are mapped from the equivalent SES complaintFeedbackType values
    Abuse = 9,
    AuthFailure = 10,
    Fraud = 11,
    NotSpam = 12,
    Other = 13,
    Virus = 14,
}

#[derive(Clone, Debug, Deserialize)]
pub struct BounceRecord {
    #[serde(rename = "email")]
    pub address: String,
    #[serde(rename = "bounceType")]
    pub bounce_type: BounceType,
    #[serde(rename = "bounceSubType")]
    pub bounce_subtype: BounceSubtype,
    #[serde(rename = "createdAt")]
    pub created_at: u64,
}

#[derive(Debug)]
pub struct DbError {
    description: String,
}

impl DbError {
    pub fn new(description: String) -> DbError {
        DbError { description }
    }
}

impl Error for DbError {
    fn description(&self) -> &str {
        &self.description
    }
}

impl Display for DbError {
    fn fmt(&self, formatter: &mut Formatter) -> fmt::Result {
        write!(formatter, "{}", self.description)
    }
}

impl From<UrlError> for DbError {
    fn from(error: UrlError) -> DbError {
        DbError::new(format!("URL error: {}", error.description()))
    }
}

impl From<RequestError> for DbError {
    fn from(error: RequestError) -> DbError {
        DbError::new(format!("request error: {}", error.description()))
    }
}

#[derive(Debug)]
struct DbUrls {
    get_bounces: Url,
}

impl DbUrls {
    pub fn new(settings: &Settings) -> DbUrls {
        let base_uri: Url = settings.authdb.baseuri.parse().expect("invalid base URI");
        DbUrls {
            get_bounces: base_uri.join("emailBounces/").expect("invalid base URI"),
        }
    }

    pub fn get_bounces(&self, address: &str) -> Result<Url, UrlError> {
        self.get_bounces.join(&hex::encode(address))
    }
}

pub trait Db {
    fn get_bounces(&self, address: &str) -> Result<Vec<BounceRecord>, DbError>;
}

#[derive(Debug)]
pub struct DbClient {
    urls: DbUrls,
    request_client: RequestClient,
}

impl DbClient {
    pub fn new(settings: &Settings) -> DbClient {
        DbClient {
            urls: DbUrls::new(settings),
            request_client: RequestClient::new(),
        }
    }
}

impl Db for DbClient {
    fn get_bounces(&self, address: &str) -> Result<Vec<BounceRecord>, DbError> {
        let mut response = self
            .request_client
            .get(self.urls.get_bounces(address)?)
            .send()?;
        match response.status() {
            StatusCode::Ok => response.json::<Vec<BounceRecord>>().map_err(From::from),
            status => Err(DbError::new(format!("auth db response: {}", status))),
        }
    }
}

unsafe impl Sync for DbClient {}
