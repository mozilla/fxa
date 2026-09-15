# Server-side scope resolution via service parameter for Firefox OAuth flows

- Status: accepted
- Deciders: Lauren Zugai, Mark Hammond, Wil Clouser, Vijay Budhram, Dan Schomburg
- Date: 2026-04-15

## Context and Problem Statement

Firefox is a first-party OAuth client of FxA. Across OAuth flows (sign-up, sign-in, and incremental scope authorization), Firefox currently must specify the exact `scope` query parameter in the authorization URL. (Note: today this applies to Firefox mobile clients, which use refresh tokens for ongoing access. The migration of Desktop from session-token-based access token creation to refresh tokens is covered in [ADR 0048](0048-refresh-tokens-and-account-level-authorization.md).)

This creates a coupling problem. If FxA Product decisions change which services are offered during a flow (e.g., offering an "Enable Monitor in Firefox" checkbox during initial account creation), Firefox must ship a client-side update to change the requested scopes. More fundamentally, Firefox shouldn't need awareness of which optional services FxA might offer during a given flow -- and when options are involved, the granted scopes won't match the requested scopes regardless, since users may decline options. Either Firefox over-requests scopes speculatively (option 2), or the server must be able to resolve and grant the appropriate scopes independently of what the client requested.

Meanwhile, FxA must maintain its own scope-to-service allowlist mapping regardless of approach to render the correct consent UI, validate that requested scopes are allowed, and enforce what gets granted.

The `service` query parameter already identifies the product context. Since the server-side mapping is unavoidable, should FxA own scope resolution entirely for first-party clients based on `service`?

## Goals

- Decouple product decisions about which browser services are offered during Firefox auth flows from the Firefox desktop release cycle
- Allow FxA to offer optional services during auth flows (e.g., "Enable Monitor?") where granted scopes may differ from what was initially requested, without requiring client awareness of those options

## Decision Drivers

- This applies to all first-party Firefox-to-FxA OAuth flows: initial sign-up, sign-in, and incremental scope authorization for signed-in users
- Scoped keys (Sync) require password-derived key material -- scopes that need `keys_jwk` cannot be included in passwordless-entry flows regardless of approach
- FxA already maintains client registrations with `allowedScopes`, scope-to-key mappings, and consent logic server-side
- Product requirements change (e.g., "offer Monitor during sign-up") and should not require Firefox desktop release cycles
- RFC 9700 Section 2.3 (OAuth Security Best Current Practice) recommends least-privilege tokens but focuses on what is _granted_, not what is _requested_ -- the server is the enforcement point
- Firefox is a trusted first-party client, not a third-party app -- the traditional OAuth scope request model was designed for untrusted clients. Firefox is the special case because it's the only RP where Product can decide what browser services to offer during auth flows, and tying those decisions to the Firefox desktop release cycle is not ideal. Other RPs that need additional scopes can update their authorization URL or redirect users back to FxA with the additional scope requested.
- The approach should work and make sense regardless of whether Firefox browser services continue sharing Firefox's client ID or move to per-service, per-platform client IDs (e.g., Relay-in-Desktop, Relay-in-iOS) in the future

## Considered Options

- **Option 1**: Client specifies exact scopes -- Firefox sends `service=vpn&scope=https://identity.mozilla.com/apps/vpn`
- **Option 2**: Client requests all possible scopes, server narrows -- Firefox sends every scope it might ever need, FxA grants only what applies
- **Option 3**: Server resolves scopes from service -- Firefox sends `service=vpn`, FxA determines the required and optional scopes for that service context

## Decision Outcome

Chosen option: "Option 3 -- Server resolves scopes from service", because it eliminates client-server coupling for product decisions, supports flows where granted scopes differ from requested scopes (e.g., optional service checkboxes), avoids the scoped keys problem of option 2, and aligns with FxA already being the authority on scope-to-service mappings.

When `service` is specified, FxA resolves the applicable scopes server-side — `service` is a more concise way of specifying scopes, and the `scope` parameter can be dropped. When `service` is not specified (e.g., normal RP redirects), `scope` continues to work as it does today.

