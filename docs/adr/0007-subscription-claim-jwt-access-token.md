# Placing subscription info in the `fxa-subscriptions` claim of JWT access tokens

- Status: proposed
- Deciders: Shane Tomlinson
- Date: 2019-09-30

Technical Story: https://github.com/mozilla/fxa/issues/1595

## Context and Problem Statement

A mechanism is needed to inform service providers (SP) that a user has paid for a given subscription. A SP could fetch the user's profile information, however, we prevent some 3rd party SPs from doing so, and instead give them all the information they need in a JWT format access token. Adding subscription information in JWT access tokens will give SPs the information they need to verify users have paid for a subscription.

## Decision Drivers

- Security - Users should not be able to get access to subscriptions they have not paid for.
- Extensibility - Adding subscription info should not inhibit future extensions to JWT access tokens.
- Standards - The [JWT access token draft spec][#jwt-draft-spec] format should be followed as closely as possible.

## Considered Options

1. Add subscriptions to the `scopes` claim
2. Add subscriptions as its own claim, `fxa-subscriptions`

## Decision Outcome

Chosen option: Adding subscription info into its own claim was chosen because FxA's lax scope checking means bad acting users could grant themselves access to subscriptions they have not paid for. See [this bug regarding FxA's lax scope checking][#lax-scope-checking].

### Positive Consequences

- The JWT access token contains all the information an SP needs to verify the user has paid for a subscription.
- Users are unable to grant themselves access to subscriptions they have not paid for.

### Negative Consequences

- SPs must now check two claims from the JWT to ensure a user is able to access a protected resource.
- An additional claim is added that is not defined in [the JWT access token draft spec][#jwt-draft-spec].

## Pros and Cons of the Options

### Add subscriptions to the `scopes` claim

An access token for a user that has paid for `subscription1` would have `subscription1` in it's scope claim.

e.g.,

```json
{
  "jti": "cafecafe",
  "sub": "deadbeef",
  "scope": "profile:read subscription1",
  ...
}
```

- Good, because subscription information is in `scope` which is most likely the expected claim in which an SP would look for this info.
- Good, because no new claims are added over what's defined in [the JWT access token draft spec][#jwt-draft-spec].
- Bad, because [FxA's lax scope checking][#lax-scope-checking] means users would grant themselves access to subscriptions they have not paid for.

### Add subscriptions to the `fxa-subscriptions` claim

An access token for a user that has paid for `subscription1` would have `subscription1` in it's scope claim.

e.g.,

```json
{
  "jti": "cafecafe",
  "sub": "deadbeef",
  "scope": "profile:read",
  "fxa-subscriptions": "subscription1"
  ...
}
```

- Good, because users are unable to grant themselves access to subscriptions they have not paid for.
- Good, because subscription information is isolated from other possible future JWT extensions.
- Bad, because `fxa-subscriptions` is a non-standard claim and SP developers may not expect to look there.

## Links

[#jwt-draft-spec]: https://tools.ietf.org/html/draft-bertocci-oauth-access-token-jwt-00
[#lax-scope-checking]: https://github.com/mozilla/fxa/issues/2478
