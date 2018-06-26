// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, you can obtain one at https://mozilla.org/MPL/2.0/.

#![feature(assoc_unix_epoch)]
#![feature(plugin)]
#![feature(try_from)]
#![feature(type_ascription)]
#![plugin(rocket_codegen)]

extern crate base64;
extern crate chrono;
extern crate config;
extern crate emailmessage;
#[macro_use]
extern crate failure;
extern crate futures;
extern crate hex;
extern crate hmac;
#[macro_use]
extern crate lazy_static;
extern crate md5;
extern crate mozsvc_common;
extern crate rand;
extern crate redis;
extern crate regex;
extern crate reqwest;
extern crate rocket;
#[macro_use]
extern crate rocket_contrib;
extern crate rusoto_core;
extern crate rusoto_credential;
extern crate rusoto_ses;
extern crate rusoto_sqs;
extern crate sendgrid;
extern crate serde;
#[macro_use]
extern crate serde_derive;
extern crate serde_json;
extern crate serde_test;
extern crate sha2;
#[macro_use(
    slog_b, slog_error, slog_info, slog_kv, slog_log, slog_o, slog_record, slog_record_static
)]
extern crate slog;
extern crate slog_async;
extern crate slog_mozlog_json;
extern crate slog_term;

pub mod app_errors;
pub mod auth_db;
pub mod bounces;
pub mod deserialize;
pub mod duration;
pub mod logging;
pub mod message_data;
pub mod providers;
pub mod queues;
pub mod send;
pub mod serialize;
pub mod settings;
pub mod validate;
