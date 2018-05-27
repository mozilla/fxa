// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, you can obtain one at https://mozilla.org/MPL/2.0/.

#![feature(assoc_unix_epoch)]
#![feature(try_from)]
#![feature(type_ascription)]

extern crate chrono;
extern crate config;
extern crate futures;
extern crate hex;
#[macro_use]
extern crate lazy_static;
extern crate md5;
extern crate regex;
extern crate reqwest;
extern crate rusoto_core;
extern crate rusoto_credential;
extern crate rusoto_ses;
extern crate rusoto_sqs;
extern crate serde;
#[macro_use]
extern crate serde_derive;
extern crate serde_json;

mod auth_db;
mod deserialize;
mod duration;
mod queues;
mod settings;
mod validate;

use futures::future::{self, Future, Loop};

use queues::{QueueError, QueueIds, Queues, Sqs};
use settings::Settings;

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
