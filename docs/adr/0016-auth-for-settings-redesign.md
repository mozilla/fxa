# Authentication in Settings Redesign

- Status: proposed
- Deciders: Les Orchard, Lauren Zugai, Ben Bangert, Ryan Kelly
- Date: 2020-04-15

Issue: https://jira.mozilla.com/browse/FXA-1559

## Context and Problem Statement

The Settings Redesign app needs to query & mutate the same protected user data as the existing settings app hosted on content-server. This will require some form of authentication & authorization to manage that data. [ADR-0014] included several assumptions that turned out to be inaccurate during implementation efforts. Using OAuth2 tokens in the auth-server for the API calls needed is a larger effort than anticipated and will not meet time/work constraints for the Settings Redesign. This ADR includes a new option that is proposed to meet these decision drivers.

## Decision Drivers

- Smooth UX
- Security
- Development velocity
- Ease of integration

## Considered Options

- Authenticate with sessionToken, then use a unique Bearer token for auth-server APIs.
- Authenticate via OAuth2 to use auth-server APIs
- Authenticate via OAuth2 to use DB directly
- Reuse existing sessionToken on content-server with auth-server APIs
- Implement own login sessions

## Decision Outcome

Chosen option: "Authenticate with sessionToken, then use a unique Bearer token for auth-server APIs", because:

- It requires minimal changes to existing auth-server implementation and infrastructure.
- It relies on an authentication mechanism with relatively well-known security properties.

### Positive Consequences

- We do not have to re-implement substantial logic in the auth-server for using OAuth2 tokens.

### Negative Consequences

- We will need to modify auth strategies in auth-server APIs.
- We don't have an entirely greenfield project, which could be a bit of a drag. But, rediscovering lessons learned in existing code can also be a drag.
- We will be using a unique Bearer token between the graphql API and the auth-server that purports to represent the original Hawk request.

## Pros and Cons of the Options

### Authenticate with sessionToken, then use a unique Bearer token for auth-server APIs.

While we could like to someday deprecate the session token mechanism, in this case a substantial portion of the API's used in auth-server assume a sessionToken and the data returned when authenticating it will be used. The session token includes additional relevant authentication method information that is currently not present on the OAuth2 tokens which further complicates adapting the auth-server methods to use an OAuth 2 token.

- Pros:
  - Can be done with seamless UX - user visits new settings without confirmation
  - Minimal work involved as the new auth-server auth strategy can lookup originating sessionTokenID.
- Neutral:
  - GraphQL server needs to proxy auth-server APIs
- Cons:
  - More systems that continue to use sessionTokens which we would like to deprecate.
  - We use Hawk request signing with the session token credentials for authentication. Passing these credentials from the frontend to a GQL backend essentially defeats the purpose of Hawk, since the scheme is in part meant to minimize the transmission of credentials over the network.

### Authenticate via OAuth2 to use auth-server APIs

We would like to someday deprecate the session token mechanism altogether. This could be a start.

- Pros:
  - Security properties of OAuth2 authn / authz are known and not entirely novel
- Neutral:
  - GraphQL server needs to proxy auth-server APIs
- Cons:
  - APIs on auth-server need auth strategy changes to accept OAuth tokens
  - May initially require a hack similar to payments-server where a pre-generated access token is passed along
  - Many APIs built against assumption of data loaded with the sessionToken which will incur substantial work in the auth-server to accommodate.
  - OAuth2 token is missing information relevant to the users active session that is present in the sessionToken.

### Authenticate via OAuth2 to use DB directly

We would like to someday deprecate the session token mechanism altogether. We would also like to modernize around the sorts of things auth-server does. This could be a start.

- Pros:
  - Security properties of OAuth2 authn / authz are known and not entirely novel
  - Can re-use at least the oauth APIs on auth-server to validate token stored in client
- Neutral:
  - GraphQL server can be implemented from scratch directly against DB
- Cons:
  - Auth UX flow will require user to confirm permissions
  - Skipping auth-server requires reinventing many things
  - New implementation will require security reviews of auth-server re-implementations
  - OAuth2 token is missing information relevant to the users active session that is present in the sessionToken.

### Reuse existing sessionToken on content-server with auth-server APIs

The Settings Redesign frontend will be hosted at `accounts.firefox.com/beta/settings` per [FXA-1539](https://jira.mozilla.com/browse/FXA-1539) / [#4819](https://github.com/mozilla/fxa/issues/4819). This means it will have access to the same credentials as the original settings frontend on content-server.

- Pros:
  - Can be done with seamless UX - user visits new settings without confirmation
- Neutral:
  - GraphQL server needs to proxy auth-server APIs
- Cons:
  - We use Hawk request signing with the session token credentials for authentication. Passing these credentials from the frontend to a GQL backend essentially defeats the purpose of Hawk, since the scheme is in part meant to minimize the transmission of credentials over the network.

### Implement own login sessions

We could make a complete break from everything but the database and start fresh.

- Pros:
  - None?
- Neutral:
  - GraphQL server can be implemented from scratch directly against DB
- Cons:
  - User must login separately - cannot piggy-back atop existing FxA login
  - Novel security properties of new login session system
  - Need to maintain storage for persistent sessions - e.g. a database or redistribution
  - Skipping auth-server requires reinventing many auth-server things

[adr-0014]: 0014-auth-for-settings-redesign.md
