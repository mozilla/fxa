// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, you can obtain one at https://mozilla.org/MPL/2.0/.

//! The main process for fxa-email-service.
//! Starts a Rocket server
//! that exposes one endpoint: `POST /send`
//!
//! Configuration is via [`settings::Settings`][settings].
//! By default the server listens on `127.0.0.1:8001`.
//!
//! [settings]: ../fxa_email_service/settings/struct.Settings.html

#![feature(proc_macro_hygiene)]

extern crate fxa_email_service;
#[macro_use]
extern crate rocket;
extern crate sentry;
extern crate slog;

use sentry::integrations::panic::register_panic_handler;

use fxa_email_service::{
    api::{healthcheck, send},
    db::{auth_db::DbClient, delivery_problems::DeliveryProblems, message_data::MessageData},
    logging::MozlogLogger,
    providers::Providers,
    settings::Settings,
};

fn main() {
    let settings = Settings::new().expect("Settings::new error");

    let sentry_dsn = if let Some(ref sentry) = settings.sentry {
        Some(sentry.dsn.0.parse().expect("settings.sentry.dsn error"))
    } else {
        None
    };
    let sentry = sentry::init(sentry::ClientOptions {
        dsn: sentry_dsn,
        release: sentry::release_name!(),
        ..Default::default()
    });

    if sentry.is_enabled() {
        register_panic_handler();
    }

    let db = DbClient::new(&settings);
    let delivery_problems = DeliveryProblems::new(&settings, db);
    let logger = MozlogLogger::new(&settings);
    let message_data = MessageData::new(&settings);
    let providers = Providers::new(&settings);

    let config = settings
        .build_rocket_config()
        .expect("Error creating rocket config");
    rocket::custom(config)
        .manage(settings)
        .manage(delivery_problems)
        .manage(logger)
        .manage(message_data)
        .manage(providers)
        .mount(
            "/",
            routes![
                send::handler,
                healthcheck::heartbeat,
                healthcheck::lbheartbeat,
                healthcheck::version
            ],
        )
        .attach(rocket::fairing::AdHoc::on_request("log.start", |request, _| {
            let log =
                MozlogLogger::with_request(request).expect("MozlogLogger::with_request error");
            slog::slog_info!(log, "{}", "Request started");
        }))
        .attach(rocket::fairing::AdHoc::on_response("log.summary", |request, response| {
            let log =
                MozlogLogger::with_request(request).expect("MozlogLogger::with_request error");
            if response.status().code == 200 {
                slog::slog_info!(log, "{}", "Request finished succesfully";
                    "status_code" => response.status().code, "status_msg" => response.status().reason);
            }
        }))
        .launch();
}
