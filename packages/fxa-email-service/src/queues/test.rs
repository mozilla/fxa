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
//  * They ensure that errors are returned if the wrong notification type is
//    found on a particular queue.
//
//  * They exercise most of the queue-handling code to make sure it runs with
//    no panics.

#[test]
fn process() {
    let settings = Settings::new().expect("config error");
    let ids = QueueIds {
        bounce: "incoming-bounce",
        complaint: "incoming-complaint",
        delivery: "incoming-delivery",
        notification: "outgoing",
    };
    let queues = Queues::new::<mock::Queue>(&ids, &settings);
    match queues.process() {
        Ok(count) => assert_eq!(count, 3),
        Err(error) => assert!(false, error.description().to_string()),
    }
}

#[test]
fn process_complaint_on_bounce_queue() {
    let settings = Settings::new().expect("config error");
    let ids = QueueIds {
        bounce: "incoming-complaint",
        complaint: "incoming-complaint",
        delivery: "incoming-delivery",
        notification: "outgoing",
    };
    let queues = Queues::new::<mock::Queue>(&ids, &settings);
    match queues.process() {
        Ok(_) => assert!(false, "Queues::process should have failed"),
        Err(error) => assert_eq!(
            error.description(),
            "Unexpected notification type in bounce queue: Complaint"
        ),
    }
}

#[test]
fn process_bounce_on_complaint_queue() {
    let settings = Settings::new().expect("config error");
    let ids = QueueIds {
        bounce: "incoming-bounce",
        complaint: "incoming-bounce",
        delivery: "incoming-delivery",
        notification: "outgoing",
    };
    let queues = Queues::new::<mock::Queue>(&ids, &settings);
    match queues.process() {
        Ok(_) => assert!(false, "Queues::process should have failed"),
        Err(error) => assert_eq!(
            error.description(),
            "Unexpected notification type in complaint queue: Bounce"
        ),
    }
}
