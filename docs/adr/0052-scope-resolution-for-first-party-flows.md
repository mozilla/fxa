# Scope resolution and optional-scope consent for first-party Firefox flows

- Status: proposed
- Supersedes: [ADR 0049](0049-service-driven-scope-resolution.md)
- Deciders: Lauren Zugai, Mark Hammond, Dan Schomburg, Wil Clouser, Vijay Budhram
- Date: 2026-09-09

## Context and Problem Statement

[ADR 0049](0049-service-driven-scope-resolution.md) decided that Firefox sends `service` and FxA
resolves scopes server-side, dropping `scope`. Review surfaced three gaps worth a fresh decision:

1. **0049 lists "non-standard OAuth pattern" as a negative without examining it.** This was the
   main friction in review — the preference to stay close to the standard. Given the
   [ADR 0042](0042-use-node-oidc-for-oauth.md) migration, it should be measured against what
   RFC 6749 and node-oidc-provider actually permit.
2. **One of 0049's drivers was "FxA must maintain the mapping regardless."** A web channel
   capabilities message could supply that mapping from Firefox, so the driver is weaker than
   stated.
3. **Scope escalation was never written down as a constraint.** RFC 6749 §3.3 frames the
   authorization server's latitude as narrowing what was requested, not adding to it, and both
   node-oidc-provider and the major providers surveyed below enforce that direction. Stating it
   explicitly changes which options remain viable.

The driving requirement is unchanged: FxA wants to offer optional services during an auth flow
("Also enable Monitor?") without those product decisions riding the Firefox release train.

## Decision Drivers

- Granted scopes should not exceed what was requested. RFC 6749 §3.3 frames the authorization
  server's latitude as narrowing rather than adding, and §6 forbids a refresh from widening beyond
  the original grant. node-oidc-provider enforces both structurally, as do the providers surveyed
  below.
- Product decisions about which services are _offered_ during a flow should not require a Firefox
  release.
- Scoped keys (Sync) need password-derived material, so a key-bearing scope cannot be _required_
  in a passwordless-entry flow.
- The implementation should sit inside node-oidc-provider's model rather than work around it.
- Firefox acts as a container RP for several services (VPN, Relay, Monitor) under one client ID.
  That shape is what makes offering one service during another service's flow possible at all. It
  also means scope decisions cannot be inferred from `client_id` alone, so some other signal is
  needed.

## Prior Art: how other providers decide "required"

No major provider lets the client assert required-vs-optional in the authorization request.
Required-ness is provider-side policy attached to the permission, and the client's request is
always a subset of a statically registered superset.

| Provider        | Who decides                            | Mechanism                                                                                                                                                                                        |
| --------------- | -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Google          | Provider, by scope category            | Sign-in scopes (`openid`/`email`/`profile`) are a non-declinable bundle; non-sign-in scopes get individual checkboxes. Trusted and domain-wide-delegation apps bypass granular consent entirely. |
| Meta            | Provider; user declines per permission | The Login Dialog lets people decline individual permissions; apps read granted vs declined from `/me/permissions` and may re-request.                                                            |
| Microsoft Entra | Client registration + runtime subset   | `requiredResourceAccess` in the app manifest is the static superset; runtime `scope` requests a subset. Guidance is explicit that static must be a superset of dynamic.                          |
| OIDC Core       | Client, advisory only                  | `essential: true` marks a claim the client says is necessary for the task — a hint, and for **claims** only. No scope equivalent exists in any published spec.                                   |

Two conclusions carry regardless of the option chosen:

- **"Required" is a rendering decision derived from server-side policy**, not something the client
  declares in the request.
- **Whoever owns the registered superset owns the ceiling.** That is the general answer to
  escalation, and it is Entra's model.

Note the limits of the survey. All four have the client send a scope list, so none is a precedent
for omitting it; RFC 6749 §3.3 permits a server-supplied default, but permitted is not the same as
customary. All four also model third-party clients, where FxA's case is first-party — a category
these providers treat separately: Google exempts trusted apps from granular consent, Okta gates it
on a per-client `consent_method`, and Auth0 requires both `is_first_party` on the client and the
resource server opting in. The closest structural analogue is Google's Cross-client Identity, where
multi-component apps share one authorization umbrella;
[ADR 0048](0048-refresh-tokens-and-account-level-authorization.md) already follows that model for
account-level authorization.

## Considered Options

### Option 1: Client sends exact scopes

Firefox sends `service=vpn&scope=<vpn scope>`.

- Good, standard RFC 6749 §3.3; no custom parameter semantics; sits natively in
  node-oidc-provider with no custom code.
