# JWT access tokens

Author: Shane Tomlinson
Last updated: 2019-10-09

The [original OAuth 2.0 spec][#ietf-oauth-spec] does not specify a
format for access tokens, most OAuth implementations use fixed length opaque tokens.

A service provider (SP) that accepts access tokens must verify the token to determine
whether the grant associated with the token has sufficient privileges to access a
protected resource. With opaque tokens, verification involves sending the token to
the remote authorization server (AS)'s `/introspect` endpoint. The AS looks up the
token in a database, verifies the token is still valid, and returns associated
metadata such as a userid and list of scopes in the grant. Because verification
involves a request to the AS, verification can introduce unwanted latency.

The IETF [JWT access token draft spec][#ietf-jwt-access-token-draft-spec]
solves the latency problem by defining a standard access token format that can be verified
locally by the SP, eliminating the need to call remote services on every verification.

[JWTs are signed JSON packets][#ietf-jwt-spec] that can contain
arbitrary information in fields called `claims` where a claim is a single unit of
information. JWT access tokens are signed with public/private key pairs, and once the
SP fetches the correct public key from the AS, no further remote calls are needed.
JWT access tokens can contain most of the same information as the AS's `/introspect`
endpoint.

At a high level, a SP that wishes to do local verification of JWT access tokens needs
to verify the header of the token, verify the signature of the token, ensure the token
is not yet expired, and ensure the access token contains the correct claims necessary
to access a protected resource. More information can be found in the section titled
[Local verification of a JWT access token](#local-verification-of-a-jwt-access-token).

## Claims within an access token

Firefox Accounts largely follows the IETF JWT access token draft spec's
[Data Structure][#ietf-jwt-access-token-draft-spec-structure].

- `aud` - audience. By default the `client_id` of the Relying Party (RP). If a RP specifies
  a [Resource Indicator][#ietf-resource-indicator-draft-spec] when requesting the access token, it will be an array that contains both the client_id and the resource indicator.
- `client_id` - client id of the RP.
- `iss` - issuer. For tokens that come from FxA's production stack this will be `https://accounts.firefox.com`
- `exp` - expiration time after which the access token MUST NOT be accepted for processing, in _seconds_ since Unix epoch.
- `iat` - time at which the token was issued, in _seconds_ since Unix epoch.
- `jti` - JWT id
- `scope` - space separated list of scopes associated with the grant.
- `sub` - subject, user id. Normally the FxA user id for the user. If the RP uses [Pairwise Pseudonymous Identifiers (PPID)][#ppid-doc], will be an identifier that cannot be correlated to either the real FxA userid, or the PPID given out to other RPs.
- `fxa-subscriptions` - space separated list of subscriptions the user has for the RP. Claim is only present if the user has a subscription with the RP.

## Local verification of a JWT access token

The following is based on the [section on validation][#ietf-jwt-access-token-draft-spec-validation] JWT Access Token Draft Spec:

1.  The resource server MUST verify that the `typ` header value case-insensitively
    matches `at+jwt` or `application/at+jwt` and reject tokens carrying any other value.
2.  The resource server MUST validate the signature of all incoming
    JWT access token according to [RFC7515][#ietf-jws-spec] using the algorithm
    specified in the JWT `alg` Header Parameter. The SP MUST use the keys provided
    at https://oauth.accounts.firefox.com/v1/jwks
3.  The `iss` claim MUST exactly match `https://accounts.firefox.com`
4.  The resource server MUST validate that the `aud` claim contains the
    resource indicator value corresponding to the identifier the
    resource server expects for itself, and should at a minimum contain
    the client_id for the RP. The `aud` claim MAY contain an
    array with more than one element. The JWT access token MUST be
    rejected if `aud` does not list the resource indicator of the
    current resource server as a valid audience, or if it contains
    additional audiences that are not known aliases of the resource
    indicator of the current resource server.
5.  The current time MUST be before the time represented by the `exp`
    Claim. `exp` is in _seconds_ since Unix epoch.
6.  The `scope` claim must contain the scopes necessary to access a protected resource.
7.  If the protected resource requires a subscription, check the `fxa-subscriptions` claim
    for the expected subscription capability. More information on why the `fxa-subscriptions`
    claim is used instead of adding subscriptions onto the `scope` claim, please see
    [this explanation][#why-fxa-subscriptions-claim].

Libraries such as [node-jsonwebtoken][#node-jsonwebtoken], when properly configured, take
care of all of this except for the `scope` and `fxa-subscriptions` checks.

## Remote verification of a JWT access token

A SP is not required to locally verify JWT access tokens, instead it may verify
these tokens by presenting them to FxA's [/introspect][#fxa-introspect-endpoint-api-docs]
and [/verify][#fxa-verify-endpoint-api-docs] endpoints.

## Pitfalls of JWT access tokens

While FxA JWT access tokens allow for local verification, they do have some drawbacks.

### Access token size

The most obvious drawback is size, a JWT access token is [requires over 800 bytes][#github-jwt-token-size]
whereas a normal access token requires 64 bytes. JWT access tokens that are
sent with every request could add significant overhead.

JWT access tokens are signed using RSA keys, which generate large signatures. Changing
to a [different key type][#github-es256-signing-key] would reduce the signature size.

### Revocation and cached tokens

A second, more subtle issue comes with local verification and revocation. When a
token is verified against FxA servers, FxA is able to look up whether that token has
been revoked by the user and immediately notify the SP the token is no longer valid.
SPs that cache and locally verify JWT access tokens have no way of knowing whether
the token has been revoked, they can only determine whether a token has expired.
Because tokens expire 24 to 48 hours after they are created (depending on FxA server load),
an SP could consider a token valid long after it has been revoked by the user.

Two mechanisms exist to partially mitigate this:

- Perform an occasional remote verification against the `/introspect` endpoint.
- When trading the code for the token, specify a short `ttl`. Whenever the refresh token
  is used to fetch a new access token, the `/token` endpoint will return a 4xx error indicating
  the refresh token has been revoked.

In the future, FxA may [send notifications to SPs][#notify-sp-on-token-revocation] whenever
an access or refresh token is revoked, but this functionality is not yet built.

## Requesting use of JWT access tokens

JWT access tokens are only enabled for RPs on an opt-in basis. RPs can request JWT access
tokens when their OAuth credentials are being provisioned.

[#ietf-oauth-spec]: https://tools.ietf.org/html/rfc6749
[#ietf-jwt-access-token-draft-spec]: https://tools.ietf.org/html/draft-ietf-oauth-access-token-jwt#section-3
[#ietf-jwt-access-token-draft-spec-structure]: https://tools.ietf.org/html/draft-ietf-oauth-access-token-jwt#section-2.2
[#ietf-jwt-access-token-draft-spec-validation]: https://tools.ietf.org/html/draft-ietf-oauth-access-token-jwt#section-4
[#ietf-jws-spec]: https://tools.ietf.org/html/rfc7515
[#ietf-jwt-spec]: https://tools.ietf.org/html/rfc7519
[#ietf-resource-indicator-draft-spec]: https://tools.ietf.org/html/draft-ietf-oauth-resource-indicators-08
[#ppid-doc]: https://github.com/mozilla/fxa/blob/main/packages/fxa-auth-server/docs/oauth/pairwise-pseudonymous-identifiers.md
[#why-fxa-subscriptions-claim]: https://github.com/mozilla/fxa/blob/main/docs/adr/0007-subscription-claim-jwt-access-token.md
[#fxa-introspect-endpoint-api-docs]: https://github.com/mozilla/fxa/blob/main/packages/fxa-auth-server/docs/oauth/api.md#post-v1introspect
[#fxa-verify-endpoint-api-docs]: https://github.com/mozilla/fxa/blob/main/packages/fxa-auth-server/docs/oauth/api.md#post-v1verify
[#node-jsonwebtoken]: https://github.com/auth0/node-jsonwebtoken/
[#notify-sp-on-token-revocation]: https://github.com/mozilla/fxa/issues/2246
[#github-jwt-token-size]: https://github.com/mozilla/fxa/issues/1797
[#github-es256-signing-key]: https://github.com/mozilla/fxa/pull/1918
