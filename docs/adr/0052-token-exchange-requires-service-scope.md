# Token exchange requires the service scope at sign-in

- Status: accepted
- Deciders: Lauren Zugai, Nick Shirley, Vijay Budhram
- Date: 2026-10-15

Technical Story: [FXA-14724]. Builds on ADR [0048](0048-refresh-tokens-and-account-level-authorization.md) and ADR [0051](0051-account-authorization-table.md).

## Context and Problem Statement

The silent token exchange grants a Firefox service only when `accountAuthorizations` has a row for that service. ADR 0051 writes a row only when the sign-in requests the service scope (`oauthServer.exchange.serviceScopes`) from a client listed for the service (`oauthServer.exchange.allowedClientsForService`).

Two first-party clients sign in without their service scope. They request only `profile` and subscriptions:

- Monitor web (`802d56ef2a9af9fa`) does not request `https://identity.mozilla.com/apps/monitor`.
- The Mozilla VPN app (`e6eb0d1e856335fc`) does not request `https://identity.mozilla.com/apps/vpn`. The desktop and iOS apps use the same client ID and scopes. The Android app probably does too, but this is not confirmed yet.

Their sign-ins are recorded with no service, so the token exchange returns 403 for those users in Firefox. The same problem will occur again when a future service wants the token exchange and its existing sign-ins do not include the service scope. We do not want to run a new backfill each time.

How must the token exchange treat clients that do not request the service scope?

## Decision Drivers

- Existing Monitor and VPN users get the silent exchange.
- Stay close to Google's [cross-client identity](https://developers.google.com/identity/protocols/oauth2/cross-client-identity) model, where consent comes from a scope that the user approved.
- Keep the consent check simple. Do not add a second rule to it.
- Keep `accountAuthorizations` accurate, so that deauthorization decides correctly.
- No new backfill for each future service.

## Considered Options

- Option A: one-time fix for Monitor and VPN, forward-fill for future services
- Option B: config-based fallback in the token exchange

## Decision Outcome

Chosen option: "Option A", because it keeps the token exchange rule as it is (`clientId` and `scope`, not only `clientId`) and follows the cross-client identity model. A permanent client list in the consent check and a lasting deauthorization mismatch cost more than a temporary fix for two clients.

The rule for relying parties: a client's sign-ins count for the token exchange only when the client requests the service scope. A client that does not request it today gets forward-fill, not a backfill. The one exception is Monitor web and the VPN app, which get a one-time backfill (see the work below). Future services get forward-fill only. A service scope does not give the relying party access to more data. Requesting it at sign-in is how the user's approval reaches the other clients of that product.

The work:

- Monitor (MNTOR-5389) and VPN (a new ticket on their side) start to request the service scope.
- [FXA-14724] makes the backfill add the service scope for Monitor web and VPN app tokens, identified by client ID:
  - `802d56ef2a9af9fa` to `https://identity.mozilla.com/apps/monitor`
  - `e6eb0d1e856335fc` to `https://identity.mozilla.com/apps/vpn`
- A temporary change at sign-in records the service scope for these two client IDs. With it, the backfill can run before Monitor and VPN ship their scope change, with no gap. A separate ticket removes it after both clients request the scope.
- The prod backfill ([FXA-14086]) runs with its default options after [FXA-14724] and the sign-in change land.

### Positive Consequences

- Existing Monitor and VPN users get the silent exchange.
- The token exchange has no new rule.
- The model matches cross-client identity after the clients request the scope.

### Negative Consequences

