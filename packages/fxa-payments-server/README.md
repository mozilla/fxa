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

## License

MPL-2.0
