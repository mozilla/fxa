# Authentication in Settings Redesign

- Status: accepted
- Deciders: Les Orchard, Lauren Zugai, Ben Bangert, Ryan Kelly
- Date: 2020-04-15

Issue: https://jira.mozilla.com/browse/FXA-1559

## Context and Problem Statement

The Settings Redesign app needs to query & mutate the same protected user data as the existing settings app hosted on content-server. This will require some form of authentication & authorization to manage that data.

## Decision Drivers

- Smooth UX
- Security
- Development velocity
- Ease of integration

## Considered Options

- Authenticate via OAuth2 to use auth-server APIs
- Authenticate via OAuth2 to use DB directly
- Reuse existing sessionToken on content-server with auth-server APIs
- Implement own login sessions

## Decision Outcome

Chosen option: "Authenticate via OAuth2 to use auth-server APIs", because:

- It requires minimal changes to existing auth-server implementation and infrastructure.
- It relies on an authentication mechanism with relatively well-known security properties.

### Positive Consequences

- The OAuth2 access token mechanism is better suited to this purpose than a novel scheme to share session token credentials.
- The new Settings Redesign app can use existing auth-server APIs with minimal modifications to accept scoped OAuth2 access tokens. This can constrain most of the novelty in the project to the redesigned & reimplemented settings UX.

### Negative Consequences

- We will need to modify auth strategies in auth-server APIs, taking care not to affect existing usage in the production settings app.
- We don't have an entirely greenfield project, which could be a bit of a drag. But, rediscovering lessons learned in existing code can also be a drag.

## Pros and Cons of the Options

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
  - New implementation will require security reviews of auth-server reimplementations

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
