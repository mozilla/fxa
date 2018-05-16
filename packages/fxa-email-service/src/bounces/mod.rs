// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, you can obtain one at https://mozilla.org/MPL/2.0/.

use std::{
    collections::HashMap, error::Error, fmt::{self, Display, Formatter}, time::SystemTime,
};

use rocket::{http::Status, response::Failure};

use auth_db::{BounceRecord, BounceType, Db, DbError};
use settings::{BounceLimit, BounceLimits, Settings};

#[cfg(test)]
mod test;

#[derive(Debug)]
pub struct BounceError {
    pub address: String,
    pub bounce: Option<BounceRecord>,
    description: String,
}

impl BounceError {
    pub fn new(address: &str, bounce: BounceRecord) -> BounceError {
        let description = format!(
            "email address violated {} limit",
            match bounce.bounce_type {
                BounceType::Hard => "hard bounce",
                BounceType::Soft => "soft bounce",
                BounceType::Complaint => "complaint",
            }
        );

        BounceError {
            address: address.to_string(),
            bounce: Some(bounce),
            description,
        }
    }
}

impl Error for BounceError {
    fn description(&self) -> &str {
        &self.description
    }
}

impl Display for BounceError {
    fn fmt(&self, formatter: &mut Formatter) -> fmt::Result {
        write!(formatter, "{}", self.description)
    }
}

impl From<DbError> for BounceError {
    fn from(error: DbError) -> BounceError {
        BounceError {
            address: String::from(""),
            bounce: None,
            description: format!("database error: {}", error.description()),
        }
    }
}

impl From<BounceError> for Failure {
    fn from(_error: BounceError) -> Failure {
        // Eventually we should be able to do something richer than this,
        // as per https://github.com/SergioBenitez/Rocket/issues/586.
        Failure(Status::TooManyRequests)
    }
}

pub struct Bounces<'a> {
    db: Box<&'a Db>,
    limits: &'a BounceLimits,
}

impl<'a> Bounces<'a> {
    pub fn new(settings: &'a Settings, db: Box<&'a Db>) -> Bounces<'a> {
        Bounces {
            db,
            limits: &settings.bouncelimits,
        }
    }

    pub fn check(&self, address: &str) -> Result<(), BounceError> {
        let bounces = self.db.get_email_bounces(address)?;
        let now = SystemTime::now()
            .duration_since(SystemTime::UNIX_EPOCH)
            .expect("system time error");
        let now = now.as_secs() * 1000;
        bounces
            .iter()
            .try_fold(HashMap::new(), |mut counts, bounce| {
                {
                    let count = counts.entry(&bounce.bounce_type).or_insert(0);
                    *count += 1;
                    let limits = match bounce.bounce_type {
                        BounceType::Hard => &self.limits.hard,
                        BounceType::Soft => &self.limits.soft,
                        BounceType::Complaint => &self.limits.complaint,
                    };
                    if is_bounce_violation(*count, bounce.created_at, now, limits) {
                        return Err(BounceError::new(address, *bounce));
                    }
                }

                Ok(counts)
            })
            .map(|_| ())
    }
}

unsafe impl<'a> Sync for Bounces<'a> {}

fn is_bounce_violation(count: u8, created_at: u64, now: u64, limits: &Vec<BounceLimit>) -> bool {
    for limit in limits.iter() {
        if count > limit.limit && created_at >= now - limit.period {
            return true;
        }
    }

    false
}
