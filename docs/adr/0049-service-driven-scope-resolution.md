# Server-side scope resolution via service parameter for Firefox OAuth flows

- Status: proposed
- Deciders: Lauren Zugai, Mark Hammond
- Date: 2026-04-15

## Context and Problem Statement

Firefox is a first-party OAuth client of FxA. Across OAuth flows (sign-up, sign-in, and incremental scope authorization), Firefox currently must specify the exact `scope` query parameter in the authorization URL. (Note: today this applies to Firefox mobile clients, which use refresh tokens for ongoing access. The migration of Desktop from session-token-based access token creation to refresh tokens is covered in [ADR 0048](0048-refresh-tokens-and-account-level-authorization.md).)

This creates a coupling problem. If FxA Product decisions change which services are offered during a flow (e.g., offering an "Enable Monitor in Firefox" checkbox during initial account creation), Firefox must ship a client-side update to change the requested scopes. More fundamentally, Firefox shouldn't need awareness of which optional services FxA might offer during a given flow -- and when options are involved, the granted scopes won't match the requested scopes regardless, since users may decline options. Either Firefox over-requests scopes speculatively (option 2) or it under-requests and receives scopes it didn't ask for.

Meanwhile, FxA must maintain its own scope-to-service allowlist mapping regardless of approach to render the correct consent UI, validate that requested scopes are allowed, and enforce what gets granted.

The `service` query parameter already identifies the product context. Since the server-side mapping is unavoidable, should FxA own scope resolution entirely for first-party clients based on `service`?

## Decision Drivers

- This applies to all first-party Firefox-to-FxA OAuth flows: initial sign-up, sign-in, and incremental scope authorization for signed-in users
- Scoped keys (Sync) require password-derived key material -- scopes that need `keys_jwk` cannot be included in passwordless-entry flows regardless of approach
- FxA already maintains client registrations with `allowedScopes`, scope-to-key mappings, and consent logic server-side
- Product requirements change (e.g., "offer Monitor during sign-up") and should not require Firefox desktop release cycles
- RFC 9700 Section 2.3 (OAuth Security Best Current Practice) recommends least-privilege tokens but focuses on what is _granted_, not what is _requested_ -- the server is the enforcement point
- Firefox is a trusted first-party client, not a third-party app -- the traditional OAuth scope request model was designed for untrusted clients
- The approach should work and make sense regardless of whether Firefox browser services continue sharing Firefox's client ID or move to per-service, per-platform client IDs (e.g., Relay-in-Desktop, Relay-in-iOS) in the future

## Considered Options

- **Option 1**: Client specifies exact scopes -- Firefox sends `service=vpn&scope=https://identity.mozilla.com/apps/vpn`
- **Option 2**: Client requests all possible scopes, server narrows -- Firefox sends every scope it might ever need, FxA grants only what applies
- **Option 3**: Server resolves scopes from service -- Firefox sends `service=vpn`, FxA determines the required and optional scopes for that service context

## Decision Outcome

Chosen option: "Option 3 -- Server resolves scopes from service", because it eliminates client-server coupling for product decisions, avoids the scoped keys problem of option 2, and aligns with FxA already being the authority on scope-to-service mappings.

When `service` is specified, FxA resolves the applicable scopes server-side — `service` is a more concise way of specifying scopes, and the `scope` parameter can be dropped. When `service` is not specified, `scope` continues to work as it does today.

### Positive Consequences

- Product changes to which services/scopes are offered during a flow require only a server-side configuration change, not a Firefox release
- The server can exclude key-bearing scopes (like `oldsync`) from passwordless flows, which is impossible if the client requests all scopes upfront (option 2)
- Eliminates redundancy where `service=vpn&scope=vpn` conveyed the same information twice for simple cases
- FxA can offer optional scopes (e.g., "Also enable Monitor in Firefox?") without the client needing awareness of those options
- Scopes implied by `service` can be derived from the same mapping used for consent rendering and token granting -- single source of truth

### Negative Consequences

- Non-standard OAuth pattern -- new developers familiar with OAuth must learn this FxA-specific convention
- The client loses the ability to express nuanced scope intent beyond the `service` identifier (e.g., two features that both use `service=vpn` but want different optional scopes offered)
- Scope resolution logic becomes a server-side responsibility that must be maintained and documented

## Pros and Cons of the Options

### Option 1: Client specifies exact scopes

Standard OAuth approach where Firefox includes the `scope` parameter with the specific scopes it needs.

- Good, because it follows the standard OAuth 2.0 protocol (RFC 6749 Section 3.3)
- Good, because the client explicitly communicates what access it needs
- Bad, because every product change to scope offerings requires a Firefox client update and release cycle
- Bad, because the server must still maintain its own scope-to-service mappings independently, so having the client also specify scopes creates two sources of truth that must stay in sync
- Bad, because if optional scopes are added to a flow (e.g., Monitor-in-Firefox option during sign-up, Relay checkbox on VPN page), the client must know about them in advance
- Good, because it is compatible with a possible future migration to per-service, per-platform client IDs

### Option 2: Client requests all possible scopes, server narrows

Firefox requests every scope it could ever need, and FxA grants only the relevant subset.

- Good, because the client never needs updating when new scopes become available
- Bad, because including `oldsync` or other key-bearing scopes in the request triggers the scoped keys code path, forcing password entry -- this breaks the passwordless scope authorization flow
- Bad, because the server cannot distinguish intent ("I need VPN" vs "I need everything")
- Bad, because the consent page cannot meaningfully display what is being requested
- Good, because it is compatible with a possible future migration to per-service, per-platform client IDs

### Option 3: Server resolves scopes from service

Firefox sends only the `service` parameter instead of `scope`. FxA resolves the required and optional scopes, renders the consent page, and grants only what the user approves.

- Good, because product scope changes are server-side configuration, no client release needed
- Good, because the server already maintains these mappings and is the enforcement point for grants
- Good, because it only requires a password entry when the Sync scope is actually needed
- Good, because it aligns with RFC 9700 Section 2.3 which places privilege restriction responsibility on the authorization server
- Neutral, because the client loses granular control over scopes -- if two features both use the same `service` value but need different scopes, the client has no way to express that distinction, but this is mitigated by using different `service` values or by varying scope resolution server-side based on other flow context like `entrypoint`
- Good, because it is compatible with per-service, per-platform client IDs -- scope resolution shifts from `service` to `client_id` with no change in approach
- Bad, because it deviates from standard OAuth scope request patterns

## Links

- Reference: [Moving Desktop Firefox to the FxA "Refresh Token"](https://docs.google.com/document/d/1sPLQHayKgmsRJ8fQ61u_yCjwt_o2hrAMaKYPfo2GKzI/)
- Reference: [RFC 9700 Section 2.3 - Access Token Privilege Restriction](https://www.rfc-editor.org/rfc/rfc9700.html#section-2.3)
- Reference: [RFC 6749 Section 3.3 - Access Token Scope](https://www.rfc-editor.org/rfc/rfc6749.html#section-3.3)
