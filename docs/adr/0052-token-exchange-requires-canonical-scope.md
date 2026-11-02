# Token exchange requires the canonical scope at sign-in

- Status: accepted
- Deciders: Lauren Zugai, Nick Shirley, Vijay Budhram
- Date: 2026-10-15

Technical Story: [FXA-14724]. Builds on ADR [0048](0048-refresh-tokens-and-account-level-authorization.md) and ADR [0051](0051-account-authorization-table.md).

## Context and Problem Statement

FxA follows Google's [cross-client identity](https://developers.google.com/identity/protocols/oauth2/cross-client-identity) model: once a user authorizes a service on their account, from any of that service's clients on any platform, the service's other clients don't need to ask again. For example, a user who signed in to the Relay web app on their phone can use Relay-in-Firefox without reauthorizing at FxA. Firefox does this through the silent refresh token exchange, trading its refresh token for a new one that also holds the service's canonical scope.

FxA records every sign-in in `accountAuthorizations` (ADR 0051), with a row for each requested scope. When the sign-in is for a service, meaning it passes that service's `service=` value or requests its canonical scope from a client listed for the service, FxA also records a row for the canonical scope. The token exchange looks for that row. A sign-in that doesn't request the canonical scope is still recorded, but not for the service, so the token exchange returns 403 and Firefox sends the user to a cached sign-in.

### The canonical scope

The canonical scope is a service's own URL scope, such as `https://identity.mozilla.com/apps/vpn` or `https://identity.mozilla.com/apps/monitor`. The service's backend checks for it on an FxA access token to know the token was issued for that service. FxA config (`oauthServer.exchange.serviceScopes`, to be moved to our database) names one per service, and FxA records authorization against it. In cross-client identity terms, it's the service's scope for its "project", and it gives a client no access beyond what the service needs.

### The problem

Two first-party clients sign in without their canonical scope. They request only `profile` and subscriptions:

- Monitor web (`802d56ef2a9af9fa`) doesn't request `https://identity.mozilla.com/apps/monitor`.
- The Mozilla VPN app (`e6eb0d1e856335fc`) doesn't request `https://identity.mozilla.com/apps/vpn`.

Their sign-ins are recorded with no service, so the token exchange returns 403 for those users in Firefox. The one-time backfill of `accountAuthorizations` from existing refresh tokens ([FXA-14086]) doesn't help either, because those tokens don't hold the canonical scope.

The bigger question is what we do when this happens again. If a future service wants the token exchange and its existing sign-ins don't include the canonical scope, we don't want to run another backfill.

How should the token exchange treat clients that don't request the canonical scope?

## Decision Drivers

- Existing Monitor and VPN users get the silent exchange.
- Stay close to the cross-client identity model, where consent comes from a scope the user approved.
- Keep the consent check simple. Don't add a second rule to it.
- Keep `accountAuthorizations` accurate, so that deauthorization decides correctly.
- No new backfill for each future service.

## Considered Options

- Option A: one-time fix for Monitor and VPN, forward-fill for future services
- Option B: config-based fallback in the exchange

## Decision Outcome

Chosen option: "Option A", because it keeps the token exchange rule as it is (`clientId` and `scope`, not only `clientId`) and follows the cross-client identity model. A permanent client list in the consent check and a lasting deauthorization mismatch cost more than a temporary fix for two clients.

### What this means for relying parties

Except for the explicitly documented Monitor web and VPN app backfill and temporary sign-in handling, a client's sign-ins count for the token exchange only when the client requests the canonical scope. This applies even when the client's own server never checks that scope.

For example, Monitor's website gets tokens for its own client ID and only needs `profile` and `account/subscriptions`. Monitor in Firefox needs `apps/monitor`, because Monitor's API checks for it on the access token Firefox sends.

Requesting the canonical scope at sign-in gives the relying party no access it doesn't already have. It's how the user's approval reaches the product's other clients, so that Firefox can use the service without asking the user to sign in again.

Services that don't request the scope today get forward-fill: only sign-ins after they start requesting it count. Monitor web and the VPN app are the one exception and get a one-time backfill.

### The work

