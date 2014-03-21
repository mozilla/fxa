Firefox Accounts Server
=======================

[![Build Status](https://travis-ci.org/mozilla/fxa-auth-server.svg?branch=master)](https://travis-ci.org/mozilla/fxa-auth-server)

This project implements the core server-side API for Firefox Accounts.  It
provides account, device and encryption-key management for the Mozilla Cloud
Services ecosystem.

[Overview](/docs/overview.md)

[Detailed design document](https://github.com/mozilla/fxa-auth-server/wiki/onepw-protocol)

[Detailed API spec](/docs/api.md)

## Prerequisites

* node 0.10.x or higher
* npm
* pgrep
  *  Usually available by default on Mac OS X 10.8+ and Linux.
  *  On older versions of Mac OS X, get it via: `brew install proctools`.
* libgmp
  *  On Linux: install libgmp and libgmp-dev packages
  *  On Mac OS X: `brew install gmp`

## Install

You'll need node 0.10.x or higher and npm to run the server.

Clone the git repository and install dependencies:

    git clone git://github.com/mozilla/fxa-auth-server.git
    cd fxa-auth-server
    npm install

To start the server, run:

    npm start

It will listen on http://localhost:9000 by default.

## Testing

Run tests with:

    npm test

## Reference Client

A node library that implements the client side of the protocol and an example
script is located in the `/client` directory.

* [/client/index.js](/client/index.js)
* [/client/example.js](/client/example.js)


## Dev Deployment

There is a development server running the moz-svc-dev AWS environment, at the following address:

    https://api-accounts.dev.lcip.org/

It is managed using [awsbox](http://awsbox.org/).  You can force-push a particular version of the code by doing:

    $> git remote add api-dev-lcip-org app@api-accounts.dev.lcip.org:git
    $> git push api-dev-lcip-org HEAD:master


The dev deployment is configured to send emails via Amazon SES.  If you need to re-create, or want to stand up a similar server, you will need to:

  1.  Obtain the SES SMTP credentials; ping @rfk or @zaach for details.
  2.  Deploy the new machine using awsbox.
  3.  Configure postfix to use the SES credentials:
      1.  Edit /etc/postfix/sasl_passwd to insert the SES credentials.
      2.  Run `/usr/sbin/postmap /etc/postfix/sasl_passwd` to compile them.
      3.  Edit /etc/postfix/main.cf to change 'relayhost' to the SES SMTP host
          (typically "email-smtp.us-east-1.amazonaws.com:587").
      4.  Run `service postfix restart` to restart postfix.


There is also a "bleeding edge" development server that is configured to
auto-update itself from the latest github master.  It may be useful for testing
out new protocol changes, but should be considered unstable for general
development use:

    https://api-accounts-latest.dev.lcip.org/


### Configuration

To set the url of the [content server](https://github.com/mozilla/fxa-content-server), edit `config.json` on your deployed instance and add:

    "contentServer": {
      "url": "http://your.content.server.org"
    }

## MySQL setup

### Install MySQL

#### Mac

Installation is easy with homebrew. I use mariadb which is a fork of mysql but either should work.

    brew install mariadb

Follow the homebrew instructions for starting the server. I usually just do

    mysql.server start

#### Linux

[Install MySQL](http://bit.ly/19XPRZf) and start it.

### Execution

Our test suite assumes mysql uses it's default configuration. See `config/config.js` for the override ENV variables if you have different root user password or other user. Now you should be able to run the test suite from the project root directory.

    DB_BACKEND=mysql npm test

Or run the local server

    DB_BACKEND=mysql npm start


### Cleanup

You may want to clear the data from the database periodically. I just drop the database:

    mysql -uroot -e"DROP DATABASE fxa"

The server will automatically re-create it on next use.

## License

MPL 2.0
