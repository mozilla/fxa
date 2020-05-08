# Change history

## 1.169.3

No changes.

## 1.169.2

No changes.

## 1.169.1

No changes.

## 1.169.0

No changes.

## 1.168.3

No changes.

## 1.168.2

No changes.

## 1.168.1

No changes.

## 1.168.0

### New features

- docker: created fxa-builder docker image ([d4da8a360](https://github.com/mozilla/fxa/commit/d4da8a360))
- metrics: transform a "raw" Amplitude event into a HTTP payload ([ee5df17c6](https://github.com/mozilla/fxa/commit/ee5df17c6))

### Other changes

- cleanup: Remove the `marketingOptIn` param ([8a1446d43](https://github.com/mozilla/fxa/commit/8a1446d43))

## 1.167.1

No changes.

## 1.167.0

### Refactorings

- config: replace 127.0.0.1 with localhost ([1dd1b038d](https://github.com/mozilla/fxa/commit/1dd1b038d))

## 1.166.2

No changes.

## 1.166.1

No changes.

## 1.166.0

### Bug fixes

- coverage: Report coverage ([d42aef600](https://github.com/mozilla/fxa/commit/d42aef600))
- metrics: update language property on Amplitude schema ([4f2c4493b](https://github.com/mozilla/fxa/commit/4f2c4493b))

### Refactorings

- emails: move all email normalization and equality checks to helper functions ([ce1930f4b](https://github.com/mozilla/fxa/commit/ce1930f4b))

## 1.165.1

No changes.

## 1.165.0

### New features

- metrics: validate Amplitude events with a JSON schema ([63dadbc2c](https://github.com/mozilla/fxa/commit/63dadbc2c))

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

- deps: updated fxa-shared deps and added vuln exception for minimist ([595d424f3](https://github.com/mozilla/fxa/commit/595d424f3))

## 1.162.3

No changes.

## 1.162.2

No changes.

## 1.162.1

No changes.

## 1.162.0

### Bug fixes

- monorepo: update default node version across packages ([0f2d54071](https://github.com/mozilla/fxa/commit/0f2d54071))

### Refactorings

- ci: major refactor of CircleCI workflow ([7e77b0a29](https://github.com/mozilla/fxa/commit/7e77b0a29))

### Other changes

- deps: Updates to address nsp advisory 1488 ([e47bc55ba](https://github.com/mozilla/fxa/commit/e47bc55ba))

## 1.161.2

No changes.

## 1.161.1

No changes.

## 1.161.0

No changes.

## 1.160.1

No changes.

## 1.160.0

No changes.

## 1.159.0

### Bug fixes

- metrics: add Amplitude events for /pair on content server ([a345e36bc](https://github.com/mozilla/fxa/commit/a345e36bc))

## 1.158.1

No changes.

## 1.158.0

### Bug fixes

- deps: Ignore hoek nsp warning https://npmjs.com/advisories/1468 ([6c0edfa9c](https://github.com/mozilla/fxa/commit/6c0edfa9c))

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

- metrics: add Amplitude events for subscription upgrades (d5acb5a65)

## 1.152.1

No changes.

## 1.152.0

No changes.

## 1.151.5

No changes.

## 1.151.4

No changes.

## 1.151.3

No changes.

## 1.151.2

No changes.

## 1.151.1

### Bug fixes

- emails: Add email templates for adding secondary email, recovery key, and both after account verified (7e329ffb3)

## 1.151.0

### New features

- sign-up: validate email domain with DNS (3facc9c30)
- audit: run npm audit on push instead of in ci (ccd3c2b07)
- metrics: Allow RPs to submit a generic 'engage' event to amplitude (9cfd5ec79)

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

### New features

- metrics: Allow RPs to submit a generic 'engage' event to amplitude (e6653e5af)

## 1.150.1

No changes.

## 1.150.0

### New features

- experiments: Add experiments support in fxa-shared (c17e6c754)

### Bug fixes

- payments: correctly append event time to amplitude events (9163183e8)
- metrics: Add metrics for recovery key, emails, and 2FA (fedc92bcc)
- payments: Append time property to amplitude events (6c3fe91c4)

## 1.149.4

### Bug fixes

- payments: correctly append event time to amplitude events (ec04e7e82)

## 1.149.3

No changes.

## 1.149.2

No changes.

## 1.149.1

### Bug fixes

- payments: Append time property to amplitude events (07b01d9ca)
- metrics: Add metrics for recovery key, emails, and 2FA (4d69b9b93)

## 1.149.0

### New features

- metrics: add flow perf metrics to payments server pages (b99457e70)
- payments: complete post-metrics endpoint (4ef358149)

### Bug fixes

- metrics: Update app_version to send complete train version number (6f698a6ce)

### Refactorings

- routes: Extract Express routing helpers into fxa-shared (e471b29c2)

## 1.148.8

No changes.

## 1.148.7

No changes.

## 1.148.6

No changes.

## 1.148.5

No changes.

## 1.148.4

### New features

- payments: complete post-metrics endpoint (f7998ad02)

## 1.148.3

No changes.

## 1.148.2

### New features

- metrics: add product_id and plan_id to more amplitude events (ed501fa1c)

### Other changes

- release: Merge branch 'train-147' into train-148-merge-147 (66e170d45)

## 1.148.1

No changes.

## 1.148.0

### New features

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

### Bug fixes

- docs: update feature-flag readme with monorepo details (f9a49a667)

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

- metrics: add support form metrics (b9e7e08df)

### Other changes

- deps: fxa-shared npm audit changes (c8dd3862f)

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

### New features

- metrics: add subscription events and new top funnel event (0224188c3)
- metrics: change name of button event (16f553bba)
- metrics: allow get-metrics-flow to take form_type button (1304e1b2b)

### Bug fixes

- build: fixed fxa-shared build on `npm install` (be709e07d)

### Other changes

- ts: convert fxa-shared/l10n/localizeTimestamp to typescript (99f3fce63)
- ts: prepare fxa-shared for conversion to typescript (e4c7eef42)

## 1.144.4

No changes.

## 1.144.3

No changes.

## 1.144.2

No changes.

## 1.144.1

### New features

- metrics: change name of button event (c4a9e398b)
- metrics: allow get-metrics-flow to take form_type button (c49f6ee76)

## 1.144.0

### Bug fixes

- deps: use ../ paths to fxa-shared and fxa-geodb in content server (9669cc946)

### Other changes

- scripts: add fxa-shared and fxa-geodb to the release script (3920a7b74)

## 1.143.4

Prehistoric.
