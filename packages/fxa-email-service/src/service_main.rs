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
extern crate sendgrid;
extern crate serde;
#[macro_use]
extern crate serde_derive;
extern crate serde_json;

mod app_errors;
mod auth_db;
mod bounces;
mod deserialize;
mod duration;
mod providers;
mod send;
mod settings;
mod validate;

fn main() {
    rocket::ignite()
        .mount("/", routes![send::handler])
        .catch(errors![
            app_errors::bad_request,
            app_errors::not_found,
            app_errors::method_not_allowed,
            app_errors::unprocessable_entity,
            app_errors::too_many_requests,
            app_errors::internal_server_error
        ])
        .launch();
}
