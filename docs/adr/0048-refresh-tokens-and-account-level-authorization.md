# Refresh tokens for browser service authorization and account-level consent

- Status: accepted
- Deciders: Lauren Zugai, Mark Hammond, Jonathan Almeida, Wil Clouser, Ben Dean-Kawamura, Ross Otto, Vijay Budhram, Luke Crouch, David Durst
- Date: 2026-01-16

Technical Story: FXA-12946 (Relay Mobile MVP), FXA-12541 (Relay post-MVP / other services), FXA-12940 (other FxA improvements)

## Context and Problem Statement

Firefox desktop browser services like Relay and Smart Window use session tokens to create OAuth access tokens on behalf of the user. This approach has several problems:

- **No scope enforcement**: Session tokens are not bound to any scopes -- Firefox can use a session token to mint access tokens for any scope in Firefox's allowlist at any time via the `fxa-credentials` grant, regardless of what scopes were originally requested during sign-in. This enables scope expansion (e.g., Sync to Sync+Relay) without explicit user consent.
- **No user visibility or control**: There is no entry under Settings > Connected Services for these service grants. FxA collapses all session-token-derived grants into a single "Firefox" entry. Users cannot see which browser services they have opted into or revoke consent for individual services without destroying the session token entirely, which signs them out of the browser.
- **Conflation of authentication and authorization**: Session tokens prove authentication ("who you are"), while OAuth tokens prove authorization ("what you're allowed to do"). Using session tokens for service access repurposes an authentication credential for authorization delegation.

Mobile already uses refresh tokens to create access tokens (unlike Desktop, which discards the refresh token generated during sign-in and uses the session token instead). The intent to move Desktop to refresh tokens had been discussed informally, but the Mobile team's development of a Relay browser integration using refresh tokens drove the full set of decisions captured here. Additionally, signed-in users who need access to a new service (e.g., a Sync user enabling Relay) need a mechanism to upgrade their token's scopes without re-entering their password, since key-bearing scopes like `oldsync` would trigger the scoped keys code path.

This ADR covers four interrelated decisions: (1) switching from session tokens to refresh tokens for browser service authorization, (2) the migration strategy for existing Desktop users, (3) the consent model for account-level authorization, and (4) the token exchange mechanism for scope upgrades.

## Decision Drivers

- Users must feel in control of their account and the services they choose to use, with an easy way to view and revoke granted consent
- Refresh tokens appear as revocable grants in Connected Services; session token grants cannot be individually revoked
- OAuth best practices separate authentication (session tokens) from authorization (OAuth tokens with explicit scopes)
- Mobile Relay MVP needs to launch without requiring a major refactoring effort to bounce users back to FxA UI
- Users who have already consented to a service should not be re-prompted for consent on another device or platform, to reduce friction
- Scoped keys (Sync) require password-derived key material -- when adding a non-key-bearing scope (e.g., Relay) to a signed-in user's existing refresh token, the process must not trigger password entry
- RFC 6749 Section 6 prohibits scope expansion on standard refresh token grants, so a token exchange mechanism is needed
- Eventual migration to `node-oidc-provider` (ADR 0042) favors using a recognized grant type that the library supports via its `registerGrantType()` API

## Considered Options

### Token type for browser service authorization

- **Session tokens** Firefox uses the session token to mint OAuth access tokens for browser services
- **Refresh tokens**: Firefox obtains a scoped refresh token per service context and uses it to create access tokens

### Migration from session tokens to refresh tokens for existing desktop browser services

- **Option 1: Re-authentication**: Users re-authenticate with FxA the next time they use a service, receiving a refresh token with the appropriate scopes
- **Option 2: Silent grant**: FxA grants a refresh token with requested scopes via an API endpoint, matching the existing trust model where Firefox already mints access tokens with any allowlisted scope

### Consent model

- **Option A: Implicit consent by granted tokens**: Consent is implicit in the existence of a refresh token with the relevant scopes. No persistent authorization record beyond the tokens themselves.
- **Option B: Explicit account-level authorization**: Consent is recorded at the account level in a new table in the FxA database. When signing in on a new device, FxA checks existing authorizations and issues tokens without re-prompting.

### Token exchange mechanism for scope upgrades

