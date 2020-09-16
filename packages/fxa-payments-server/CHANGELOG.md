# Change history

## 1.187.3

No changes.

## 1.187.2

No changes.

## 1.187.1

No changes.

## 1.187.0

### Bug fixes

- payments: pay invoice on retry ([408fcfe2b](https://github.com/mozilla/fxa/commit/408fcfe2b))
- payments: display only one in-progress spinner during cancellation ([b364b18ba](https://github.com/mozilla/fxa/commit/b364b18ba))

### Other changes

- deps: bump helmet from 3.23.3 to 4.1.0 ([c0631ebc6](https://github.com/mozilla/fxa/commit/c0631ebc6))
- payments: detach payment method on failed first sub payment ([80ae4c153](https://github.com/mozilla/fxa/commit/80ae4c153))
- payments: clean up subplat API code unused after SCA switch over ([13c5265fb](https://github.com/mozilla/fxa/commit/13c5265fb))
- payments: cleanup of pre-SCA code in payments-server ([28066579a](https://github.com/mozilla/fxa/commit/28066579a))

## 1.186.2

No changes.

## 1.186.1

### Bug fixes

- payments: pay invoice on retry ([71df1cfb2](https://github.com/mozilla/fxa/commit/71df1cfb2))

## 1.186.0

### New features

- payments: use existing card for new subscriptions ([044c891ca](https://github.com/mozilla/fxa/commit/044c891ca))

### Other changes

- payments: upgrade @fluent/bundle to 0.16, @fluent/react to 0.13, @fluent/langneg to 0.5 ([e6083822c](https://github.com/mozilla/fxa/commit/e6083822c))
- deps: update yarn version and root level deps ([da2e99729](https://github.com/mozilla/fxa/commit/da2e99729))
- payments: upgrade to @fluent/react 0.12.0 ([bc5bd56cb](https://github.com/mozilla/fxa/commit/bc5bd56cb))

## 1.185.1

No changes.

## 1.185.0

### Bug fixes

- storybook: delete commits and pulls over 3 weeks old on every build ([306846f0a](https://github.com/mozilla/fxa/commit/306846f0a))

### Other changes

- update typescript ([245568d56](https://github.com/mozilla/fxa/commit/245568d56))
- dependency updates ([aaa549ed6](https://github.com/mozilla/fxa/commit/aaa549ed6))

## 1.184.1

No changes.

## 1.184.0

### Bug fixes

- payments: ensure SCA payment update uses same error as subscription create ([b8132570e](https://github.com/mozilla/fxa/commit/b8132570e))
- style: Update 404 pages paragraph styles ([f91e5768c](https://github.com/mozilla/fxa/commit/f91e5768c))

## 1.183.1

No changes.

## 1.183.0

### New features

- payments: implement metrics for SCA flows ([39f651722](https://github.com/mozilla/fxa/commit/39f651722))

### Refactorings

- subscriptions: use a single payment update form ([8ab8480f1](https://github.com/mozilla/fxa/commit/8ab8480f1))
- rescripts: include all of fxa as valid paths in rescripts ([62b0878bf](https://github.com/mozilla/fxa/commit/62b0878bf))

## 1.182.2

No changes.

## 1.182.1

No changes.

## 1.182.0

### New features

- payments: Add "Download Terms" link to terms and privacy component ([1134fac2d](https://github.com/mozilla/fxa/commit/1134fac2d))
- payments: use SetupIntent API for SCA payment update ([9592b4233](https://github.com/mozilla/fxa/commit/9592b4233))

### Bug fixes

- payments: filter "synthetic" locales out of the fetch list ([3c1e650de](https://github.com/mozilla/fxa/commit/3c1e650de))
- payments: de-dupe and correct some differing types between fxa-shared and fxa-payments-server Redux store ([e695bc9fb](https://github.com/mozilla/fxa/commit/e695bc9fb))

### Other changes

- subscriptions: use just "Subscriptions" ([56ecd40af](https://github.com/mozilla/fxa/commit/56ecd40af))
- test: add non-usd flows to 123 done ([860c70095](https://github.com/mozilla/fxa/commit/860c70095))

## 1.181.2

No changes.

## 1.181.1

No changes.

## 1.181.0

### New features

- payments: feature flag support to select SCA or legacy payment UI as default ([26266e48a](https://github.com/mozilla/fxa/commit/26266e48a))

### Bug fixes

- payments: hide mention of card in reactivate dialog when unavailable ([cf55dda0d](https://github.com/mozilla/fxa/commit/cf55dda0d))

### Other changes

- styles: make subscription icon background configurable as metadata ([ab231fa37](https://github.com/mozilla/fxa/commit/ab231fa37))
- l10n: follow-up test for #5948 (currency l10n) ([e87996b48](https://github.com/mozilla/fxa/commit/e87996b48))

## 1.180.1

No changes.

## 1.180.0

### New features

- payments: new subscription payment page with card authentication support ([56f28f7a1](https://github.com/mozilla/fxa/commit/56f28f7a1))

### Bug fixes

- l10n: fixed currency localization for "other than US" locales ([79f6eebd9](https://github.com/mozilla/fxa/commit/79f6eebd9))
- payments: remove legal links from footer of payment update form ([90e2c097b](https://github.com/mozilla/fxa/commit/90e2c097b))

## 1.179.4

No changes.

## 1.179.3

### Bug fixes

- l10n: fixed currency localization for "other than US" locales ([5f8495594](https://github.com/mozilla/fxa/commit/5f8495594))

## 1.179.2

No changes.

## 1.179.1

No changes.

## 1.179.0

### New features

- payments: New PaymentFormV2 component with Stripe upgrades ([05c0a47a7](https://github.com/mozilla/fxa/commit/05c0a47a7))
- payments: add @svgr/webpack to storybook can properly compile svgs ([c44d000d3](https://github.com/mozilla/fxa/commit/c44d000d3))

### Bug fixes

- payments: stop fetching unused cached subscription data on payments frontend ([aa69769bf](https://github.com/mozilla/fxa/commit/aa69769bf))

### Other changes

- styles: correctly pass styles into stripe card element ([7fa3fcaef](https://github.com/mozilla/fxa/commit/7fa3fcaef))

## 1.178.1

No changes.

## 1.178.0

### Bug fixes

- payments: further l10n updates for payment update form ([1f8d51c05](https://github.com/mozilla/fxa/commit/1f8d51c05))

### Other changes

- payments-server: l10n msg 4 required fields ([36b50a41d](https://github.com/mozilla/fxa/commit/36b50a41d))
- styles: fortress and payments ui improvements ([69994084b](https://github.com/mozilla/fxa/commit/69994084b))
- deps: update deps ([27cd24c63](https://github.com/mozilla/fxa/commit/27cd24c63))
- l10n: match directory names to language codes ([bb8f2354f](https://github.com/mozilla/fxa/commit/bb8f2354f))
- docs: Replace 'master' with 'main' throughout ([20a0acf8b](https://github.com/mozilla/fxa/commit/20a0acf8b))
- payments: remove zip code validation ([0619df7f2](https://github.com/mozilla/fxa/commit/0619df7f2))

## 1.177.1

No changes.

## 1.177.0

### New features

- auth-server: use ToS ## 1.176.0 privacy links from Stripe metadata in subplat emails ([6b2817090](https://github.com/mozilla/fxa/commit/6b2817090))
- payments: Add legal doc links to payment confirmation checkbox label ([6d41b566d](https://github.com/mozilla/fxa/commit/6d41b566d))
- payments: Use Stripe metadata for terms ## 1.176.0 privacy URLs in payments-server ([92e750a82](https://github.com/mozilla/fxa/commit/92e750a82))

### Bug fixes

- scripts: use mkdir and cp in a loop to copy .ftl files ([7d6b33cb9](https://github.com/mozilla/fxa/commit/7d6b33cb9))

### Other changes

- l10n: copy .ftl files from fxa-content-server-l10n into payments ([ca5758a70](https://github.com/mozilla/fxa/commit/ca5758a70))
- payments-server: use shared lang list ([18f7a1af8](https://github.com/mozilla/fxa/commit/18f7a1af8))
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

- admin-panel+settings+react: set up storybook and tailwind for admin-panel, share tailwind config across all projects, config movement ([7cd796a3f](https://github.com/mozilla/fxa/commit/7cd796a3f))

### Bug fixes

- local-dev: added fxa-shared and fxa-react to pm2 ([c3780546b](https://github.com/mozilla/fxa/commit/c3780546b))

### Refactorings

- clean up the fluent file ([a0be82a2d](https://github.com/mozilla/fxa/commit/a0be82a2d))

### Other changes

- settings: UnitRow, UnitRowWithAvatar, ## 1.173.0 Modal styles + Storybook, allow postcss imports ([d22db34b4](https://github.com/mozilla/fxa/commit/d22db34b4))

## 1.173.0

### New features

- storybooks: Switch Storybook notification from comment post to commit status check ([705833d3a](https://github.com/mozilla/fxa/commit/705833d3a))
- storybooks: build storybooks for CI and deploy to mozilla-fxa/storybooks ([a71aa0cb7](https://github.com/mozilla/fxa/commit/a71aa0cb7))
- settings: Add modal and UnitRow components ([5273861d5](https://github.com/mozilla/fxa/commit/5273861d5))

### Bug fixes

- build: fix paths to fxa-shared ([21fe09b72](https://github.com/mozilla/fxa/commit/21fe09b72))
- payments-server: correct location for secrets.json alongside config ([b19124ad3](https://github.com/mozilla/fxa/commit/b19124ad3))

### Refactorings

- tsconfig: consolidate common tsconfig options ([e565285b7](https://github.com/mozilla/fxa/commit/e565285b7))
- lint-staged: replace sass-lint with stylelint ([9e1104c05](https://github.com/mozilla/fxa/commit/9e1104c05))
- packages: use workspace references ([81575019a](https://github.com/mozilla/fxa/commit/81575019a))

### Other changes

- build: updated payments-server test-ci.sh ([b2a456ac1](https://github.com/mozilla/fxa/commit/b2a456ac1))
- deps: update some dependencies ([fec460f6d](https://github.com/mozilla/fxa/commit/fec460f6d))
- format: mass reformat with prettier 2 and single config ([cc595fc2b](https://github.com/mozilla/fxa/commit/cc595fc2b))

## 1.172.2

No changes.

## 1.172.1

No changes.

## 1.172.0

### New features

- storybook: build static gh-pages site from storybook builds ([acf5c00ba](https://github.com/mozilla/fxa/commit/acf5c00ba))

### Refactorings

- shared components: Rename 'fxa-components' to 'fxa-react' ([e82eeebf0](https://github.com/mozilla/fxa/commit/e82eeebf0))

## 1.171.1

No changes.

## 1.171.0

### Bug fixes

- deps: Add exception for yargs-parser nsp advisory 1500 ([b54877911](https://github.com/mozilla/fxa/commit/b54877911))

## 1.170.3

No changes.

## 1.170.2

No changes.

## 1.170.1

No changes.

## 1.170.0

### New features

- payments: make product details configurable in Stripe metadata ([765bafd49](https://github.com/mozilla/fxa/commit/765bafd49))
- fxa-components: add Survey component ([e9bf5ad4d](https://github.com/mozilla/fxa/commit/e9bf5ad4d))
- payments: update subscription upgrade UX for new designs ([cc0b1d69d](https://github.com/mozilla/fxa/commit/cc0b1d69d))

### Bug fixes

- payments-server: remove border in update pay ([c11951c7c](https://github.com/mozilla/fxa/commit/c11951c7c))

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

- payments: start using rescripts so we can import external components ([79cd1c121](https://github.com/mozilla/fxa/commit/79cd1c121))
- build: add a default dockerfile template to build.sh ([4dd0b0007](https://github.com/mozilla/fxa/commit/4dd0b0007))

### Bug fixes

- npm: fixed npm install in content-server etc ([11ddc0b60](https://github.com/mozilla/fxa/commit/11ddc0b60))

## 1.168.3

No changes.

## 1.168.2

No changes.

## 1.168.1

No changes.

## 1.168.0

### New features

- docker: created fxa-builder docker image ([d4da8a360](https://github.com/mozilla/fxa/commit/d4da8a360))

### Bug fixes

- react: added PUBLIC_URL=/ to admin-panel and payments build script ([0432a10af](https://github.com/mozilla/fxa/commit/0432a10af))
- deps: update content-server and payments package-lock, fixes #5078 ([64b194d5a](https://github.com/mozilla/fxa/commit/64b194d5a))

### Other changes

- cleanup: Remove the `marketingOptIn` param ([8a1446d43](https://github.com/mozilla/fxa/commit/8a1446d43))

## 1.167.1

No changes.

## 1.167.0

### New features

- payments: localization updates ([a0d64226f](https://github.com/mozilla/fxa/commit/a0d64226f))

### Bug fixes

- payments: bugfix for creating default mock stubs for stripe JS API ([7506b8642](https://github.com/mozilla/fxa/commit/7506b8642))

### Refactorings

- config: replace 127.0.0.1 with localhost ([1dd1b038d](https://github.com/mozilla/fxa/commit/1dd1b038d))
- pm2: restructure our pm2 configs ([3a054dfc3](https://github.com/mozilla/fxa/commit/3a054dfc3))

### Other changes

- payments-server: no more dialog errors in subscription create ([bb563caef](https://github.com/mozilla/fxa/commit/bb563caef))
- styles: convert payments UI to grid and tidy ([869b97603](https://github.com/mozilla/fxa/commit/869b97603))
- payments-server: clear checkbox when stay subscribed clicked ([adfc11224](https://github.com/mozilla/fxa/commit/adfc11224))
- payments-server: fix padding on hide/show button ([e5fc9c842](https://github.com/mozilla/fxa/commit/e5fc9c842))

## 1.166.2

### New features

- payments: localization updates ([47b03678e](https://github.com/mozilla/fxa/commit/47b03678e))

### Other changes

- payments-server: fix padding on hide/show button ([147dd6c7e](https://github.com/mozilla/fxa/commit/147dd6c7e))
- payments-server: clear checkbox when stay subscribed clicked ([e6e91f13b](https://github.com/mozilla/fxa/commit/e6e91f13b))

## 1.166.1

No changes.

## 1.166.0

### New features

- payment-server: mobile payments flow for fpn ([33e59c64d](https://github.com/mozilla/fxa/commit/33e59c64d))
- metrics: add metrics to amplitude events ([75fa856a8](https://github.com/mozilla/fxa/commit/75fa856a8))
- metrics: log raw Amplitude events in payments server ([e34b82bb6](https://github.com/mozilla/fxa/commit/e34b82bb6))

### Bug fixes

- payments: update line-height styles on payment inputs to address a buggy offset ([9b8b69600](https://github.com/mozilla/fxa/commit/9b8b69600))
- metrics: update language property on Amplitude schema ([4f2c4493b](https://github.com/mozilla/fxa/commit/4f2c4493b))
- Docker: fix path to a JSON schema in fxa-shared for Payments ([374d95a76](https://github.com/mozilla/fxa/commit/374d95a76))

### Other changes

- payments-server: fix inconsistent input style in payment form ([d82c48972](https://github.com/mozilla/fxa/commit/d82c48972))
- payments-server: diplay amex logo in confirmation billing details ([b8ab039ba](https://github.com/mozilla/fxa/commit/b8ab039ba))
- subscriptions: remove references to plan.name and plan.nickname ([4ffe01b37](https://github.com/mozilla/fxa/commit/4ffe01b37))

## 1.165.1

### Bug fixes

- Docker: fix path to a JSON schema in fxa-shared for Payments ([ebfc116ab](https://github.com/mozilla/fxa/commit/ebfc116ab))

## 1.165.0

### New features

- metrics: validate Amplitude events with a JSON schema ([63dadbc2c](https://github.com/mozilla/fxa/commit/63dadbc2c))
- payment-server: update plan billing text on tiers page ([dbbe8a26e](https://github.com/mozilla/fxa/commit/dbbe8a26e))
- payment-server: update settings page billing description ([bab6e5a49](https://github.com/mozilla/fxa/commit/bab6e5a49))
- payment-server: update legal checkbox text on tiers page ([786c3f8b5](https://github.com/mozilla/fxa/commit/786c3f8b5))
- payment-server: update legal checkbox text on payments page ([98f066b21](https://github.com/mozilla/fxa/commit/98f066b21))
- payments: update messaging used for payments page main pricing header ([1b71b8a71](https://github.com/mozilla/fxa/commit/1b71b8a71))

### Bug fixes

- payments: add missing white checkmark images ([b5609715c](https://github.com/mozilla/fxa/commit/b5609715c))

### Refactorings

- payments: extract fluent l10n testing logic ([0b0c9e445](https://github.com/mozilla/fxa/commit/0b0c9e445))

### Other changes

- payments: clean up .ftl file ([1cee777a5](https://github.com/mozilla/fxa/commit/1cee777a5))
- payments: move currency symbol to formatCurrencyInCents function ([a67c89104](https://github.com/mozilla/fxa/commit/a67c89104))

## 1.164.1

No changes.

## 1.164.0

### Bug fixes

- metrics: fix undefined nav timing perf entry bug on Safari for Payments ([98e099399](https://github.com/mozilla/fxa/commit/98e099399))
- payment-server: configure DSN later ([a90ee9efe](https://github.com/mozilla/fxa/commit/a90ee9efe))

### Refactorings

- stripe: remove usage of lineHeight property when styling Stripe input fields ([7e929c980](https://github.com/mozilla/fxa/commit/7e929c980))

### Other changes

- metrics: reduce nav timing metric tags in Payments ([81a47c7db](https://github.com/mozilla/fxa/commit/81a47c7db))

## 1.163.2

### Bug fixes

- metrics: fix undefined nav timing perf entry bug on Safari for Payments ([a68e129d1](https://github.com/mozilla/fxa/commit/a68e129d1))

## 1.163.1

No changes.

## 1.163.0

### New features

- secrets: pass in secrets.json file as env CONFIG_FILES where you can supply your own stripe keys ([dce8268b3](https://github.com/mozilla/fxa/commit/dce8268b3))
- subscriptions: implement idempotency when creating a subscriptions ([b1c387e12](https://github.com/mozilla/fxa/commit/b1c387e12))

### Bug fixes

- metrics: add uid to Payments Amplitude events ([02fdad7f5](https://github.com/mozilla/fxa/commit/02fdad7f5))

### Other changes

- deps: Updates to address nsp advisory 1179 ([a5649db18](https://github.com/mozilla/fxa/commit/a5649db18))

## 1.162.3

No changes.

## 1.162.2

No changes.

## 1.162.1

No changes.

## 1.162.0

### New features

- add pm2 debug servers and add'l debug scripts ([5d3747e38](https://github.com/mozilla/fxa/commit/5d3747e38))

### Bug fixes

- metrics: send nav timing as text/plain ([f82c3bcf6](https://github.com/mozilla/fxa/commit/f82c3bcf6))
- payments: use a nonce to guard against repeat payment submissions ([226380c4f](https://github.com/mozilla/fxa/commit/226380c4f))
- monorepo: update default node version across packages ([0f2d54071](https://github.com/mozilla/fxa/commit/0f2d54071))

### Refactorings

- ci: major refactor of CircleCI workflow ([7e77b0a29](https://github.com/mozilla/fxa/commit/7e77b0a29))

### Other changes

- cleanup: remove obsolete docker files ([863e56163](https://github.com/mozilla/fxa/commit/863e56163))
- deps: Updates to address nsp advisory 1488 ([e47bc55ba](https://github.com/mozilla/fxa/commit/e47bc55ba))

## 1.161.2

No changes.

## 1.161.1

No changes.

## 1.161.0

### Bug fixes

- metrics: handle race condition in Payments nav timing metrics ([09e06be3e](https://github.com/mozilla/fxa/commit/09e06be3e))

### Other changes

- content/payments: update subscription label to include payment ([bfd66ba3e](https://github.com/mozilla/fxa/commit/bfd66ba3e))

## 1.160.1

No changes.

## 1.160.0

### New features

- metrics: collect navigation timing on Payments with StatsD ([28db0cfef](https://github.com/mozilla/fxa/commit/28db0cfef))

## 1.159.0

No changes.

## 1.158.1

No changes.

## 1.158.0

### Bug fixes

- deps: Ignore hoek nsp warning https://npmjs.com/advisories/1468 ([6c0edfa9c](https://github.com/mozilla/fxa/commit/6c0edfa9c))
- payments: ensure correct 'try again' message used for card_declined error ([26224fe8a](https://github.com/mozilla/fxa/commit/26224fe8a))

## 1.157.0

### Bug fixes

- payments: Add dollar signs to prices on product subscription page ([030909311](https://github.com/mozilla/fxa/commit/030909311))
- payments: ensure correct product name used in reactivation confirm dialog ([8058b26d2](https://github.com/mozilla/fxa/commit/8058b26d2))
- viewport: Update viewport metatag to include minimum-scale, and make value consistent across all instances ([fb3afee23](https://github.com/mozilla/fxa/commit/fb3afee23))

### Other changes

- payments: add mention of local storybook to payments README ([5df839766](https://github.com/mozilla/fxa/commit/5df839766))

## 1.156.0

### Bug fixes

- payments: filter non-numeric characters out of zip code field (cf04681ca)
- payments: ensure correct month used in credit card expiration (1bdec7965)

## 1.155.0

### New features

- auth-server: direct stripe API usage (21bccd703)

### Bug fixes

- npm: added https://npmjs.com/advisories/961 to content-server ignores (feadeb3ce)
- styles: make survey iframe responsive (f4ff0cbab)
- payments: ensure a request is not already in progress on submission (c018bc3e2)

### Refactorings

- git: merge all package gitignores into single root-level gitignore (a238c3d27)

### Other changes

- payments-server: create subscription index l10n (ec5576884)
- payments-server: add l10n to subscription route index (64ebd83be)
- payments-server: aria label l10n (4351d7f7f)
- payments-server: account activated banner l10n (32d1a7735)
- payments-server: add l10n to subscriptionItem (43ced7791)
- payments-server: add l10n to PaymentUpdateForm (430087c04)
- payments-server: move AppLocalizationProvider into own file (e1288eda6)
- payments-server: Reactivate l10n (4532841f1)
- payments-server: SubscriptionUpgrade l10n (201f16a12)
- payments-server: l10n and componetize for fields.tsx (3f6b31f51)
- payments-server: SubscriptionRedirect l10n (8ae16b3fa)
- payments-server: fix Storybook build for missing App.scss (3c6b13cae)

## 1.154.0

### Other changes

- payments-server: add l10n to payments form component (ec246ef25)
- payments-server: add l10n for payment legal blurb (b8e08ca94)
- payments-server: l10n for product route index (7d643c1fd)
- payments-server: l10n for plan details (78cc5f0b9)
- payments-server: remove unused App.scss file (85f1d2529)
- payments-server: move error message component into directory (a4ad59585)
- payments-server: move tooltip to directory (22c1f565a)
- payments-server: move portal to directory (0816a6bce)
- payments-server: move loading spinner to directory (41b683e01)
- payments-server: move loading overlay to directory (ba8edc230)
- payments-server: move dialog message component into directory (c8e28590c)
- payments-server: move AlertBar component files into directoy (24976b465)
- payments-server: add l10n to AppLayout component (86a92bccd)
- payments-server: add fluent to payments server (98b19c4a8)

## 1.153.0

### New features

- payments: re-introduce the post-subscription survey (d40ccf59c)
- fxa-payments-server: add survey to subscription redirect fixes #3456 (8ac10b191)
- metrics: add Amplitude events for subscription upgrades (d5acb5a65)
- payments: add accounts-static CDN as imgSrc to CSP header (f4b519c95)

### Bug fixes

- payments: hide dialog close button for "plan not found" error (b30878566)
- payments: add survey embed URL to CSP and use https (90f0d0fde)
- payments: subscription survey tweaks and functional test fixes (a551319e3)
- payments-server: update meta tags in index.html for each request (8cf386631)

### Refactorings

- payments: move amplitude pings into plain module (03fea43e4)

### Other changes

- c8a81bfa5 Revert "Implement subscribe survey" (c8a81bfa5)
- deps: Update nsp for 1426 (60ec68a50)
- metrics: remove flow perf metrics from Payments (42c2492ed)
- payments-server: update sentry for sourcemaps on payments server (b49c1b451)

## 1.152.1

No changes.

## 1.152.0

### New features

- payments: tests to assert that we use fallback product icon when missing metadata (6311bac7c)
- payments: add server config support for additional imgSrc hosts in CSP (3e76dcad2)
- payments: use Stripe metadata for product details in UI (03437de40)
- payments: use Stripe metadata as source for product name, icon, download URL (eb3a58224)

### Bug fixes

- payments: use the correct type for updatePaymentAndRefresh (bda8e1b1b)
- metrics: use flush time as Payments Amplitude event time (4dc588b71)
- payments: hide message when cancellation date is unavailable (edb7e9224)

## 1.151.5

No changes.

## 1.151.4

### Bug fixes

- metrics: use flush time as Payments Amplitude event time (b35ca2de1)

## 1.151.3

No changes.

## 1.151.2

No changes.

## 1.151.1

No changes.

## 1.151.0

### New features

- audit: run npm audit on push instead of in ci (ccd3c2b07)
- payments: implement subscription upgrade view (def4acc03)
- payments: support display of upgradeCTA in Product / Plan metadata (52d1f7004)

### Bug fixes

- payments: only hide firefox logo when displaying profile avatar (2cdcc0ebe)
- error: keep zip field from erroring while user inputs (53321b3ad)
- style: fix #3404 - Payments 'Cancel' and 'Change' buttons too wide (0e023845c)
- payments: address security advisory with forced upgrade to handlebars dependency (2b7f3cda5)
- style: Update payments product avatar/logo style to prevent overlap (f81c59381)
- style: Update 'Resubscribe' button styles to have more flexibility with text (3ca66354f)

### Refactorings

- payments: further overhaul of Redux store for better TypeScript usage (8dde160e9)

### Other changes

- copy: fix #3438 - Update payments upgrade billing copy (74d7f4473)
- payments: bump handlebars up to 4.5.3 (03e9e999f)
- deps: Get audit-filter working for all packages in monorepo (1b0141e2b)
- monorepo: eslint consolidation (0a5e3950f)
- payments: upgrade dependencies, including typescript (9aed37836)
- payments-server: set payments-server to listen on 0.0.0.0 (d64e8514e)
- payments: fix some matchMedia type mismatches (5665f17fb)
- payments/copy: Update cancel subscription item copy to prevent confusion (7a9e85afe)
- payments: small cleanup ## 1.150.9 refactoring in PaymentForm component (7a349188d)

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

### Bug fixes

- style: Update payments product avatar/logo style to prevent overlap (023bf7aac)

## 1.150.1

No changes.

## 1.150.0

### New features

- payments: Create/animate 'ErrorMessage' component to display card-specific errors instead of a modal" (2140fc11e)
- debug: introduce start-dev-debug run scripts to ease node debugging (4d2e2b2af)
- payments: more explicit auto-focus for name field (5c18fc227)

### Bug fixes

- payments: include time fields in amplitude events (6b69b0270)
- ui: extend alert bar auto-dismiss delay and restore close icon (d9445ea5a)
- security: filter handlebars security advisory for now (a598cfd9b)
- payments: correctly append event time to amplitude events (9163183e8)
- style: use svg for close modal icon (442db7dcd)
- tests: mock version value for Amplitude test (1760956aa)
- payments: redirect to settings if customer has no subscriptions fixes #2372 - remove outdated comment - add redirect to settings - update tests - set initial customerSubscriptions state to null - remove 'no subscriptions' element - add null checks for customerSubscriptions (449f5ff26)
- payments: Append time property to amplitude events (6c3fe91c4)

### Refactorings

- build: some random dev build changes (3c3a888a8)
- oauth: move oauth-server into auth-server (phase 2) (b5f7df167)

### Other changes

- security: remove exception for NPM advisory 1184 (ff2c5e1d8)
- payments/copy: Update subscription failed error message to display generic error (80a2264d3)

## 1.149.4

### Bug fixes

- payments: correctly append event time to amplitude events (ec04e7e82)

## 1.149.3

No changes.

## 1.149.2

No changes.

## 1.149.1

### Bug fixes

- tests: mock version value for Amplitude test (3344f38d8)
- payments: Append time property to amplitude events (07b01d9ca)

## 1.149.0

### New features

- metrics: add flow perf metrics to payments server pages (b99457e70)
- payments: Add reactivate subscription confirmation modals (c9f938f99)
- payments: rework form validation to handle focus ## 1.148.8 blur independently (7c9565410)
- routes: Provide the same routing API as the content server (3347940a1)
- payments: complete post-metrics endpoint (4ef358149)
- metrics: add endpoint for emitting amplitude metrics (912e92857)
- metrics: add Amplitude metrics to payments pages (dbda81e28)

### Bug fixes

- strings: grammar issues in subscription strings (1a310801b)
- copy: 5554659fe fix(copy) Update payments resub confirm modal copy (5554659fe)
- links: open stripe priv notice in new window (854aab0f4)
- styles: clean up payment page UI a bit (b2a5177a4)
- styles: fix white flash by adding color to payment index (35893201e)
- payment-server: cancel dialog loading indication in button (c41f3986f)
- styles: fix invalid input shadow (078690e99)
- styles: remove alt text from loading spinner on payments (6962e29c6)
- payments-server: use refs to track metric state (a166b9e82)
- styles: match subscription styles to fxa settings (465977d52)
- payments: Get post-metrics route working and add tests (1189682e7)
- payments: fix lint for no-unused-vars (a0afd0fce)
- payments: restore WORKDIR to /app after metrics (c89988b7e)
- images: add viewBox to fpn svg (ea71cd174)
- payments: b0a2789a1 fix(payments) Basic payment submission error message update (b0a2789a1)

### Refactorings

- routes: Extract Express routing helpers into fxa-shared (e471b29c2)

### Other changes

- payments: fix #2812 - Add generic error message for 'card_error' types from Stripe (61c1bb878)
- text: use product name on payments server instead of plan (d77edd5c3)
- fxa-payment-server: fix ts error with StripeElementStyles obj (eddf2f4b7)
- tests: add tests for Amplitude event actions in Subscriptions (2de36426c)
- styles: make price and billing cycle bold on payments page (b97d268e3)
- images: inline fpn svg to reduce requests (44c86e7d2)
- strings: fix typo in subscription settings (84dc553a1)

## 1.148.8

### Bug fixes

- deps: Update deps and add exception for advisory 1184 (f4d7e9855)

## 1.148.7

No changes.

## 1.148.6

No changes.

## 1.148.5

### Bug fixes

- payments: restore WORKDIR to /app after metrics (19cf97e1b)
- payments: fix lint for no-unused-vars (557e6d6b8)

## 1.148.4

### New features

- routes: Provide the same routing API as the content server (a6a46802e)
- payments: complete post-metrics endpoint (f7998ad02)
- metrics: add endpoint for emitting amplitude metrics (74355e2f5)
- metrics: add Amplitude metrics to payments pages (01c890933)

### Bug fixes

- payments: Get post-metrics route working and add tests (aa244aaaf)
- payments-server: use refs to track metric state (d33972166)
- styles: match subscription styles to fxa settings (89b8ee401)

### Other changes

- images: inline fpn svg to reduce requests (088e6db64)

## 1.148.3

No changes.

## 1.148.2

### Bug fixes

- images: add viewBox to fpn svg (ba0fe6c95)

### Other changes

- release: Merge branch 'train-147' into train-148-merge-147 (66e170d45)

## 1.148.1

### Other changes

- strings: fix typo in subscription settings (e079be703)

## 1.148.0

### Bug fixes

- payments: add config to disable HSTS to avoid multiple headers in production (40ebee8a4)
- payments: only show zip input error onBlur (7b5907d34)

### Refactorings

- payments: Better organize Redux modules and API calls, remove cruft, fix console warnings (1e035bc72)

### Other changes

- style: add icon to subscription success page (af0e41e17)
- styles: mitigate loading jank on payments server (48ca59611)
- styles: fix very small style nit on payments header (79259aca0)
- styles: tidy up payment server styles (cabdec38c)

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

- support form: use a modal for successful submission message (037617a2e)

### Bug fixes

- build: npm audit fix (4839fcc5e)
- content/payment: update helmet (a6adbc815)
- payments: fix storybook rendering since adding matchMedia to app context (f5446b404)
- payments-server: trap exceptions in App component to display an error dialog rather than just failing to render (a0949bce6)

### Other changes

- legal: update payments server footer links (69e13ae50)

## 1.146.4

No changes.

## 1.146.3

### Bug fixes

- deps: Update handle deps to fix advisories (081895ad8)
- content/payment: update helmet (24fe65c44)

## 1.146.2

### Bug fixes

- content/payment: update helmet (052caaa0e)

## 1.146.1

No changes.

## 1.146.0

### Bug fixes

- payments: Dockerfile-test can just use the base Dockerfile to test (2feb51102)
- payments: respond to /**version** (6e2bc606b)
- payments: update payment views for mobile (4ed4d39e3)
- layout: fix ToS and Privacy Notice links on payments server (19127d30d)

### Other changes

- deps: fxa-payments-server npm audit changes (71575a8a2)

## 1.145.5

### Bug fixes

- content/payment: update helmet (24fe65c44)

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

- fortress: add "fortress" relying party (2ffe1334d)

### Bug fixes

- style: make billing info heading bold (73f127fd9)
- payments: better validation for Stripe elements (fffd3e9db)

### Refactorings

- db: rename productName to productId (5d709f96d)

### Other changes

- payments: upgrade eslint and react-scripts (955ecc02e)
- payments: 100% test coverage for subscription management route (a5cef8cf6)

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

- payments: Allow 'npm test' to test files under 'server/' directory (a0fcc420c)

### Bug fixes

- payments server: stop embedding inline js in prod build (492773b59)
- css: fix #2125 - Remove horizontal scrollbars (810b540a9)
- payments: Fix payments compilation (57d1b660a)
- payments: ensure storybook gets a properly mocked-out app config (2fb2f24f6)
- payments: quick fix for BrowserslistError: Unknown browser query `android all` (5cc7134df)
- payments: use redux-devtools-extension package in redux store (5560b79ba)

### Other changes

- payments: 100% test coverage on product payment route (8b18001e4)
- fxa-payments-server: fixes #1923 - add CSP to the payments server (7988167c3)
- docs: add changelogs for subscription packages (5876ced17)
- hooks: turn on prettier hook for typescript (7e69761f0)
- payments: upgrade or remove many dependencies (574780f7d)
- payments: general fixes and better separation for testing configs (34754c46f)
- payments: improve test coverage of Redux store utils (e83453bdb)
- payments: improve component test coverage (ad39e9e85)
- deps: update dependency @testing-library/react to v9 (8876bac70)
- payments: improve DialogMessage test coverage (f2092253f)
- payments: tweak jest projects to fix coverage reports (c9a8d396a)
- payments: get PaymentForm up to 100% test coverage (46612c42d)
- payments: improve test coverage of PlanDetails component (2dd6ceda2)
- payments: improve test coverage for AppContext and validator (920f99650)
- payments: add tests for hooks and screen-info (881eb7d12)
- payments: add more component tests (de357d13a)
- payments: increase test coverage to 40-50% (49197da36)
- payments: enable test coverage reports (bd510d7cc)
- payments: reformat payments-server with prettier (9ba026998)
- payments: Add prettier config files to payments-server (64b831565)

## 1.143.4

Prehistoric.
