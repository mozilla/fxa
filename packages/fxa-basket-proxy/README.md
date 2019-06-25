# Firefox Accounts Basket Proxy

[![Build Status: Travis](https://travis-ci.org/mozilla/fxa-basket-proxy.svg?branch=master)](https://travis-ci.org/mozilla/fxa-basket-proxy)

This server acts as an intermediary between Firefox Accounts and
[Basket](http://basket.readthedocs.org/en/latest/), Mozilla's email newsletter
subscription system. It allows FxA-OAuth-authenticated access to the Basket API
and is responsible for some background data-syncing tasks.

Over time, we expect most of the functionality of this proxy to be absorbed
into Basket itself; running it as a separate system in the meantime gives us
the ability to iterate quickly and minimise coupling between the two systems.

To run the proxy:

node ./bin/basket-proxy-server.js

To process account-related events from SQS:

node ./bin/basket-event-handler.js

For testing and development purposes, there's a minimal 'fake' implementation
of the Basket server API that stores its state in memory. Run it like so,
and the proxy will use it unless configured with the URL of a live Basket
server:

node ./bin/fake-basket-server.js

## Prerequisites

- node 6
- npm
- Grunt

[Grunt](http://gruntjs.com/) is used to run common tasks to build, test, and run local servers.

| TASK                  | DESCRIPTION                                                                           |
| --------------------- | ------------------------------------------------------------------------------------- |
| `grunt lint`          | run ESLint and JSCS (code style checker) on the code.                                 |
| `grunt server`        | run a local server running on port 1114.                                              |
| `grunt test`          | run local tests.                                                                      |
| `grunt version`       | stamp a new minor version. Updates the version number and creates a new CHANGELOG.md. |
| `grunt version:patch` | stamp a new patch version. Updates the version number and creates a new CHANGELOG.md. |

## License

MPL 2.0
