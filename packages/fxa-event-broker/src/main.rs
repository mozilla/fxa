// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, you can obtain one at https://mozilla.org/MPL/2.0/.

//! These are the developer docs
//! for the Firefox Accounts event broker.
//! For higher-level documentation,
//! see the [readme].
//!
//! [readme]: https://github.com/mozilla/fxa/blob/master/packages/fxa-event-broker/README.md#fxa-event-broker

#![feature(type_ascription)]

mod incoming;
mod settings;
mod types;

use futures::future::{self, Future, Loop};
use lazy_static::lazy_static;

use crate::{incoming::Incoming, settings::Settings, types::error::AppError};

lazy_static! {
    static ref SETTINGS: Settings = Settings::new().unwrap();
    static ref INCOMING: Incoming = Incoming::new(&SETTINGS);
}

type LoopResult = Box<Future<Item = Loop<usize, usize>, Error = AppError>>;

fn main() {
    let process_queues: &Fn(usize) -> LoopResult = &|previous_count: usize| {
        let future = INCOMING.read().and_then(move |events| {
            events.iter().for_each(|event| {
                // TODO: process events
                INCOMING.delete(&event.receipt_handle);
            });
            Ok(Loop::Continue(previous_count + events.len()))
        });
        Box::new(future)
    };
    let mut runtime = tokio::runtime::current_thread::Runtime::new().unwrap();
    runtime
        .block_on(future::loop_fn(0, process_queues))
        .unwrap();
}
