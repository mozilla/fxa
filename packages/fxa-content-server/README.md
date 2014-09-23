# Firefox Accounts Content Server

Travis Tests: [![Build Status: Travis](https://travis-ci.org/mozilla/fxa-content-server.svg?branch=master)](https://travis-ci.org/mozilla/fxa-content-server)
[![Coverage Status](https://img.shields.io/coveralls/mozilla/fxa-content-server.svg)](https://coveralls.io/r/mozilla/fxa-content-server)
Functional Tests: 
[![Build Status: Functional Tests](http://qa.stage.mozaws.net:8080/job/fxa.content-server-tests.dev/badge/icon)](http://qa.stage.mozaws.net:8080/job/fxa.content-server-tests.dev/)

Static server that hosts Firefox Account sign up, sign in, email verification, etc. flows.

## Prerequisites

* node 0.10.x
* npm
* Grunt (`npm install -g grunt-cli`)
* libgmp
  * On Linux, Install libgmp and libgmp-dev packages: `sudo apt-get install libgmp3-dev`
  * On Mac OS X: `brew install gmp`
* [fxa-auth-server](https://github.com/mozilla/fxa-auth-server) running on 127.0.0.1:9000.

## Development Setup

```sh
cp server/config/local.json-dist server/config/local.json
npm install
npm start
```

It will listen on <http://127.0.0.1:3030> by default.

Note: If you have issues with `npm install` please update to npm 2.0+ using `npm install -g npm@2` 
([Issue #1594](https://github.com/mozilla/fxa-content-server/issues/1594))

## Testing

#### Prerequisites:
  * Java JDK or JRE (http://www.oracle.com/technetwork/java/javase/downloads/index.html)
  * Selenium Server 2.43.1 ([Download](http://selenium-release.storage.googleapis.com/2.43/selenium-server-standalone-2.43.1.jar))

### Setup

* Run Selenium Server
* Run the Firefox Content Server locally: `npm start`
* Run an instance of the [fxa-auth-server](https://github.com/mozilla/fxa-auth-server) at 127.0.0.1:9000.

e.g. in shell form:

```sh
java -jar selenium-server-standalone-2.43.1.jar &
cd fxa-auth-server
npm start &
cd ../fxa-content-server
npm start &
```

To run tests locally with Selenium:

```sh
npm test
```

## Configuration

To change the default auth server edit `server/config/*.json` on your deployed instance.

```json
{
  "fxaccount_url": "http://your.auth.server.here.org"
}
```

## Grunt Commands

[Grunt](http://gruntjs.com/) is used to run common tasks to build, test, and run local servers.

| TASK | DESCRIPTION |
|------|-------------|
| `grunt build` | build production resources. See [task source](grunttasks/build.js) for more documentation |
| `grunt clean` | remove any built production resources. |
| `grunt lint` | run JSHint, JSONLint, and JSCS (code style checker) on client side and testing JavaScript. |
| `grunt server` | run a local server running on port 3030 with development resources. |
| `grunt server:dist` | run a local server running on port 3030 with production resources. Production resources will be built as part of the task. |
| `grunt test` | run local Intern tests. |
| `grunt version` | stamp a new minor version. Updates the version number and creates a new CHANGELOG.md. |
| `grunt version:patch` | stamp a new patch version. Updates the version number and creates a new CHANGELOG.md. |

## Servers

* latest development - https://latest.dev.lcip.org/
* testing - https://nightly.dev.lcip.org/
* stage - https://accounts.stage.mozaws.net/
* production - https://accounts.firefox.com/

## License

MPL 2.0
