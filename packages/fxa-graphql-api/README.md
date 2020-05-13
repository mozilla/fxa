# FXA GraphQL API

This is the GraphQL server for the Firefox Accounts API, its current primary consume is the new
settings page.

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

## Architectural decisions

The FxA team has made intentional decisions when it comes to the design of this package and its related packages' code bases. Learn more in the following ADRs:

- 0009 - [Consistency in testing tools](https://github.com/mozilla/fxa/blob/master/docs/adr/0009-testing-stacks.md)

## License

MPL-2.0
