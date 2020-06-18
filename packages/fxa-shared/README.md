# Shared module for FxA repositories

## Shared modules

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

## Publishing new version

Install the [np](https://github.com/sindresorhus/np) tool, run `np [new_version_here]`.

## Used by:

- https://github.com/mozilla/fxa-content-server
- https://github.com/mozilla/fxa-auth-server
- https://github.com/mozilla/fxa-oauth-server
- https://github.com/mozilla/fxa-auth-mailer

## Testing

This package uses [Mocha](https://mochajs.org/) to test its code. By default `npm test` will first lint the code and then test all files ending under `test/`, and uses `ts-node` so it can process TypeScript files.

Test specific tests with the following commands:

```bash
# Test only test/oauth/scopes.js
npx mocha -r ts-node/register test/oauth/scopes.js

# Grep for "invalid scope values"
npx mocha -r ts-node/register -g "invalid scope values" --recursive test
```

Refer to Mocha's [CLI documentation](https://mochajs.org/#command-line-usage) for more advanced test configuration.
