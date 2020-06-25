// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, you can obtain one at https://mozilla.org/MPL/2.0/.

//! These are the developer docs
//! for the Firefox Accounts email-sending service.
//! For higher-level documentation,
//! see the [readme].
//!
//! The project is compiled as a library
//! that is linked against by
//! two separate binaries:
//!
//! * [`fxa_email_send`][send] runs a Rocket server
//!   exposing an endpoint that enables callers
//!   to send email.
//!
//! * [`fxa_email_queues`][queues] runs a process
//!   that loops infinitely,
//!   polling SQS queues for
//!   SES bounce, complaint and delivery notifications.
//!
//! [readme]: https://github.com/mozilla/fxa/blob/main/packages/fxa-email-service/README.md
//! [send]: ../fxa_email_send/index.html
//! [queues]: ../fxa_email_queues/index.html

#![feature(decl_macro)]
#![feature(proc_macro_hygiene)]
#![feature(plugin)]
#![feature(type_ascription)]

extern crate base64;
extern crate chrono;
extern crate config;
extern crate emailmessage;
extern crate failure;
extern crate futures;
extern crate hex;
extern crate hmac;
extern crate http;
extern crate hyperx;
#[macro_use]
extern crate lazy_static;
extern crate lettre;
extern crate lettre_email;
extern crate md5;
extern crate rand;
extern crate redis;
extern crate regex;
extern crate reqwest;
#[macro_use]
extern crate rocket;
#[macro_use]
extern crate rocket_contrib;
extern crate roxmltree;
extern crate rusoto_core;
extern crate rusoto_credential;
extern crate rusoto_ses;
extern crate rusoto_sqs;
extern crate sendgrid;
extern crate sentry;
extern crate serde;
#[macro_use]
extern crate serde_derive;
extern crate serde_json;
extern crate serde_test;
extern crate sha2;
#[macro_use(slog_o)]
extern crate slog;
extern crate slog_async;
extern crate slog_mozlog_json;
#[macro_use]
extern crate slog_scope;
extern crate slog_term;
extern crate socketlabs;
extern crate uuid;

pub mod api;
pub mod db;
pub mod logging;
pub mod providers;
pub mod queues;
pub mod settings;
pub mod types;
