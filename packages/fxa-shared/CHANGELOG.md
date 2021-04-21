# Change history

## 1.204.4

No changes.

## 1.204.3

No changes.

## 1.204.2

No changes.

## 1.204.1

### Bug fixes

- release: Add changelog notes and bump version for 204 ([5b8356e11](https://github.com/mozilla/fxa/commit/5b8356e11))

## 1.204.0

### Bug fixes

- stop reporting apollo errors ([acb735aa9](https://github.com/mozilla/fxa/commit/acb735aa9))
- l10n: use en-CA not en-GB for settings and payments ([ef404738d](https://github.com/mozilla/fxa/commit/ef404738d))
- auth-server: handle empty responses ([be6e22c81](https://github.com/mozilla/fxa/commit/be6e22c81))

### Other changes

- deps: bump generic-pool from 3.7.2 to 3.7.8 ([30b800739](https://github.com/mozilla/fxa/commit/30b800739))
- deps-dev: bump ts-jest from 26.4.3 to 26.5.4 ([dc136b213](https://github.com/mozilla/fxa/commit/dc136b213))
- deps: bump aws-sdk from 2.879.0 to 2.883.0 ([47ddfc9bb](https://github.com/mozilla/fxa/commit/47ddfc9bb))

## 1.203.5

No changes.

## 1.203.4

No changes.

## 1.203.3

No changes.

## 1.203.2

No changes.

## 1.203.1

No changes.

## 1.203.0

### Other changes

- deps: bump @nestjs/core from 7.6.14 to 7.6.15 ([adfbdd3b3](https://github.com/mozilla/fxa/commit/adfbdd3b3))
- deps: bump objection from 2.2.7 to 2.2.15 ([626f62e58](https://github.com/mozilla/fxa/commit/626f62e58))
- deps: bump @nestjs/core from 7.6.13 to 7.6.14 ([a335f90c7](https://github.com/mozilla/fxa/commit/a335f90c7))
- deps: bump class-transformer from 0.3.1 to 0.4.0 ([66bec644c](https://github.com/mozilla/fxa/commit/66bec644c))
- deps: bump @nestjs/mapped-types from 0.3.0 to 0.4.0 ([aedb056a1](https://github.com/mozilla/fxa/commit/aedb056a1))
- deps-dev: bump @types/redis from 2.8.27 to 2.8.28 ([e6d19228f](https://github.com/mozilla/fxa/commit/e6d19228f))

## 1.202.3

### Bug fixes

- settings: fix session ttl in settings ([b9abd02da](https://github.com/mozilla/fxa/commit/b9abd02da))

## 1.202.2

No changes.

## 1.202.1

No changes.

## 1.202.0

### New features

- auth-server: handle IPN for billing agreement cancelled Because: ([381b00471](https://github.com/mozilla/fxa/commit/381b00471))
- l10n: Add support for new locales ([23f26e217](https://github.com/mozilla/fxa/commit/23f26e217))

### Bug fixes

- l10n: Add 'hi' locale support ([213ac944a](https://github.com/mozilla/fxa/commit/213ac944a))

### Other changes

- Add a new event property to Checkout related Amplitude events ([045a6544d](https://github.com/mozilla/fxa/commit/045a6544d))
- deps: bump @nestjs/core from 7.6.12 to 7.6.13 ([e0611af3b](https://github.com/mozilla/fxa/commit/e0611af3b))
- deps: bump generic-pool from 3.7.1 to 3.7.2 ([52648911e](https://github.com/mozilla/fxa/commit/52648911e))
- deps-dev: bump @types/mocha from 7.0.2 to 8.2.1 ([1ccd661a1](https://github.com/mozilla/fxa/commit/1ccd661a1))
- deps: bump rxjs from 6.6.3 to 6.6.6 ([62c3c2447](https://github.com/mozilla/fxa/commit/62c3c2447))
- deps: bump @nestjs/graphql from 7.9.9 to 7.9.10 ([a6b3030cc](https://github.com/mozilla/fxa/commit/a6b3030cc))
- deps: bump aws-sdk from 2.849.0 to 2.851.0 ([ba6f4b37e](https://github.com/mozilla/fxa/commit/ba6f4b37e))
- deps: bump @nestjs/common from 7.6.4 to 7.6.13 ([386ccc471](https://github.com/mozilla/fxa/commit/386ccc471))

## 1.201.1

No changes.

## 1.201.0

### New features

- settings: finish implementing delete avatar ([77aa4fd8d](https://github.com/mozilla/fxa/commit/77aa4fd8d))

### Other changes

- deps: bump @nestjs/graphql from 7.9.8 to 7.9.9 ([e6b62e0e0](https://github.com/mozilla/fxa/commit/e6b62e0e0))
- deps: bump @nestjs/config from 0.6.1 to 0.6.3 ([41b3ea4af](https://github.com/mozilla/fxa/commit/41b3ea4af))
- deps: bump aws-sdk from 2.841.0 to 2.849.0 ([1e3e08e4b](https://github.com/mozilla/fxa/commit/1e3e08e4b))
- fxa-settings: add avatar delete mutation ([510c2faef](https://github.com/mozilla/fxa/commit/510c2faef))
- deps: bump @nestjs/core from 7.5.5 to 7.6.12 ([11b786463](https://github.com/mozilla/fxa/commit/11b786463))
- deps: bump aws-sdk from 2.822.0 to 2.841.0 ([69f41b166](https://github.com/mozilla/fxa/commit/69f41b166))

## 1.200.0

### New features

- fxa-settings: avatar uploads ([edaf607ead](https://github.com/mozilla/fxa/commit/edaf607ead))

### Bug fixes

- settings: when gql-api switched to nestjs the auth error changed ([7817de9390](https://github.com/mozilla/fxa/commit/7817de9390))

### Other changes

- deps: bump @nestjs/graphql from 7.9.1 to 7.9.8 ([2e1c276997](https://github.com/mozilla/fxa/commit/2e1c276997))
- deps: bump @nestjs/mapped-types from 0.1.1 to 0.3.0 ([50b07cab0a](https://github.com/mozilla/fxa/commit/50b07cab0a))
- deps: bump graphql from 15.4.0 to 15.5.0 ([eae1a35dd0](https://github.com/mozilla/fxa/commit/eae1a35dd0))

## 1.199.0

### New features

- auth-server: add paypal IPN handler ([8d5c253fe](https://github.com/mozilla/fxa/commit/8d5c253fe))
- shared: add paypal BA model commands ([3aae010a7](https://github.com/mozilla/fxa/commit/3aae010a7))

### Bug fixes

- metrics: fixed 'fxa - activity' metric ([a28ceeb74](https://github.com/mozilla/fxa/commit/a28ceeb74))

### Other changes

- deps: bump knex from 0.21.12 to 0.21.16 ([8ff4bb2b5](https://github.com/mozilla/fxa/commit/8ff4bb2b5))
- deps: bump @sentry/node from 6.0.0 to 6.0.1 ([3b6838b18](https://github.com/mozilla/fxa/commit/3b6838b18))
- deps: bump objection from 2.2.3 to 2.2.7 ([875a1ffbb](https://github.com/mozilla/fxa/commit/875a1ffbb))
- deps-dev: bump @nestjs/testing from 7.5.5 to 7.6.5 ([ed20e1585](https://github.com/mozilla/fxa/commit/ed20e1585))
- deps: bump @sentry/node from 5.29.1 to 6.0.0 ([147825a5b](https://github.com/mozilla/fxa/commit/147825a5b))
- deps: bump apollo-server from 2.19.0 to 2.19.2 ([48896ad58](https://github.com/mozilla/fxa/commit/48896ad58))

## 1.198.2

### Bug fixes

- metrics: fixed 'fxa - activity' metric ([bdd645c48](https://github.com/mozilla/fxa/commit/bdd645c48))

## 1.198.1

### Other changes

- 4e70b3f04 merge main->train-198 ([4e70b3f04](https://github.com/mozilla/fxa/commit/4e70b3f04))

## 1.198.0

### Other changes

- deps: update eslint to v7 ([7cf502be2](https://github.com/mozilla/fxa/commit/7cf502be2))
- deps: bump graphql from 14.6.0 to 15.4.0 ([d28e79655](https://github.com/mozilla/fxa/commit/d28e79655))
- deps: removed fxa-notifier-aws dep ([71c8bc171](https://github.com/mozilla/fxa/commit/71c8bc171))

## 1.197.3

No changes.

## 1.197.2

No changes.

## 1.197.1

No changes.

## 1.197.0

### New features

- metrics: add nav timing metrics for new settings ([b1f2650a4](https://github.com/mozilla/fxa/commit/b1f2650a4))

### Refactorings

- auth: use native promises in all production / non-test code ([ea2ab78c1](https://github.com/mozilla/fxa/commit/ea2ab78c1))

### Other changes

- deps: bump @nestjs/common from 7.5.5 to 7.6.4 ([afc29280a](https://github.com/mozilla/fxa/commit/afc29280a))
- deps: bump moment from 2.25.3 to 2.29.1 ([76acfdd63](https://github.com/mozilla/fxa/commit/76acfdd63))

## 1.196.0

### New features

- gql-api: add customs check on query/mutations ([80fc6da3b](https://github.com/mozilla/fxa/commit/80fc6da3b))

### Bug fixes

- shared: don't report NestJS HttpExceptions ([e187a25f7](https://github.com/mozilla/fxa/commit/e187a25f7))
- settings: Moved client email validation to fxa-shared ([db96a7c50](https://github.com/mozilla/fxa/commit/db96a7c50))
- capture GraphQL errors in field resolvers ([007c47833](https://github.com/mozilla/fxa/commit/007c47833))

### Other changes

- deps: updated @sentry/integrations ([9efc0c5bf](https://github.com/mozilla/fxa/commit/9efc0c5bf))
- deps: bump @sentry/node from 5.23.0 to 5.29.1 ([0bc414ad2](https://github.com/mozilla/fxa/commit/0bc414ad2))
- deps: bump redis from 2.8.0 to 3.0.2 ([3edfabfab](https://github.com/mozilla/fxa/commit/3edfabfab))
- deps-dev: bump ts-loader from 8.0.9 to 8.0.12 ([5f342dbca](https://github.com/mozilla/fxa/commit/5f342dbca))
- deps: updated @nestjs/\* deps ([4496c9649](https://github.com/mozilla/fxa/commit/4496c9649))
- deps: bump @nestjs/graphql from 7.7.0 to 7.9.1 ([48c46cbb6](https://github.com/mozilla/fxa/commit/48c46cbb6))

## 1.195.4

No changes.

## 1.195.3

No changes.

## 1.195.2

No changes.

## 1.195.1

### New features

- gql-api: add customs check on query/mutations ([10e0af619](https://github.com/mozilla/fxa/commit/10e0af619))

## 1.195.0

### Other changes

- deps: bump @sentry/browser from 5.27.1 to 5.27.6 ([461dee802](https://github.com/mozilla/fxa/commit/461dee802))

## 1.194.0

### New features

- event-broker: capture error context ([59a6d1530](https://github.com/mozilla/fxa/commit/59a6d1530))

### Other changes

- deps: bump knex from 0.21.4 to 0.21.12 ([7b7222ca1](https://github.com/mozilla/fxa/commit/7b7222ca1))
- deps: bump hot-shots from 7.8.0 to 8.2.0 ([b5c99456d](https://github.com/mozilla/fxa/commit/b5c99456d))
- deps-dev: bump jest from 26.6.1 to 26.6.3 ([239c3e824](https://github.com/mozilla/fxa/commit/239c3e824))
- deps: bump @nestjs/mapped-types from 0.1.0 to 0.1.1 ([e2b3767ef](https://github.com/mozilla/fxa/commit/e2b3767ef))
- deps-dev: bump ts-loader from 8.0.4 to 8.0.9 ([69e5f91f2](https://github.com/mozilla/fxa/commit/69e5f91f2))

## 1.193.1

No changes.

## 1.193.0

### Other changes

- deps-dev: bump ts-jest from 26.1.0 to 26.4.3 ([b6974132f](https://github.com/mozilla/fxa/commit/b6974132f))
- deps: bump @sentry/browser from 5.17.0 to 5.27.1 ([fcc11be76](https://github.com/mozilla/fxa/commit/fcc11be76))
- deps: update node version to 14 ([6c2b253c1](https://github.com/mozilla/fxa/commit/6c2b253c1))
- deps-dev: bump jest from 26.4.2 to 26.6.1 ([f2546787b](https://github.com/mozilla/fxa/commit/f2546787b))
- deps-dev: bump jsdom from 16.2.2 to 16.4.0 ([d892ab883](https://github.com/mozilla/fxa/commit/d892ab883))

## 1.192.0

### New features

- subscriptions: handle 'customer.created' Stripe event ([4134ba197](https://github.com/mozilla/fxa/commit/4134ba197))

### Other changes

- deps: bump @nestjs/graphql from 7.6.0 to 7.7.0 ([69e938f06](https://github.com/mozilla/fxa/commit/69e938f06))
- deps: bump @types/sinon from 9.0.7 to 9.0.8 ([f74dce522](https://github.com/mozilla/fxa/commit/f74dce522))

## 1.191.1

No changes.

## 1.191.0

### Other changes

- deps-dev: bump @types/redis from 2.8.20 to 2.8.27 ([f5e9d0451](https://github.com/mozilla/fxa/commit/f5e9d0451))
- deps: bump @types/sinon from 9.0.5 to 9.0.7 ([253383773](https://github.com/mozilla/fxa/commit/253383773))

## 1.190.1

No changes.

## 1.190.0

### New features

- auth: Add Create/Delete for Account-Customer Relationship ([147bbe3f6](https://github.com/mozilla/fxa/commit/147bbe3f6))
- auth: create script to populate accountCustomers table ([b1dfccf6b](https://github.com/mozilla/fxa/commit/b1dfccf6b))
- settings: emit settings view Amplitude event ([c34a98bd8](https://github.com/mozilla/fxa/commit/c34a98bd8))
- shared: add CRUD methods for maintaining fxa user and customer relationship ([01122d032](https://github.com/mozilla/fxa/commit/01122d032))

## 1.189.1

No changes.

## 1.189.0

### New features

- admin-server: convert to NestJS ([69f44d78e](https://github.com/mozilla/fxa/commit/69f44d78e))

### Refactorings

- db access: 76536e5fe refactor(db access) - Extract direct db access from fxa-graphql-api to fxa-shared ([76536e5fe](https://github.com/mozilla/fxa/commit/76536e5fe))

### Other changes

- fxa-shared: add nestjs module docs ([dd9faea0a](https://github.com/mozilla/fxa/commit/dd9faea0a))
- deps-dev: bump ts-loader from 6.2.2 to 8.0.4 ([c8aff3f11](https://github.com/mozilla/fxa/commit/c8aff3f11))
- deps: fixed yarn dependency warnings ([b32addf86](https://github.com/mozilla/fxa/commit/b32addf86))
- monorepo: move deps to correct sub-packages ([a8cc232b9](https://github.com/mozilla/fxa/commit/a8cc232b9))

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
