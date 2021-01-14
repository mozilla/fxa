## 1.198.1

### Other changes

- 4e70b3f04 merge main->train-198 ([4e70b3f04](https://github.com/mozilla/fxa/commit/4e70b3f04))

## 1.198.0

### Bug fixes

- settings: fix email communications link ([6c09d7ecf](https://github.com/mozilla/fxa/commit/6c09d7ecf))

### Refactorings

- settings: limit queried data for reloads ([3ae316198](https://github.com/mozilla/fxa/commit/3ae316198))

### Other changes

- deps-dev: bump @testing-library/user-event from 12.1.7 to 12.6.0 ([19422c122](https://github.com/mozilla/fxa/commit/19422c122))
- deps: update eslint to v7 ([7cf502be2](https://github.com/mozilla/fxa/commit/7cf502be2))
- deps: bump graphql from 14.6.0 to 15.4.0 ([d28e79655](https://github.com/mozilla/fxa/commit/d28e79655))

## 1.197.3

No changes.

## 1.197.2

No changes.

## 1.197.1

### New features

- head: Add react-helmet to change page title ([4af241087](https://github.com/mozilla/fxa/commit/4af241087))

### Other changes

- settings: s/Newsletters/Email Communications/ ([5d7752cb7](https://github.com/mozilla/fxa/commit/5d7752cb7))

## 1.197.0

### New features

- metrics: add nav timing metrics for new settings ([b1f2650a4](https://github.com/mozilla/fxa/commit/b1f2650a4))

### Bug fixes

- settings: account for header height on anchor jump ([db6e88f3b](https://github.com/mozilla/fxa/commit/db6e88f3b))

### Other changes

- deps-dev: bump @storybook/preset-create-react-app ([3560cca17](https://github.com/mozilla/fxa/commit/3560cca17))
- deps-dev: bump @rescripts/cli from 0.0.14 to 0.0.15 ([49312d918](https://github.com/mozilla/fxa/commit/49312d918))

## 1.196.0

### Bug fixes

- settings: Moved client email validation to fxa-shared ([db96a7c50](https://github.com/mozilla/fxa/commit/db96a7c50))
- fxa-settings: dynamic loading svg fix ([cb0508069](https://github.com/mozilla/fxa/commit/cb0508069))
- settings: use Sentry dsn after config's loaded ([76ac89fa7](https://github.com/mozilla/fxa/commit/76ac89fa7))
- settings: scroll to element id in url hash ([24f4d45f2](https://github.com/mozilla/fxa/commit/24f4d45f2))

### Other changes

- Settings_v2: add tests to enable and disable 2fa ([8df19593f](https://github.com/mozilla/fxa/commit/8df19593f))
- dep: update tailwindcss to version 2 ([ec97cb07c](https://github.com/mozilla/fxa/commit/ec97cb07c))
- deps-dev: bump @types/babel\_\_core from 7.1.7 to 7.1.12 ([a834dab3a](https://github.com/mozilla/fxa/commit/a834dab3a))

## 1.195.4

### Bug fixes

- settings: use Sentry dsn after config's loaded ([70d88f818](https://github.com/mozilla/fxa/commit/70d88f818))
- settings: scroll to element id in url hash ([aa64a2d6c](https://github.com/mozilla/fxa/commit/aa64a2d6c))

## 1.195.3

No changes.

## 1.195.2

No changes.

## 1.195.1

No changes.

## 1.195.0

### New features

- graphql-api: convert to NestJS ([139029248](https://github.com/mozilla/fxa/commit/139029248))

### Other changes

- deps: bump @sentry/browser from 5.27.1 to 5.27.6 ([461dee802](https://github.com/mozilla/fxa/commit/461dee802))

## 1.194.0

### New features

- content-server: add new settings opt-out survey ([a9e401b1f](https://github.com/mozilla/fxa/commit/a9e401b1f))
- settings: nav backwards on 2fa form ([815164a2b](https://github.com/mozilla/fxa/commit/815164a2b))
- settings: added "Can't scan code?" option to 2fa setup ([b3814c9df](https://github.com/mozilla/fxa/commit/b3814c9df))
- settings: connected services disconnect flow ([0dba8fe52](https://github.com/mozilla/fxa/commit/0dba8fe52))
- settings: add password confirmation match to criteria list. fixes #6790 ([c763be88e](https://github.com/mozilla/fxa/commit/c763be88e))

### Bug fixes

- settings: limit display name input to 256 characters ([31d3084a9](https://github.com/mozilla/fxa/commit/31d3084a9))
- settings: restore the sign out button for OAuth RPs ([23cdd3fc5](https://github.com/mozilla/fxa/commit/23cdd3fc5))
- fxa-settings: add forgotten work in qr flow copy ([d7804ede3](https://github.com/mozilla/fxa/commit/d7804ede3))
- settings: add form validation to secondary email confirmation ([1bfac22e9](https://github.com/mozilla/fxa/commit/1bfac22e9))
- settings: updated bento logos ([9f1219d12](https://github.com/mozilla/fxa/commit/9f1219d12))

### Refactorings

- settings: allow callback override of FlowContainer's back button ([3ec955346](https://github.com/mozilla/fxa/commit/3ec955346))

### Other changes

- deps-dev: bump @testing-library/react-hooks from 3.4.1 to 3.4.2 ([c1709e0fd](https://github.com/mozilla/fxa/commit/c1709e0fd))
- fxa-settings: add subscriptions link test ([7450c5505](https://github.com/mozilla/fxa/commit/7450c5505))
- settings: add disconnect RP tests ([f89f3bc5c](https://github.com/mozilla/fxa/commit/f89f3bc5c))
- fxa-settings: error msg copy updates 2fa ([a21bb35b4](https://github.com/mozilla/fxa/commit/a21bb35b4))
- deps: bump react-hook-form from 6.10.1 to 6.11.0 ([daad44f40](https://github.com/mozilla/fxa/commit/daad44f40))
- deps: bump react-hook-form from 6.8.6 to 6.10.1 ([265b32a61](https://github.com/mozilla/fxa/commit/265b32a61))

## 1.193.1

No changes.

## 1.193.0

### New features

- settings: add metrics for two step auth ([666a27aa5](https://github.com/mozilla/fxa/commit/666a27aa5))
- settings: add replace 2fa recovery codes page ([7637a81f5](https://github.com/mozilla/fxa/commit/7637a81f5))
- settings: show 2fa enabled message ([4f3846314](https://github.com/mozilla/fxa/commit/4f3846314))
- settings: added metric events for secondary email to new settings ([702538c37](https://github.com/mozilla/fxa/commit/702538c37))
- settings: verify recovery code and enable two step auth ([c2c48483a](https://github.com/mozilla/fxa/commit/c2c48483a))
- settings: added view metrics to account-recovery ([d79337d61](https://github.com/mozilla/fxa/commit/d79337d61))
- settings: add step 2 of two step auth ([d98c51332](https://github.com/mozilla/fxa/commit/d98c51332))

### Bug fixes

- settings: show error when new password = old ([8def102bb](https://github.com/mozilla/fxa/commit/8def102bb))
- fxa-settings: fix 2fa unit row alignment ([b0ba04bbe](https://github.com/mozilla/fxa/commit/b0ba04bbe))
- fxa-settings: bento menu icons grayscale bug ([20433faf0](https://github.com/mozilla/fxa/commit/20433faf0))
- settings: updated google play logo ([4bd362437](https://github.com/mozilla/fxa/commit/4bd362437))
- settings: add some padding to solo buttons. fixes #6806 ([01bb2a390](https://github.com/mozilla/fxa/commit/01bb2a390))
- settings: add scroll margin to UnitRow. fixes #6805 ([77ab529ad](https://github.com/mozilla/fxa/commit/77ab529ad))
- settings: add form validation to ModalVerifiedSession ([c9357844e](https://github.com/mozilla/fxa/commit/c9357844e))
- settings: scroll to top on navigation ([675b47cb7](https://github.com/mozilla/fxa/commit/675b47cb7))
- settings: port old settings pwd validation rules ([fafdc85d0](https://github.com/mozilla/fxa/commit/fafdc85d0))
- settings: fixed lint warning ([a08afea97](https://github.com/mozilla/fxa/commit/a08afea97))
- settings: use local default avatar in new settings ([27dbb7fe3](https://github.com/mozilla/fxa/commit/27dbb7fe3))
- settings: fix disappearing avatar icon. fixes #6359 ([d0db6e927](https://github.com/mozilla/fxa/commit/d0db6e927))
- fxa-settings: format 2fa recovery codes for export ([de10d9454](https://github.com/mozilla/fxa/commit/de10d9454))
- settings: use non-interpolated classnames on tooltip. fixes #6777 ([0a05bfcb5](https://github.com/mozilla/fxa/commit/0a05bfcb5))
- settings: fix two step auth route ([05c157c51](https://github.com/mozilla/fxa/commit/05c157c51))
- settings: change flex on avatarMenu. fixes #6769 ([ead4c1471](https://github.com/mozilla/fxa/commit/ead4c1471))
- settings: set text alignment on nav. fixes #6768 ([f46c1b399](https://github.com/mozilla/fxa/commit/f46c1b399))
- settings: fixes #6656 ([838501e4a](https://github.com/mozilla/fxa/commit/838501e4a))

### Other changes

- fxa-settings: comment out beta links for release ([d40a53bc0](https://github.com/mozilla/fxa/commit/d40a53bc0))
- deps-dev: bump @storybook/addon-links from 5.3.19 to 6.0.28 ([e61e65f45](https://github.com/mozilla/fxa/commit/e61e65f45))
- fxa-settings: add beta and classic settings links ([e073084f9](https://github.com/mozilla/fxa/commit/e073084f9))
- settings: use CRLF for datatrio separator ([351a14c70](https://github.com/mozilla/fxa/commit/351a14c70))
- settings: fix comment whoops ([813ffddb6](https://github.com/mozilla/fxa/commit/813ffddb6))
- settings: remove avatar row button for now. closes #6792 ([6a3377b87](https://github.com/mozilla/fxa/commit/6a3377b87))
- deps: bump react-test-renderer from 16.13.1 to 17.0.1 ([779cb264d](https://github.com/mozilla/fxa/commit/779cb264d))
- deps: bump @sentry/browser from 5.17.0 to 5.27.1 ([fcc11be76](https://github.com/mozilla/fxa/commit/fcc11be76))
- deps: update node version to 14 ([6c2b253c1](https://github.com/mozilla/fxa/commit/6c2b253c1))
- settings: fix new settings build warnings ([a4ff5b1f1](https://github.com/mozilla/fxa/commit/a4ff5b1f1))
- docs: update storybooks index for settings ([a68df24fd](https://github.com/mozilla/fxa/commit/a68df24fd))

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
