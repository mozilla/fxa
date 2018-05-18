// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, you can obtain one at https://mozilla.org/MPL/2.0/.

use std::{
    error::Error, fmt::{self, Display, Formatter},
};

use hex;
use reqwest::{Client as RequestClient, Error as RequestError, StatusCode, Url, UrlError};

use settings::Settings;

#[cfg(test)]
mod test;

#[derive(Clone, Copy, Debug, Deserialize, Eq, Hash, PartialEq)]
pub enum BounceType {
    Hard = 1,
    Soft = 2,
    Complaint = 3,
}

#[derive(Clone, Copy, Debug, Deserialize)]
pub struct BounceRecord {
    #[serde(rename = "bounceType")]
    pub bounce_type: BounceType,
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

struct DbUrls {
    get_email_bounces: Url,
}

impl DbUrls {
    pub fn new(settings: &Settings) -> DbUrls {
        let base_uri: Url = settings.authdb.baseuri.parse().expect("invalid base URI");
        DbUrls {
            get_email_bounces: base_uri.join("emailBounces/").expect("invalid base URI"),
        }
    }

    pub fn get_email_bounces(&self, address: &str) -> Result<Url, UrlError> {
        self.get_email_bounces.join(&hex::encode(address))
    }
}

pub trait Db {
    fn get_email_bounces(&self, address: &str) -> Result<Vec<BounceRecord>, DbError>;
}

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
    fn get_email_bounces(&self, address: &str) -> Result<Vec<BounceRecord>, DbError> {
        let mut response = self
            .request_client
            .get(self.urls.get_email_bounces(address)?)
            .send()?;
        match response.status() {
            StatusCode::Ok => response.json::<Vec<BounceRecord>>().map_err(From::from),
            status => Err(DbError::new(format!("auth db response: {}", status))),
        }
    }
}

unsafe impl Sync for DbClient {}
