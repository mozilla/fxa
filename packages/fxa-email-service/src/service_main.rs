// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, you can obtain one at https://mozilla.org/MPL/2.0/.

#![feature(assoc_unix_epoch)]
#![feature(plugin)]
#![feature(try_from)]
#![feature(type_ascription)]
#![plugin(rocket_codegen)]

extern crate config;
extern crate hex;
#[macro_use]
extern crate lazy_static;
extern crate regex;
extern crate reqwest;
extern crate rocket;
#[macro_use]
extern crate rocket_contrib;
extern crate rusoto_core;
extern crate rusoto_credential;
extern crate rusoto_ses;
extern crate serde;
#[macro_use]
extern crate serde_derive;
extern crate serde_json;
extern crate validator;
#[macro_use]
extern crate validator_derive;

mod auth_db;
mod bounces;
mod deserialize;
mod duration;
mod providers;
mod send;
mod settings;
mod validate;

fn main() {
    rocket::ignite().mount("/", routes![send::handler]).launch();
}
