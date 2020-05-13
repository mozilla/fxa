# FXA Admin Server

This is the GraphQL server for an internal resource for FxA Admins to access a set of convenience tools.

## Generate test email bounces

If you need to create a handful of test email bounces in development you can use `npm run email-bounce`.

By default this will create a new email bounce for a newly-created dummy account.

Use the `--email` flag to create a bounce for an existing account.

Use the `--count` flag to create X number of bounces in a single command.

Example: `npm run email-bounce -- --email=test@example.com --count=3`

## Testing

This package uses [Mocha](https://mochajs.org/) to test its code. By default `npm test` will test all files ending in `.spec.ts` under `src/test/` and uses `ts-node` so it can process TypeScript files.

Test specific tests with the following commands:

```bash
# Test only src/test/lib/sentry.spec.ts
npx mocha -r ts-node/register src/test/lib/sentry.spec.ts

# Grep for "returns lbheartbeat"
npx mocha -r ts-node/register src/test/lib/** -g "returns lbheartbeat"
```

Refer to Mocha's [CLI documentation](https://mochajs.org/#command-line-usage) for more advanced test configuration.

## Architectural decisions

The FxA team has made intentional decisions when it comes to the design of this package and its related packages' code bases. Learn more in the following ADRs:

- 0009 - [Consistency in testing tools](https://github.com/mozilla/fxa/blob/master/docs/adr/0009-testing-stacks.md)

## License

MPL-2.0