- **Bad, cannot support optional offers.** FxA can only grant what was requested, so an "Also
  enable Monitor?" checkbox requires Firefox to have requested Monitor — and Firefox cannot
  request what it does not know is on offer. Choosing this means accepting that optional service
  offers are out of scope.
- Bad, every change to the offer set needs a Firefox release.
- Rejected variant: Firefox could render the optional offer itself (an "also enable VPN?" checkbox
  in the Sync menu) and request the resulting scopes, which makes Option 1 workable for
  multi-service flows at the cost of putting the offer decision in the browser.

### Option 2: Client requests the catalog, server narrows

Firefox sends `service=vpn` **and** a scope list covering everything it might ever need. FxA
resolves required and offerable scopes for that service, renders consent, and grants what the user
approves — bounded by the list Firefox sent.

**Implementation shape:**

- Firefox ships a per-platform scope catalog and sends it on every authorization request.
  `service` is still sent — it selects which entry in the scope map applies, and therefore both
  what counts as required and which consent UX to render.
- FxA needs `service → offerable` (see [Where the mapping lives](#where-the-mapping-lives)). The
  `required` half can come from the web channel capabilities message rather than FxA configuration.
- At the provider's `/auth` endpoint, node-oidc-provider's `checkScope` validates the catalog
  against the client's registered `scope`. Firefox's registration must allow every catalog entry.
- In the interaction, intersect the request with `required` (rendered as a static list) and with
  `offerable` (rendered as checkboxes), then build the node-oidc-provider Grant with
  `addOIDCScope()` for approved scopes and `rejectOIDCScope()` for user-declined ones.
- **A custom node-oidc-provider interaction policy check is required.** Its stock
  `op_scopes_missing` check prompts for any requested scope that is neither granted nor rejected.
  Scopes narrowed away by `service` are neither, so consent would fire on every request forever.
  Replace it via `policy.get('consent').checks.remove('op_scopes_missing')` and add a replacement
  scoped to the service-applicable subset. Do not use the library's `rejectOIDCScope()` for
  narrowed-away scopes — rejections persist and there is no un-reject, which would block offering
  them later.
- Firefox always sends `keys_jwk`; FxA produces `keys_jwe` only when a key-bearing scope is
  actually granted (see [Constraints](#constraints)).

Assessment:

- Good, standard OAuth, and the library's native model.
- Good, offering an _already-catalogued_ scope in a new context needs no Firefox release.
- Good, no escalation — the request is the ceiling. Option 3 reaches the same place via client
  registration, so this is not a differentiator.
- Neutral, **the catalog is a union, so it collapses to the broadest parent.** If any service
  needs `profile`, the catalog carries `profile`, and a flow needing only `profile:uid` is requested
  with the parent. Nothing breaks — FxA still narrows from the scope map — but the request
  overstates what the flow needs, so it reads confusingly and carries no signal about intent.
- Bad, requires replacing one of node-oidc-provider's built-in consent checks, per the
  implementation shape above.
- Note, 0049's claim that requesting `oldsync` forces password entry does not hold: the password
  decision can key off what is granted rather than what is requested.

### Option 3: Server resolves scopes from `service`

Firefox sends `service=vpn` and **no** scope list. FxA resolves required and offerable scopes for
that service, renders consent, and grants what the user approves. Identical to Option 2 except that
the client asserts no scope list of its own.

**Implementation shape:**

- FxA resolves `service` into the required scopes, presents any optional scopes offered for that
  service, and then issues the authorization request carrying the required set plus whatever the
  user opted into. Because consent precedes the request, a declined scope is never requested and
  granted never exceeds requested. The resolution happens before the request reaches the provider,
  which is the only safe point for it (see
  [Re-evaluating](#re-evaluating-non-standard-oauth-pattern)).
- Register `service` as a node-oidc-provider `extraParams` entry so it reaches interaction details
  and metrics.
- Grant construction is simpler than Option 2's: the library's stock `op_scopes_missing` check
  works unmodified because everything requested is granted, and there is nothing to reject because
  a declined scope never enters the request.
- Declines never reach the provider, so the Grant's rejection record cannot be relied on to stop
  re-offering something the user turned down. FxA can record declines in its own consent records
  instead, which it is free to do at whatever granularity it wants.

Assessment:

- Neutral, offer changes are configuration rather than a Firefox release — true of Option 2 as
  well, for anything already in its catalog.
- Good, no escalation: the client asserts no ceiling, and the resolved set is still validated
  against the client's registered `scope`.
- Good, a key-bearing scope can be kept out of a passwordless flow by construction, since FxA
  decides the requested set.
- Good, no custom interaction policy needed.
- Bad, omitting `scope` departs from how every surveyed provider operates. The spec permits it and
  the library accepts it, but a reader who knows OAuth will not expect it, and the convention has to
  be documented for every future client.
- Bad, `service` is a custom parameter and the mapping is state to maintain. Where that mapping
  lives is a separate choice — it can be FxA configuration, or Firefox can supply it over the web
  channel (see [Where the mapping lives](#where-the-mapping-lives)).

## Re-evaluating "non-standard OAuth pattern"

0049 lists this as a negative. It is overstated in one respect and understated in another.

**Overstated:** RFC 6749 §3.3 anticipates an omitted `scope` — _"If the client omits the scope
parameter when requesting authorization, the authorization server MUST either process the request
using a pre-defined default value or fail the request indicating an invalid scope."_ A
server-defined default is prescribed behaviour, not a deviation; `service` selects which default
applies. Note this provision governs the **authorization request** only. Refresh requests fall
under §6, where an omitted scope means the originally granted scope and the request may not exceed
it — so the resolved set is chosen once and is then a fixed ceiling. node-oidc-provider enforces
both: `scope` is not a required authorization parameter, and `refresh_token.js` rejects any refresh
requesting scopes absent from the refresh token. `service` itself is a first-class extension via
`extraParams`.

**Understated:** the cost is structural rather than conceptual, and it lands on the 0042 migration.
node-oidc-provider resolves the requested scope set before any interaction runs, with no supported
hook to widen it later. That leaves two approaches, and they are not equivalent:

- **Mutating stored interaction params — rejected.** `checkScope` is in the authorization stack but
  **not** the resume stack. Injecting scopes into a stored `Interaction` bypasses `client.scope`
  validation entirely. `checkResource`'s `filterStatics` still clamps to the provider's configured
  `scopes`, but not to the client's allowlist.
- **Resolving before the request reaches the provider — chosen.** Nothing in the library is
  subverted, `checkScope` still validates against client registration, and it survives PAR and
  signed request objects.

Resolving ahead of the provider is the natural shape for FxA, whose front-end already loads and
validates before anything is sent up. The cost is not work to be done, it is a constraint on
[ADR 0042](0042-use-node-oidc-for-oauth.md): the migration cannot hand the entry point to the
provider and treat FxA's UI as an interaction it dispatches to.

## Where the mapping lives

The mapping is two things with different owners. This holds under Options 2 and 3 alike.

**`service → required` can come from Firefox**, over the `fxa_status` capabilities message — for
example `{ smartwindow: 'https://identity.mozilla.com/apps/smartwindow profile:uid' }`. FxA reads
`service=smartwindow` and knows the required set without holding configuration of its own. This is
the half Firefox genuinely knows best, and sourcing it this way removes most of the coordination
burden raised in review.

**`service → offerable` must be FxA configuration.** If Firefox supplied it, adding "Also enable
Monitor?" to the signup flow would need a Firefox release — the coupling this ADR exists to
remove. This half is small, a product-owned table of what may be offered in which context, and it
is the only mapping FxA is obliged to maintain.

FxA must also know which services a given Firefox build understands before offering anything, so
the capabilities message is required under every option and is not a differentiator.

**Ordering caveat.** `fxa_status` resolves after the FxA page loads, which is after
node-oidc-provider has fixed the requested scope set for that request. A web-channel-sourced
`required` map therefore requires that FxA, not the provider, owns the entry point Firefox
navigates to — the page completes the handshake and only
then initiates the authorization request. A configuration-sourced map carries no such constraint.
This is a dependency on how [ADR 0042](0042-use-node-oidc-for-oauth.md) lands, and it applies
equally to Options 2 and 3.

## Constraints

- **A key-bearing scope forces password entry only when it is `required` for the service.** When
  merely offerable, it may be granted if the flow independently produced password-derived key
  material, or if the user opts in and accepts a password step-up. An offerable key-bearing scope
  must never silently turn a passwordless flow into a password-required one.
- **Scope hierarchy must be normalized before anything is rendered or requested.** `profile`
  implies `profile:uid`, so requesting both is meaningless, and offering a scope already implied by
  a required one is a checkbox that grants either way. Reduce required and offerable to maximal
  elements first, and expand again when storing the grant.
- **Neither option gives defence in depth at the request layer.** Under Option 2 the request is
  the broad catalog, so a mis-resolution almost always lands inside it; under Option 3 the same
  logic produces both the request and the grant, so it cannot check itself. The real guards are the
  client's registered `scope` and a per-service client allowlist, available under either option.
- **Declining a required scope cancels the flow.** Required scopes render without a checkbox, so
  the only way to refuse one is to abandon the flow, which returns `access_denied`. A partial grant
  missing a required scope is never issued.
- **Firefox always sends `keys_jwk`.** It is inert when no key-bearing scope is granted, and
  omitting it would foreclose granting one opportunistically — for example, a VPN flow where the
  user happens to authenticate with a password can then also grant Sync if offered and accepted.
  FxA returns `keys_jwe` only for key-bearing scopes actually granted.

## Decision Outcome

**TBD — up for discussion.** The leaning is **Option 3**, with `scope` retained as a first-class
alternate path when `service` is absent. On that path — reconnect after a password reset,
account-menu sign-in, third-party RPs — `scope` is used unmodified. Reconnect should request what
the client _currently wants_ rather than everything it once had, which removes any need for
"nice-to-have" scope semantics.

If we go with Option 3, it reaffirms 0049's outcome, but the reasoning changes. The "FxA must
maintain the mapping regardless" driver is largely dissolved by the web channel capabilities
message. And the
release-train argument 0049 leans on separates Options 2 and 3 from Option 1, not from each other:
Option 2 toggles an offer just as freely for any scope already in its catalog, and a genuinely new
service needs a Firefox release either way.

What separates them is the catalog. Option 2 needs Firefox to ship and maintain one; that catalog
is a union, so it collapses to the broadest parent and cannot express a service wanting only a
sub-scope; and over-requesting forces a replacement for one of node-oidc-provider's consent checks.
Option 3 carries none of those, because FxA composes the request from what the flow actually needs.
The case is about cost rather than capability — both options can do the job.

**What the decision comes down to:** weighting protocol conventionality above the coupling costs.
Option 2 keeps the request in the shape every OAuth reader expects and every surveyed provider
uses, and its price — a catalog, no sub-scopes, a replaced consent check — is real but bounded.
That preference drove the original review and is a legitimate basis for deciding the other way.

## Implementation notes (verified against oidc-provider@9.12.2)

- Every FxA scope must appear in the provider's `scopes` config or `checkResource`'s
  `filterStatics` silently drops it. The default is only `['openid', 'offline_access']`.
- `extraParams` takes an object (`{ service: validatorFn }`), coerced internally to a Set.
- Consent UI reads `missingOIDCScope` / `missingResourceScopes` from interaction details;
  previously granted scopes do not re-prompt.
- `rejectOIDCScope()` persists and there is no un-reject. This is the library's mechanism for not
  re-offering a declined scope, and it only applies when declined scopes are in the request — under
  Option 3 they are not, so FxA owns that record instead.
- Flows that skip consent do so by overriding `loadExistingGrant` to construct and save a Grant.
- If the user grants nothing, the library throws `AccessDenied` rather than issuing an empty token.

## Open question

Whether to model VPN/Relay/Monitor as **RFC 8707 resource indicators** rather than URL-format
scopes. oidc-provider supports this well (`resourceIndicators`, `addResourceScope`,
`missingResourceScopes`), and it yields audience-restricted access tokens per service. Out of scope
here, but materially cheaper to choose before the 0042 migration than after.

It would sit alongside `service` rather than replace it: `resource` names the resource server that
will consume the token, an audience question, while `service` names the product flow the user is in,
which also drives consent UX, key handling, and metrics.

## Links

- [ADR 0042 — Evaluate Strategy for OAuth Implementation](0042-use-node-oidc-for-oauth.md)
- [ADR 0049 — Server-side scope resolution via service parameter](0049-service-driven-scope-resolution.md)
- [ADR 0051 — Account authorization table](0051-account-authorization-table.md)
- [RFC 6749 §3.3 — Access Token Scope](https://www.rfc-editor.org/rfc/rfc6749#section-3.3)
- [RFC 6749 §6 — Refreshing an Access Token](https://www.rfc-editor.org/rfc/rfc6749#section-6)
- [RFC 9700 §2.3 — Access Token Privilege Restriction](https://www.rfc-editor.org/rfc/rfc9700.html#section-2.3)
- [Google — How to handle granular permissions](https://developers.google.com/identity/protocols/oauth2/resources/granular-permissions)
- [Microsoft — Requesting permissions and consent](https://learn.microsoft.com/en-us/entra/identity-platform/consent-types-developer)
- [Meta — Permissions with Facebook Login](https://developers.facebook.com/docs/facebook-login/web/permissions/)
- [OpenID Connect Core §5.5 — Requesting Claims using the claims Request Parameter](https://openid.net/specs/openid-connect-core-1_0.html#ClaimsParameter)
- [Okta — Request user consent (`consent_method`)](https://developer.okta.com/docs/guides/request-user-consent/main/)
