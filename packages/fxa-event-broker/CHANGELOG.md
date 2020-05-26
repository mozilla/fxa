# Change history

## 1.172.1

No changes.

## 1.172.0

No changes.

## 1.171.1

No changes.

## 1.171.0

### Bug fixes

- deps: Upgrade convict and mocha to resolve yargs-parser nsp advisory 1500 ([3dbf5df4b](https://github.com/mozilla/fxa/commit/3dbf5df4b))

## 1.170.3

No changes.

## 1.170.2

No changes.

## 1.170.1

No changes.

## 1.170.0

### Other changes

- all: update readmes across all packages to improve testing documentation ([099163e94](https://github.com/mozilla/fxa/commit/099163e94))

## 1.169.3

No changes.

## 1.169.2

No changes.

## 1.169.1

No changes.

## 1.169.0

### New features

- build: add a default dockerfile template to build.sh ([4dd0b0007](https://github.com/mozilla/fxa/commit/4dd0b0007))

## 1.168.3

No changes.

## 1.168.2

No changes.

## 1.168.1

No changes.

## 1.168.0

### New features

- docker: created fxa-builder docker image ([d4da8a360](https://github.com/mozilla/fxa/commit/d4da8a360))

## 1.167.1

No changes.

## 1.167.0

### Refactorings

- config: replace 127.0.0.1 with localhost ([1dd1b038d](https://github.com/mozilla/fxa/commit/1dd1b038d))
- pm2: restructure our pm2 configs ([3a054dfc3](https://github.com/mozilla/fxa/commit/3a054dfc3))

## 1.166.2

No changes.

## 1.166.1

No changes.

## 1.166.0

No changes.

## 1.165.1

No changes.

## 1.165.0

No changes.

## 1.164.1

No changes.

## 1.164.0

No changes.

## 1.163.2

No changes.

## 1.163.1

No changes.

## 1.163.0

### Other changes

- deps: Updates to address nsp advisory 1179 ([a5649db18](https://github.com/mozilla/fxa/commit/a5649db18))

## 1.162.3

No changes.

## 1.162.2

No changes.

## 1.162.1

### Bug fixes

- event-broker: make uuid a full dependency ([0d989878c](https://github.com/mozilla/fxa/commit/0d989878c))

## 1.162.0

### New features

- add pm2 debug servers and add'l debug scripts ([5d3747e38](https://github.com/mozilla/fxa/commit/5d3747e38))

### Bug fixes

- test: fixed race in event-broker test ([bc97bb5e0](https://github.com/mozilla/fxa/commit/bc97bb5e0))
- monorepo: update default node version across packages ([0f2d54071](https://github.com/mozilla/fxa/commit/0f2d54071))

### Refactorings

- ci: major refactor of CircleCI workflow ([7e77b0a29](https://github.com/mozilla/fxa/commit/7e77b0a29))
- event-broker: update deps and move to src ([d7da2deaf](https://github.com/mozilla/fxa/commit/d7da2deaf))

## 1.161.2

No changes.

## 1.161.1

No changes.

## 1.161.0

### New features

- event-broker: use tags for unique metrics ([382451260](https://github.com/mozilla/fxa/commit/382451260))

### Bug fixes

- dev: some processes need to wait for mysql to startup ([147994051](https://github.com/mozilla/fxa/commit/147994051))
- lookup clientids in eventbroker ([bb1b25585](https://github.com/mozilla/fxa/commit/bb1b25585))

## 1.160.1

### Bug fixes

- lookup clientids in eventbroker ([35d83f9d2](https://github.com/mozilla/fxa/commit/35d83f9d2))

## 1.160.0

No changes.

## 1.159.0

### Other changes

- nsp: add four nsp exceptions to auth and profile servers. ([ca8b53826](https://github.com/mozilla/fxa/commit/ca8b53826))

## 1.158.1

No changes.

## 1.158.0

### Bug fixes

- deps: Ignore hoek nsp warning https://npmjs.com/advisories/1468 ([6c0edfa9c](https://github.com/mozilla/fxa/commit/6c0edfa9c))

### Other changes

- deps: Update hoek where we use it directly ([ee998b304](https://github.com/mozilla/fxa/commit/ee998b304))

## 1.157.0

No changes.

## 1.156.0

No changes.

## 1.155.0

### Refactorings

- git: merge all package gitignores into single root-level gitignore (a238c3d27)

## 1.154.0

No changes.

## 1.153.0

### New features

- event-broker: use proper hapi/sqs filtering (6c9899e64)

### Other changes

- event-broker: add remaining docs (e92349a2e)

## 1.152.1

No changes.

## 1.152.0

### New features

- event-broker: add remaining RP events (d5c42ccd8)

## 1.151.5

No changes.

## 1.151.4

No changes.

## 1.151.3

No changes.

## 1.151.2

No changes.

## 1.151.1

No changes.

## 1.151.0

### New features

- event-broker: live firestore data updates (8fc21f30d)
- audit: run npm audit on push instead of in ci (ccd3c2b07)
- event-broker: nest structures for debug log (93202a6d6)

### Bug fixes

- event-broker: allow userAgent to be empty (8ce686a02)
- event: copy over version.json to /app/version.json (90e884a91)

### Refactorings

- event-broker: update deps, TS 3.7 (73f955d00)

### Other changes

- monorepo: eslint consolidation (0a5e3950f)

## 1.150.9

No changes.

## 1.150.8

No changes.

## 1.150.7

No changes.

## 1.150.6

No changes.

## 1.150.5

No changes.

## 1.150.4

No changes.

## 1.150.3

No changes.

## 1.150.2

No changes.

## 1.150.1

No changes.

## 1.150.0

### New features

- event-broker: telegraf opts ## 1.149.4 sentry info (1e266b217)
- event-broker: optimize docker build (e94d0ceec)
- event-broker: update dependencies (94de10458)

### Bug fixes

- events: set default `metrics.prefix` to have trailing `.` (ca7a03d7b)

### Refactorings

- event-broker: use esModuleInterop (53b509aab)

## 1.149.4

No changes.

## 1.149.3

No changes.

## 1.149.2

No changes.

## 1.149.1

No changes.

## 1.149.0

No changes.

## 1.148.8

### Bug fixes

- deps: Update deps and add exception for advisory 1184 (f4d7e9855)

## 1.148.7

No changes.

## 1.148.6

No changes.

## 1.148.5

No changes.

## 1.148.4

No changes.

## 1.148.3

No changes.

## 1.148.2

### Other changes

- release: Merge branch 'train-147' into train-148-merge-147 (66e170d45)

## 1.148.1

No changes.

## 1.148.0

### New features

- add queue prefix config and fix login validation (1e00dc4ab)
- add vscode tasks for running tests and debugger (dac5e8b98)

## 1.147.5

No changes.

## 1.147.4

No changes.

## 1.147.3

No changes.

## 1.147.2

No changes.

## 1.147.1

No changes.

## 1.147.0

### New features

- event-broker: add performance metrics (5a4ebcab6)

### Bug fixes

- event-broker: add interface Version (942100a80)
- event-broker: response to /**version** route (7a7a148bc)

## 1.146.4

No changes.

## 1.146.3

No changes.

## 1.146.2

No changes.

## 1.146.1

No changes.

## 1.146.0

### New features

- event-broker: add config flag to allow capability check to fail (150df6ab5)

### Bug fixes

- vuln: updated hapi to fix https://npmjs.com/advisories/1165 (010abc849)

### Other changes

- deps: fxa-event-broker npm audit changes (564dc7e7a)

## 1.145.5

No changes.

## 1.145.4

No changes.

## 1.145.3

No changes.

## 1.145.2

No changes.

## 1.145.1

No changes.

## 1.145.0

### Refactorings

- db: rename productName to productId (5d709f96d)

## 1.144.4

No changes.

## 1.144.3

No changes.

## 1.144.2

No changes.

## 1.144.1

No changes.

## 1.144.0

### New features

- event-broker: add sentry error reporting (f0694d630)
- event-broker: add delete event propagation (f7d6222ee)
- event-broker: add firestore type-checking (b22b5e1c4)

### Other changes

- docs: add changelogs for subscription packages (5876ced17)
- hooks: turn on prettier hook for typescript (7e69761f0)

## 1.143.4

Prehistoric.
