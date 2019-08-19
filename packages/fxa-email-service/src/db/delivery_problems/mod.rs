// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, you can obtain one at https://mozilla.org/MPL/2.0/.

//! Bounce and complaint handling.

#[cfg(test)]
mod test;

use std::{collections::HashMap, time::SystemTime};

use chrono::{DateTime, TimeZone, Utc};
use serde::{
    de::{Deserialize, Deserializer, Error as DeserializeError, Unexpected},
    ser::{Serialize, Serializer},
};

use super::{
    auth_db::Db as AuthDb,
    core::{Client as DbClient, DataType},
};
use crate::{
    queues::notification::{BounceSubtype, BounceType, ComplaintFeedbackType},
    settings::{DeliveryProblemLimit, DeliveryProblemLimits, Settings},
    types::{
        email_address::EmailAddress,
        error::{AppErrorKind, AppResult},
    },
};

/// Bounce/complaint registry.
///
/// Currently this writes to both
/// Redis and the `emailBounces` table in `fxa-auth-db-mysql`,
/// but only reads from the latter.
/// This is the first step
/// in a gradual migration process
/// away from the auth db.
#[derive(Debug)]
pub struct DeliveryProblems<D: AuthDb> {
    auth_db: D,
    db: DbClient,
    limits: DeliveryProblemLimits,
}

impl<D> DeliveryProblems<D>
where
    D: AuthDb,
{
    /// Instantiate the registry.
    pub fn new(settings: &Settings, auth_db: D) -> DeliveryProblems<D> {
        DeliveryProblems {
            auth_db,
            db: DbClient::new(settings),
            limits: settings.deliveryproblemlimits.clone(),
        }
    }

    /// Check multiple email addresses
    /// against bounce/complaint records
    /// from the registry.
    ///
    /// Addresses that violate thresholds
    /// defined in the [`DeliveryProblemLimits` setting][limits]
    /// will be dropped from the returned data.
    /// If the `to` address violates a threshold,
    /// it will be optimistically replaced
    /// in the returned data
    /// by a non-violating `cc` address.
    /// If there are no non-violating addresses,
    /// the function will fail.
    pub fn check_all<'e>(
        &self,
        to: &'e EmailAddress,
        cc: &'e [EmailAddress],
    ) -> AppResult<(&'e str, Vec<&'e str>)> {
        let mut cc: Vec<&str> = cc.iter().fold(Vec::new(), |mut addresses, address| {
            if self.check(&address).is_ok() {
                addresses.push(address.as_ref());
            }
            addresses
        });

        let to = if let Err(error) = self.check(&to) {
            if cc.len() == 0 {
                return Err(error);
            } else {
                cc.pop().unwrap()
            }
        } else {
            to.as_ref()
        };

        Ok((to, cc))
    }

    /// Check an email address
    /// against bounce/complaint records
    /// from the registry.
    ///
    /// If matching records are found,
    /// they are checked against thresholds
    /// defined in the [`DeliveryProblemLimits` setting][limits].
    ///
    /// [limits]: ../settings/struct.DeliveryProblemLimits.html
    pub fn check(&self, address: &EmailAddress) -> AppResult<()> {
        let problems = self.auth_db.get_bounces(address)?;
        // TODO: When we start reading from the new datastore, use Utc::now() here instead
        let timestamp = now();
        problems
            .iter()
            .try_fold(HashMap::new(), |mut counts, problem| {
                {
                    let count = counts.entry(&problem.problem_type).or_insert(0);
                    *count += 1;
                    let limits = match problem.problem_type {
                        ProblemType::HardBounce => &self.limits.hard,
                        ProblemType::SoftBounce => &self.limits.soft,
                        ProblemType::Complaint => &self.limits.complaint,
                    };
                    if is_limit_violation(*count, problem.created_at, timestamp, limits) {
                        return match problem.problem_type {
                            ProblemType::HardBounce => Err(AppErrorKind::HardBounce {
                                address: address.clone(),
                                time: problem.created_at,
                                problem: From::from(problem.clone()),
                            })?,
                            ProblemType::SoftBounce => Err(AppErrorKind::SoftBounce {
                                address: address.clone(),
                                time: problem.created_at,
                                problem: From::from(problem.clone()),
                            })?,
                            ProblemType::Complaint => Err(AppErrorKind::Complaint {
                                address: address.clone(),
                                time: problem.created_at,
                                problem: From::from(problem.clone()),
                            })?,
                        };
                    }
                }

                Ok(counts)
            })
            .map(|_| ())
    }

    /// Record a hard or soft bounce
    /// against an email address.
    pub fn record_bounce(
        &self,
        address: &EmailAddress,
        bounce_type: BounceType,
        bounce_subtype: BounceSubtype,
        timestamp: DateTime<Utc>,
    ) -> AppResult<()> {
        let problem_type: ProblemType = From::from(bounce_type);
        let problem_subtype: ProblemSubtype = From::from(bounce_subtype);
        self.auth_db
            .create_bounce(address, problem_type, problem_subtype)?;
        self.record_delivery_problem(address, problem_type, problem_subtype, timestamp)?;
        Ok(())
    }

    fn record_delivery_problem(
        &self,
        address: &EmailAddress,
        problem_type: ProblemType,
        problem_subtype: ProblemSubtype,
        timestamp: DateTime<Utc>,
    ) -> AppResult<()> {
        let mut problems: Vec<DeliveryProblem> = self
            .db
            .get(address.as_ref(), DataType::DeliveryProblem)?
            .unwrap_or_else(|| Vec::new());

        // TODO: A direct port of the auth db behaviour here would insert at the
        //       start rather than append to the end of the list. But it's more
        //       efficient for us to append here and then process the list in
        //       reverse instead. So when we come to processing data from this
        //       data store, we must be careful to call `.rev()` beforehand (but
        //       hopefully that will also be obvious from the failing tests without
        //       needing to rely on this comment).
        problems.push(DeliveryProblem {
            address: address.clone(),
            problem_type,
            problem_subtype,
            created_at: timestamp,
        });

        self.db
            .set(address.as_ref(), &problems, DataType::DeliveryProblem)?;

        Ok(())
    }

    /// Record a complaint
    /// against an email address.
    pub fn record_complaint(
        &self,
        address: &EmailAddress,
        complaint_type: Option<ComplaintFeedbackType>,
        timestamp: DateTime<Utc>,
    ) -> AppResult<()> {
        let problem_subtype = complaint_type.map_or(ProblemSubtype::Unmapped, |ct| From::from(ct));
        self.auth_db
            .create_bounce(address, ProblemType::Complaint, problem_subtype)?;
        self.record_delivery_problem(address, ProblemType::Complaint, problem_subtype, timestamp)?;
        Ok(())
    }
}