- **Option I: Use the session token with full scopes via `fxa-credentials` grant**: Reuse the existing custom grant type, passing a session token and the complete desired scope set with `access_type=offline` to obtain a new refresh token. This is already implemented in application-services (`create_refresh_token_using_session_token`). The client would then revoke the old refresh token and manage the device record.
- **Option II: RFC 8693 token exchange with full desired scope set**: Use the standard token exchange grant type, passing the existing refresh token and the complete desired scope set per RFC 8693 semantics
- **Option III: RFC 8693 token exchange with additional scopes only**: Use the standard token exchange grant type, passing the existing refresh token and only the new scopes needed; the server unions them with the original token's scopes
- **Option IV: Authorization code exchange with broader scopes**: Use the session token to silently obtain an authorization code with the full desired scope set (`authorize_code_using_session_token` in application-services), then exchange the code for a new refresh token (`create_refresh_token_using_authorization_code`). This is a two-step flow but does not require a browser redirect — both calls are server-to-server.

## Decision Outcome

### Use refresh tokens for browser service authorization

Chosen because refresh tokens provide individual revocability in Connected Services, enforce explicit scopes, and properly separate authentication from authorization. Session tokens remain for authenticating with FxA itself but should not be used for ongoing service authorization.

Mobile Relay will launch using a refresh token. Desktop Relay, Smart Window, and Sync will migrate to refresh tokens via silent grant.

### Migrate existing users via silent grant (Option 2)

Chosen because it avoids user friction. Since session tokens already grant OAuth access tokens with any allowlisted scope, granting a refresh token with the same scopes is not worse from a security or trust perspective -- it simply makes the existing implicit authorization explicit and revocable. Firefox can determine which scopes to request based on local signals (e.g., `signon.firefoxRelay.feature` is enabled, Sync data exists).

Re-authentication (Option 1) was rejected because it would disrupt ~110k existing Relay Desktop users by forcing them to re-authenticate for a capability they already use.

### Use explicit account-level authorization (Option B)

Chosen because it provides a persistent audit trail, enables cross-device consent sharing, and decouples consent from token lifecycle.

