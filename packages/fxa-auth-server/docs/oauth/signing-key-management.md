# Management of JWT Signing Keys

This server uses signed [JWTs](https://jwt.io/) to represent various kinds of security token,
including:

- `id_token`s as defined by [OpenID Connect](https://openid.net/specs/openid-connect-core-1_0.html)
- `access_token`s as defined by [JWT Profile for OAuth 2.0 Access
  Tokens](https://datatracker.ietf.org/doc/draft-bertocci-oauth-access-token-jwt/)
- Security Event Tokens as defined by [RFC8417](https://tools.ietf.org/html/rfc8417)

RPs are expected to verify the signatures on these JWTs by fetching our public keys via the
[OpenID Connect Discovery Protocol](https://openid.net/specs/openid-connect-discovery-1_0.html),
which involves:

1. Fetching our main OpenID metadata document at https://accounts.firefox.com/.well-known/openid-configuration
2. Extracting the contained `"jwks_uri"` entry
3. Fetching a [JWK Set](https://tools.ietf.org/html/rfc7517) document from that URI
4. Respecting standard HTTP cache-control headers on those resources

We thus have a coordination problem between this server and its RPs when it comes to changing our
JWT signing keys. Let `T_cache` be the max age in the cache-control headers of our metadata documents,
and `T_tokens` be the maximum lifetime of any token issued by this service. Then:

- We must advertise a new signing key in our JWK Set for at least `T_cache` seconds before we start
  using it to sign tokens. If we don't, RPs with a cached copy of our JWK Set may not know to trust
  the new key, resulting in spurious verification failures and/or fragile logic to refresh the cached
  copy on-demand when verification fails.
- We must continue to advertise an old signing key in our JWK Set for at least `T_tokens` seconds
  after we stop using it to sign tokens. If we don't, RPs who refresh their cache of our JWK Set may
  treat tokens signed with that key as invalid before they expire, resulting in spurious verification
  failures.

To help manage this, the server config has slots for three different keys, one required and the others
optional:

- `openid.key`: The private key that is actively being used to sign tokens. This key is required.
- `openid.newKey`: A new private key that we intend to start using to sign tokens in the future.
  This key is optional, but can be specified in order to start advertising it before use.
- `openid.oldKey`: The _public_ component of a key we previously used to sign tokens. This key is
  optional, but can be specified in order to continue advertising it while tokens bearing its signature
  may be active.

The procedure for rotating the active signing key is:

- Create the new signing key and configure it as `openid.newKey`, while leaving the existing `openid.key` intact.
  - This can be performed using `../scripts/prepare-new-signing-key.js`.
- Deploy to all server instances, then wait for at least `T_cache` seconds plus some margin for clock error.
- Take the public component of `openid.key` and configure it as `openid.oldKey`, then move `openid.newKey`
  to `openid.key`.
  - This can be performed using `../scripts/activate-new-signing-key.js`.
- Deploy to all server instances, then wait for at least `T_tokens` seconds plus some margin for clock error.
- Remove `openid.oldKey` from the configuration.
  - This can be performed using `../scripts/retire-old-signing-key.js`.
- Deploy to all server instances, then celebrate a job well done.

This scheme keeps things fairly simple, but it also means that each key rotation event must be at least
`T_cache + T_tokens` seconds apart. If this proves to be a problem in practice, we could reduce the limit
to `T_cache` by keeping a _list_ of old signing keys rather than a single key.

For our main production environment, secret keys are managed via [SOPS](https://github.com/mozilla/sops).
If you're working in such an environment you can do this to extract the keys from SOPS into local files:

```
./scripts/sops-key-config.js extract path/to/encrypted/config.yaml
```

Then, after operating on them locally using the above key-rotation scripts, you can insert the modified
values back into SOPS via:

```
./scripts/sops-key-config.js insert path/to/encrypted/config.yaml
```
