<!-- This Source Code Form is subject to the terms of the Mozilla Public
     License, v. 2.0. If a copy of the MPL was not distributed with this
     file, You can obtain one at http://mozilla.org/MPL/2.0/. -->

# Test fixtures (typed Jest mocks)

Replacement for the legacy `test/mocks.js` monolith (**FXA-13708**). Most specs
need no fixture file at all — this directory exists only for the cases where a
typed inline `createMock<T>()` is not enough.

## Default: inline `createMock<T>()`

For any collaborator with a real TypeScript interface (NestJS managers,
`AuthLogger`, `StatsD`, repositories, …), mock it inline — don't hand-roll a
mock and don't add a file here:

```ts
import { createMock } from '@golevelup/ts-jest';

const log = createMock<AuthLogger>();
const statsd = createMock<StatsD>();
```

Why this over a hand-rolled mock:

- **Complete method set.** Every method exists as a spy for free, so the
  "mock is missing a method" failure (`undefined is not a function`) disappears.
  The legacy `mockObject(STATSD_METHOD_NAMES)` stubbed 3 of `StatsD`'s ~13.
- **Tracks the production type.** The mock is `DeepMocked<T>`; if `T` changes,
  the spec fails to compile (enforced once specs are type-checked — **FXA-13782**).
- **Deep mocking.** Nested calls return their own deep mocks, so chained APIs
  work unwired: `ctx.switchToHttp().getRequest()`.
- **No shared method-name list** for consumers to couple to and accrete onto.

The payoff scales with the collaborator — minimal for flat ones (`statsd`,
`log`, use it anyway for one idiom), large for complex surfaces (`db`, `request`,
NestJS managers).

**Caveat — auto-return.** Methods return nested deep mocks, not `undefined`. For
data-bearing reads (`db.account`, …) a forgotten stub yields a silent proxy
rather than a crash, so stub the reads your assertions depend on. Supply data
from the `libs/` factories:

```ts
db.account.mockResolvedValue(AccountFactory({ email }));
```

## When to add a file here

Only when inline `createMock<T>()` is not enough:

1. **Container / DI-injected collaborators.** Things production resolves from
   the TypeDI `Container` need the mock installed _and torn down_ (`clearMocks`
   does not reset TypeDI). See `fxa-mailer.ts`: `installMockFxaMailer()` pairs
   `createMock<FxaMailer>()` + `Container.set(...)` with a matching
   `uninstallMockFxaMailer()` for `afterEach`.
2. **Shared presets.** A collaborator most consumers configure identically
   (a `request` builder, a pre-wired `db` factory). Export a factory that wraps
   `createMock<T>()` and applies them.
3. **No production type at all (rare).** Currently none — notably the legacy
   `mailer` is deliberately not given one; mock `FxaMailer` and pass a throwaway
   stub for the legacy `mailer` argument.

If it is none of these, it is pure indirection — don't add it.

## Conventions for files that belong here

- One file per domain, named after it (`mailer.ts`, `db.ts`, …).
- Named factory `createMock<Domain>()`; take a `Partial<...>` overrides argument
  when presets are involved, mirroring the `*.factories.ts` style in `libs/`.
- Reuse `libs/` data factories (`AccountFactory`, …); never re-invent shapes.
- Pair every `Container.set(...)` with a matching reset so state cannot leak
  between specs.
