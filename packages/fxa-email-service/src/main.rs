#![feature(plugin)]
#![plugin(rocket_codegen)]

extern crate config;
#[macro_use]
extern crate lazy_static;
extern crate regex;
extern crate rocket;
#[macro_use]
extern crate rocket_contrib;
extern crate serde;
#[macro_use]
extern crate serde_derive;
extern crate serde_json;
extern crate validator;
#[macro_use]
extern crate validator_derive;

mod deserialize;
mod send;
mod settings;

fn main()
{
  rocket::ignite().mount("/", routes![send::handler]).launch();
}
