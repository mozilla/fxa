# Firefox Accounts Server

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

    git clone https://github.com/mozilla/fxa-auth-server.git
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
    "stripeApiKey": "sk_test_123",
    "paypalNvpSigCredentials": {
      "enabled": true,
      "sandbox": true,
      "user": "business_account_email_ID",
      "pwd": "business_account_password",
      "signature": "business_account_signature"
    }
  }
}
```

- `stripeApiKey` should be a test Stripe Secret Key
- `user` should be a sandbox PayPal business account username
- `pwd` should be a sandbox PayPal business account password
- `signature` should be a sandbox PayPal business account signature

The sandbox PayPal business account API credentials above can be found in the PayPal developer dashboard under "Sandbox" > "Accounts". You may need to create a business account if one doesn't exist.

## Testing

Run tests with:

    npm test

Run specific tests with the following commands:

```bash
# Test only test/local/account_routes.js
# Note: This command does not work for remote tests.
npm test -- test/local/account_routes.js

# Grep for "SQSReceiver"
NODE_ENV=dev npx mocha -r esbuild-register test/*/** -g "SQSReceiver"
```

To select a specific glob of tests to run:

```
npm test -- test/local/account_routes.js test/local/password_*
```

To run a certain suite of tests (e.g. all remote tests):

```
npm test -- test/remote
```

- Note: stop the auth-server before running tests. Otherwise, they will fail with obscure errors.
- You can use `LOG_LEVEL`, such as `LOG_LEVEL=debug` to specify the test logging level.

This package uses [Mocha](https://mochajs.org/) to test its code. By default `npm test` will run a series of NPM test scripts and then lint the code:

Refer to Mocha's [CLI documentation](https://mochajs.org/#command-line-usage) for more advanced test configuration.

We also use [Chai](https://www.chaijs.com/) for making assertions in tests. As of version 4.3.6, Chai truncates error messages by default. To disable truncation for tests in a given file, import chai from the local file `/test/chaiWithoutTruncation.js` as demonstrated in `test/local/senders/emails.ts`. If you want more truncation than you get by default (but you do want to put some kind of limit on how much the error message prints out) you can change the `truncateThreshold` value in `chaiWithoutTruncation.js` to be the desired number of characters. Setting it to `0` (as we have) disables truncation entirely.

### Testing with non-local databases

Executing tests using remote databases (MySQL, Redis, Memcached) is possible by specifying (and exporting) the following environment variables:

- MySQL:
  - MYSQL_HOST
  - MYSQL_SLAVE_HOST
  - AUTH_MYSQL_HOST
- Redis:
  - REDIS_HOST
  - ACCESS_TOKEN_REDIS_HOST
  - REFRESH_TOKEN_REDIS_HOST
- Memcached:
  - MEMCACHE_METRICS_CONTEXT_ADDRESS

This also allows to use temporary throw-away Docker containers to provide these.

## Mailer and Emails

See the ["Emails" page in ecosystem platform](https://mozilla.github.io/ecosystem-platform/reference/emails) for docs on our email stack, including styling and l10n guides.

### Storybook

Storybook is set up in the auth-server for FxA and SubPlat emails. See our "emails" documentation for more info.

### L10N

Strings are automatically extracted to the [`fxa-content-server-l10n` repo](https://github.com/mozilla/fxa-content-server-l10n) where they reach Pontoon for translations to occur by our l10n team and contributors. This is achieved by concatenating all of our .ftl (Fluent) files into a single `auth.ftl` file with the `merge-ftl` grunttask, and the `extract-and-pull-request.sh` script that runs in `fxa-content-server-l10n` on a weekly cadence. For more detailed information, check out the [ecosystem platform l10n](http://localhost:3000/ecosystem-platform/reference/localization) doc.

Non-email strings that must be translated are placed directly in `lib/l10n/auth.ftl`, under any brands we have set to [message references](https://projectfluent.org/fluent/guide/references.html). Email strings for translation are placed in a nearby (`templates/[templateName]/en.ftl` or `partials/[partialName]/en.ftl`). For more detailed information on l10n in emails with examples, see the [ecosystem platform doc email page, l10n section](https://mozilla.github.io/ecosystem-platform/reference/emails).

#### Production

Use the `FXA_L10N_SHA` to pin L10N files to certain SHA. If not set then the `master` SHA will be used.

## Reference Client

[fxa-auth-client](../fxa-auth-client)

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
  node -r esbuild-register scripts/email-config read
  ```

- To set the live config from a JSON file on disk:

  ```
  cat foo.json | node -r esbuild-register scripts/email-config write
  ```

- To set the live config from a string:

  ```
  echo '{"sendgrid":{"percentage":10}}' | node -r esbuild-register scripts/email-config write
  ```

- To undo the last change:

  ```
  node -r esbuild-register scripts/email-config revert
  ```

- To check the resolved config for a specific email address:

  ```
  node -r esbuild-register scripts/email-config check foo@example.com
  ```

### Token Pruning

We need to be able to periodically remove old tokens and codes. This can be accomplished via the token pruning script in the scripts directory.

For example to clear out tokens and codes older than 10 days execute the following:

```
./scripts/prune-tokens.sh —-maxTokenAge='10 days' --maxCodeAge='10 days'
```

For more info about the script usage execute the following:

```
./scripts/prune-tokens.sh --help
```

_Note: In the wild, this script will be run periodically by our SRE team as part of database maintenance._

## Troubleshooting

Firefox Accounts authorization is a complicated flow. You can get verbose logging by adjusting the log level in the `config.json` on your deployed instance. Add a stanza like:

    "log": {
      "level": "trace"
    }

Valid `level` values (from least to most verbose logging) include: `"fatal", "error", "warn", "info", "trace", "debug"`.

## License

MPL 2.0
