# Shared module for FxA repositories

## Shared modules

### Dual Package

Note that this is a dual package. The impetus for it was Webpack 5 compat. (And we'd want to move to all-ESM eventually.) But CommonJS was kept for backwards compatibility until we can be certain of its removal.

### l10n

`supportedLanguages.json` is the shared list of all supported locales across FxA

### oauth

`oauth.scopes` provides shared logic for validating and checking OAuth scopes.

Detailed documentation on the details of FxA OAuth scope values
is available from the [fxa-oauth-server](https://github.com/mozilla/fxa/blob/main/packages/fxa-auth-server/docs/oauth/scopes.md).
This library provides some convenient APIs for working with them
according to the rules described there.

Given a string containing scopes,
you can parse it into a `ScopeSet` object
from either a raw space-delimited string:

```
let s1 = oauth.scopes.fromString('profile:write basket');
```

Or directly from a url-encoded string:

```
let s2 = oauth.scopes.fromURLEncodedString('profile%3Aemail+profile%3Adisplay_name+clients');
```

Once you have a `ScopeSet` object,
you can check whether it
is sufficient to wholly imply another set:

```
  s1.contains('profile:email:write');          // true, implied by 'profile:write'
  s2.contains('profile:email:write');          // false
  s1.contains('profile:email:write clients');  // false, 'clients' is not in `s1`
```

Or whether it has
any scope values in common
with another set:

```
  s1.intersects('profile:email:write clients'); // true, 'profile:email:write' is common
  s2.intersects(s1);                            // true, 'profile:email' is common
  s2.intersects('clients:write basket');        // false, no members in common
```

You can filter it down
to only the scope values
implied by another scope:

```
  let s3 = oauth.scope.fromString('profile:email clients:abcd'));
  s3.filtered(s1); // 'profile:email'
  s3.filtered(s2); // 'profile:email clients:abcd'
```

Or you can find out
what values in the set
are _not_ implied by another scope:

```
  s3.difference(s1); // 'clients:abcd'
  s3.difference(s2); // the empty set
  s2.difference(s3); // 'profile:display_name clients'
```

You can also combine multiple sets of scopes,
either by generating the union as a new set:

```
  s1.union(s2); // 'profile:write basket clients'
```

Or by building up the new set in place:

```
  let allScopes = scopes.fromArray([]);
  allScopes.add(s1);  // now "profile:write basket"
  allScopes.add(s2);  // now "profile:write basket clients"
  allScopes.add(s3);  // now "profile:write basket clients"
```

### tracing

This utility allows for easy configuration of tracing. To use this in a service:

- Add the config chunk in @fxa/shared/otel to your packages's config.

- Then initialize as follows. This invocation should happen as early as possible in the service's or app's lifecycle. Ideally it's
  the first thing done, even before importing other modules.

```
// For services
const config = require('../config');
const { initTracing } = require('@fxa/shared/otel')
initTracing(config.get('tracing'));
```

To see traces on your local system, set the following environment variables:

```
# Capture all traces
TRACING_SAMPLE_RATE=1

# Send traces to console (optional, it's nice to see it working but noisy...)
TRACING_CONSOLE_EXPORTER_ENABLED=true

# Send traces to the otel service
TRACING_OTEL_EXPORTER_ENABLED=true

# Enable the otel collector service and instruct it to export traces to jaeger
TRACING_OTEL_COLLECTOR_ENABLED=true
TRACING_OTEL_COLLECTOR_JAEGER_ENABLED=true

```

The default config for tracing found at @fxa/shared/otel/config.ts will pick up these variables and result in traces showing up in Jaeger which runs locally at `localhost:16686`.

It's important to note that sentry also supports tracing integration. So we typically let a call to 'initSentry', a function located in the sentry/node.ts module do the work of initializing tracing.

## Used by:

- https://github.com/mozilla/fxa-content-server
- https://github.com/mozilla/fxa-auth-server
- https://github.com/mozilla/fxa-oauth-server
- https://github.com/mozilla/fxa-auth-mailer

## Testing

This package uses [Mocha](https://mochajs.org/) to test its code. By default `npm test` will first lint the code and then test all files ending under `test/`, and uses `esbuild-register` so it can process TypeScript files.

Test specific tests with the following commands:

```bash
# Test only test/oauth/scopes.js
npx mocha -r esbuild-register test/oauth/scopes.js

# Grep for "invalid scope values"
npx mocha -r esbuild-register -g "invalid scope values" --recursive test
```

Refer to Mocha's [CLI documentation](https://mochajs.org/#command-line-usage) for more advanced test configuration.