If both `service` and `scope` are specified, the behavior follows the current model: only the requested scope can be granted (unless it's Desktop using the session token, which can currently get any scope it wants). If one of the requested scopes is not in the allowlist, it will error with "invalid scope" as it does today. In the future, if we allow the user to deny certain requested scopes that are in the allowlist, the refresh token will only contain the subset of scopes the user approved, and Firefox will know the granted scopes via the `scopes` field in the OAuth WebChannel message.

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
- Neutral, because the client loses granular control over scopes -- if two features both use the same `service` value but need different scopes, the client has no way to express that distinction. This is mitigated by using a different `service` value for each distinct scope set, or by specifying `scope` directly (which takes precedence). Using other flow context like `entrypoint` to vary scope resolution would complicate the contract and is not recommended.
- Good, because it is compatible with per-service, per-platform client IDs -- scope resolution shifts from `service` to `client_id` with no change in approach
- Bad, because it deviates from standard OAuth scope request patterns

## Addendum -- 2026-09-14

Added after review on [PR #21180](https://github.com/mozilla/fxa/pull/21180) and follow-up engineering discussion. The decision above stands.

### Decision change

**The service-to-scope mapping moves to Firefox.** The driver "FxA must maintain its own scope-to-service allowlist mapping regardless" no longer holds. Firefox sends the map over the `fxa_status` web channel capabilities message as `capabilities.services[service].scope`, so a Firefox version that changes its scopes, or offers a new service, tells us rather than requiring a matching config change here. FxA keeps only the product-owned decision of which optional scopes to offer in a given flow. Tracked in [FXA-14509](https://mozilla-hub.atlassian.net/browse/FXA-14509) / [bz-2066516#c4](https://bugzilla.mozilla.org/show_bug.cgi?id=2066516#c4).

### Clarifications

**First-party is thinly specified.** The published OAuth specs assume a third-party client, so how first-party clients are treated is largely vendor policy -- the comparisons that came up in review (Google, Okta, Auth0) are each provider's own policy, not standards. [draft-ietf-oauth-first-party-apps](https://datatracker.ietf.org/doc/html/draft-ietf-oauth-first-party-apps-01) defines the category normatively, as "applications that are controlled by the same entity as the authorization server used by the application, and the user understands them both as the same entity", and treats `scope` as optional -- but it is a draft, and it covers flow mechanics rather than consent. We follow the specs where they speak; where they do not, being first-party gives latitude. That softens, without removing, the "Non-standard OAuth pattern" negative above.

**No scope escalation.** FxA should not grant scopes the client did not request. RFC 6749 Sections 3.3 and 5.1 only require the server to report the granted set when it differs from the requested one, but every provider surveyed grants a subset, and node-oidc-provider enforces it structurally. So wherever `scope` is the source of truth, FxA cannot add optional scopes on top of it: the client cannot send only what is required and have us hand back more. Under option 3 the set FxA resolves from `service` is the request, so offering optional scopes within it is not escalation.

**Option 1 can support _optional_ scopes, but they must still come from the client.** The analysis above implies optional offers require option 3; they do not. Options 1 and 2 differ in what the client sends -- required plus whatever it wants offered for that flow, or a catalog FxA narrows -- but under both, the offer set is bounded by the client's request. Strava requests its full scope set explicitly and renders a checkbox per requested scope, with `read` non-declinable by server policy. What option 3 adds is that FxA composes the offer set rather than the client. The web channel mapping is needed either way: rendering a service-labelled checkbox means grouping scopes into a bundle, and that needs the map even when the client composes the request.

**A consent checkbox is a service, not a scope.** Strava's checkboxes map one-to-one onto user-legible scopes. Ours do not: a "VPN" checkbox grants the VPN scope plus `profile`, and no consent screen should display `https://identity.mozilla.com/apps/vpn`. That one-to-many relationship is why a service-to-scopes map has to exist somewhere under any option.

**Scope hierarchy (options 1 and 2).** `profile` implies `profile:uid`, so a request carrying both is redundant, and an offered scope that a required one already implies is a checkbox that grants nothing. Where the client composes the request it has to collapse overlapping scopes to the broadest one first -- Sync needs `profile`, Smart Window needs `profile:uid`. Under option 3 FxA composes the set and normalizes it itself.

### node-oidc-provider notes

These notes target `oidc-provider@9.12.2`, for the [ADR 0042](0042-use-node-oidc-for-oauth.md) migration.

- Granted scope is structurally bounded by the request: an authorization code's scope is `grant.getOIDCScopeFiltered(requestParamScopes)`. A scope added to the Grant but not requested is silently dropped.
- `scope` is not a required authorization parameter. `openid` is compelled only for `id_token` response types, CIBA, a set of gated request parameters (`acr_values`, `claims`, `claims_locales`, `id_token_hint`, `max_age`, `nonce`), and clients registered with `default_acr_values`, `default_max_age`, or `require_auth_time`. Otherwise dropping `scope` is accepted by the library.
- `service` is accepted via `extraParams`, which takes an object mapping a parameter name to an optional validator.
- On the no-resource path, `checkResource`'s `filterStatics` rewrites `scope` to only those values in the provider's `scopes` config, so an FxA scope missing from it is silently dropped. The default is only `['openid', 'offline_access']`. With a `resource` present the filter does not run and scopes are validated against the resource server instead.
- The requested scope set is fixed before any interaction runs, and `checkScope` is in the authorization stack but not the resume stack -- so mutating a stored `Interaction` to inject scopes bypasses `client.scope` validation. Resolution has to happen before the request reaches the provider.
- Consent UI reads `missingOIDCScope` / `missingResourceScopes` from interaction details. `rejectOIDCScope()` persists and there is no un-reject.
- Flows that skip consent do so by overriding `loadExistingGrant` to construct and save a Grant.
- Worth considering separately: modelling VPN/Relay/Monitor as RFC 8707 resource indicators would yield audience-restricted tokens per service. It would sit alongside `service` rather than replace it -- `resource` names the resource server consuming the token, `service` names the product flow.

## Links

- Reference: [Moving Desktop Firefox to the FxA "Refresh Token"](https://docs.google.com/document/d/1sPLQHayKgmsRJ8fQ61u_yCjwt_o2hrAMaKYPfo2GKzI/)
- Reference: [RFC 9700 Section 2.3 - Access Token Privilege Restriction](https://www.rfc-editor.org/rfc/rfc9700.html#section-2.3)
- Reference: [RFC 6749 Section 3.3 - Access Token Scope](https://www.rfc-editor.org/rfc/rfc6749.html#section-3.3)
