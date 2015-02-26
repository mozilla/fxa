Firefox Accounts Customs Server
=======================

[![Build Status](https://travis-ci.org/mozilla/fxa-customs-server.svg?branch=master)](https://travis-ci.org/mozilla/fxa-customs-server)

This project is used by the [Firefox Accounts Auth Server](https://github.com/mozilla/fxa-auth-server) to detect and deter [fraud and abuse](https://wiki.mozilla.org/Identity/Firefox_Accounts/Fraud_and_abuse).

## Prerequisites
* node 0.10.x
* npm
* memcached
  * On Debian flavors of Linux: `sudo apt-get install memcached`
  * On Mac OS X: `brew install memcached`

## Install

Clone the git repository and install dependencies:

    git clone git://github.com/mozilla/fxa-customs-server.git
    cd fxa-customs-server
    npm install

To start the server, run:

    npm start

It will listen on http://127.0.0.1:7000 by default.

## Testing

Run tests with:

    npm test

On Mac OS X, memcached must be manually started for the tests to run.

    memcached &
    npm test

## Code

Here are the main components of this project:

- `bans/`: code implementing temporary bans of specific email or IP addresses and listening on the SQS API for requests
- `bin/customs_server.js`: process listening on the network and responding to HTTP API calls
- `config/config.js`: where all of the configuration options are defined
- `email_record.js`, `ip_email_record.js` and `ip_record.js`: code implementing the various blocking and rate-limiting policies
- `scripts`: helper scripts only used for development/testing
- `test/local`: unit tests
- `test/remote`: tests exercising the HTTP API

### API

See our [detailed API spec](/docs/api.md).

### Policies

There are three types of policies:

* rate-limiting: slows down attackers by temporarily blocking requests for 15 minutes (see `config.limits.rateLimitIntervalSeconds`)
* block / ban: stops attacks by temporarily blocking requests for 24 hours (see `config.limits.blockIntervalSeconds`)
* lockout: stops password-guessing attacks by permanently blocking password-authenticated requests until the user reconfirms their email address by clicking a link

We currently have the following policies in place:

* rate-limiting when too many emails (`config.limits.maxEmails` defaults to 3) have been sent to the same email address in a given time period (`config.limits.rateLimitIntervalSeconds` defaults to 15 minutes)
* rate-limiting when too many failed login attempts (`config.limits.maxBadLogins` defaults to 2) have occurred for a given account and IP address, in a given time period (`config.limits.rateLimitIntervalSeconds` defaults to 15 minutes)
* lockout when too many failed login attempts (`config.limits.badLoginLockout` defaults to 20) have occurred for a given account regardless of the IP address, in a given time period  (`config.limits.rateLimitIntervalSeconds` defaults to 15 minutes)
* manual blocking of an account (see `/blockEmail` API call)
* manual blocking of an IP address (see `/blockIp` API call)

The data that these policies are based on is stored in a memcache instance (keyed by `email`, `ip` or `ip + email` depending on the policy) and the code that implements them is split across these three files:

* `email_record.js` handles blocking and rate-limiting based only on the email address
* `ip_email_record.js` handles rate-limiting based on both the email and IP address of the request
* `ip_record.js` handles blocking based only on the IP address

The rate-limiting and blocking policies are conveyed to the auth server via the `block` property in the response to `/check` wheres the `lockout` policies are conveyed via the response to `/failedLoginAttempt`.
