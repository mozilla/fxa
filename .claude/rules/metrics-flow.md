---
paths:
  - "packages/fxa-settings/src/lib/metrics.ts"
  - "packages/fxa-settings/src/lib/metrics-flow.ts"
  - "packages/fxa-settings/src/lib/glean/**"
  - "packages/fxa-settings/src/lib/passkeys/**"
  - "packages/fxa-settings/src/pages/Index/**"
  - "packages/fxa-settings/src/pages/Signin/**"
---

# FXA Settings — flow metrics context

When building a `metricsContext` or forwarding flow identity (`flowId`,
`flowBeginTime`, `deviceId`) to the auth-server or Glean, source it from the
frozen `flowQueryParams` snapshot (threaded from `App`, the same value the Glean
SDK is initialized with) — **not** a live `location.search` read.

The SPA can strip flow params from the URL after load, so a later
`location.search` read yields a `flow_id` that no longer matches the client's
Glean events. The server event (e.g. `login.complete`) then fails to join the
client funnel and conversion analytics silently break. (Incident: FXA-14093.)

```ts
// Wrong — live URL read; may have lost flow params since load
queryParamsToMetricsContext(searchParams(location.search));
// Right — frozen snapshot; matches the Glean SDK flow_id
queryParamsToMetricsContext(flowQueryParams);
```

`location.search` is still correct for navigation; the trap is metrics only.
Pattern: `lib/passkeys/signin-flow.ts`, `Signin/SigninPasskeyFallback/container.tsx`.