Account-level authorizations are stored in a new table in the FxA database. When a user authorizes a service on any device, FxA records it at the account level. When signing in on a new device, FxA checks whether the user has already authorized the requested service and scope -- if so, it issues the refresh token without re-prompting for consent. This follows a similar model to [Google's Cross-client Identity](https://developers.google.com/identity/protocols/oauth2/cross-client-identity), where multi-component apps (e.g., Relay web and Relay in the browser) fall under a single project umbrella and share authorization.

Existing users with active refresh or access tokens will be backfilled into the authorizations table via a migration script. Users can revoke account-level authorization through a new section in Connected Services.

Option A (implicit consent) was rejected because token-only consent does not persist across devices, has no audit trail, and makes cross-device consent sharing fragile.

### Use RFC 8693 token exchange with additional scopes only (Option III)

When a signed-in user needs an additional scope (e.g., a Sync user enabling Relay), the browser sends a token exchange request containing the existing refresh token as the `subject_token` and only the additional scopes needed in the `scope` parameter. The server unions the original token's scopes with the requested scopes to produce the new token's scope set, then revokes the original refresh token.

Option I (`fxa-credentials` with session token) was rejected because:

- **No server-side policy enforcement**: `fxa-credentials` grants whatever scopes the client requests within the client's allowlist. There is no opportunity for FxA to check authorization state — e.g., whether the user has actually consented to this service or whether an account-level authorization exists. The token exchange (Option III) provides a distinct server-side decision point where these checks naturally live, which is essential for the account-level authorization model (Option B above).
- **Client manages token lifecycle**: The client would need to request the full scope set, revoke the old refresh token, and handle the device record. Application-services already has this plumbing, but centralizing it server-side in the token exchange is simpler for the client and ensures consistency.

Option II (RFC 8693 with full scope set) was rejected because:

- **Client complexity**: The browser would need to introspect its existing refresh token to reconstruct the full scope list. Sending only additional scopes is less error-prone (cannot accidentally drop scopes) and aligns with the design philosophy in ADR 0049 where the server owns scope resolution for first-party clients.

Option IV (authorization code exchange) was rejected because:

- **Two-step flow with no additional benefit over Option I**: Like Option I, it uses the session token and goes through `validateRequestedGrant`, so it shares the same policy enforcement gap and sync scope caution concerns. The extra step of obtaining an authorization code before exchanging it for a refresh token adds complexity without providing a server-side authorization gate that Option I doesn't already have.
- **Client manages token lifecycle**: Same as Option I — the client must handle revoking the old refresh token and managing the device record.

**Note on `node-oidc-provider` migration**: The `fxa-credentials` grant is used for bootstrapping refresh tokens during initial Firefox sign-in and will require custom registration via `registerGrantType()` in `node-oidc-provider` (ADR 0042) regardless. Option I reuses that grant and does not add a second custom grant type. Options II and III add RFC 8693 token exchange as a second custom grant type — it is a recognized grant type with a [documented example in `node-oidc-provider`](https://github.com/panva/node-oidc-provider/blob/main/docs/README.md#custom-grant-types). Option IV uses the standard authorization code flow and does not add a custom grant type.

**Note on sync scope caution**: Options I and IV go through `validateRequestedGrant`, which grants sync scopes to any verified session. Historically, FxA has been careful about granting sync scopes — requiring an email verification loop for most users on top of the password entry. Any verified session could request sync scopes through these paths without additional gates. Option III avoids this because it does not go through `validateRequestedGrant` — the existing refresh token already proves the user authorized those scopes through the original, more rigorous flow.

**Note on RFC 8693 compliance**: RFC 8693 Section 2.1 defines `scope` as "the desired scope of the requested security token," which conventionally means the full desired scope set. Our implementation treats it as additional scopes only, which is a deliberate deviation. This is acceptable for a first-party-only flow between Firefox and FxA, and should be documented as an FxA-specific convention. The response correctly returns the combined scope set in the `scope` field.

### Positive Consequences

- Users gain visibility and control over browser service authorizations through Connected Services
- Cross-device consent sharing eliminates redundant re-authorization (e.g., authorizing Relay on web carries to mobile)
- Relay Mobile MVP can launch without bouncing users to FxA UI -- if the user authorized Relay on web, the token exchange succeeds silently
- Scope upgrades for non-key-bearing services do not trigger password entry
- The token exchange mechanism uses a recognized RFC grant type, easing eventual `node-oidc-provider` migration
- Silent grant migration avoids disrupting existing Relay Desktop users

### Negative Consequences

- The `scope` parameter semantics in the token exchange deviate from RFC 8693 -- this must be documented and understood by implementers
- Account-level authorization requires a new database table, migration script, and UI additions to Connected Services
- Two custom grant types (`fxa-credentials` and token exchange) must be maintained and eventually registered with `node-oidc-provider`

## Note on per-service, per-platform client IDs

Currently, all Firefox browser services (Relay, Smart Window, Sync) share Firefox's single OAuth client ID. A possible future direction is to assign each service its own client ID per platform (e.g., Relay-in-Desktop, Relay-in-iOS, Relay-in-Android). This maps directly to [Google's Cross-client Identity](https://developers.google.com/identity/protocols/oauth2/cross-client-identity) model, where multiple client IDs are grouped under a single project umbrella and share authorization at the account level. This would make browser service metrics consistent with how FxA already tracks third-party RPs by `client_id`, and scope allowlists could be managed per `client_id` using standard OAuth client registration rather than the novel `service`-based resolution described in ADR 0049. However, it's not necessarily better OAuth practice overall — Firefox is the actual client receiving the tokens, not the individual services.

The decisions in this ADR are compatible with that migration. Account-level authorization would function like Google's project umbrella — applying across client IDs for the same service. The token exchange mechanism and silent grant migration path would not need to change. See also ADR 0049, which notes this as a decision driver for server-side scope resolution.

## Links

- Reference: [Decision Brief - Authorization in Non-Sync Firefox Login Flows](https://docs.google.com/document/d/1sR5t6GbmK6yjx5Dj8B_MSE9ckq_MbQFclUvEHnsBI2M/)
- Reference: [Moving Desktop Firefox to the FxA "Refresh Token"](https://docs.google.com/document/d/1sPLQHayKgmsRJ8fQ61u_yCjwt_o2hrAMaKYPfo2GKzI/)
- Related: [ADR 0042 - Use node-oidc-provider for OAuth](0042-use-node-oidc-for-oauth.md)
- Related: [ADR 0049 - Server-side scope resolution via service parameter](0049-service-driven-scope-resolution.md)
- Reference: [RFC 8693 - OAuth 2.0 Token Exchange](https://www.rfc-editor.org/rfc/rfc8693.html)
- Reference: [RFC 6749 Section 6 - Refreshing an Access Token](https://www.rfc-editor.org/rfc/rfc6749.html#section-6)
- Reference: [RFC 6749 Section 1.3.3 - Resource Owner Password Credentials](https://www.rfc-editor.org/rfc/rfc6749.html#section-1.3.3)
- Reference: [Google Cross-client Identity](https://developers.google.com/identity/protocols/oauth2/cross-client-identity)
- Reference: [node-oidc-provider Custom Grant Types (including token exchange example)](https://github.com/panva/node-oidc-provider/blob/main/docs/README.md#custom-grant-types)
