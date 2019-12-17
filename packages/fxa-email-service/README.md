# fxa_email_service

[![License](https://img.shields.io/github/license/mozilla/fxa-email-service.svg?style=flat-square)](https://opensource.org/licenses/MPL-2.0)

- [What's this?](#whats-this)
- [How can I set up a dev environment?](#how-can-i-set-up-a-dev-environment)
  - [For standalone development](#for-standalone-development)
  - [As part of the FxA stack](#as-part-of-the-FxA-stack)
- [How do I run the tests?](#how-do-i-run-the-tests)
- [How can I send an email via SES?](#how-can-i-send-an-email-via-ses)
- [How can I send an email via Sendgrid?](#how-can-i-send-an-email-via-sendgrid)
- [How do bounce, complaint and delivery notifications work?](#how-do-bounce-complaint-and-delivery-notifications-work)

## What's this?

The FxA team had an OKR for Q2 2018
about decoupling the auth server from SES
and making it possible to send email
via different providers.
Subsequently,
some other teams expressed an interest in
depending on a standalone email service too.

This repo started as our experiment
to see what a decoupled email-sending service would look like,
written in Rust.
It is now handling all FxA email traffic in production,
and we are gradually separating it from the FxA stack
to run as a standalone service
in its own right.

You can find out more
about the structure of the code
from the [developer docs](https://mozilla.github.io/fxa/fxa-email-service/fxa_email_service).

## How can I set up a dev environment?

### For standalone development

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

### As part of the FxA stack

If you're developing for FxA,
the easiest thing to do is
set up [`fxa-local-dev`](https://github.com/mozilla/fxa-local-dev).
That will install everything you need
for running locally,
including all of the other FxA services.

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
which will be the case if you're running `fxa-local-dev`

If that's not the case, don't worry.
There is another script provided
to save you even more keystrokes
if you're running standalone:

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

- `FXA_EMAIL_AWS_KEYS_ACCESS`
- `FXA_EMAIL_AWS_KEYS_SECRET`

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

- `FXA_EMAIL_SENDER_ADDRESS`
- `FXA_EMAIL_SENDER_NAME`

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
cargo r --bin fxa_email_send
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
cargo r --bin fxa_email_send
```

Or you can use the shortcut:

```
./r
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

For consistency with the implementation in the FxA auth server,
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

- `FXA_EMAIL_AWS_REGION`
- `FXA_EMAIL_AWS_SQSURLS_BOUNCE`
- `FXA_EMAIL_AWS_SQSURLS_COMPLAINT`
- `FXA_EMAIL_AWS_SQSURLS_DELIVERY`
- `FXA_EMAIL_AWS_SQSURLS_NOTIFICATION`

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
cargo r --bin fxa_email_queues
```

There's also a shortcut for this:

```
./rq
```
