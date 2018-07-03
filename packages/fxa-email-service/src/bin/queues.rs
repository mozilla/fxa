// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, you can obtain one at https://mozilla.org/MPL/2.0/.

//! The queue-processing loop for fxa_email_service.
//!
//! Configuration is via [`settings::Settings`][settings].
//!
//! [settings]: ../fxa_email_service/settings/struct.Settings.html

extern crate futures;
extern crate fxa_email_service;
#[macro_use]
extern crate lazy_static;

use futures::future::{self, Future, Loop};

use fxa_email_service::{
    queues::{QueueError, QueueIds, Queues, Sqs},
    settings::Settings,
};

lazy_static! {
    static ref SETTINGS: Settings = Settings::new().expect("config error");
    static ref QUEUES: Queues = {
        let sqs_urls = match SETTINGS.aws.sqsurls {
            Some(ref urls) => urls,
            None => panic!("Missing config: aws.sqsurls.*"),
        };
        Queues::new::<Sqs>(
            QueueIds {
                bounce: sqs_urls.bounce.clone(),
                complaint: sqs_urls.complaint.clone(),
                delivery: sqs_urls.delivery.clone(),
                notification: sqs_urls.notification.clone(),
            },
            &SETTINGS,
        )
    };
}

type LoopResult = Box<Future<Item = Loop<usize, usize>, Error = QueueError>>;

fn main() {
    let process_queues: &Fn(usize) -> LoopResult = &|previous_count: usize| {
        let future = QUEUES
            .process()
            .or_else(|error: QueueError| {
                println!("{:?}", error);
                future::ok(0)
            })
            .and_then(move |count: usize| {
                let total_count = count + previous_count;
                println!(
                    "Processed {} messages, total message count is now {}",
                    count, total_count
                );
                Ok(Loop::Continue(total_count))
            });
        Box::new(future)
    };
    future::loop_fn(0, process_queues).wait().unwrap();
}
