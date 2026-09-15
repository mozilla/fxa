# fxa-relier-demo

Browser-only OAuth relying party for the local FxA stack. Proof of concept for a
123done replacement that shows what each flow and scope actually yields.

- Public client with PKCE; no server, no client secret.
- Pick a scenario, edit any authorize parameter, run it, then inspect the callback,
  tokens, introspection, userinfo, and a scope-to-claim matrix.
- Scoped keys are requested with a key pair generated in the tab and decrypted there.

## Run

```
yarn start infrastructure
nx start fxa-auth-server fxa-profile-server fxa-content-server fxa-settings
nx start fxa-relier-demo        # http://localhost:8090
```

The two demo clients live in `packages/fxa-auth-server/config/dev.json`
(`Relier Demo (trusted)` and `Relier Demo (untrusted)`), redirecting to
`http://localhost:8090/callback`.

## Not in the POC

Confidential-client flows, functional-test wiring, hosting, subscriptions.