unsafe impl<D> Sync for DeliveryProblems<D> where D: AuthDb {}

fn is_limit_violation(
    count: u8,
    created_at: u64,
    timestamp: u64,
    limits: &[DeliveryProblemLimit],
) -> bool {
    for limit in limits.iter() {
        if count > limit.limit && created_at >= timestamp - limit.period.0 {
            return true;
        }
    }

    false
}

fn now() -> u64 {
    let now = SystemTime::now()
        .duration_since(SystemTime::UNIX_EPOCH)
        .expect("system time error");
    now.as_secs() * 1000 + u64::from(now.subsec_millis())
}

/// Encapsulates some kind of delivery problem,
/// either a bounced email or a complaint.
#[derive(Clone, Debug, Deserialize, Eq, PartialEq, Serialize)]
pub struct DeliveryProblem {
    pub address: EmailAddress,
    pub problem_type: ProblemType,
    pub problem_subtype: ProblemSubtype,
    pub created_at: DateTime<Utc>,
}

impl From<LegacyDeliveryProblem> for DeliveryProblem {
    fn from(source: LegacyDeliveryProblem) -> Self {
        Self {
            address: source.address,
            problem_type: source.problem_type,
            problem_subtype: source.problem_subtype,
            created_at: Utc.timestamp(
                source.created_at as i64 / 1000,
                (source.created_at % 1000) as u32 * 1000000,
            ),
        }
    }
}

/// Legacy delivery problem abstraction,
/// not to be used by new code.
///
/// The serialised format uses historical names
/// that carry match [`fxa-auth-db-mysql`](https://github.com/mozilla/fxa-auth-db-mysql/).
/// We don't want to pollute our own data store
/// with that nomenclature.
#[derive(Clone, Debug, Deserialize, Eq, PartialEq, Serialize)]
pub struct LegacyDeliveryProblem {
    #[serde(rename = "email")]
    pub address: EmailAddress,
    #[serde(rename = "bounceType")]
    pub problem_type: ProblemType,
    #[serde(rename = "bounceSubType")]
    pub problem_subtype: ProblemSubtype,
    #[serde(rename = "createdAt")]
    pub created_at: u64,
}

