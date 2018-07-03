# fxa-email-service

[![Build status](https://img.shields.io/travis/mozilla/fxa-email-service.svg?style=flat-square)](https://travis-ci.org/mozilla/fxa-email-service)
[![CircleCI](https://circleci.com/gh/mozilla/fxa-email-service/tree/master.svg?style=svg)](https://circleci.com/gh/mozilla/fxa-email-service/tree/master)
[![License](https://img.shields.io/github/license/mozilla/fxa-email-service.svg?style=flat-square)](https://opensource.org/licenses/MPL-2.0)
![Under construction](https://camo.githubusercontent.com/45d551b3b690a49aa6d855f9fe28fd47a5effc82/68747470733a2f2f63646e2e74686561746c616e7469632e636f6d2f6173736574732f6d656469612f696d672f706f7374732f323031352f31302f6d616d61676e6f6c69615f6163726573756e646572636f6e737472756374696f6e2f6132613838353234352e676966)

* [What's this?](#whats-this)
* [Moving to a new service seems risky. How will that work?](#moving-to-a-new-service-seems-risky-how-will-that-work)
* [What are the long-term goals?](#what-are-the-long-term-goals)
* [How will you make sure the new service isn't just as tightly coupled to SES?](#how-will-you-make-sure-the-new-service-isnt-just-as-tightly-coupled-to-ses)
* [How can I set up a dev environment?](#how-can-i-set-up-a-dev-environment)
* [How do I run the tests?](#how-do-i-run-the-tests)
* [How can I send an email via SES?](#how-can-i-send-an-email-via-ses)
* [How can I send an email via Sendgrid?](#how-can-i-send-an-email-via-sendgrid)
* [How do bounce, complaint and delivery notifications work?](#how-do-bounce-complaint-and-delivery-notifications-work)

## What's this?

The FxA team have an OKR for Q2 2018
about decoupling the auth server from SES
and making it possible to send email
via different providers.
You can read more about that OKR
in the [feature doc](https://docs.google.com/document/d/1SZ_uGpqofUJeOjGAu2oRKqp-qEMLbvWt8UlxK4UbFwI).

This repo is our experiment
to see what a decoupled email-sending service would look like.
It's being written in Rust.

## Moving to a new service seems risky. How will that work?

As a first step,
we're doing a like-for-like extraction
of functionality from the auth server
and porting it to Rust
behind a very simple, single-endpoint API.
The plan is to run it on a closed port
on the same box as the auth server,
similar to how we run the auth db server.

Included in the code earmarked for extraction
is the logic for handling bounce, complaint and delivery notifications.
Because this logic is stateful,
the initial plan is for the new service
to lean on the db server directly
and re-use the same table and stored procedures
that are already being used.
So in that sense,
the switchover should be transparent
and we can even run the new service side-by-side
with the current auth server,
if we want to phase it in gradually.

## What are the long-term goals?

Ultimately, if everything goes to plan,
we'd like to run this as a standalone service
that can be used by other trusted reliers
from the Firefox/Application Services ecosystem.
But getting to that point will require
a number of features that are out of scope
for the initial release,
such as authentication, rate-limiting and a dedicated database.

## How will you make sure the new service isn't just as tightly coupled to SES?

The core functionality is going to be exposed behind traits
and we will limit the AWS-specific code
to AWS-specific trait implementations.
To keep ourselves honest about that separation,
we will also implement an alternative provider
that email can be routed by on a per-request basis.

## How can I set up a dev environment?

We're running on the Rust nightly channel,
so the easiest way to get set up
is with [`rustup`](https://rustup.rs/):

```
curl https://sh.rustup.rs -sSf | sh
```

If you don't want to use nightly as your default channel,
you can use it just for this repo instead
by installing nightly and then running `rustup override` in this directory:

```
rustup install nightly
rustup override set nightly
```

You will also need to install Redis.
If your Redis instance
is not running on the default port (6379),
you will need to set the correct port
in `config/local.json`:

```json
{
  "redis": {
    "port": "..."
  }
}
```

You can also set `host` in the same way,
if your Redis instance is not running locally.

## How do I run the tests?

A simple `cargo t` will fail
because some of the tests are not threadsafe
(they rely on setting environment variables
that will conflict with other concurrent tests).
To run the tests in a single thread instead,
a shell script is provided
to save you some keystrokes:

```
./t
```

That script assumes you have an instance of [`fxa-auth-db-mysql`](https://github.com/mozilla/fxa-auth-db-mysql)
running locally on port 8000,
which will be the case if you're running [`fxa-local-dev`](https://github.com/mozilla/fxa-local-dev).

If that's not the case, don't worry.
There is another script provided
to save you even more keystrokes:

```
./tdb
```

That script will clone a local copy of the db repo
and start it in the background.
At the end of the script,
the db process will be left running in the background
(but subsequent runs of the script
won't start extra db processes,
you'll only be left with that one).
If you want to kill your db process,
you can find it with:

```
ps -ef | grep "node bin/server"
```

## How can I send an email via SES?

You'll need to set up some config
with your AWS credentials.
That can be with environment variables:

* `FXA_EMAIL_AWS_KEYS_ACCESS`
* `FXA_EMAIL_AWS_KEYS_SECRET`

Or in `config/local.json`:

```json
{
  "aws": {
    "keys": {
      "access": "...",
      "secret": "..."
    }
  }
}
```

`config/local.json` is included in `.gitignore`,
so you don't have to worry about your keys
being accidentally leaked on GitHub.

Also note that the AWS IAM limits sending
to approved `from` addresses.
Again, you can set that via environment variables:

* `FXA_EMAIL_SENDER_ADDRESS`
* `FXA_EMAIL_SENDER_NAME`

Or in `config/local.json`:

```json
  "sender": {
    "address": "verification@latest.dev.lcip.org",
    "name": "Firefox Accounts"
  },
```

Once you have config set,
you can start the service with:

```
cargo r --bin fxa-email-service
```

Then you can use `curl`
to send requests:

```
curl \
  -d '{"to":"foo@example.com","subject":"bar","body":{"text":"baz"}}' \
  -H 'Content-Type: application/json' \
  http://localhost:8001/send
```

If everything is set-up correctly,
you should receive email pretty much instantly.

## How can I send an email via Sendgrid?

The process is broadly the same as for SES.
First set your Sendgrid API key,
either using the `FXA_EMAIL_SENGRID_KEY` environment variable
or in `config/local.json`:

```json
{
  "sendgrid": {
    "key": "..."
  }
}
```

Then start the service:

```
cargo r --bin fxa-email-service
```

Then set `provider` to `sendgrid` in your request payload:

```
curl \
  -d '{"to":"foo@example.com","subject":"bar","body":{"text":"baz"},"provider":"sendgrid"}' \
  -H 'Content-Type: application/json' \
  http://localhost:8001/send
```

If everything is set-up correctly,
you should receive email pretty much instantly.

## How do bounce, complaint and delivery notifications work?

For consistency with the implementation in the auth server,
three separate SQS queues are monitored
for bounce, complaint and delivery notifications.
Ultimately we expect to simplify this
to a single queue for all three notification types.

Messages on these queues
are JSON payloads of the format
described in the [AWS docs](https://docs.aws.amazon.com/ses/latest/DeveloperGuide/notification-contents.html)
and encoded in [`src/queues/sqs/notification/mod.rs`](src/queues/sqs/notification/mod.rs).

When a message is received,
three things happen in sequence:

1. For bounce and complaint notification types,
   a bounce record is created in the auth db.
   Errors are fatal at this point,
   steps `2` and `3` will not occur
   if the db returns an error.

2. The message is forwarded to the auth server
   via a fourth, outgoing queue.
   An error here is not fatal.

3. The message is deleted from the origin queue.

Currently, both the incoming and outgoing queues
happen to be SQS queues but,
since that's an implementation detail,
the code separates them
behind more abstract `Incoming` and `Outgoing` traits.

The queue URLs and region
are set via config,
either using environment variables:

* `FXA_EMAIL_AWS_REGION`
* `FXA_EMAIL_AWS_SQSURLS_BOUNCE`
* `FXA_EMAIL_AWS_SQSURLS_COMPLAINT`
* `FXA_EMAIL_AWS_SQSURLS_DELIVERY`
* `FXA_EMAIL_AWS_SQSURLS_NOTIFICATION`

Or in `config/local.json`:

```json
{
  "aws": {
    "region": "...",
    "sqsurls": {
      "bounce": "...",
      "complaint": "...",
      "delivery": "...",
      "notification": "..."
    }
  }
}
```

The queue-handling code runs in a different process
to the main email-sending service.
You can run it locally like so:

```
cargo r --bin fxa-email-queues
```
