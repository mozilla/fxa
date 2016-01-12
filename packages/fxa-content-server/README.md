# Firefox Accounts Content Server

[![Build Status: Travis](https://travis-ci.org/mozilla/fxa-content-server.svg?branch=master)](https://travis-ci.org/mozilla/fxa-content-server)
[![Coverage Status](https://img.shields.io/coveralls/mozilla/fxa-content-server.svg)](https://coveralls.io/r/mozilla/fxa-content-server)

Static server that hosts Firefox Account sign up, sign in, email verification, etc. flows.


Follow the instructions on:
	[fxa-local-dev](https://github.com/mozilla/fxa-local-dev)
	
The above link helps to install the following pre-requisites, and set up a development environment.

## Prerequisites
* node 0.10.x or 4.2.3+
* npm
* Grunt
* libgmp
* [fxa-local-dev](https://github.com/mozilla/fxa-local-dev) - Please note that this is the preferred way of contributing to Firefox Accounts.

## Development Setup

Make sure that fxa-local-dev servers are running. The fxa-content-server will listen on <http://127.0.0.1:3030> by default.

Note: If you have issues with `npm install` please update to npm 2.0+ using `npm install -g npm@2` 
([Issue #1594](https://github.com/mozilla/fxa-content-server/issues/1594))

## Testing

#### Prerequisites:
  * Java JDK or JRE (http://www.oracle.com/technetwork/java/javase/downloads/index.html)
  * Selenium Server 2.48.2 ([Download](http://selenium-release.storage.googleapis.com/2.48/selenium-server-standalone-2.48.2.jar))

### Setup

* Run Selenium Server

e.g. in shell form:

```sh
java -jar selenium-server-standalone-2.48.2.jar 
```

To run tests locally with Selenium:

```sh
npm test
```

To change the default auth server edit `server/config/*.json` on your deployed instance.

```json
{
  "fxaccount_url": "http://your.auth.server.here.org"
}
```

**Note that testing with Selenium via Docker does *not* work at present, so all testing must be carried out via your normal operating system's npm & Java tooling.**

## Grunt Commands

[Grunt](http://gruntjs.com/) is used to run common tasks to build, test, and run local servers.

| TASK | DESCRIPTION |
|------|-------------|
| `grunt build` | build production resources. See [task source](grunttasks/build.js) for more documentation |
| `grunt clean` | remove any built production resources. |
| `grunt lint` | run ESLint, JSONLint, and JSCS (code style checker) on client side and testing JavaScript. |
| `grunt server` | run a local server running on port 3030 with development resources. |
| `grunt server:dist` | run a local server running on port 3030 with production resources. Production resources will be built as part of the task. |
| `grunt test` | run local Intern tests. |
| `grunt version` | stamp a new minor version. Updates the version number and creates a new CHANGELOG.md. |
| `grunt version:patch` | stamp a new patch version. Updates the version number and creates a new CHANGELOG.md. |

## Servers

* latest development - https://latest.dev.lcip.org/
* stable - https://stable.dev.lcip.org/
* stage - https://accounts.stage.mozaws.net/
* production - https://accounts.firefox.com/

## License

MPL 2.0
