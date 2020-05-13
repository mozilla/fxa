# fxa-payments-server

This is the server that handles payments.

## Storybook

This project uses [Storybook](https://storybook.js.org/) to show each screen without requiring a full stack.

You can view the Storybook built from the most recent master at http://mozilla.github.io/fxa/fxa-payments-server/

In local development, `npm run storybook` should start a Storybook server at <http://localhost:6006> with hot module replacement to reflect live changes.

## Installation notes

On Mac OS, `npm run test` may trigger an `EMFILE` error. In this case, to get tests running, you may need to `brew install watchman`. (If the watchman postinstall step fails, follow the instructions [here](https://stackoverflow.com/a/41320226) to change `/usr/local` ownership from root to your user account.)

## Secrets

Create the following file: `server/config/secrets.json`. It will not be tracked in Git.

Use the following as a template, and fill in your own values:

```json
{
  "stripe": {
    "apiKey": "pk_test_123"
  }
}
```

- `apiKey` should be a test Stripe Publishable Key

## Testing

This package uses [Jest](https://jestjs.io/) to test both the frontend and server. By default `npm test` will run all NPM test scripts:

- `npm run test:frontend` will test the React App frontend under `src/`
- `npm run test:server` will test the Express server under `server/`

Test specific tests with the following commands:

```bash
# Test frontend tests for the component AlertBar
npm run test:frontend -- AlertBar

# Grep frontend tests for "renders as expected"
npm run test:frontend -- -t "renders as expected"

# Test server tests for the file server/lib/csp
npm run test:server -- server/lib/csp

# Grep server tests for "logs raw events"
npm run test:server -- -t "logs raw events"
```

Note that prior to testing you may need to create a build of the React App. You can do this by running `npm run build`.

Refer to Jest's [CLI documentation](https://jestjs.io/docs/en/cli) for more advanced test configuration.

## Architectural decisions

The FxA team has made intentional decisions when it comes to the design of this package and its related packages' code bases. Learn more in the following ADRs:

- 0001 - [Isolating payment content with third-party widgets from general account management](https://github.com/mozilla/fxa/blob/master/docs/adr/0001-isolating-payment-content-with-third-party-widgets-from-general-account-management.md)
- 0009 - [Consistency in testing tools](https://github.com/mozilla/fxa/blob/master/docs/adr/0009-testing-stacks.md)

## License

MPL-2.0
