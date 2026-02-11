# FXA Admin Server

This is the GraphQL server for an internal resource for FxA Admins to access a set of convenience tools.

## Connecting to the Playground

The [GraphQL playground](https://www.apollographql.com/docs/apollo-server/testing/graphql-playground/) for this package is available at [localhost:8095/graphql](http://localhost:8095/graphql), providing a GUI for an up-to-date schema and API docs, as well as a way to test queries and mutations.

The playground requires an `oidc-claim-id-token-email` authorization header. In production this is supplied through an nginx header after LDAP credentials have been verified, but in development, a dummy email should be supplied in the bottom left-hand corner of the GQL playground labeled "HTTP Headers":

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

## Subscription Service

The subscription service binds account records to info about their current set of subscriptions. Subscription data is held in two datastores. Firestore acts as a backing document store and is responsible for holding documents containing subscription information. If the subscription data cannot be located in Firestore, then the underlying API implementation will be queried and the subscription data will be pulled directly from the source.

It can be difficult to test the subscription in its full form. Stripe integration is not difficult, but workflows for apple app store purchases and google play purchases are difficult to test manually. As a side effect of this, feature flags have been added to disable these calls during local development.

## Feature Flags

Feature flags can be found in `./src/config/index.ts`, under the `featureFlags` section. Feature flags should be named in an obvious way, and are useful for local testing, soft launches, and as a short circuit if a feature starts misbehaving.

## Configuration

All configuration settings can be found in `./src/config/indext.ts`. Furthermore, overrides can be applied by adding json files to this folder containing partial overrides. For example, to create local settings, add the following to `./src/config/local.json`

```
{
  featureFlags: {
    subscriptions: {
      playStore: false
    }
  }
}
```

## Secrets

With the addition of subscriptions, secrets are now required to fully exercise the subscription service code. Adding secrets is not difficult though. Simply add a `./src/config/secrets.json` file and provide the required config settings. It is generally best to ask a fellow developer to get help with these values, as setting this up yourself can be time consuming.

In the event you can’t provide a secrets file, but still want to do some development work, consider using feature flags to disable subscription features accordingly.

Here is an example secrets.json that would support stripe, and google play, and apple app store.

```
{
  "subscriptions": {
     "stripeApiKey": "sk-test_123",
     "stripeWebhookSecret": "wh-sec_123",
     "paypalNvpSigCredentials": {
       "enabled": true,
       "sandbox": true,
       "user": "sb-123.business.example.com",
       "pwd": "pwd123",
       "signature": "sig--123"
     },
     "playApiServiceAccount": {
       "enabled": true,
       "keyFilename": "/Users/me/my-secrets/firestore.json",
       "projectId": "test-123"
     }
   },
   "googleAuthConfig": {
     "clientSecret": "secret-google-123"
   },
   "appleAuthConfig": {
     "clientSecret": "secret-apple-123"
   }
}
```

_(And of course real values would need to be provided…)_

**(Note: There is no watch on .json files, so run a yarn build after changing them.)**

## Testing

This package uses [Jest](https://mochajs.org/) to test its code. By default `yarn test` will test all files ending in `.spec.ts`.

Test commands:

```bash
# Test with coverage
yarn test-cov

# Test on file change
yarn test-watch
```

## GraphQL Schema Generation

The graphql schema is automatically generated. This happens on the fly and is controlled by the Graphql NestJS plugin. Simply
starting the graphql server is enough to kick off automatic schema generation. For more info about schema generation checkout
[this resource](https://docs.nestjs.com/graphql/quick-start).

If your schema is not automatically updating, check the server output. There's a chance a Typescript compilation error is
preventing the schema from being generated.

## License

MPL-2.0
