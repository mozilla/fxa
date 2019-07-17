# Pairwise Pseudonymous Identifiers

A Pairwise Pseudonymous Identifier (PPID) is defined in the [OpenID Connect Spec][#oidc-spec] as:

> Identifier that identifies the Entity to a Relying Party that cannot be correlated with the Entity's PPID at another Relying Party.

Put another way, PPIDs provide a single user with distinct userids across distinct Relying Parties (RPs), enhancing user privacy by preventing cross-site correlation based on userid.

By default, Firefox accounts provides the same userid to all Mozilla-internal RPs to facilitate cross service correlation. As Mozilla expands its product offering to include white labeled 3rd party services, we want to uphold Mozilla's principles regarding user privacy by providing external services with only the minimal data necessary.

PPIDs allow Mozilla to enforce our privacy stance by providing each PPID enabled RP with a distinct userid for a given user. For example, a user that signs into 2 PPID enabled services would have 3 distinct userids:

- FxA userid, only seen by Mozilla properties
- PPID for service 1, known by Mozilla and service 1
- PPID for service 2, known by Mozilla and service 2

PPIDs prevents service 1 and service 2 from correlating user data with each other based on userid alone. _PPIDs only prevent correlation based on userid_, transient information such as IP address, shared 3rd party cookies, and user-agent information can still be used by RPs to correlate users. This also assumes that RPs are unable to fetch user profile information such as email address and display name that could be used as additional data points.

PPIDs are returned as the `sub` claim within an [OIDC ID Token][#oidc-id-token] or [OAuth JWT Access Token][#oauth-jwt-access-token].

## Further enhancing privacy through PPID rotation

User privacy can be further enhanced by preventing long term profiles from being built for a given user through PPID rotation. Firefox accounts supports two methods of PPID rotation, RP initiated, and server initiated.

### RP initiated PPID rotation

Any PPID enabled RP that receives JWT access tokens or OIDC ID tokens can initiate PPID rotation by specifying an additional parameter, `ppid_seed`, when requesting tokens from `/token` endpoints on the OAuth server. `ppid_seed` must be an integer between 0 and 1024, and can be rotated at any time.

### Server initiated PPID rotation

By default, Firefox accounts does not enforce sub rotation, but for sensitive RPs where long term user profiles are undesirable, Firefox accounts can enforce periodic rotation without depending on the RP to pass in a `ppid_seed`. The default period is 6 hours.

## Ensuring 3rd parties are unable to access user information

An OAuth access token is a bearer token that can be presented by anyone to an OAuth service provider to access a protected resource. If a JWT access token contains a PPID `sub` claim that is meant to protect a user's privacy, but is granted the `profile` scope allows the service provider to present the same access token to the FxA profile server and learn the user's true identity. As such, tokens _MUST NOT_ be requested with the `profile` scope or any of its implicants such as `profile:uid` or `profile:email`.

## PPIDs and logging

PPIDs are not used by internal Mozilla properties and are not logged.

## PPID generation

PPIDs are generated using [HKDF][#hkdf] with the following inputs:

- **km**: `client_id`.`userid_hex`.`ppid_seed||0`.`serverEnforcedRotationInput`
- **info**: `oidc ppid sub`
- **salt**: A secret configured by Ops
- **len**: 16 bytes, which leads to a 32 hex character result

### Server enforced rotation input

The server enforced rotation input defaults to the string `0`. If server enforced rotation is enabled for the client, it is calculated as follows:

```
serverEnforcedRotationInput = Math.floor(Date.now() / ROTATION_PERIOD)
```

If an RP requests two tokens in short succession, their `sub` claims could be different if the first token was generated previous to the rotation epoch and the second after.

## The future

Firefox accounts does not currently support [sector identifiers][#oidc-sector-identifier]. Sector identifiers allow multiple client_ids to receive the same PPID, this would be useful if the RP has applications on multiple platforms, e.g., an app on Android, iOS, and an addon in Firefox.

[#oidc-spec]: https://openid.net/specs/oidc-core-1_0.html#Terminology
[#oidc-id-token]: https://openid.net/specs/openid-connect-core-1_0.html#IDToken
[#oidc-sector-identifier]: https://openid.net/specs/openid-connect-core-1_0.html#PairwiseAlg
[#oauth-jwt-access-token]: https://tools.ietf.org/html/draft-bertocci-oauth-access-token-jwt-00
[#hkdf]: https://tools.ietf.org/html/rfc5869