- Monitor (MNTOR-5389) and VPN (a new ticket on their side) start requesting the canonical scope.
- [FXA-14724] makes the backfill add the canonical scope for Monitor web and VPN app tokens, identified by client ID:
  - `802d56ef2a9af9fa` to `https://identity.mozilla.com/apps/monitor`
  - `e6eb0d1e856335fc` to `https://identity.mozilla.com/apps/vpn`
- A temporary change at sign-in records the canonical scope for these two client IDs, so the backfill can run before Monitor and VPN ship their scope change, with no gap. A separate ticket removes it once both clients request the scope.
- The prod backfill ([FXA-14086]) runs with its default options after [FXA-14724] and the sign-in change land.

## Pros and Cons of the Options

### Option A: one-time fix for Monitor and VPN, forward-fill for future services

- Monitor (MNTOR-5389) and VPN (new ticket on their side) start requesting the canonical scope.
- Widen FXA-14724 so the backfill adds the canonical scope for Monitor web and VPN app tokens, identified by client ID.
- Optional but likely: a temporary bandaid at sign-in that records the canonical scope for those two client IDs, removed later. It lets us run the backfill sooner, with no gap and no dependency on Monitor or VPN shipping the scope change.
- Future services must request the canonical scope. Sign-ins before that don't count, and those users get a one-tap cached sign-in the first time Firefox needs the service.

Pros:

- Existing Monitor and VPN users get the silent exchange.
- Matches Google's cross-client identity once the clients request the scope.
- No new rule in the exchange.

Cons:

- Monitor web and the VPN app don't need the scope today. They'd add it only for the silent exchange.
- Rows say the user has a scope their token doesn't hold, until they sign in again. Deauthorization decides from remaining refresh tokens, so it can misfire. For example, disconnecting VPN-in-Android also checks the VPN app's backfilled `apps/vpn` row. No remaining token holds `apps/vpn`, so that row is deauthorized while the app is still connected. This is temporary and fixes itself as users sign in again with the scope. In the worst case, the user authorizes again at FxA.
- Temporary special handling for Monitor and VPN: the backfill change and a sign-in bandaid to remove later.

### Option B: config-based fallback in the exchange

- New config listing each service's own non-Firefox clients: `vpn` to the VPN app, `monitor` to Monitor web.
- If there's no canonical-scope row, the exchange accepts an active row from a listed client.
- No backfill change, no sign-in change, and no scope changes needed from Monitor or VPN.

Pros:

- Covers existing users and future services with a config change. No further backfills.
- No new deauthorization misfires. The listed client's rows only contain scopes its token holds, so they're deauthorized when that client is disconnected and left alone otherwise.

Cons:

- Departs from Google's model: a sign-in counts without the scope ever being requested.
- Adds a second, unusual rule to the consent check, plus a permanent per-service client list to maintain.
- Doesn't fix today's deauthorization mismatch, only hides it. Disconnecting VPN-in-Android still deauthorizes Android's own `apps/vpn` row, because the VPN app's token doesn't hold `apps/vpn`. The exchange still succeeds through the VPN app's active rows, so the user doesn't notice, but the table no longer shows the user as authorized for `apps/vpn`. This isn't temporary: it lasts as long as the VPN app's tokens don't hold `apps/vpn`.

## Notes

- **Cross-client identity for Desktop.** The token exchange works only with refresh tokens. Firefox for Android already uses it for VPN. Desktop can use it after it moves to refresh tokens.
- **Relay.** `bypassConsentForServices` grants Relay without `accountAuthorizations`, because the Relay clients check attached clients for the Relay client ID. This ADR does not change it.
- **Destroy from a relying party.** When a relying party revokes its own token with `/oauth/destroy`, deauthorization does not run. This is a separate gap for relying parties that have their own account deletion, such as Monitor.

## Links

- Builds on [ADR 0048](0048-refresh-tokens-and-account-level-authorization.md).
- Builds on [ADR 0051](0051-account-authorization-table.md).
- Related to [ADR 0049](0049-service-driven-scope-resolution.md), which resolves the canonical scope from `service=` for Firefox sign-ins.
- Documentation of the token exchange: [FXA-13081].

[FXA-13081]: https://mozilla-hub.atlassian.net/browse/FXA-13081
[FXA-14086]: https://mozilla-hub.atlassian.net/browse/FXA-14086
[FXA-14724]: https://mozilla-hub.atlassian.net/browse/FXA-14724
