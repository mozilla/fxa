// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, you can obtain one at https://mozilla.org/MPL/2.0/.

//! Strongly-typed wrapper
//! for a subset of [`fxa-auth-db-mysql`][authdb].
//!
//! Ultimately we will move away
//! from the auth db
//! so, to avoid unnecessary coupling,
//! this module MUST NOT be used directly.
//! Instead,
//! all access should be via
//! [`delivery_problems::DeliveryProblems`][delpro].
//!
//! [authdb]: https://github.com/mozilla/fxa-auth-db-mysql/
//! [delpro]: ../delivery_problems/struct.DeliveryProblems.html

use std::fmt::Debug;

use hex;
use reqwest::{Client as RequestClient, StatusCode, Url, UrlError};

use super::delivery_problems::{
    LegacyDeliveryProblem as DeliveryProblem, ProblemSubtype, ProblemType,
};
use crate::{
    settings::Settings,
    types::{
        email_address::EmailAddress,
        error::{AppErrorKind, AppResult},
    },
};

#[cfg(test)]
mod test;

pub trait Db: Debug + Sync {
    fn get_bounces(&self, address: &EmailAddress) -> AppResult<Vec<DeliveryProblem>>;

    fn create_bounce(
        &self,
        _address: &EmailAddress,
        _problem_type: ProblemType,
        _problem_subtype: ProblemSubtype,
    ) -> AppResult<()> {
        Err(AppErrorKind::NotImplemented(
            "db::auth_db::Db::create_bounce".to_owned(),
        ))?
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
    fn get_bounces(&self, address: &EmailAddress) -> AppResult<Vec<DeliveryProblem>> {
        let mut response = self
            .request_client
            .get(self.urls.get_bounces(address)?)
            .send()?;
        match response.status() {
            StatusCode::OK => response.json::<Vec<DeliveryProblem>>().map_err(From::from),
            status => Err(AppErrorKind::Internal(format!(
                "Auth db get_bounces response: {}",
                status
            )))?,
        }
    }

    fn create_bounce(
        &self,
        address: &EmailAddress,
        problem_type: ProblemType,
        problem_subtype: ProblemSubtype,
    ) -> AppResult<()> {
        let response = self
            .request_client
            .post(self.urls.create_bounce())
            .json(&DeliveryProblem {
                address: address.clone(),
                problem_type,
                problem_subtype,
                created_at: 0,
            })
            .send()?;
        match response.status() {
            StatusCode::OK => Ok(()),
            status => Err(AppErrorKind::Internal(format!(
                "Auth db create_bounce response: {}",
                status
            )))?,
        }
    }
}

#[derive(Debug)]
struct DbUrls {
    get_bounces: Url,
    create_bounce: Url,
}

impl DbUrls {
    pub fn new(settings: &Settings) -> DbUrls {
        let base_uri: Url = settings
            .authdb
            .baseuri
            .as_ref()
            .parse()
            .expect("invalid base URI");
        DbUrls {
            get_bounces: base_uri.join("emailBounces/").expect("invalid base URI"),
            create_bounce: base_uri.join("emailBounces").expect("invalid base URI"),
        }
    }

    pub fn get_bounces(&self, address: &EmailAddress) -> Result<Url, UrlError> {
        self.get_bounces.join(&hex::encode(address.as_ref()))
    }

    pub fn create_bounce(&self) -> Url {
        self.create_bounce.clone()
    }
}
