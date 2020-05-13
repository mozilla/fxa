# Firefox Accounts Server

[![Coverage Status](https://coveralls.io/repos/github/mozilla/fxa-auth-server/badge.svg?branch=master)](https://coveralls.io/github/mozilla/fxa-auth-server?branch=master)
[![Code Quality: Javascript](https://img.shields.io/lgtm/grade/javascript/g/mozilla/fxa-auth-server.svg?logo=lgtm&logoWidth=18)](https://lgtm.com/projects/g/mozilla/fxa-auth-server/context:javascript)
[![Total Alerts](https://img.shields.io/lgtm/alerts/g/mozilla/fxa-auth-server.svg?logo=lgtm&logoWidth=18)](https://lgtm.com/projects/g/mozilla/fxa-auth-server/alerts)

This project implements the core server-side API for Firefox Accounts. It
provides account, device and encryption-key management for the Mozilla Cloud
Services ecosystem.

[Overview](docs/overview.md)

[Detailed design document](https://github.com/mozilla/fxa-auth-server/wiki/onepw-protocol)

[Detailed API spec](docs/api.md)

[Guidelines for Contributing](CONTRIBUTING.md)

## Prerequisites

- node 6+
- npm 2
- Grunt
- postfix
- memcached
- redis

## Install

On some systems running the server as root will cause working directory permissions issues with node. It is recommended that you create a separate, standard user to ensure a clean and more secure installation.

Clone the git repository and install dependencies:

    git clone git://github.com/mozilla/fxa-auth-server.git
    cd fxa-auth-server
    npm install

This runs a script `scripts/start-local.sh` as defined in `package.json`. This will start up
4 services, three of which listen on the following ports (by default):

- `bin/key_server.js` on port 9000
- `test/mail_helper.js` on port 9001
- `./node_modules/fxa-customs-server/bin/customs_server.js` on port 7000

When you `Ctrl-c` your server, all 4 processes will be stopped.

To start the server in dev MySQL store mode (ie. `NODE_ENV=dev`), run:

    npm run start-mysql

## Secrets

Create the following file: `config/secrets.json`. It will not be tracked in Git.

Use the following as a template, and fill in your own values:

```json
{
  "subscriptions": {
    "stripeApiKey": "sk_test_123"
  }
}
```

- `stripeApiKey` should be a test Stripe Secret Key

## Testing

Run tests with:

    npm test

To select a specific glob of tests to run:

    npm test -- test/local/account_routes.js test/local/password_*

- Note: stop the auth-server before running tests. Otherwise, they will fail with obscure errors.
- You can use `LOG_LEVEL`, such as `LOG_LEVEL=debug` to specify the test logging level.

## Testing

This package uses [Mocha](https://mochajs.org/) to test its code. By default `npm test` will run a series of NPM test scripts and then lint the code:

Run specific tests with the following commands:

```bash
# Test only test/local/account_routes.js
npm test -- test/local/account_routes.js

# Grep for "SQSReceiver"
NODE_ENV=dev npx mocha -r ts-node/register test/*/** -g "SQSReceiver"
```

Refer to Mocha's [CLI documentation](https://mochajs.org/#command-line-usage) for more advanced test configuration.

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

[fxa-js-client](../fxa-js-client)

## Dev Deployment

Refer to https://github.com/mozilla/fxa-dev.git.

## Configuration

Configuration of this project
is managed by [convict](https://github.com/mozilla/node-convict),
using the schema in
[`config/index.ts`](config/index.ts).

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

### Email config

There is also some live config
loaded from Redis for the email service.
This config is stored as a JSON string
that looks like this
(every property is optional):

```json
{
  "sendgrid": {
    "percentage": 100,
    "regex": "^.+@example\\.com$"
  },
  "socketlabs": {
    "percentage": 100,
    "regex": "^.+@example\\.org$"
  },
  "ses": {
    "percentage": 10,
    "regex": ".*"
  }
}
```

`scripts/email-config.js`
has been written to help
manage this config.

- To print the current live config to stdout:

  ```
  npx ts-node scripts/email-config read
  ```

- To set the live config from a JSON file on disk:

  ```
  cat foo.json | npx ts-node scripts/email-config write
  ```

- To set the live config from a string:

  ```
  echo '{"sendgrid":{"percentage":10}}' | npx ts-node scripts/email-config write
  ```

- To undo the last change:

  ```
  npx ts-node scripts/email-config revert
  ```

- To check the resolved config for a specific email address:

  ```
  npx ts-node scripts/email-config check foo@example.com
  ```

## Architectural decisions

The FxA team has made intentional decisions when it comes to the design of this package and its related packages' code bases. Learn more in the following ADRs:

- 0003 - [Event Broker for Subscription Platform](https://github.com/mozilla/fxa/blob/master/docs/adr/0003-event-broker-for-subscription-platform.md)
- 0004 - [Product Capabilities for Subscription Services](https://github.com/mozilla/fxa/blob/master/docs/adr/0004-product-capabilities-for-subscription-services.md)
- 0005 - [Minimizing password entry](https://github.com/mozilla/fxa/blob/master/docs/adr/0005-minimize-password-entry.md)
- 0006 - [Utilizing JSON-Schemas, SemVer, and Tooling for JSON Messaging](https://github.com/mozilla/fxa/blob/master/docs/adr/0006-json-schemas-for-messaging.md)
- 0007 - [Placing subscription info in the fxa-subscriptions claim of JWT access tokens](https://github.com/mozilla/fxa/blob/master/docs/adr/0007-subscription-claim-jwt-access-token.md)
- 0009 - [Consistency in testing tools](https://github.com/mozilla/fxa/blob/master/docs/adr/0009-testing-stacks.md)
- 0012 - [Next Two Factor authentication in FxA](https://github.com/mozilla/fxa/blob/master/docs/adr/0012-next-two-factor-authentication.md)
- 0014 - [Authentication in Settings Redesign](https://github.com/mozilla/fxa/blob/master/docs/adr/0014-auth-for-settings-redesign.md)

## Troubleshooting

Firefox Accounts authorization is a complicated flow. You can get verbose logging by adjusting the log level in the `config.json` on your deployed instance. Add a stanza like:

    "log": {
      "level": "trace"
    }

Valid `level` values (from least to most verbose logging) include: `"fatal", "error", "warn", "info", "trace", "debug"`.

## Database integration

This server depends on a database server
from the [`fxa-auth-db-mysql` repo](../fxa-auth-db-mysql/).

## License

MPL 2.0
