Firefox Accounts Customs Server
=======================

[![Build Status](https://travis-ci.org/mozilla/fxa-customs-server.svg?branch=master)](https://travis-ci.org/mozilla/fxa-customs-server)

This project is used by the [Firefox Accounts Auth Server](https://github.com/mozilla/fxa-auth-server) to detect and deter [fraud and abuse](https://wiki.mozilla.org/Identity/Firefox_Accounts/Fraud_and_abuse).

## Install

You'll need node 0.10.x or higher and npm to run the server.

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

## Code

Here are the main components of this project:

- `bans/`: code implementing temporary bans of specific email or IP addresses and listening on the SQS API for requests
- `bin/customs_server.js`: process listening on the network and responding to HTTP API calls
- `config/config.js`: where all of the configuration options are defined
- `email_record.js`, `ip_email_record.js` and `ip_record.js`: code implementing the various blocking and rate-limiting policies
- `scripts`: helper scripts only used for development/testing
- `test/local`: unit tests
- `test/remote`: tests exercising the HTTP API
