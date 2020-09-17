# Deprecate Hawk authentication on fxa-auth-server

- Deciders: Danny Coates, Ryan Kelly, Les Orchard, Ben Bangert
- Date: 2020-05-27

## Context and Problem Statement

The new FxA settings page introduces a new service in the form of a GQL API that will provide account and profile data to the browser. This service needs to make api requests to the auth-server on behalf of logged in users. The auth-server uses hawk authentication so adding another service between the browser and auth-server is not straightforward. In [ADR-0017](0017-switch-settings-auth-to-sessiontoken.md) we decided to allow the browser to share the session token with the GQL server so that it can make hawk authenticated requests. This leads us to question whether we should deprecate our use of hawk altogether.

Long ago, the precursor to onepw had 2-phase signup/login that would establish a secret key that would be used to encrypt/decrypt the sessionToken so that it was never in the clear on the wire. It was secure enough that you could login over HTTP and still be safe. We'd still use TLS, but - defense in depth. Once we had the sessionToken we used Hawk for API requests to maintain that level of security. We implemented this protocol and it worked as designed. The problem at the time was we wanted to support low-end phones on slow networks and the extra round trips meant we were too slow; bad UX. Instead of scrapping the whole thing we modified the protocol to the one we use today. The sessionToken is now sent over TLS in the signup/login response, but the "secure even over HTTP" dream is gone.

Hawk is designed for authentication over HTTP. Quoting from the design goals of Hawk:

- simplify and improve HTTP authentication for services that are unwilling or unable to deploy TLS for all resources,
- secure credentials against leakage (e.g., when the client uses some form of dynamic configuration to determine where to send an authenticated request), and
- avoid the exposure of credentials sent to a malicious server over an unauthenticated secure channel due to client failure to validate the server's identity as part of its TLS handshake.

None of those scenarios apply to auth-server.

Defining the replacement for hawk is out of scope, but let's consider the properties of the interim replacement: using the sessionToken as a bearer token.

The new surface area to which the token is exposed is in the HTTP header of API requests, sent over TLS. Both the client and server storage of the token remains unchanged. A compromised TLS connection would expose the token on more API calls where it would not have been with hawk. The sessionToken is in the body of the login response, so even with hawk that endpoint could leak the token if the TLS connection is compromised.

A leaked sessionToken would allow access to personal information, email addresses and device metadata, but not the FxA password, secret keys, or Firefox Sync data.

## Decision Drivers

- Security

## Considered Options

- Deprecate use of hawk
- Continue using hawk in future work

## Decision Outcome

We will stop using hawk in future work that requires authentication. Selecting a preferred scheme is out of scope of this ADR. Sharing the session token with trusted services is an acceptable interim solution.

## Pros and Cons of the Options

### Deprecate use of hawk

Pros:

- simpler cross service integrations
- simpler browser / client integrations
  Cons:
- unknown duration of long-term support of deprecated auth scheme

### Continue using hawk in future work

Pros:

- none. hawk is a pita
- postpones considering better options
  Cons:
- more awkward cases like GQL API
- higher long-term maintenance burden
- more difficult integrations

## Links

- [Original SRP protocol](https://wiki.mozilla.org/Identity/AttachedServices/KeyServerProtocol)
- [Onepw protocol](https://github.com/mozilla/fxa-auth-server/wiki/onepw-protocol)
- [Hawk](https://hapi.dev/module/hawk/)
