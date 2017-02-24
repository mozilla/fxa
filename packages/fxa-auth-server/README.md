Firefox Accounts Server
=======================

[![Build Status](https://travis-ci.org/mozilla/fxa-auth-server.svg?branch=master)](https://travis-ci.org/mozilla/fxa-auth-server)
[![Coverage Status](https://coveralls.io/repos/github/mozilla/fxa-auth-server/badge.svg?branch=master)](https://coveralls.io/github/mozilla/fxa-auth-server?branch=master)

This project implements the core server-side API for Firefox Accounts.  It
provides account, device and encryption-key management for the Mozilla Cloud
Services ecosystem.

[Overview](/docs/overview.md)

[Detailed design document](https://github.com/mozilla/fxa-auth-server/wiki/onepw-protocol)

[Detailed API spec](/docs/api.md)

[Guidelines for Contributing](/CONTRIBUTING.md)

## Prerequisites

* node 4.5.0 or higher
* npm 2
* Grunt
* postfix

## Install

On some systems running the server as root will cause working directory permissions issues with node. It is recommended that you create a separate, standard user to ensure a clean and more secure installation.

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

To select a specific glob of tests to run:

    npm test -- test/local/account_routes.js test/local/password_*

* Note: stop the auth-server before running tests. Otherwise, they will fail with obscure errors.

## Mailer

The mailer library is located in `mailer/` directory.

The emails are written to postfix which tends sends them off to SES.

The auth-mailer also includes a restify API to send emails, but the auth server is using it as a library at the moment.

### Changing Templates

If you are changing or adding templates then you need to update `.html` and `.txt` templates.
In `mailer/`, use the `/partials` directory to make changes to the HTML templates, then run `grunt templates` to regenerate the template.
This saves the HTML template into `/templates`. Then make changes to the `.txt` template in the `/templates` directory.

### L10N

After updating a string in one of the templates in `./mailer/templates` you'll need to extract the strings.
Follow the instructions at [mozilla/fxa-content-server-l10n](https://github.com/mozilla/fxa-content-server-l10n#string-extraction).

#### Production

Use the `FXA_L10N_SHA` to pin L10N files to certain SHA. If not set then the `master` SHA will be used.


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

## License

MPL 2.0
