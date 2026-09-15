# shared-feature-flags

Single read API for admin-managed feature flags.

```ts
import { featureFlags, httpSource } from '@fxa/shared/feature-flags';

// Node services: poll the auth server. Call once at boot; ttlMs comes from
// the host's config so it can be tuned without a deploy.
await featureFlags.init({ source: httpSource(authServerUrl), ttlMs });

// Browser: flags were resolved server-side and injected into the page.
await featureFlags.init({ flags: config.featureFlags });

// Anywhere afterwards, synchronous.
if (featureFlags.get('new-checkout')) { ... }
```

Reads are served from an in-process cache. A stale read returns the cached
value and refreshes in the background; a failed refresh keeps the last good
value. Unknown flags are `false`.

Every flag is served over the unauthenticated endpoint, so flag names and
states are public. A future server-only flag needs an authenticated route,
not a DB read.