- Monitor web and the VPN app do not use the scope themselves. They add it only for the silent exchange.
- Backfilled rows say that the user has a scope their token does not hold, until the user signs in again. Deauthorization decides from the remaining refresh tokens, so it can misfire. For example, a disconnect of VPN in Firefox for Android also checks the backfilled `apps/vpn` row of the VPN app. No remaining token holds `apps/vpn`, so the row is deauthorized while the app is still connected. This is temporary, and it stops as users sign in again with the scope. In the worst case, the user authorizes again at FxA.
- Monitor and VPN get special handling (the backfill change and the sign-in change) that we must remove later.
- Users of a future service whose sign-ins came before it requested the scope do not get the silent exchange. The first time Firefox needs the service, they see a one-tap cached sign-in.
- The service and client lists stay in auth-server config, so each change needs a config edit and a deploy. The token exchange is first-party only, so this is acceptable today. It does not scale to third-party relying parties.

## Pros and Cons of the Options

### Option A: one-time fix for Monitor and VPN, forward-fill for future services

Monitor and VPN request the service scope. The backfill and a temporary sign-in change add the scope for their client IDs. Future services must request the service scope, and their earlier sign-ins do not count.

- Good, because existing Monitor and VPN users get the silent exchange.
- Good, because it matches cross-client identity after the clients request the scope.
- Good, because the token exchange has no new rule.
- Bad, because Monitor web and the VPN app do not need the scope today. They add it only for the silent exchange.
- Bad, because backfilled rows say that the user has a scope their token does not hold, until the user signs in again. Deauthorization can misfire until then (see Negative Consequences).
- Bad, because it adds temporary special handling for Monitor and VPN: the backfill change and a sign-in change to remove later.

### Option B: config-based fallback in the token exchange

A new config lists the non-Firefox clients of each service: `vpn` to the VPN app, `monitor` to Monitor web. Unlike `allowedClientsForService`, which controls which clients can write a row for the service scope, the token exchange reads this list. When there is no row for the service scope, the token exchange accepts an active row from a listed client. There is no backfill change, no sign-in change, and no scope change from Monitor or VPN.

- Good, because it covers existing users and future services with a config change, and needs no more backfills.
- Good, because it adds no new deauthorization misfires. The rows of a listed client contain only scopes that its token holds, so they are deauthorized when that client disconnects and are not changed otherwise.
- Bad, because it departs from the cross-client identity model: a sign-in counts even though it never requested the scope.
- Bad, because it adds a second, unusual rule to the consent check, and a permanent client list for each service that we must maintain.
- Bad, because it does not fix the deauthorization mismatch, it only hides it. A disconnect of VPN in Firefox for Android still deauthorizes the Android `apps/vpn` row, because the token of the VPN app does not hold `apps/vpn`. The exchange still succeeds through the active rows of the VPN app, so the user sees no change. But the table no longer shows the user as authorized for `apps/vpn`. This is not temporary: it lasts while the tokens of the VPN app do not hold `apps/vpn`.

## Notes

- **Move the token exchange config to the database.** `serviceScopes`, `allowedClientsForService` and the related lists are in auth-server Convict config today. A database table would let us edit them in the admin panel, with no deploy. This is the main fix for the scale concern.
- **Cross-client identity for Desktop.** The token exchange works only with refresh tokens. Firefox for Android already uses it for VPN. Desktop can use it after it moves to refresh tokens.
- **Relay.** `bypassConsentForServices` grants Relay without `accountAuthorizations`, because the Relay clients check attached clients for the Relay client ID. This ADR does not change it.
- **Destroy from a relying party.** When a relying party revokes its own token with `/oauth/destroy`, deauthorization does not run. This is a separate gap for relying parties that have their own account deletion, such as Monitor.

## Links

- Builds on [ADR 0048](0048-refresh-tokens-and-account-level-authorization.md).
- Builds on [ADR 0051](0051-account-authorization-table.md).
- Related to [ADR 0049](0049-service-driven-scope-resolution.md), which resolves the service scope from `service=` for Firefox sign-ins.
- Documentation of the token exchange: [FXA-13081].

[FXA-13081]: https://mozilla-hub.atlassian.net/browse/FXA-13081
[FXA-14086]: https://mozilla-hub.atlassian.net/browse/FXA-14086
[FXA-14724]: https://mozilla-hub.atlassian.net/browse/FXA-14724
