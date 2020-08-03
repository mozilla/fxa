# FXA GraphQL API

This is the GraphQL server for the Firefox Accounts API, its current primary consume is the new
settings page.

## Connecting to the Playground

The [GraphQL playground](https://www.apollographql.com/docs/apollo-server/testing/graphql-playground/) for this package is available at [localhost:8290/graphql](http://localhost:8290/graphql), providing a GUI for an up-to-date schema and API docs, as well as a way to test queries and mutations.

The playground requires a `sessionToken` for authorization from the `login` response. [Verify an account](https://github.com/mozilla/fxa#verifying-email-and-viewing-logs) locally, sign out, and with the Network tab open, login. Under the "Response" tab for the `account/login` POST request, copy the `sessionToken`.

![](https://user-images.githubusercontent.com/13018240/89205157-e00f9500-d57c-11ea-9829-5638cf00958b.png)

Add this as a property of a JSON object with an `authorization` key in the bottom left-hand corner of the GQL playground labeled "HTTP Headers":

```
{
  "authorization": "d4a62a0f58efb0e9c7d17b579434f2a56cad10503033874002ddd507a503cea5"
}
```

Hit the "play" button and the schema and docs will populate.

## Testing

This package uses [Mocha](https://mochajs.org/) to test its code. By default `npm test` will test all files ending in `.spec.ts` under `src/test/` and uses `ts-node` so it can process TypeScript files.

Test specific tests with the following commands:

```bash
# Test only src/test/lib/sentry.spec.ts
npx mocha -r ts-node/register src/test/lib/sentry.spec.ts

# Grep for "bearer token"
npx mocha -r ts-node/register src/test/lib/** -g "bearer token"
```

Refer to Mocha's [CLI documentation](https://mochajs.org/#command-line-usage) for more advanced test configuration.

## License

MPL-2.0
