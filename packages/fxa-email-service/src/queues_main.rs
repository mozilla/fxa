// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, you can obtain one at https://mozilla.org/MPL/2.0/.

#![feature(assoc_unix_epoch)]
#![feature(try_from)]
#![feature(type_ascription)]

extern crate chrono;
extern crate config;
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

use queues::{QueueIds, Queues, Sqs};
use settings::Settings;

fn main() {
    let settings = Settings::new().expect("config error");
    let sqs_urls = match settings.aws.sqsurls {
        Some(ref urls) => urls,
        None => panic!("Missing config: aws.sqsurls.*"),
    };
    let queue_ids = QueueIds {
        bounce: &sqs_urls.bounce,
        complaint: &sqs_urls.complaint,
        delivery: &sqs_urls.delivery,
        notification: &sqs_urls.notification,
    };
    let queues = Queues::new::<Sqs>(&queue_ids, &settings);
    loop {
        match queues.process() {
            Ok(count) => println!("Processed {} messages", count),
            Err(error) => println!("{:?}", error),
        }
    }
}
