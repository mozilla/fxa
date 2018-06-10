// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, you can obtain one at https://mozilla.org/MPL/2.0/.

use std::{
    convert::{From, TryFrom},
    error::Error,
    fmt::{self, Display, Formatter},
};

use regex::Regex;

#[cfg(test)]
mod test;

// Durations are measured in milliseconds, to play nicely with
// the rest of the FxA ecosystem
const SECOND: u64 = 1000;
const MINUTE: u64 = SECOND * 60;
const HOUR: u64 = MINUTE * 60;
const DAY: u64 = HOUR * 24;
const WEEK: u64 = DAY * 7;
const MONTH: u64 = DAY * 30;
const YEAR: u64 = DAY * 365;

lazy_static! {
    static ref DURATION_FORMAT: Regex =
        Regex::new("^(?:([0-9]+) )?(second|minute|hour|day|week|month|year)s?$").unwrap();
}

#[derive(Debug)]
pub struct DurationError {
    pub value: String,
}

impl Error for DurationError {
    fn description(&self) -> &str {
        "invalid duration"
    }
}

impl Display for DurationError {
    fn fmt(&self, formatter: &mut Formatter) -> fmt::Result {
        write!(formatter, "invalid duration: {}", self.value)
    }
}

#[derive(Debug, PartialEq)]
pub struct Duration(u64);

impl From<Duration> for u64 {
    fn from(value: Duration) -> u64 {
        value.0
    }
}

impl<'v> TryFrom<&'v str> for Duration {
    type Error = DurationError;

    fn try_from(value: &str) -> Result<Duration, DurationError> {
        fn fail(value: &str) -> Result<Duration, DurationError> {
            Err(DurationError {
                value: value.to_string(),
            })
        }

        if let Some(matches) = DURATION_FORMAT.captures(value) {
            if let Ok(multiplier) = matches.get(1).map_or(Ok(1), |m| m.as_str().parse::<u64>()) {
                return match matches.get(2).map_or("", |m| m.as_str()) {
                    "second" => Ok(Duration(multiplier * SECOND)),
                    "minute" => Ok(Duration(multiplier * MINUTE)),
                    "hour" => Ok(Duration(multiplier * HOUR)),
                    "day" => Ok(Duration(multiplier * DAY)),
                    "week" => Ok(Duration(multiplier * WEEK)),
                    "month" => Ok(Duration(multiplier * MONTH)),
                    "year" => Ok(Duration(multiplier * YEAR)),
                    _ => fail(value),
                };
            }
        }

        fail(value)
    }
}
