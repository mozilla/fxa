// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, you can obtain one at https://mozilla.org/MPL/2.0/.

#![feature(plugin)]
#![plugin(rocket_codegen)]

extern crate config;
#[macro_use]
extern crate lazy_static;
extern crate regex;
extern crate rocket;
#[macro_use]
extern crate rocket_contrib;
extern crate rusoto_core;
extern crate rusoto_ses;
extern crate serde;
#[macro_use]
extern crate serde_derive;
extern crate serde_json;
extern crate validator;
#[macro_use]
extern crate validator_derive;

mod deserialize;
mod providers;
mod send;
mod settings;
mod validate;

fn main()
{
  rocket::ignite().mount("/", routes![send::handler]).launch();
}
