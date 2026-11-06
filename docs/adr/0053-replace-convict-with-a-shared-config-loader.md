# Replace convict with a shared config loader

- Status: proposed
- Deciders: Vijay Budhram
- Date: 2026-11-05

Technical Story: [FXA-13293]

## Context and Problem Statement

FxA loads service config with [convict](https://github.com/mozilla/node-convict). The project has no active maintainer. Its last commit is about four years old, and a security report ([node-convict#424]) received no response from the maintainer. Unmaintained code on the config path of the auth server is a risk, because config holds secrets and controls security checks at boot.

Eight packages use convict 6.2.5 from npm, with `convict-format-with-moment` and `convict-format-with-validator`:

| Package                    | Schema keys (approx.) | Notes                                                                                               |
| -------------------------- | --------------------- | --------------------------------------------------------------------------------------------------- |
| `fxa-auth-server`          | 460                   | Derives values with `set` after load, reads key files, runs prod checks. 53 files use `ConfigType`. |
| `fxa-content-server`       | 140                   | About 10 `set` overrides. `validate()` is commented out.                                            |
| `fxa-admin-server`         | 130                   | NestJS `ConfigModule` loads `getProperties()`.                                                      |
| `fxa-profile-server`       | 50                    | Masks secrets in logs with the private `getSchema()._cvtProperties`.                                |
| `fxa-event-broker`         | 35                    | NestJS `ConfigModule` loads `getProperties()`.                                                      |
| `fxa-admin-panel`          | 25                    | `AppConfig` is the type of the convict instance.                                                    |
| `123done`, `db-migrations` | 40                    | Small.                                                                                              |

Shared libs also export convict schema fragments, and several packages use them:

- `libs/shared/otel` (`tracingConfig`)
- `libs/shared/guards` (`GuardConfig`)
- `libs/shared/db/mysql/legacy` and `libs/shared/db/mysql/core` (`makeMySQLConfig`, `makeRedisConfig`, `makeConvictMySQLConfig`)
- `libs/shared/cloud-tasks` (`CloudTasksConvictConfigFactory`)
- `libs/shared/url-allow-list` (the `allowlist` format)

The packages use a small part of convict:

- Schema properties: `doc`, `default`, `format`, `env`, `sensitive`, and `arg` (3 uses).
- Formats: `duration`, `int`, `nat`, `url`, `port`, `timestamp`, enum arrays, `RegExp`, and the custom formats `jwk`, `pem` and `allowlist`.
- Instance methods: `get`, `set`, `has`, `default`, `getProperties`, `loadFile`, `validate` and `toString`.
- Layering: `config/<NODE_ENV>.json`, then the files in `CONFIG_FILES`, then env vars.

No package uses `nullable` or defines an inline format function.

How do we remove the convict dependency with the least risk to running services?

## Decision Drivers

- Remove the unmaintained dependency from the auth, profile and content servers.
- Keep every deployed env var name. Ops sets the flat names from the convict `env` keys, for example `TRACING_CLIENT_NAME`.
- Keep the `CONFIG_FILES` layering, which local dev, Docker and the package scripts use.
- Keep the type inference that `ConfigType` and `AppConfig` give today.
- Move one package at a time, with no flag day across eight packages.
- Do not add a new third-party dependency.

## Considered Options

- Option A: a shared loader in `libs/shared/config` with a convict-compatible API
- Option B: move every package to `nest-typed-config` and class-validator
- Option C: copy convict into the monorepo
- Option D: take over maintenance of `mozilla/node-convict`

## Decision Outcome

Chosen option: "Option A", because it removes the dependency without a change to the schemas, the env var names or the `CONFIG_FILES` layering. Each package changes its import, and the shared fragments keep their shape.

### The work

1. Add `libs/shared/config`. It implements the schema properties, formats and instance methods listed above, with the same semantics, and it has no runtime dependencies.
2. Give the loader types that infer the config shape from the schema, so that `getProperties()` and `get('a.b')` stay typed. Use the shape of the convict type definitions (Apache-2.0) as the reference.
3. Make `toString()` mask `sensitive` values with a public API, and move `fxa-profile-server` off `getSchema()._cvtProperties`.
4. Move the packages one at a time, smallest first: `123done`, `db-migrations`, `fxa-admin-panel`, `fxa-event-broker`, `fxa-profile-server`, `fxa-admin-server`, `fxa-content-server`, `fxa-auth-server`. Each step runs the package's existing config and boot tests.
5. Move the shared lib fragments when no package needs convict for them. The fragments are plain schema objects, so the old and the new loader both accept them during the move.
6. Remove `convict`, `convict-format-with-moment`, `convict-format-with-validator` and `@types/convict` from all `package.json` files.

The estimate is one to two weeks for one engineer.

### Positive Consequences

- No unmaintained code on the config path.
- No change for ops: env var names, defaults and config files stay the same.
- Each package moves in its own PR, and a revert is a one-line change.
- `toString()` masking becomes a supported API.

### Negative Consequences

- FxA owns a config loader of about 300 to 500 lines, with its tests.
- The config model does not change. Defaults stay in the schema, and the two config styles (this loader and `nest-typed-config` in SubPlat) both remain in the monorepo.
- The type inference for nested paths is the hardest part, and it needs careful tests.

## Pros and Cons of the Options

### Option A: a shared loader with a convict-compatible API

- Good, because the schemas, env var names and config files do not change.
- Good, because the move is incremental and each step is easy to revert.
- Good, because it adds no third-party dependency.
- Bad, because FxA maintains its own loader.

### Option B: move every package to `nest-typed-config` and class-validator

SubPlat uses this approach in `apps/payments/*` and `libs/payments/*`. The libraries are already installed.

- Good, because it uses maintained libraries, and the monorepo gets one config style.
- Bad, because its loader maps env vars with `__` for nesting. To keep the deployed names, each of the about 880 keys needs an explicit env mapping, or ops renames every variable.
- Bad, because the defaults move out of the schema into `.env` files or code.
- Bad, because `CONFIG_FILES` layering and the auth server logic after load need a new design.
- Bad, because the estimate is four to six weeks, with a boot risk for every service.

### Option C: copy convict into the monorepo

- Good, because it is the smallest change.
- Bad, because FxA then maintains all of convict, including the features it does not use.
- Bad, because it moves the risk but does not reduce it.

### Option D: take over maintenance of `mozilla/node-convict`

- Good, because other Mozilla projects get the fixes too.
- Bad, because it needs an organization decision and a long-term owner outside the FxA roadmap.
- Bad, because FxA still depends on a general-purpose library that is larger than what it uses.

## Open Questions

- Confirm that convict 6.2.5 contains the fix for [node-convict#424]. The ticket says that the team patched convict, but the monorepo has no yarn patch for it.
- `fxa-auth-server` logs `config.toString()` outside prod (`bin/key_server.js`), and its own schema marks no keys `sensitive`. Decide if the move also marks the secret keys `sensitive`.

[FXA-13293]: https://mozilla-hub.atlassian.net/browse/FXA-13293
[node-convict#424]: https://github.com/mozilla/node-convict/issues/424
