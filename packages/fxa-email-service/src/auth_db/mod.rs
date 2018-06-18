// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, you can obtain one at https://mozilla.org/MPL/2.0/.

use std::{
    error::Error,
    fmt::{self, Debug, Display, Formatter},
};

use hex;
use reqwest::{Client as RequestClient, Error as RequestError, StatusCode, Url, UrlError};
use serde::{
    de::{Deserialize, Deserializer, Error as DeserializeError, Unexpected},
    ser::{Serialize, Serializer},
};

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
                Unexpected::Unsigned(u64::from(value)),
                &"bounce type",
            )),
        }
    }
}

impl Serialize for BounceType {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: Serializer,
    {
        let value = match self {
            BounceType::Hard => 1,
            BounceType::Soft => 2,
            BounceType::Complaint => 3,
        };
        serializer.serialize_u8(value)
    }
}

#[derive(Clone, Copy, Debug, PartialEq)]
pub enum BounceSubtype {
    // Set by the auth db if an input string is not recognised
    Unmapped,
    // These are mapped from the equivalent SES bounceSubType values
    Undetermined,
    General,
    NoEmail,
    Suppressed,
    MailboxFull,
    MessageTooLarge,
    ContentRejected,
    AttachmentRejected,
    // These are mapped from the equivalent SES complaintFeedbackType values
    Abuse,
    AuthFailure,
    Fraud,
    NotSpam,
    Other,
    Virus,
}

impl<'d> Deserialize<'d> for BounceSubtype {
    fn deserialize<D>(deserializer: D) -> Result<Self, D::Error>
    where
        D: Deserializer<'d>,
    {
        let value: u8 = Deserialize::deserialize(deserializer)?;
        match value {
            0 => Ok(BounceSubtype::Unmapped),
            1 => Ok(BounceSubtype::Undetermined),
            2 => Ok(BounceSubtype::General),
            3 => Ok(BounceSubtype::NoEmail),
            4 => Ok(BounceSubtype::Suppressed),
            5 => Ok(BounceSubtype::MailboxFull),
            6 => Ok(BounceSubtype::MessageTooLarge),
            7 => Ok(BounceSubtype::ContentRejected),
            8 => Ok(BounceSubtype::AttachmentRejected),
            9 => Ok(BounceSubtype::Abuse),
            10 => Ok(BounceSubtype::AuthFailure),
            11 => Ok(BounceSubtype::Fraud),
            12 => Ok(BounceSubtype::NotSpam),
            13 => Ok(BounceSubtype::Other),
            14 => Ok(BounceSubtype::Virus),
            _ => Err(D::Error::invalid_value(
                Unexpected::Unsigned(u64::from(value)),
                &"bounce subtype",
            )),
        }
    }
}

impl Serialize for BounceSubtype {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: Serializer,
    {
        let value = match self {
            BounceSubtype::Unmapped => 0,
            BounceSubtype::Undetermined => 1,
            BounceSubtype::General => 2,
            BounceSubtype::NoEmail => 3,
            BounceSubtype::Suppressed => 4,
            BounceSubtype::MailboxFull => 5,
            BounceSubtype::MessageTooLarge => 6,
            BounceSubtype::ContentRejected => 7,
            BounceSubtype::AttachmentRejected => 8,
            BounceSubtype::Abuse => 9,
            BounceSubtype::AuthFailure => 10,
            BounceSubtype::Fraud => 11,
            BounceSubtype::NotSpam => 12,
            BounceSubtype::Other => 13,
            BounceSubtype::Virus => 14,
        };
        serializer.serialize_u8(value)
    }
}

#[derive(Clone, Debug, Deserialize, Serialize)]
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
        DbError::new(format!("URL error: {:?}", error))
    }
}

impl From<RequestError> for DbError {
    fn from(error: RequestError) -> DbError {
        DbError::new(format!("request error: {:?}", error))
    }
}

#[derive(Debug)]
struct DbUrls {
    get_bounces: Url,
    create_bounce: Url,
}

impl DbUrls {
    pub fn new(settings: &Settings) -> DbUrls {
        let base_uri: Url = settings.authdb.baseuri.parse().expect("invalid base URI");
        DbUrls {
            get_bounces: base_uri.join("emailBounces/").expect("invalid base URI"),
            create_bounce: base_uri.join("emailBounces").expect("invalid base URI"),
        }
    }

    pub fn get_bounces(&self, address: &str) -> Result<Url, UrlError> {
        self.get_bounces.join(&hex::encode(address))
    }

    pub fn create_bounce(&self) -> Url {
        self.create_bounce.clone()
    }
}

pub trait Db: Debug + Sync {
    fn get_bounces(&self, address: &str) -> Result<Vec<BounceRecord>, DbError>;

    fn create_bounce(
        &self,
        _address: &str,
        _bounce_type: BounceType,
        _bounce_subtype: BounceSubtype,
    ) -> Result<(), DbError> {
        Err(DbError::new(String::from("Not implemented")))
    }
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

    fn create_bounce(
        &self,
        address: &str,
        bounce_type: BounceType,
        bounce_subtype: BounceSubtype,
    ) -> Result<(), DbError> {
        let response = self
            .request_client
            .post(self.urls.create_bounce())
            .json(&BounceRecord {
                address: address.to_string(),
                bounce_type,
                bounce_subtype,
                created_at: 0,
            })
            .send()?;
        match response.status() {
            StatusCode::Ok => Ok(()),
            status => Err(DbError::new(format!("auth db response: {}", status))),
        }
    }
}
