# FXA Admin Server

This is the GraphQL server for an internal resource for FxA Admins to access a set of convenience tools.

## Connecting to the Playground

The [GraphQL playground](https://www.apollographql.com/docs/apollo-server/testing/graphql-playground/) for this package is available at [localhost:8095/graphql](http://localhost:8095/graphql), providing a GUI for an up-to-date schema and API docs, as well as a way to test queries and mutations.

The playground requires an `oidc-claim-id-token-email` authorization header. In production this is supplied through an nginx header after LDAP credentials, which have been verified but in development, a dummy email should be supplied in the bottom left-hand corner of the GQL playground labeled "HTTP Headers":

In addition a `REMOTE-GROUPS` header must also be set to indicate the user's LDAP group memebership. Again, in production this will be set by nginx, but in development, a dummy value must be suplied.

```
{
  "oidc-claim-id-token-email": "hello@mozilla.com",
  "REMOTE-GROUPS": "vpn_fxa_admin_panel_prod"
}
```

Valid remote groups are as follows:

- `vpn_fxa_admin_panel_prod` - production users with admin level permissions
- `vpn_fxa_supportagent_prod` - production users with support level permissions
- `vpn_fxa_admin_panel_stage` - stage users with admin level permissions
- `vpn_fxa_supportagent_stage` - stage users with support level permissions

Hit the "play" button and the schema and docs will populate.

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
