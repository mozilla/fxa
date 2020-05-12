# Switch from OAuth2 to sharing sessionToken with GraphQL server for settings redesign auth

- Status: proposed
- Deciders: Les Orchard, Ben Bangert, Danny Coates, Ryan Kelly
- Date: 2020-05-12

Issue:

- https://github.com/mozilla/fxa/issues/4850
- https://jira.mozilla.com/browse/FXA-1559

## Context and Problem Statement

The Settings Redesign app needs to query & mutate the same protected user data as the existing settings app hosted on content-server. This will require some form of authentication & authorization to manage that data.

In [ADR-0014](0014-auth-for-settings-redesign.md), we'd decided to use OAuth2 as the mechanism. But, upon attempting to implement, we discovered that [context missing from OAuth2 tokens][missing-oauth2-context] rendered the option unusable.

[missing-oauth2-context]: https://github.com/mozilla/fxa/pull/4931#discussion_r411828476

## Decision Drivers

Basically, same as [ADR-0014](0014-auth-for-settings-redesign.md):

- Smooth UX
- Security
- Development velocity
- Ease of integration

## Considered Options

- Reuse existing sessionToken on content-server with auth-server APIs
- Authenticate via OAuth2 to use auth-server APIs

## Decision Outcome

Chosen option: "Reuse existing sessionToken on content-server with auth-server APIs", because it's the least novel option requiring fewest changes to auth-server.

### Positive Consequences

- Easiest path to authenticating on auth-server for API requests, works almost exactly like the settings client does already.

### Negative Consequences

- We defeat the security promises of Hawk, but we're not really relying on them. We'd also like to move away from Hawk in the future anyway.

## Pros and Cons of the Options

### Reuse existing sessionToken on content-server with auth-server APIs

The Settings Redesign frontend will be hosted at `accounts.firefox.com/beta/settings` per [FXA-1539](https://jira.mozilla.com/browse/FXA-1539) / [#4819](https://github.com/mozilla/fxa/issues/4819). This means it will have access to the same credentials as the original settings frontend on content-server.

- Pros:
  - Can be done with seamless UX - user visits new settings without confirmation
  - Requires little to no changes on auth-server since the existing sessionToken auth process will be followed.
- Cons:
  - sessionTokens are long lived. Problems if one leaked, though this is unlikely.
  - Passing credentials from client to server defeats the purpose of Hawk.
    - However, this drawback [can be considered acceptable because](https://github.com/mozilla/fxa/pull/5253#issuecomment-626112085):
      - We don't take advantage of Hawk's security promises
        - Replay protection is ignored
        - FxA is served via HTTPS, so we don't need security over unencrypted HTTP.
      - We'd like to move away from Hawk altogether in the future.

### Authenticate via OAuth2 to use auth-server APIs

We would like to someday deprecate the session token mechanism altogether. This could be a start.

- Pros:
  - Security properties of OAuth2 authn / authz are known and not entirely novel
  - Auth-server APIs can be reused with small changes
- Neutral:
  - GraphQL server needs to proxy auth-server APIs
- Cons:
  - APIs on auth-server need auth strategy changes to accept OAuth tokens
  - May initially require a hack similar to payments-server where a pre-generated access token is passed along
  - OAuth2 access token would need reimplementation of many contextual details from sessionToken - i.e. [different levels of authentication & verification like ACCOUNT_UNVERIFIED, SESSION_UNVERIFIED, TOTP_REQUIRED](https://github.com/mozilla/fxa/pull/4931#discussion_r411828476) that _could_ be implemented in scopes with additional work.
