# FXA Admin Server

This is the GraphQL server for an internal resource for FxA Admins to access a set of convenience tools.

## Generate test email bounces

If you need to create a handful of test email bounces in development you can use `yarn email-bounce`.

By default this will create a new email bounce for a newly-created dummy account.

Use the `--email` flag to create a bounce for an existing account.

Use the `--count` flag to create X number of bounces in a single command.

Example: `yarn email-bounce --email test@example.com --count 3`

## Testing

This package uses [Jest](https://mochajs.org/) to test its code. By default `yarn test` will test all files ending in `.spec.ts`.

Test commands:

```bash
# Test with coverage
yarn test:cov

# Test on file change
yarn test:watch
```

## License

MPL-2.0
