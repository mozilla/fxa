Firefox Accounts Server
=======================

[![Build Status](https://travis-ci.org/mozilla/fxa-auth-server.svg?branch=master)](https://travis-ci.org/mozilla/fxa-auth-server)

This project implements the core server-side API for Firefox Accounts.  It
provides account, device and encryption-key management for the Mozilla Cloud
Services ecosystem.

[Overview](/docs/overview.md)

[Detailed design document](https://github.com/mozilla/fxa-auth-server/wiki/onepw-protocol)

[Detailed API spec](/docs/api.md)

[Guidelines for Contributing](/CONTRIBUTING.md)

## Prerequisites

* node 0.10.x or higher
* npm

## Install

You'll need node 0.10.x or higher and npm to run the server. On some systems running the server as root will cause working directory permissions issues with node. It is recommended that you create a seperate, standard user to ensure a clean and more secure installation.

Clone the git repository and install dependencies:

    git clone git://github.com/mozilla/fxa-auth-server.git
    cd fxa-auth-server
    npm install

To start the server in dev memory store mode (ie. `NODE_ENV=dev`), run:

    npm start

This runs a script `scripts/start-local.sh` as defined in `package.json`. This will start up
4 services, three of which listen on the following ports (by default):

* `bin/key_server.js` on port 9000
* `test/mail_helper.js` on port 9001
* `./node_modules/fxa-customs-server/bin/customs_server.js` on port 7000
* `bin/notifier.js` (no port)

When you `Ctrl-c` your server, all 4 processes will be stopped.

To start the server in dev MySQL store mode (ie. `NODE_ENV=dev`), run:

    npm run start-mysql

## Testing

Run tests with:

    npm test

* Note: stop the auth-server before running tests. Otherwise, they will fail with obscure errors.

## Reference Client

https://github.com/mozilla/fxa-js-client


## Dev Deployment

Refer to https://github.com/mozilla/fxa-dev.git.


## Configuration

Configuration of this project
is managed by [convict](https://github.com/mozilla/node-convict),
using the schema in
[`config/index.js`](https://github.com/mozilla/fxa-auth-server/blob/master/config/index.js).

Default values from this schema
can be overridden in two ways:

1. By setting individual environment variables,
   as indicated by the `env` property
   for each item in the schema.

   For example:
   ```sh
   export CONTENT_SERVER_URL="http://your.content.server.org"
   ```

2. By specifying the path
   to a conforming JSON file,
   or a comma-separated list of paths,
   using the `CONFIG_FILES` environment variable.
   Files specified in this way
   are loaded when the server starts.
   If the server fails to start,
   it usually indicates that one of these JSON files
   does not conform to the schema;
   check the error message
   for more information.

   For example:
   ```sh
   export CONFIG_FILES="~/fxa-content-server.json,~/fxa-db.json"
   ```

## Troubleshooting

Firefox Accounts authorization is a complicated flow.  You can get verbose logging by adjusting the log level in the `config.json` on your deployed instance.  Add a stanza like:

    "log": {
      "level": "trace"
    }

Valid `level` values (from least to most verbose logging) include: `"fatal", "error", "warn", "info", "trace", "debug"`.

## Database integration

This server depends on a database server
from the [`fxa-auth-db-mysql` repo](https://github.com/mozilla/fxa-auth-db-mysql/).
When running the tests, it uses a memory-store
that mocks behaviour of the production MySQL server.

## Using with FxOS

By default, FxOS uses the production Firefox Accounts server (`api.accounts.firefox.com/v1`). If you want to use a different account server on a device, you need to update a preference value `identity.fxaccounts.auth.uri`.

* Download this script: https://gist.github.com/edmoz/5596162
* `chmod +x modPref.sh; ./modPref.sh pull`
* Edit `prefs.js` to change `identity.fxaccounts.auth.uri`, e.g., add a line
```
user_pref("identity.fxaccounts.auth.uri", "https://api-accounts.stage.mozaws.net/v1");
```
* `./modPref.sh push prefs.js`

## License

MPL 2.0
