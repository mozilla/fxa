# FXA Admin Server

This is the GraphQL server for an internal resource for FxA Admins to access a set of convenience tools.

## Connecting to the Playground

The [GraphQL playground](https://www.apollographql.com/docs/apollo-server/testing/graphql-playground/) for this package is available at [localhost:8095/graphql](http://localhost:8095/graphql), providing a GUI for an up-to-date schema and API docs, as well as a way to test queries and mutations.

The playground requires an `oidc-claim-id-token-email` authorization header. In production this is supplied through an nginx header after LDAP credentials, which have been verified but in development, a dummy email should be supplied in the bottom left-hand corner of the GQL playground labeled "HTTP Headers":

In addition a `remote-groups` header must also be set to indicate the user's LDAP group membership. Again, in production this will be set by nginx, but in development, a dummy value must be supplied.

```
{
  "oidc-claim-id-token-email": "hello@mozilla.com",
  "remote-groups": "vpn_fxa_admin_panel_prod"
}
```

Valid remote groups are as follows:

- `vpn_fxa_admin_panel_prod` - production users with admin level permissions
- `vpn_fxa_supportagent_prod` - production users with support level permissions
- `vpn_fxa_admin_panel_stage` - stage users with admin level permissions
- `vpn_fxa_supportagent_stage` - stage users with support level permissions

Hit the "play" button and the schema and docs will populate.

## Limiting Access With Remote Groups

The `remote-groups` header will ultimately limit access to certain data in the graphql schema. This is controlled via a nestjs guard. The guard is applied by tagging methods in our resolvers with an `@feature(AdminPanelFeature.$FEATURE_NAME)`. Once this is applied, access is restricted based on the feature’s configuration.

The underlying configuration for features is shared between the admin-panel and the admin-server and therefore resides in `fxa-shared/guard/AdminPanelGuard`. Currently these permissions are hardcoded since there is no compelling reason for them to change.

During development a remote-group with admin permissions is typically used so that all parts of the graphql schema are accessible. However, it might still be useful to test with a remote group with fewer permissions. This can be accomplished by simply using a different `remote-groups` header value.

If access is insufficient an error field will be returned indicating insufficient permissions. It is important to note that because access is restricted at the field level, there is a possibility a graphql query can partially succeed. In this case, the fields that are accessible will still be returned, but there will also be an error field in the response indicating what part of the query could not be fulfilled.

## Generate test email bounces

If you need to create a handful of test email bounces in development you can use `yarn email-bounce`.

By default this will create a new email bounce for a newly-created dummy account.

Use the `--email` flag to create a bounce for an existing account.

Use the `--count` flag to create X number of bounces in a single command.

Use the `--hasDiagnosticCode` flag to create a bounce with a diagnostic code (otherwise null).

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
