# Change history

## 1.152.1

No changes.

## 1.152.0

### New features

* payments: tests to assert that we use fallback product icon when missing metadata (6311bac7c)
* payments: add server config support for additional imgSrc hosts in CSP (3e76dcad2)
* payments: use Stripe metadata for product details in UI (03437de40)
* payments: use Stripe metadata as source for product name, icon, download URL (eb3a58224)

### Bug fixes

* payments: use the correct type for updatePaymentAndRefresh (bda8e1b1b)
* metrics: use flush time as Payments Amplitude event time (4dc588b71)
* payments: hide message when cancellation date is unavailable (edb7e9224)

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
