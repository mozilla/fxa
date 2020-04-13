# FXA Admin Server

This is the GraphQL server for an internal resource for FxA Admins to access a set of convenience tools.

## Generate test email bounces

If you need to create a handful of test email bounces in development you can use `npm run email-bounce`.

By default this will create a new email bounce for a newly-created dummy account.

Use the `--email` flag to create a bounce for an existing account.

Use the `--count` flag to create X number of bounces in a single command.

Example: `npm run email-bounce -- --email=test@example.com --count=3`

## License

MPL-2.0
