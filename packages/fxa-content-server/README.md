# Firefox Accounts Content Server

[![Build Status](https://travis-ci.org/mozilla/fxa-content-server.png)](https://travis-ci.org/mozilla/fxa-content-server)

Static server that hosts Firefox Account sign up, sign in, email verification, etc. flows.

## Prerequisites

* node 0.10.x or higher
* npm
* Grunt (`npm install -g grunt-cli`)
* PhantomJS (`npm install -g phantomjs`)
* bower (`npm install -g bower`)
* libgmp
  * On Linux: install libgmp and libgmp-dev packages
  * On Mac OS X: brew install gmp
* [fxa-auth-server](https://github.com/mozilla/fxa-auth-server) running on 127.0.0.1:9000.

## Development Setup

```
npm install
npm start
```

## Testing

### Setup
There is quite a bit of setup to do before you can test this service, which is non-optimal, but for now:

  * Set up saucelabs credentials (we have an opensource account: `SAUCE_USERNAME=intern-example-ci` `SAUCE_ACCESS_KEY=89ac3089-17b3-4e9b-aaf3-c475b27fa441`)
  * PhantomJS: `phantomjs --webdriver=4444` (see [Prerequisites](#prerequisites))
  * Run the Firefox Content Server locally: `npm start`
  * Run an instance of the [fxa-auth-server](https://github.com/mozilla/fxa-auth-server) at 127.0.0.1:9000.

e.g. in shell form:

```
export SAUCE_USERNAME=intern-example-ci
export SAUCE_ACCESS_KEY=89ac3089-17b3-4e9b-aaf3-c475b27fa441
phantomjs --webdriver=4444 &
cd fxa-auth-server
npm start &
cd ../fxa-content-server
npm start &
```

### Running the tests

To run tests locally against phantomjs:

    npm test

To run tests against saucelabs:

    npm run-script test-remote

## Configuration

The default auth server is `http://api-accounts.dev.lcip.org`.  To change this,
edit `server/config/*.json` on your deployed instance.

    {
      'fxaccount_url': 'http://your.auth.server.here.org'
    }


## Grunt Commands

[Grunt](http://gruntjs.com/) is used to run common tasks to build, test, and run local servers.

* `grunt jshint` - run JSHint on client side and testing JavaScript.
* `grunt build` - build production resources
* `grunt clean` - remove any built production resources
* `grunt test` - run local Intern tests.
* `grunt server` - run a local server running on port 3030 with development resources.
* `grunt server:dist` - run a local server running on port 3030 with production resources. Production resources will be built as part of the task.


## License

MPL 2.0
