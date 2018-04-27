#![feature(plugin)]
#![plugin(rocket_codegen)]

extern crate rocket;
#[macro_use]
extern crate rocket_contrib;
#[macro_use]
extern crate serde_derive;
extern crate serde_json;
extern crate validator;
#[macro_use]
extern crate validator_derive;

mod send;

fn main()
{
  rocket::ignite().mount("/", routes![send::handler]).launch();
}