impl From<DeliveryProblem> for LegacyDeliveryProblem {
    fn from(source: DeliveryProblem) -> Self {
        Self {
            address: source.address,
            problem_type: source.problem_type,
            problem_subtype: source.problem_subtype,
            created_at: source.created_at.timestamp_millis() as u64,
        }
    }
}

/// The type of the delivery problem.
///
/// Either a hard (permanent) bounce,
/// a soft (transient) bounce
/// or a complaint, such as
/// a user marking an email as spam.
#[derive(Clone, Copy, Debug, Eq, Hash, PartialEq)]
pub enum ProblemType {
    HardBounce,
    SoftBounce,
    Complaint,
}

impl<'d> Deserialize<'d> for ProblemType {
    fn deserialize<D>(deserializer: D) -> Result<Self, D::Error>
    where
        D: Deserializer<'d>,
    {
        let value: u8 = Deserialize::deserialize(deserializer)?;
        match value {
            // The auth db falls back to zero when it receives a value it doesn't recognise.
            // We can remove this match arm when auth db support has been removed.
            0 => {
                println!("Mapped default auth db bounce type to ProblemType::SoftBounce");
                Ok(ProblemType::SoftBounce)
            }
            1 => Ok(ProblemType::HardBounce),
            2 => Ok(ProblemType::SoftBounce),
            3 => Ok(ProblemType::Complaint),
            _ => Err(D::Error::invalid_value(
                Unexpected::Unsigned(u64::from(value)),
                &"problem type",
            )),
        }
    }
}

impl Serialize for ProblemType {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: Serializer,
    {
        let value = match self {
            ProblemType::HardBounce => 1,
            ProblemType::SoftBounce => 2,
            ProblemType::Complaint => 3,
        };
        serializer.serialize_u8(value)
    }
}

/// The problem subtype,
/// indicating the underlying cause
/// of a bounce or complaint.
#[derive(Clone, Copy, Debug, Eq, PartialEq)]
pub enum ProblemSubtype {
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

impl<'d> Deserialize<'d> for ProblemSubtype {
    fn deserialize<D>(deserializer: D) -> Result<Self, D::Error>
    where
        D: Deserializer<'d>,
    {
        let value: u8 = Deserialize::deserialize(deserializer)?;
        match value {
            0 => Ok(ProblemSubtype::Unmapped),
            1 => Ok(ProblemSubtype::Undetermined),
            2 => Ok(ProblemSubtype::General),
            3 => Ok(ProblemSubtype::NoEmail),
            4 => Ok(ProblemSubtype::Suppressed),
            5 => Ok(ProblemSubtype::MailboxFull),
            6 => Ok(ProblemSubtype::MessageTooLarge),
            7 => Ok(ProblemSubtype::ContentRejected),
            8 => Ok(ProblemSubtype::AttachmentRejected),
            9 => Ok(ProblemSubtype::Abuse),
            10 => Ok(ProblemSubtype::AuthFailure),
            11 => Ok(ProblemSubtype::Fraud),
            12 => Ok(ProblemSubtype::NotSpam),
            13 => Ok(ProblemSubtype::Other),
            14 => Ok(ProblemSubtype::Virus),
            _ => Err(D::Error::invalid_value(
                Unexpected::Unsigned(u64::from(value)),
                &"problem subtype",
            )),
        }
    }
}

impl Serialize for ProblemSubtype {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: Serializer,
    {
        let value = match self {
            ProblemSubtype::Unmapped => 0,
            ProblemSubtype::Undetermined => 1,
            ProblemSubtype::General => 2,
            ProblemSubtype::NoEmail => 3,
            ProblemSubtype::Suppressed => 4,
            ProblemSubtype::MailboxFull => 5,
            ProblemSubtype::MessageTooLarge => 6,
            ProblemSubtype::ContentRejected => 7,
            ProblemSubtype::AttachmentRejected => 8,
            ProblemSubtype::Abuse => 9,
            ProblemSubtype::AuthFailure => 10,
            ProblemSubtype::Fraud => 11,
            ProblemSubtype::NotSpam => 12,
            ProblemSubtype::Other => 13,
            ProblemSubtype::Virus => 14,
        };
        serializer.serialize_u8(value)
    }
}
