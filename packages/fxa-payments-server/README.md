# fxa-payments-server

This is the server that handles payments.

## Storybook

This project uses [Storybook](https://storybook.js.org/) to show each screen without requiring a full stack.

In local development, `yarn storybook` should start a Storybook server at <http://localhost:6006> with hot module replacement to reflect live changes.

### Latest builds

The latest builds of the various FXA Storybooks are published to Google Cloud Platform, using this GCP Storybook Publisher, and can be found in the following ways.

- Via direct URL
  - Navigate to the [Mozilla Storybooks FXA URL](https://storage.googleapis.com/mozilla-storybooks-fxa/index.html)
  - Click the commit you’d like to view. (This includes both main and PR commits)
  - Click fxa-payments-server
- From the [FXA Github repo](https://github.com/mozilla/fxa)
  - Click on the green check mark next to the latest commit off of main. (Near the top of the page)
  - Scroll down and click on “Details” for entry storybooks:pull request
  - Click fxa-payments-server

## Installation notes

On Mac OS, `yarn test` may trigger an `EMFILE` error. In this case, to get tests running, you may need to `brew install watchman`. (If the watchman postinstall step fails, follow the instructions [here](https://stackoverflow.com/a/41320226) to change `/usr/local` ownership from root to your user account.)

## Secrets

Create the following file: `server/config/secrets.json`. It will not be tracked in Git.

Use the following as a template, and fill in your own values:

```json
{
  "stripe": {
    "apiKey": "pk_test_123"
  },
  "paypal": {
    "clientId": "sb"
  }
}
```

- `apiKey` should be a test Stripe Publishable Key
- `clientId` should be a sandbox PayPal client ID. For local testing, the default value of "sb" should be sufficient.

## Testing

This package uses [Jest](https://jestjs.io/) to test both the frontend and server. By default `yarn test` will run all yarn test scripts:

- `yarn test:frontend` will test the React App frontend under `src/`
- `yarn test:server` will test the Express server under `server/`

Test specific tests with the following commands:

```bash
# Test frontend tests for the component AlertBar
yarn test:frontend AlertBar

# Grep frontend tests for "renders as expected"
yarn test:frontend -t "renders as expected"

# Test server tests for the file server/lib/csp
yarn test:server server/lib/csp

# Grep server tests for "logs raw events"
yarn test:server -t "logs raw events"
```

Note that prior to testing you may need to create a build of the React App. You can do this by running `yarn build`.

Refer to Jest's [CLI documentation](https://jestjs.io/docs/en/cli) for more advanced test configuration.

## License

MPL-2.0
