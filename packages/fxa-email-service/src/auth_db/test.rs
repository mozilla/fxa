// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, you can obtain one at https://mozilla.org/MPL/2.0/.

use std::time::SystemTime;

use super::*;

#[test]
fn get_bounces() {
    let settings = Settings::new().expect("config error");
    let db = DbClient::new(&settings);
    if let Err(error) = db.get_bounces(&"foo@example.com".parse().unwrap()) {
        assert!(false, format!("{}", error));
    }
}

#[test]
fn create_bounce() {
    let settings = Settings::new().expect("config error");
    let db = DbClient::new(&settings);
    let email_addresses = vec![generate_email_address("foo"), generate_email_address("bar")];

    let bounces_before = db.get_bounces(&email_addresses[0]).expect("db error");
    let bounces_after = db
        .create_bounce(
            &email_addresses[0],
            ProblemType::HardBounce,
            ProblemSubtype::General,
        ).and_then(|_| db.get_bounces(&email_addresses[0]))
        .expect("db error");
    let now = now_as_milliseconds();

    // The next assertion is conditional because fxa-auth-db-mysql limits
    // the results from the fetchEmailBounce stored procedure to 20 rows.
    if bounces_before.len() == 20 {
        assert_eq!(bounces_after.len(), bounces_before.len());
    } else {
        assert_eq!(bounces_after.len(), bounces_before.len() + 1);
    }

    let bounce = &bounces_after[0];
    assert_eq!(bounce.address, email_addresses[0]);
    assert_eq!(bounce.problem_type, ProblemType::HardBounce);
    assert_eq!(bounce.problem_subtype, ProblemSubtype::General);
    assert!(bounce.created_at > now - 1000);

    let bounces_after = db
        .create_bounce(
            &email_addresses[1],
            ProblemType::SoftBounce,
            ProblemSubtype::MailboxFull,
        ).and_then(|_| {
            db.create_bounce(
                &email_addresses[1],
                ProblemType::Complaint,
                ProblemSubtype::Virus,
            )
        }).and_then(|_| db.get_bounces(&email_addresses[1]))
        .expect("db error");
    let now = now_as_milliseconds();

    let second_bounce = &bounces_after[1];
    assert_eq!(second_bounce.address, email_addresses[1]);
    assert_eq!(second_bounce.problem_type, ProblemType::SoftBounce);
    assert_eq!(second_bounce.problem_subtype, ProblemSubtype::MailboxFull);
    assert!(second_bounce.created_at > now - 1000);
    assert!(second_bounce.created_at > bounce.created_at);

    let third_bounce = &bounces_after[0];
    assert_eq!(third_bounce.address, email_addresses[1]);
    assert_eq!(third_bounce.problem_type, ProblemType::Complaint);
    assert_eq!(third_bounce.problem_subtype, ProblemSubtype::Virus);
    assert!(third_bounce.created_at > now - 1000);
    assert!(third_bounce.created_at > second_bounce.created_at);
}

fn generate_email_address(variant: &str) -> EmailAddress {
    format!(
        "fxa-email-service.test.auth-db.{}.{}@example.com",
        variant,
        now_as_milliseconds()
    ).parse()
    .unwrap()
}

fn now_as_milliseconds() -> u64 {
    let now = SystemTime::now()
        .duration_since(SystemTime::UNIX_EPOCH)
        .expect("system time error");
    now.as_secs() * 1000
}
