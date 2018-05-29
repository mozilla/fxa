// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, you can obtain one at https://mozilla.org/MPL/2.0/.

#![feature(assoc_unix_epoch)]
#![feature(try_from)]
#![feature(type_ascription)]

extern crate config;
extern crate hex;
#[macro_use]
extern crate lazy_static;
extern crate regex;
extern crate reqwest;
extern crate rusoto_core;
extern crate serde;
#[macro_use]
extern crate serde_derive;
extern crate serde_json;

mod auth_db;
mod deserialize;
mod duration;
mod settings;
mod validate;

fn main() {
    println!("Not implemented");
}
