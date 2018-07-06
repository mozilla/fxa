// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, you can obtain one at https://mozilla.org/MPL/2.0/.

//! Bounce and complaint handling.

use std::{collections::HashMap, time::SystemTime};

use app_errors::{AppErrorKind, AppResult};
use auth_db::{BounceSubtype as DbBounceSubtype, BounceType as DbBounceType, Db};
use queues::notification::{BounceSubtype, BounceType, ComplaintFeedbackType};
use settings::{BounceLimit, BounceLimits, Settings};

#[cfg(test)]
mod test;

/// Bounce/complaint registry.
///
/// Currently just a nicer abstraction
/// over the `emailBounces` table
/// in `fxa-auth-db-mysql`,
/// but longer-term we'll migrate
/// to something specifically tailored
/// for this service.
#[derive(Debug)]
pub struct Bounces<D: Db> {
    db: D,
    limits: BounceLimits,
}

impl<D> Bounces<D>
where
    D: Db,
{
    /// Instantiate the registry.
    pub fn new(settings: &Settings, db: D) -> Bounces<D> {
        Bounces {
            db,
            limits: settings.bouncelimits.clone(),
        }
    }

    /// Check an email address
    /// against bounce/complaint records
    /// from the registry.
    ///
    /// If matching records are found,
    /// they are checked against thresholds
    /// defined in the [`BounceLimits` setting][limits].
    ///
    /// [limits]: ../settings/struct.BounceLimits.html
    pub fn check(&self, address: &str) -> AppResult<()> {
        let bounces = self.db.get_bounces(address)?;
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
                        DbBounceType::Hard => &self.limits.hard,
                        DbBounceType::Soft => &self.limits.soft,
                        DbBounceType::Complaint => &self.limits.complaint,
                    };
                    if is_bounce_violation(*count, bounce.created_at, now, limits) {
                        return match bounce.bounce_type {
                            DbBounceType::Hard => Err(AppErrorKind::BounceHardError {
                                _address: address.to_string(),
                                _bounce: Some(bounce.clone()),
                            }.into()),
                            DbBounceType::Soft => Err(AppErrorKind::BounceSoftError {
                                _address: address.to_string(),
                                _bounce: Some(bounce.clone()),
                            }.into()),
                            DbBounceType::Complaint => Err(AppErrorKind::BounceComplaintError {
                                _address: address.to_string(),
                                _bounce: Some(bounce.clone()),
                            }.into()),
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
        address: &str,
        bounce_type: BounceType,
        bounce_subtype: BounceSubtype,
    ) -> AppResult<()> {
        self.db
            .create_bounce(address, From::from(bounce_type), From::from(bounce_subtype))?;
        Ok(())
    }

    /// Record a complaint
    /// against an email address.
    pub fn record_complaint(
        &self,
        address: &str,
        complaint_type: Option<ComplaintFeedbackType>,
    ) -> AppResult<()> {
        let bounce_subtype = complaint_type.map_or(DbBounceSubtype::Unmapped, |ct| From::from(ct));
        self.db
            .create_bounce(address, DbBounceType::Complaint, bounce_subtype)?;
        Ok(())
    }
}

unsafe impl<D> Sync for Bounces<D> where D: Db {}

fn is_bounce_violation(count: u8, created_at: u64, now: u64, limits: &[BounceLimit]) -> bool {
    for limit in limits.iter() {
        if count > limit.limit && created_at >= now - limit.period.0 {
            return true;
        }
    }

    false
}
