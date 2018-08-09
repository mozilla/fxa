// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, you can obtain one at https://mozilla.org/MPL/2.0/.

use duration::*;

#[test]
fn without_multipliers() {
    match Duration::try_from("second") {
        Ok(duration) => assert_eq!(duration.into(): u64, 1000),
        Err(error) => assert!(false, format!("{}", error)),
    }

    match Duration::try_from("seconds") {
        Ok(duration) => assert_eq!(duration.into(): u64, 1000),
        Err(error) => assert!(false, format!("{}", error)),
    }

    match Duration::try_from("minute") {
        Ok(duration) => assert_eq!(duration.into(): u64, 60000),
        Err(error) => assert!(false, format!("{}", error)),
    }

    match Duration::try_from("hour") {
        Ok(duration) => assert_eq!(duration.into(): u64, 3600000),
        Err(error) => assert!(false, format!("{}", error)),
    }

    match Duration::try_from("day") {
        Ok(duration) => assert_eq!(duration.into(): u64, 86400000),
        Err(error) => assert!(false, format!("{}", error)),
    }

    match Duration::try_from("week") {
        Ok(duration) => assert_eq!(duration.into(): u64, 604800000),
        Err(error) => assert!(false, format!("{}", error)),
    }

    match Duration::try_from("month") {
        Ok(duration) => assert_eq!(duration.into(): u64, 2592000000),
        Err(error) => assert!(false, format!("{}", error)),
    }

    match Duration::try_from("year") {
        Ok(duration) => assert_eq!(duration.into(): u64, 31536000000),
        Err(error) => assert!(false, format!("{}", error)),
    }
}

#[test]
fn with_multipliers() {
    match Duration::try_from("2 seconds") {
        Ok(duration) => assert_eq!(duration.into(): u64, 2000),
        Err(error) => assert!(false, format!("{}", error)),
    }

    match Duration::try_from("2 second") {
        Ok(duration) => assert_eq!(duration.into(): u64, 2000),
        Err(error) => assert!(false, format!("{}", error)),
    }

    match Duration::try_from("3 seconds") {
        Ok(duration) => assert_eq!(duration.into(): u64, 3000),
        Err(error) => assert!(false, format!("{}", error)),
    }

    match Duration::try_from("0 seconds") {
        Ok(duration) => assert_eq!(duration.into(): u64, 0),
        Err(error) => assert!(false, format!("{}", error)),
    }

    match Duration::try_from("2 minutes") {
        Ok(duration) => assert_eq!(duration.into(): u64, 120000),
        Err(error) => assert!(false, format!("{}", error)),
    }

    match Duration::try_from("2 hours") {
        Ok(duration) => assert_eq!(duration.into(): u64, 7200000),
        Err(error) => assert!(false, format!("{}", error)),
    }

    match Duration::try_from("2 days") {
        Ok(duration) => assert_eq!(duration.into(): u64, 172800000),
        Err(error) => assert!(false, format!("{}", error)),
    }

    match Duration::try_from("2 weeks") {
        Ok(duration) => assert_eq!(duration.into(): u64, 1209600000),
        Err(error) => assert!(false, format!("{}", error)),
    }

    match Duration::try_from("2 months") {
        Ok(duration) => assert_eq!(duration.into(): u64, 5184000000),
        Err(error) => assert!(false, format!("{}", error)),
    }

    match Duration::try_from("2 years") {
        Ok(duration) => assert_eq!(duration.into(): u64, 63072000000),
        Err(error) => assert!(false, format!("{}", error)),
    }
}

#[test]
fn invalid_patterns() {
    match Duration::try_from("seconx") {
        Ok(_) => assert!(false, "Duration::try_from should have failed"),
        Err(error) => {
            assert_eq!(format!("{}", error), "invalid duration: seconx");
        }
    }

    match Duration::try_from("secondx") {
        Ok(_) => assert!(false, "Duration::try_from should have failed"),
        Err(error) => {
            assert_eq!(format!("{}", error), "invalid duration: secondx");
        }
    }

    match Duration::try_from("secondsx") {
        Ok(_) => assert!(false, "Duration::try_from should have failed"),
        Err(error) => {
            assert_eq!(format!("{}", error), "invalid duration: secondsx");
        }
    }

    match Duration::try_from(" second") {
        Ok(_) => assert!(false, "Duration::try_from should have failed"),
        Err(error) => {
            assert_eq!(format!("{}", error), "invalid duration:  second");
        }
    }

    match Duration::try_from("second ") {
        Ok(_) => assert!(false, "Duration::try_from should have failed"),
        Err(error) => {
            assert_eq!(format!("{}", error), "invalid duration: second ");
        }
    }

    match Duration::try_from("2x seconds") {
        Ok(_) => assert!(false, "Duration::try_from should have failed"),
        Err(error) => {
            assert_eq!(format!("{}", error), "invalid duration: 2x seconds");
        }
    }
}
