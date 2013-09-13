# Firefox Accounts Persona Bridge

[![Build Status](https://travis-ci.org/mozilla/firefox-account-bridge.png)](https://travis-ci.org/mozilla/firefox-account-bridge)

This is a Node.js server which implements the Persona identity provider (IdP) protocol.
It allows users to sign in to Firefox Accounts (aka PICL).
It consumes the REST API which PICL provides.

## Prerequisites

* node 0.10.x or higher
* npm
* Java
* [Selenium Server Standalone 2.35.0](http://selenium.googlecode.com/files/selenium-server-standalone-2.35.0.jar)

## Development Setup

```
npm install
npm start
```

## Testing

  * Run in the background: `java -jar selenium-server-standalone-2.35.0.jar`
  * TDD: `npm test`
  * Functional: `npm run-script test-functional`

  * Server test: `npm run-script test-server` (Selenium server not required)

## Persona Bridge Setup

### One Time Setup

    cp server/config/local.json-dist server/config/local.json

### Running the service

Issuer determines the hostname and the environment`PORT` variable the port.

    PORT=3030 npm start

The easiest way to develop, is to run a local browserid instance and `SHIMMED_PRIMARIES`:

You have to save the `/.well-known/browserid` to the file system:

    curl http://localhost:3030/.well-known/browserid > /tmp/fxwellknown

And then start up browserid:

    SHIMMED_PRIMARIES="dev.fxaccounts.mozilla.org|http://127.0.0.1:3030|/tmp/fxwellknown"  npm start

Now you can type foo@dev.fxaccounts.mozilla.org in the test dialog at http://127.0.0.1:10001/. No DNS or `/etc/hosts` hacks are needed.

Password is 'asdf'.

### Configuration

The default idp server is `http://idp.dev.lcip.org`.  To change this, edit
`config.json` on your deployed instance.

    {
      'fxaccount_url': 'http://your.idp.here.org'
    }

