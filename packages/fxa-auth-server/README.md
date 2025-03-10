# Firefox Accounts Auth Server

## Overview

The Firefox Accounts server provides a shared authentication and management infrastructure for the Mozilla Cloud Services ecosystem. It is a HTTP API through which a user-agent can manage:

- user account details, such as email address and password
- the list of devices connected to the account
- the master encryption keys used by services connected to the account

There is no UI provided by this server. It is expected that user interaction will happen through Firefox or a hosted website, which will use the API provided by this server.

## Concepts

Each user of the service creates an **account** which has a unique id. Access to the account is authenticated by an email/password pair and uses the [Secure Remote Password protocol](https://en.wikipedia.org/wiki/Secure_Remote_Password_protocol) to avoid revealing the password to the server. Note that our SRP protocol ordering is slightly different from the sample on wikipedia, but the variables are the same.

The user connects one or more **devices** to their account. Each device performs the SRP authentication protocol to obtain one or more opaque **authentication tokens**, which are then used to make [Hawk signed requests](https://github.com/mozilla/hawk/) when interacting with the server API. This token exchange means the device does not need to keep the the user's password in persistent storage.

Once connected, each device can fetch the user's **encryption keys**. The server maintains two keys for each account, called **kA** and **kB**. kA is known to the server, and is intended for encrypting data that must be recoverable in the event of password reset. kB is stored encrypted by the user's password, and is intended for more secure encryption at the cost of unrecoverability when the password is forgotten.

## API

All server functionality is exposed via a HTTP API. It is JSON based and vaguely restful. A detailed description is available [here](https://mozilla.github.io/ecosystem-platform/api) and a prose overview of the design and cryptogaphic details is available [here](https://mozilla.github.io/ecosystem-platform/explanation/onepw-protocol).

## Linting

Run lint with:

    yarn lint

Linting will also be run for staged files automatically via Husky when you attempt to commit.

## Testing

Before running tests make sure the correct services are running. If auth server is running in pm2 weird behavior can ensue, so
prior to running tests we recommend creating a clean slate by running `yarn stop`.

Now we can start testing. To run unit tests:

- `nx test-unit fxa-auth-server`
  _Note this matches how auth server unit tests jobs in CI._

To run integration tests, we have to make sure databases and auxillary services required for integration testing are spun up.
So run:

- `yarn start infrastructure`
- `nx start fxa-customs-server`

Now integration tests can be executed:

- `nx test-integration fxa-auth-server`
  _Note this matches how auth server unit tests jobs in CI._

For general development based testing, specific tests can be targeted using the test script or use mocha directly:

_From packages/fxa-auth-server:_

- `yarn test -- test/local/account_routes.js`
- `yarn test -- test/local/account* test/local/password_*`
- `NODE_ENV=dev npx mocha -r esbuild-register test/*/** -g "SQSReceiver"`

Notes / Tips:

- For quick environment config, consider running tests with a .env file and the dotenv command. For example: `dotenv -- yarn workspace fxa-auth-server:test-integration remote`
- you can use `LOG_LEVEL`, such as `LOG_LEVEL=debug` to specify the test logging level.
- recovery-phone tests require twilio testing credentials!
- recovery-phone-customs tests require that customs server is running. So run `nx start fxa-customs-server` prior to executing tests.
- The test/remote folder contains mostly integration tests that were not designed to be run in parallel. As a result the `yarn test -- remote/test` command may result in errors. For these tests run `yarn test-integration remote` instead.

_Other Stuff_
This package uses [Mocha](https://mochajs.org/) to test its code. By default `npm test` will run a series of NPM test scripts and then lint the code:

Refer to Mocha's [CLI documentation](https://mochajs.org/#command-line-usage) for more advanced test configuration.

We also use [Chai](https://www.chaijs.com/) for making assertions in tests. As of version 4.3.6, Chai truncates error messages by default. To disable truncation for tests in a given file, import chai from the local file `/test/chaiWithoutTruncation.js` as demonstrated in `test/local/senders/emails.ts`. If you want more truncation than you get by default (but you do want to put some kind of limit on how much the error message prints out) you can change the `truncateThreshold` value in `chaiWithoutTruncation.js` to be the desired number of characters. Setting it to `0` (as we have) disables truncation entirely.

### Testing with non-local databases

Executing tests using remote databases (MySQL, Redis) is possible by specifying (and exporting) the following environment variables:

- MySQL:
  - MYSQL_HOST
  - MYSQL_SLAVE_HOST
  - AUTH_MYSQL_HOST
- Redis:
  - REDIS_HOST
  - ACCESS_TOKEN_REDIS_HOST
  - REFRESH_TOKEN_REDIS_HOST
  - METRICS_REDIS_HOST

This also allows to use temporary throw-away Docker containers to provide these.

## Mailer and Emails

See the ["Emails" page in ecosystem platform](https://mozilla.github.io/ecosystem-platform/reference/emails) for docs on our email stack, including styling and l10n guides.

### Storybook

Storybook is set up in the auth-server for FxA and SubPlat emails. See our "emails" documentation for more info.

### L10N

Strings are automatically extracted to the [`fxa-content-server-l10n` repo](https://github.com/mozilla/fxa-content-server-l10n) where they reach Pontoon for translations to occur by our l10n team and contributors. This is achieved by concatenating all of our .ftl (Fluent) files into a single `auth.ftl` file with the `merge-ftl` grunttask, and the `extract-and-pull-request.sh` script that runs in `fxa-content-server-l10n` on a weekly cadence. For more detailed information, check out the [ecosystem platform l10n](http://localhost:3000/ecosystem-platform/reference/localization) doc.

Brands we have set to [message references](https://projectfluent.org/fluent/guide/references.html) are stored in `libs/shared/l10n/src/lib/branding.ftl`. Non-email strings that must be translated are placed directly in `lib/l10n/server.ftl`. Email strings for translation are placed in a nearby (`templates/[templateName]/en.ftl` or `partials/[partialName]/en.ftl`). For more detailed information on l10n in emails with examples, see the [ecosystem platform doc email page, l10n section](https://mozilla.github.io/ecosystem-platform/reference/emails).

#### Production

Use the `FXA_L10N_SHA` to pin L10N files to certain SHA. If not set then the `master` SHA will be used.

## Reference Client

[fxa-auth-client](../fxa-auth-client)

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

### Rate-limiting config

Rate-limiting and blocking is handled by fxa-customs-server. By default, these policies are _disabled_ in dev environment via `"customsUrl":"none"` in `fxa-auth-server/config/dev.json`. Enabling the customs server allows error messages to be displayed when rate limiting occurs. Default rate-limiting values are found in `fxa-customs-server/lib/config/config.js` and can be modified with environment variables or by adding a `dev.json` file to `fxa-customs-server/config/`.

The customs-server can be enabled for local testing by changing the dev config to `"customsUrl":"http://localhost:7000"`.

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
