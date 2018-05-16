// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, you can obtain one at https://mozilla.org/MPL/2.0/.

use super::*;

#[test]
fn get_email_bounces() {
    let settings = Settings::new().expect("config error");
    let db = DbClient::new(&settings);
    if let Err(error) = db.get_email_bounces("foo@example.com") {
        assert!(false, error.description().to_string());
    }
}

#[test]
fn get_email_bounces_invalid_address() {
    let settings = Settings::new().expect("config error");
    let db = DbClient::new(&settings);
    match db.get_email_bounces("") {
        Ok(_) => assert!(false, "DbClient::get_email_bounces should have failed"),
        Err(error) => assert_eq!(error.description(), "auth db response: 400 Bad Request"),
    }
}
