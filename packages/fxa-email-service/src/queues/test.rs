// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, you can obtain one at https://mozilla.org/MPL/2.0/.

use super::*;

// Although these tests look quite pointless, the implementation of the mock
// means they do achieve a few things that may not be obvious:
//
//  * They ensure that Outgoing methods aren't invoked on Incoming queues and
//    vice versa.
//
//  * They assert that no errors bubble out of the queues with normal inputs.
//
//  * They assert that an error is returned if there is a mismatch between
//    notification_type and the rest of the notification body.
//
//  * They exercise most of the queue-handling code to make sure it runs with
//    no panics.

lazy_static! {
    static ref SETTINGS: Settings = Settings::new().expect("config error");
    static ref GOOD_QUEUES: Queues = Queues::new::<mock::Queue>(
        QueueIds {
            bounce: String::from("incoming-bounce"),
            complaint: String::from("incoming-complaint"),
            delivery: String::from("incoming-delivery"),
            notification: String::from("outgoing"),
        },
        &SETTINGS
    );
    static ref BAD_BOUNCE_QUEUE: Queues = Queues::new::<mock::Queue>(
        QueueIds {
            bounce: String::from("incoming-bounce-error"),
            complaint: String::from("incoming-complaint"),
            delivery: String::from("incoming-delivery"),
            notification: String::from("outgoing"),
        },
        &SETTINGS
    );
}

#[test]
fn process() {
    match GOOD_QUEUES.process().wait() {
        Ok(count) => assert_eq!(count, 3),
        Err(error) => assert!(false, format!("{}", error)),
    }
}

#[test]
fn process_error() {
    match BAD_BOUNCE_QUEUE.process().wait() {
        Ok(_) => assert!(false, "Queues::process should have failed"),
        Err(error) => assert_eq!(
            &format!("{}", error),
            "Invalid notification: missing bounce payload",
        ),
    }
}
