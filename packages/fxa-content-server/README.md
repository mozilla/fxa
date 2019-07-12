# Firefox Accounts Content Server

[![Build Status: Travis](https://travis-ci.org/mozilla/fxa-content-server.svg?branch=master)](https://travis-ci.org/mozilla/fxa-content-server)
[![Build Status: Circle CI](https://circleci.com/gh/mozilla/fxa-content-server.svg?style=shield)](https://circleci.com/gh/mozilla/fxa-content-server)
[![Coverage Status](https://img.shields.io/coveralls/mozilla/fxa-content-server.svg)](https://coveralls.io/r/mozilla/fxa-content-server)

Static server that hosts [Firefox Account sign up](https://accounts.firefox.com), sign in, email verification, etc. flows.

-   [Quick Start](#quick-start)
-   [Development Notes](#development-notes)
    -   [Changes to Stylesheets](#changes-to-stylesheets)
    -   [Changes to Scripts and Templates](#changes-to-scripts-and-templates)
-   [Testing](#testing)
    -   [Prerequisites](#prerequisites)
    -   [Setup](#setup)
-   [Grunt Commands](#grunt-commands)
-   [Servers](#servers)
-   [License](#license)

---

## Quick Start

Clone the repository, make sure you have [required prerequisites](https://github.com/mozilla/fxa-local-dev#dependencies) installed.
Run `npm install` and `npm run start-remote`.
This will start a local fxa-content-server on [http://127.0.0.1:3030](http://127.0.0.1:3030) that works with remote Firefox Accounts servers.

If you want to install all Firefox Accounts servers locally follow the instructions on:
[fxa-local-dev](https://github.com/mozilla/fxa-local-dev) to get a full development setup running.
Please note that fxa-local-dev is the preferred way of contributing to Firefox Accounts.

---

## Development Notes

### Changes to stylesheets, scripts and templates

Any changes made to the css resources, scripts or the template files will automatically be reflected on page refresh.

---

## Testing

### Prerequisites

-   Java JDK or JRE (http://www.oracle.com/technetwork/java/javase/downloads/index.html)

### Setup

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

**Note that testing with Selenium via Docker does _not_ work at present, so all testing must be carried out via your normal operating system's npm & Java tooling.**

### Unit Tests

If you want to test only the unit tests (not Selenium/function tests) you can visit http://127.0.0.1:3030/tests/index.html and you can select specific tests with something like http://127.0.0.1:3030/tests/index.html?grep=fxa-client

---

## Grunt Commands

[Grunt](http://gruntjs.com/) is used to run common tasks to build, test, and run local servers.

| TASK                  | DESCRIPTION                                                                                                                |
| --------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `grunt build`         | build production resources. See [task source](grunttasks/build.js) for more documentation                                  |
| `grunt clean`         | remove any built production resources.                                                                                     |
| `grunt lint`          | run ESLint, Sass-lint, amdcheck and JSONLint on client side and testing JavaScript.                                        |
| `grunt server`        | run a local server running on port 3030 with development resources.                                                        |
| `grunt server:dist`   | run a local server running on port 3030 with production resources. Production resources will be built as part of the task. |
| `grunt test`          | run local Intern tests.                                                                                                    |
| `grunt version`       | stamp a new minor version. Updates the version number and creates a new CHANGELOG.md.                                      |
| `grunt version:patch` | stamp a new patch version. Updates the version number and creates a new CHANGELOG.md.                                      |

---

## Servers

-   latest development - https://latest.dev.lcip.org/
-   stable - https://stable.dev.lcip.org/
-   stage - https://accounts.stage.mozaws.net/
-   production - https://accounts.firefox.com/

---

## License

MPL 2.0
