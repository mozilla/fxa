# Change history

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
