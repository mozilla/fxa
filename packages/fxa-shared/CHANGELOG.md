# Change history

## 1.188.1

No changes.

## 1.188.0

### New features

- subscriptions: add product specific app/service support field ([e5c6d77e8](https://github.com/mozilla/fxa/commit/e5c6d77e8))
- fxa-shared: refactor nestjs shared modules ([a9cf3836b](https://github.com/mozilla/fxa/commit/a9cf3836b))

### Refactorings

- fxa-shared: cleanup sentry and add exc route ([4561064c9](https://github.com/mozilla/fxa/commit/4561064c9))

### Other changes

- deps-dev: bump jest from 24.9.0 to 26.4.2 ([fad65917c](https://github.com/mozilla/fxa/commit/fad65917c))

## 1.187.3

No changes.

## 1.187.2

No changes.

## 1.187.1

No changes.

## 1.187.0

No changes.

## 1.186.2

No changes.

## 1.186.1

No changes.

## 1.186.0

### Other changes

- deps: update yarn version and root level deps ([da2e99729](https://github.com/mozilla/fxa/commit/da2e99729))

## 1.185.1

No changes.

## 1.185.0

### Other changes

- update typescript ([245568d56](https://github.com/mozilla/fxa/commit/245568d56))
- dependency updates ([aaa549ed6](https://github.com/mozilla/fxa/commit/aaa549ed6))

## 1.184.1

No changes.

## 1.184.0

No changes.

## 1.183.1

No changes.

## 1.183.0

No changes.

## 1.182.2

No changes.

## 1.182.1

No changes.

## 1.182.0

### Bug fixes

- auth: added exports to fxa-shared package.json ([31c8d650a](https://github.com/mozilla/fxa/commit/31c8d650a))
- payments: de-dupe and correct some differing types between fxa-shared and fxa-payments-server Redux store ([e695bc9fb](https://github.com/mozilla/fxa/commit/e695bc9fb))

### Refactorings

- auth-server: convert subscriptions to TS ([b94d0c99b](https://github.com/mozilla/fxa/commit/b94d0c99b))

## 1.181.2

No changes.

## 1.181.1

No changes.

## 1.181.0

### Other changes

- styles: make subscription icon background configurable as metadata ([ab231fa37](https://github.com/mozilla/fxa/commit/ab231fa37))

## 1.180.1

No changes.

## 1.180.0

### New features

- payments: Support new download URLs for legal links in emails ([28ebf9572](https://github.com/mozilla/fxa/commit/28ebf9572))

## 1.179.4

No changes.

## 1.179.3

No changes.

## 1.179.2

No changes.

## 1.179.1

No changes.

## 1.179.0

### New features

- auth-server: add stripe object filtering ([de82e10d3](https://github.com/mozilla/fxa/commit/de82e10d3))

## 1.178.1

No changes.

## 1.178.0

### Bug fixes

- build: added postinstall to fxa-shared ([39345629b](https://github.com/mozilla/fxa/commit/39345629b))

### Other changes

- deps: update deps ([27cd24c63](https://github.com/mozilla/fxa/commit/27cd24c63))
- l10n: add en-US to shared list of supported locales ([56d735061](https://github.com/mozilla/fxa/commit/56d735061))
- docs: Replace 'master' with 'main' throughout ([20a0acf8b](https://github.com/mozilla/fxa/commit/20a0acf8b))

## 1.177.1

No changes.

## 1.177.0

### New features

- auth-server: use ToS ## 1.176.0 privacy links from Stripe metadata in subplat emails ([6b2817090](https://github.com/mozilla/fxa/commit/6b2817090))

### Bug fixes

- shared: ensure \*.ts tests run ([ea09677c3](https://github.com/mozilla/fxa/commit/ea09677c3))

### Other changes

- deps: updated dependencies ([3fa952919](https://github.com/mozilla/fxa/commit/3fa952919))
- pm2: Add ISO timestamp to pm2 log lines ([2c5630adb](https://github.com/mozilla/fxa/commit/2c5630adb))

## 1.176.0

No changes.

## 1.175.0

### New features

- metrics: add subscription payment source country to Amplitude events ([f60887595](https://github.com/mozilla/fxa/commit/f60887595))

## 1.174.2

No changes.

## 1.174.1

No changes.

## 1.174.0

### New features

- settings-redesign: add settings_version event property for fxa_pref amplitude events ([06a02d586](https://github.com/mozilla/fxa/commit/06a02d586))

### Bug fixes

- local-dev: added fxa-shared and fxa-react to pm2 ([c3780546b](https://github.com/mozilla/fxa/commit/c3780546b))

### Refactorings

- l10n: update supported languages ([2d0e5ba21](https://github.com/mozilla/fxa/commit/2d0e5ba21))

## 1.173.0

### Bug fixes

- build: fix paths to fxa-shared ([21fe09b72](https://github.com/mozilla/fxa/commit/21fe09b72))
- docker: removed need for fxa-shared postinstall script ([b3b3d2c0e](https://github.com/mozilla/fxa/commit/b3b3d2c0e))

### Refactorings

- tsconfig: consolidate common tsconfig options ([e565285b7](https://github.com/mozilla/fxa/commit/e565285b7))
- packages: use workspace references ([81575019a](https://github.com/mozilla/fxa/commit/81575019a))

### Other changes

- deps: update some dependencies ([fec460f6d](https://github.com/mozilla/fxa/commit/fec460f6d))
- format: mass reformat with prettier 2 and single config ([cc595fc2b](https://github.com/mozilla/fxa/commit/cc595fc2b))

## 1.172.2

No changes.

## 1.172.1

No changes.

## 1.172.0

### New features

- cad: Add metrics for the CAD via QR code ([2f9729154](https://github.com/mozilla/fxa/commit/2f9729154))

## 1.171.1

No changes.

## 1.171.0

### Bug fixes

- deps: Upgrade mocha to resolve yargs-parser nsp advisory 1500 ([8246673ba](https://github.com/mozilla/fxa/commit/8246673ba))

## 1.170.3

No changes.

## 1.170.2

No changes.

## 1.170.1

No changes.

## 1.170.0

### New features

- newsletters: Add newsletters experiment metrics ([134a7fea3](https://github.com/mozilla/fxa/commit/134a7fea3))
- settings: add sentry setup ([9a9aaade7](https://github.com/mozilla/fxa/commit/9a9aaade7))

### Bug fixes

- l10n: temporary (hopefully) fix for l10n CI build ([90c407f5e](https://github.com/mozilla/fxa/commit/90c407f5e))

### Other changes

- all: update readmes across all packages to improve testing documentation ([099163e94](https://github.com/mozilla/fxa/commit/099163e94))

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
