# Bearer Token Prefix Naming for FxA Tokens

- Status: proposed
- Deciders: FxA Engineering
- Date: 2026-05-11

Technical Story: ADR-0022 (deprecate Hawk) and the Hawk-to-Bearer migration on the auth-server / auth-client.

## Context and Problem Statement

The auth-server accepts multiple token kinds on the same routes (session, keyFetch, accountReset, passwordForgot, passwordChange) and also accepts OAuth refresh tokens as plain `Bearer <hex>`. When migrating in-monorepo FxA tokens from Hawk to Bearer, we needed a wire format that lets every protected route disambiguate which kind of token it received, without colliding with refresh tokens or with the legacy Hawk scheme, and without requiring a new scheme name in the `Authorization` header.

## Decision Drivers

- Disjoint from the existing refresh-token strategy (`Authorization: Bearer <64-hex>`), so a single route can declare both strategies without ambiguity.
- Disjoint from Hawk (`Authorization: Hawk id="…"`), so Bearer and Hawk can coexist on the same route during the migration.
- Self-describing: an operator looking at a captured header should be able to identify the token kind without consulting the route definition.
- Cheap to parse server-side: a single anchored regex per strategy, no JWT verification.
- Matches the industry pattern (GitHub `ghp_…`, Stripe `sk_live_…`) so a captured token is recognizable without context.

## Considered Options

1. **Plain `Bearer <hex>` for FxA tokens**. Rejected: collides with the existing refresh-token strategy on the same routes (this is exactly what reverted the 2024 attempt), and nothing in the header tells an operator which kind of token was sent.
2. **Custom Authorization scheme**, e.g. `Authorization: FxaToken kind=sessionToken; id=<hex>`. Rejected: every client (auth-client and any third-party integrator) has to learn a non-standard scheme, browser fetch and edge proxies treat anything other than `Bearer`/`Basic` as a curiosity, and the server-side parser grows attribute-list and quoting surface.
3. **Typed prefix inside Bearer**, e.g. `Authorization: Bearer fxs_<hex>` (GitHub/Stripe style). **Chosen.**
4. **JWT access tokens** signed by the auth-server. Rejected: verifying a JWT on every auth-server request is meaningful CPU compared to the DB lookup the strategies already do, revocation still requires server state (so JWTs don't remove the lookup), and the wire-format change is a far larger coordinated effort than the migration we wanted to land.

## Decision Outcome

Chosen option: **Typed prefix inside Bearer**.

The wire format is:

```
Authorization: Bearer <prefix>_<64 lowercase hex chars>
```

`<prefix>` is the token kind, every value starts with `fx` (FxA) followed by the first letter(s) of the kind:

| Prefix  | Token kind                          | Notes                                                                                                                                                                           |
| ------- | ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `fxs_`  | sessionToken                        |                                                                                                                                                                                 |
| `fxk_`  | keyFetchToken                       |                                                                                                                                                                                 |
| `fxk_`  | keyFetchTokenWithVerificationStatus | Shares `fxk_` with keyFetchToken; the variant only changes which DB lookup runs server-side, the wire id is the same, and the client only ever derives one keyFetch credential. |
| `fxar_` | accountResetToken                   |                                                                                                                                                                                 |
| `fxpf_` | passwordForgotToken                 |                                                                                                                                                                                 |
| `fxpc_` | passwordChangeToken                 |                                                                                                                                                                                 |

The server-side regex per kind is `^Bearer <prefix>_([0-9a-f]{64})$`. The OAuth refresh-token strategy keeps its plain `Bearer <hex>` shape and is distinguishable because it has no underscore. Hawk requests are unchanged.

### Positive Consequences

- Multi-strategy chains (Bearer first, Hawk fallback, refresh-token last) on a single route work without ambiguity.
- A captured `Bearer fxs_<id>` value is self-identifying in logs and in incident response.
- Server-side dispatch is a literal-prefix regex check; no per-request parsing of structured payloads.
- The convention extends naturally to future kinds (`fx*_`).

### Negative Consequences

- The wire format formalizes that FxA tokens are pure replay credentials until rotation. Hawk's MAC, host, uri, and payload bindings were already not validated server-side (see `hawk-fxa-token.js`, which parses the header and looks up by id only), so this is not a regression in enforcement, but it does close the door on enforcing those bindings later without another protocol change. Mitigations remain token rotation cadence and the customs ratelimiter, as called out in ADR-0022.
- Two server-side kinds (`keyFetchToken` and `keyFetchTokenWithVerificationStatus`) share `fxk_`. This is intentional and documented in the strategy module, but new contributors must read that comment to understand the dispatch.

## Conventions for Future Prefixes

- Always start with `fx` (Firefox Accounts) so a captured value is unmistakably from FxA.
- Append the first letter(s) of the kind, distinct from existing prefixes (sessionToken → `s`, keyFetch → `k`, accountReset → `ar`, etc.).
- Keep the prefix all lowercase, followed by a single underscore, then 64 lowercase hex characters.
- Add the kind to the server-side `KIND_PREFIXES` map in `packages/fxa-auth-server/lib/routes/auth-schemes/bearer-fxa-token.js` and the client-side `TOKEN_PREFIXES` map in `packages/fxa-auth-client/lib/bearer.ts`. Keep the two in sync.
- Do not reuse a prefix across unrelated token kinds. The `fxk_` sharing between `keyFetchToken` and `keyFetchTokenWithVerificationStatus` is the only documented exception (same underlying token row, different server-side lookup).

## Links

- [ADR-0022](0022-deprecate-hawk.md), the original deprecation decision.
- [ADR-0048](0048-refresh-tokens-and-account-level-authorization.md), refresh-token semantics that motivated keeping `Bearer <hex>` disjoint.
