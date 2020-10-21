## 1.192.0

### New features

- settings: show QR code for two step auth ([0560dd976](https://github.com/mozilla/fxa/commit/0560dd976))
- settings: display recovery key page ([04eaaa25e](https://github.com/mozilla/fxa/commit/04eaaa25e))
- settings: implemented add recovery key ([e23daeeb6](https://github.com/mozilla/fxa/commit/e23daeeb6))
- fxa-settings: add ConnectAnotherDevicePromo ([fe3915401](https://github.com/mozilla/fxa/commit/fe3915401))
- settings: add two step authentication page ([6802ed9f3](https://github.com/mozilla/fxa/commit/6802ed9f3))
- settings: update display name ([444a5f5f4](https://github.com/mozilla/fxa/commit/444a5f5f4))
- settings: added Recovery key add page ([3265a69df](https://github.com/mozilla/fxa/commit/3265a69df))
- settings: update save btn state on display name input ([1344f77d6](https://github.com/mozilla/fxa/commit/1344f77d6))
- fxa-settings: RTL support ([ddd312140](https://github.com/mozilla/fxa/commit/ddd312140))

### Bug fixes

- fxa-settings: add refresh button margin ([274a70a30](https://github.com/mozilla/fxa/commit/274a70a30))
- fxa-settings: mobile nav toggle visibility ([2bcb43bb1](https://github.com/mozilla/fxa/commit/2bcb43bb1))
- settings: fix mobile safari failing to render new settings ([1f48c3076](https://github.com/mozilla/fxa/commit/1f48c3076))

### Other changes

- e08478c95 Show modal on connected services 'sign out' click ([e08478c95](https://github.com/mozilla/fxa/commit/e08478c95))
- deps-dev: bump @types/react from 16.9.35 to 16.9.53 ([3c3f0b16d](https://github.com/mozilla/fxa/commit/3c3f0b16d))
- settings: set / add unique testids ([c457cff10](https://github.com/mozilla/fxa/commit/c457cff10))
- lint: fixed some new-settings lint warnings ([d26744c6f](https://github.com/mozilla/fxa/commit/d26744c6f))
- fxa-setttings: refactor Service component ([64f069a2d](https://github.com/mozilla/fxa/commit/64f069a2d))
- deps-dev: bump tailwindcss from 1.7.3 to 1.9.1 ([7db53da21](https://github.com/mozilla/fxa/commit/7db53da21))
- deps-dev: bump @testing-library/user-event from 7.2.1 to 12.1.7 ([a916aef03](https://github.com/mozilla/fxa/commit/a916aef03))
- deps: moved tailwindcss-dir dep from fxa-settings to fxa-react ([bdd683b25](https://github.com/mozilla/fxa/commit/bdd683b25))
- Settings_v2: add navigation tests for profile page ([39a471672](https://github.com/mozilla/fxa/commit/39a471672))
- test: Add functional test for settings v2 change password ([46e2b835d](https://github.com/mozilla/fxa/commit/46e2b835d))

## 1.191.1

### Bug fixes

- fxa-settings: ts errors in Service.tsx ([ba4bc5633](https://github.com/mozilla/fxa/commit/ba4bc5633))

## 1.191.0

### New features

- settings: added validation to change password ([880c42293](https://github.com/mozilla/fxa/commit/880c42293))
- settings: add display name page ([116fcdc00](https://github.com/mozilla/fxa/commit/116fcdc00))
- metrics: add more Amplitude events to new settings ([39951245a](https://github.com/mozilla/fxa/commit/39951245a))

### Bug fixes

- fxa-settings: address ts error in Account model ([069c68909](https://github.com/mozilla/fxa/commit/069c68909))
- fxa-settings: fix recovery key link ([fcbb58fc9](https://github.com/mozilla/fxa/commit/fcbb58fc9))
- admin-panel: Fix connection to admin server in dev, remove unneeded Apollo dependencies, update README ([54925c489](https://github.com/mozilla/fxa/commit/54925c489))

### Other changes

- fxa-settings: connected services; icons, tests, styles ([de97d4318](https://github.com/mozilla/fxa/commit/de97d4318))
- deps-dev: bump @testing-library/dom from 6.16.0 to 7.24.5 ([b61199ad2](https://github.com/mozilla/fxa/commit/b61199ad2))
- fxa-settings: fix secondary email msg placement ([7783b686b](https://github.com/mozilla/fxa/commit/7783b686b))
- 9e0d6baf0 Document the local URL for new-settings ([9e0d6baf0](https://github.com/mozilla/fxa/commit/9e0d6baf0))
- metrics: remove marketing metrics code from new settings ([7dbae1a38](https://github.com/mozilla/fxa/commit/7dbae1a38))

## 1.190.1

No changes.

## 1.190.0

### New features

- settings: emit settings view Amplitude event ([c34a98bd8](https://github.com/mozilla/fxa/commit/c34a98bd8))
- settings: added passwordChange call to new settings ([c48140768](https://github.com/mozilla/fxa/commit/c48140768))

### Bug fixes

- tests: update functional testing docs and settings tests ([32c117bed](https://github.com/mozilla/fxa/commit/32c117bed))
- fxa-settings: fix nav mobile styles takeover ([c91d73623](https://github.com/mozilla/fxa/commit/c91d73623))

### Other changes

- fxa-settings: add BentoMenu component ([ba9f35c44](https://github.com/mozilla/fxa/commit/ba9f35c44))
- fxa-settings: mobile navigation tweaks ([2c4f3781f](https://github.com/mozilla/fxa/commit/2c4f3781f))

## 1.189.1

No changes.

## 1.189.0

### New features

- settings: standardize error/success messages and reporting ([690a6b31f](https://github.com/mozilla/fxa/commit/690a6b31f))

### Bug fixes

- settings: improve GQL error handling to avoid redirect loop ([64f03a544](https://github.com/mozilla/fxa/commit/64f03a544))

### Other changes

- fxa-settings: filtering connected devices ([7af1524b2](https://github.com/mozilla/fxa/commit/7af1524b2))
- fxa-settings: Connected Services skeleton ([aca7f8aae](https://github.com/mozilla/fxa/commit/aca7f8aae))
- tests: Add settings v2 initial functional testing ([9c8dd7de0](https://github.com/mozilla/fxa/commit/9c8dd7de0))
- fxa-settings: Tooltip component ([c5a6fafab](https://github.com/mozilla/fxa/commit/c5a6fafab))
- deps: bump subscriptions-transport-ws from 0.9.16 to 0.9.18 ([e6d40626a](https://github.com/mozilla/fxa/commit/e6d40626a))

## 1.188.1

No changes.

## 1.188.0

### New features

- settings: add ability to refresh account data via buttons in 2fa, secondary email, and recovery key sections ([58de62559](https://github.com/mozilla/fxa/commit/58de62559))
- settings: move AlertBar up in the z-index stack ([2d5ce5e82](https://github.com/mozilla/fxa/commit/2d5ce5e82))

### Refactorings

- settings: refactor small icon buttons into a component ([9eb577a63](https://github.com/mozilla/fxa/commit/9eb577a63))

### Other changes

- fxa-settings: add change codes modal to 2fa ([03fe47d8d](https://github.com/mozilla/fxa/commit/03fe47d8d))

## 1.187.3

No changes.

## 1.187.2

No changes.

## 1.187.1

No changes.

## 1.187.0

### New features

- settings: add useAlertBar hook ([6e22bc02d](https://github.com/mozilla/fxa/commit/6e22bc02d))

### Bug fixes

- settings: fix vertical spacing in avatar dropdown ([5f2ad51fa](https://github.com/mozilla/fxa/commit/5f2ad51fa))

### Refactorings

- settings: various cosmetic changes to better reflect designs ([d5e444416](https://github.com/mozilla/fxa/commit/d5e444416))
- settings: Settings components tree mods, add pages section to Storybook, doc updates ([a4ec47fca](https://github.com/mozilla/fxa/commit/a4ec47fca))

### Other changes

- fxa-settings: rework Two-step auth unit row ([39c7a851c](https://github.com/mozilla/fxa/commit/39c7a851c))

## 1.186.2

No changes.

## 1.186.1

No changes.

## 1.186.0

### New features

- settings: Add avatar drop down component ([faa5f8c56](https://github.com/mozilla/fxa/commit/faa5f8c56))
- settings: secondary email delete and make primary functionality ([38ecd1c54](https://github.com/mozilla/fxa/commit/38ecd1c54))
- settings: add verify secondary email to new settings ([96bd9e09c](https://github.com/mozilla/fxa/commit/96bd9e09c))
- settings: introduce hook to handle errors in mutations ([d637bb489](https://github.com/mozilla/fxa/commit/d637bb489))

### Bug fixes

- release: fixes versioning and changelogs ([c81c76d15](https://github.com/mozilla/fxa/commit/c81c76d15))
- settings: fixed the wrong button triggering submit on ModalVerifySession ([045dfd300](https://github.com/mozilla/fxa/commit/045dfd300))

### Refactorings

- settings: make cta buttons more modular, uniform in size ([d9b889add](https://github.com/mozilla/fxa/commit/d9b889add))

### Other changes

- fxa-settings: fix storybook errors ([674ec97f9](https://github.com/mozilla/fxa/commit/674ec97f9))
- settings: add md syntax highlighting to docs ([c1d280084](https://github.com/mozilla/fxa/commit/c1d280084))
- deps: update yarn version and root level deps ([da2e99729](https://github.com/mozilla/fxa/commit/da2e99729))
- settings: header shadow on scroll" ([d653ee8d1](https://github.com/mozilla/fxa/commit/d653ee8d1))
- docs: Add table of contents and relevant ADRs to settings docs ([56c526471](https://github.com/mozilla/fxa/commit/56c526471))

## 1.185.1
