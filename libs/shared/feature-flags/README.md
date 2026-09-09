# @fxa/shared/feature-flags

Reads the operational feature flags managed in the admin panel.

Flags are boolean and global — there is no per-user targeting, no percentage
rollout, and no experiment measurement. Anything needing a cohort belongs in
Nimbus (`libs/shared/experiments`).

## Usage

Load once at startup, then read anywhere:

```ts
import {
  createAuthServerLoader,
  featureFlag,
  loadFeatureFlags,
} from '@fxa/shared/feature-flags';

await loadFeatureFlags(createAuthServerLoader(config.servers.auth.url));

if (featureFlag('new-checkout')) {
  // ...
}
```

A service with database access can skip the HTTP hop by passing its own loader:

```ts
await loadFeatureFlags(() => FeatureFlag.getEnabledFlags());
```

In `fxa-settings`, use the `useFeatureFlag` hook from
`models/contexts/FeatureFlagsContext` rather than calling `featureFlag`
directly, so components re-render when the flag list arrives.

## Semantics

`featureFlag` returns false for an unknown flag, before the load resolves, and
if the load fails. A flag must therefore gate the _new_ behaviour — false has to
mean the safe, existing path. The admin panel rejects negatively phrased names
for this reason.

The auth server omits disabled flags from its response, so an unreleased
feature's name is not published until it is switched on.

Values are not refreshed after load: a flag changing mid-session would flip the
UI underneath whoever is using it.
