## 1.204.4

No changes.

## 1.204.3

### Bug fixes

- settings: clear local storage on account delete ([0bad38913](https://github.com/mozilla/fxa/commit/0bad38913))

## 1.204.2

### Bug fixes

- settings: ensure the object returned from useSession is stable ([d995f713b](https://github.com/mozilla/fxa/commit/d995f713b))

## 1.204.1

### Bug fixes

- release: Add changelog notes and bump version for 204 ([5b8356e11](https://github.com/mozilla/fxa/commit/5b8356e11))

## 1.204.0

### Bug fixes

- test: fix oauth functional test ([b2d677969](https://github.com/mozilla/fxa/commit/b2d677969))
- fxa-settings: remove horizontal margin for resend verification code ([20744047d](https://github.com/mozilla/fxa/commit/20744047d))
- tests: Fix sync v3 and fennec functional setting tests ([1701fdf8f](https://github.com/mozilla/fxa/commit/1701fdf8f))
- fxa-settings: add 2FA icons state ([0d87eec73](https://github.com/mozilla/fxa/commit/0d87eec73))
- fxa-settings: add focus border to download button ([8fddf89ea](https://github.com/mozilla/fxa/commit/8fddf89ea))
- fxa-settings: add focus border to download button ([5cbd15360](https://github.com/mozilla/fxa/commit/5cbd15360))

### Refactorings

- 6c92469f2 refactor AlertBar ([6c92469f2](https://github.com/mozilla/fxa/commit/6c92469f2))
- settings: Begin moving api logic out of ui components ([31a190c6b](https://github.com/mozilla/fxa/commit/31a190c6b))
- fxa-settings: replace UnitRowWithAvatar with UnitRow ([a91388dea](https://github.com/mozilla/fxa/commit/a91388dea))

### Other changes

- deps: bump classnames from 2.2.6 to 2.3.1 ([3bee063b1](https://github.com/mozilla/fxa/commit/3bee063b1))
- 7e722086b reorganize app initialization ([7e722086b](https://github.com/mozilla/fxa/commit/7e722086b))
- phase 2 ([4f728343d](https://github.com/mozilla/fxa/commit/4f728343d))

## 1.203.5

No changes.

## 1.203.4

No changes.

## 1.203.3

### Bug fixes

- settings: call direct to auth-server for changes that send email ([df2ee530b](https://github.com/mozilla/fxa/commit/df2ee530b))

## 1.203.2

No changes.

## 1.203.1

No changes.

## 1.203.0

### New features

- settings: move new settings from beta/settings to /settings ([e1fcec815](https://github.com/mozilla/fxa/commit/e1fcec815))

### Bug fixes

- settings: useMetrics needs to useRef ([242061f23](https://github.com/mozilla/fxa/commit/242061f23))
- avatar: refactor getCroppedImg to use a small canvas ([1e73748e4](https://github.com/mozilla/fxa/commit/1e73748e4))
- settings: Fix avatar black image ([5e239466f](https://github.com/mozilla/fxa/commit/5e239466f))
- signout: Fix missing avatar when signing out ([1e07d81e7](https://github.com/mozilla/fxa/commit/1e07d81e7))
- l10n: Fix profile-heading l10n label ([561a814cd](https://github.com/mozilla/fxa/commit/561a814cd))
- settings: Remove time from password change ([7cedeb117](https://github.com/mozilla/fxa/commit/7cedeb117))
- tests: get functional smoke tests working with new settings as default ([d947048fe](https://github.com/mozilla/fxa/commit/d947048fe))
- avatar: Avatar upload tweaks for new settings ([54b88d5de](https://github.com/mozilla/fxa/commit/54b88d5de))
- settings: scroll position ([013ff5a8f](https://github.com/mozilla/fxa/commit/013ff5a8f))
- settings: buttons are correctly aligned to right ([ff9fc3cbc](https://github.com/mozilla/fxa/commit/ff9fc3cbc))

### Other changes

- deps-dev: bump @types/babel\_\_core from 7.1.12 to 7.1.14 ([23df842af](https://github.com/mozilla/fxa/commit/23df842af))
- deps-dev: bump @types/react-test-renderer from 16.9.5 to 17.0.1 ([b1d01d545](https://github.com/mozilla/fxa/commit/b1d01d545))
- deps: bump @emotion/react from 11.1.4 to 11.1.5 ([32bb00ca6](https://github.com/mozilla/fxa/commit/32bb00ca6))
- deps-dev: bump @types/classnames from 2.2.10 to 2.2.11 ([2e2ca4d1f](https://github.com/mozilla/fxa/commit/2e2ca4d1f))
- deps-dev: bump @rescripts/cli from 0.0.15 to 0.0.16 ([c54667d92](https://github.com/mozilla/fxa/commit/c54667d92))
- fxa-settings: remove unused file ([72560e06f](https://github.com/mozilla/fxa/commit/72560e06f))
- deps-dev: bump @storybook/react from 5.3.19 to 6.1.21 ([37522c5a6](https://github.com/mozilla/fxa/commit/37522c5a6))

## 1.202.3

### Bug fixes

- settings: hide flash of GAE on invalid token before redirect ([011bacbf6](https://github.com/mozilla/fxa/commit/011bacbf6))

## 1.202.2

No changes.

## 1.202.1

No changes.

## 1.202.0

### New features

- settings: default to beta/settings ([02cb62636](https://github.com/mozilla/fxa/commit/02cb62636))
- settings: hide email communications link if set to empty url ([5e17a4d09](https://github.com/mozilla/fxa/commit/5e17a4d09))

### Bug fixes

- l10n: Pass navigator.languages into the new settings page ([b13e88e3e](https://github.com/mozilla/fxa/commit/b13e88e3e))
- settings: rename goHome and goBack functions ([f62f1b099](https://github.com/mozilla/fxa/commit/f62f1b099))
- settings: added "Saving" button state to avatar upload ([50cf58bcc](https://github.com/mozilla/fxa/commit/50cf58bcc))
- settings: fixed slider style when csp blocks inline styles ([982c7b6c0](https://github.com/mozilla/fxa/commit/982c7b6c0))

### Other changes

- deps-dev: bump webpack-merge-and-include-globally ([f5b5386fc](https://github.com/mozilla/fxa/commit/f5b5386fc))
- deps-dev: bump @types/webpack from 4.41.16 to 4.41.26 ([2cb798d6c](https://github.com/mozilla/fxa/commit/2cb798d6c))
- deps: bump react-hook-form from 6.15.3 to 6.15.4 ([ce0e79a51](https://github.com/mozilla/fxa/commit/ce0e79a51))

## 1.201.1

### Bug fixes

- settings: added "Saving" button state to avatar upload ([bf6dff739](https://github.com/mozilla/fxa/commit/bf6dff739))
- settings: fixed slider style when csp blocks inline styles ([ae69c6e0a](https://github.com/mozilla/fxa/commit/ae69c6e0a))

## 1.201.0

### New features

- settings: finish implementing delete avatar ([77aa4fd8d](https://github.com/mozilla/fxa/commit/77aa4fd8d))

### Bug fixes

- settings: use URL hashes to navigate back/home ([c5b06a9c5](https://github.com/mozilla/fxa/commit/c5b06a9c5))
- l10n: Update a stray l10n ID ([88daf1a0b](https://github.com/mozilla/fxa/commit/88daf1a0b))
- setting: small margin misalignment ([e1a64d5b5](https://github.com/mozilla/fxa/commit/e1a64d5b5))
- l10n: Use singular "Firefox account" in context ([b48953c7b](https://github.com/mozilla/fxa/commit/b48953c7b))
- l10n: Consistently use periods at the ends of error sentences ([9a7e68754](https://github.com/mozilla/fxa/commit/9a7e68754))
- settings: fixed casing for new settings strings ([b180b7ffd](https://github.com/mozilla/fxa/commit/b180b7ffd))
- settings: show notification on task completion ([11eec6c3c](https://github.com/mozilla/fxa/commit/11eec6c3c))
- settings: Another round of settings l10n fixes ([eb0ebcb9d](https://github.com/mozilla/fxa/commit/eb0ebcb9d))
- settings: Shorten 'delete account' button string to fit ([3cf966a08](https://github.com/mozilla/fxa/commit/3cf966a08))
- settings: Add page view event for PageChangePassword metrics parity ([33f5b812e](https://github.com/mozilla/fxa/commit/33f5b812e))
- settings: set disconnect reason on form change instead of confirm since onConfirm does not pass arguments ([fb802c6e8](https://github.com/mozilla/fxa/commit/fb802c6e8))
- settings: ensure modal callbacks adhere to the defined type ([06a2de0fb](https://github.com/mozilla/fxa/commit/06a2de0fb))
- settings: Update l10n strings based on l10n PR feedback ([0c628196a](https://github.com/mozilla/fxa/commit/0c628196a))
- settings: mobile style fixes ([6edc13405](https://github.com/mozilla/fxa/commit/6edc13405))
- fxa-settings: add/change avatar button alignment ([ab7a6d5db](https://github.com/mozilla/fxa/commit/ab7a6d5db))
- settings: account for sessionToken.mustVerify in new settings ([042ab46d5](https://github.com/mozilla/fxa/commit/042ab46d5))

### Refactorings

- settings: refactor flow parameters to avoid /get_flow ([95c54416a](https://github.com/mozilla/fxa/commit/95c54416a))

### Other changes

- settings: add metrics to new avatar page ([98041b5b4](https://github.com/mozilla/fxa/commit/98041b5b4))
- settings: ignore settings.ftl ([a1414bfe6](https://github.com/mozilla/fxa/commit/a1414bfe6))
- settings: do not show "take a photo" option on mobile ([000924882](https://github.com/mozilla/fxa/commit/000924882))
- deps-dev: bump @testing-library/user-event from 12.6.0 to 12.7.1 ([7f04d1be9](https://github.com/mozilla/fxa/commit/7f04d1be9))
- settings: upload avatar directly to profile server ([fa32870cc](https://github.com/mozilla/fxa/commit/fa32870cc))
- fxa-settings: add avatar delete mutation ([510c2faef](https://github.com/mozilla/fxa/commit/510c2faef))
- deps: yarn dedupe ([50f8a74fd](https://github.com/mozilla/fxa/commit/50f8a74fd))
- fxa-settings: load styles for react-easy-crop ([c5de3e531](https://github.com/mozilla/fxa/commit/c5de3e531))
- deps-dev: bump @types/testing-library\_\_react-hooks ([a1fe53895](https://github.com/mozilla/fxa/commit/a1fe53895))

## 1.200.0

### New features

- fxa-settings: avatar uploads ([edaf607ead](https://github.com/mozilla/fxa/commit/edaf607ead))
- fxa-settings: upload and edit avatar ([6b05e2abcf](https://github.com/mozilla/fxa/commit/6b05e2abcf))
- settings: display success tooltip on datablock action ([225746107a](https://github.com/mozilla/fxa/commit/225746107a))
- fxa-settings: upload and edit avatar ([3940cb7fe1](https://github.com/mozilla/fxa/commit/3940cb7fe1))
- settings: support firefox-ios in new settings browser comms ([a6a63a251d](https://github.com/mozilla/fxa/commit/a6a63a251d))
- fxa-settings: add ## 1.199.0 capture avatar page ([7dc80f67d7](https://github.com/mozilla/fxa/commit/7dc80f67d7))
- settings: Implemented browser comms for new settings on desktop ([a2beaac231](https://github.com/mozilla/fxa/commit/a2beaac231))

### Bug fixes

- settings: Replace AvatarCropper placeholder jpg with svg to fix storybook ([5eec03f301](https://github.com/mozilla/fxa/commit/5eec03f301))
- settings: Fix storybook builds by removing l10n from PageChangePassword render test ([6e54331d0c](https://github.com/mozilla/fxa/commit/6e54331d0c))
- settings: only set hover css when supported ([818af9298f](https://github.com/mozilla/fxa/commit/818af9298f))
- settings: when gql-api switched to nestjs the auth error changed ([7817de9390](https://github.com/mozilla/fxa/commit/7817de9390))
- settings: fix size of avatar in dropdown ([a193aabbee](https://github.com/mozilla/fxa/commit/a193aabbee))
- settings: fix startup error on some legacy browsers ([e220d692ad](https://github.com/mozilla/fxa/commit/e220d692ad))
- settings: added hover style to help icon and fixed 1px alignment issue ([419286a6ff](https://github.com/mozilla/fxa/commit/419286a6ff))
- settings: reserve vertical space for QR code ([78e47cc9e9](https://github.com/mozilla/fxa/commit/78e47cc9e9))

### Other changes

- l10n: fix various new settings l10n issues ([6e60719edb](https://github.com/mozilla/fxa/commit/6e60719edb))
- deps-dev: bump @testing-library/react-hooks from 3.4.2 to 5.0.3 ([0b4b9f0157](https://github.com/mozilla/fxa/commit/0b4b9f0157))
- l10n: combine the download l10n scripts ([37887cf115](https://github.com/mozilla/fxa/commit/37887cf115))
- settings: replace lockwise with vpn in bento menu ([5fc1b6c818](https://github.com/mozilla/fxa/commit/5fc1b6c818))
- deps: bump graphql from 15.4.0 to 15.5.0 ([eae1a35dd0](https://github.com/mozilla/fxa/commit/eae1a35dd0))
- settings: localize the common password hint ([4e7af6bdd3](https://github.com/mozilla/fxa/commit/4e7af6bdd3))
- deps-dev: bump @types/jest from 24.9.1 to 26.0.20 ([78e246d9a3](https://github.com/mozilla/fxa/commit/78e246d9a3))
- settings: trim auth-error-\* l10n strings ([40bbe6adb6](https://github.com/mozilla/fxa/commit/40bbe6adb6))
- deps-dev: bump @storybook/addon-links from 6.0.28 to 6.1.15 ([03fa0a58db](https://github.com/mozilla/fxa/commit/03fa0a58db))
- deps: bump @apollo/client from 3.3.6 to 3.3.7 ([d34d6c68cb](https://github.com/mozilla/fxa/commit/d34d6c68cb))
- deps: bump react-cropper from 2.1.3 to 2.1.4 ([2a25963715](https://github.com/mozilla/fxa/commit/2a25963715))

## 1.199.0

### New features

- settings: Localize the Avatar page ([1ca29b242](https://github.com/mozilla/fxa/commit/1ca29b242))
- settings: extract reused strings into the App ftl file ([0e7f50dbd](https://github.com/mozilla/fxa/commit/0e7f50dbd))
- settings: Localize the Recovery Key page ([714caaa38](https://github.com/mozilla/fxa/commit/714caaa38))
- settings: localize footer ([cd88cca73](https://github.com/mozilla/fxa/commit/cd88cca73))
- settings: localize header ([842beb254](https://github.com/mozilla/fxa/commit/842beb254))
- fxa-settings: add ## 1.198.2 capture avatar page ([02e1b27a0](https://github.com/mozilla/fxa/commit/02e1b27a0))
- settings: Localize the Verify Secondary Email page ([f769d94bc](https://github.com/mozilla/fxa/commit/f769d94bc))
- settings: Localize the Add Secondary Email page ([344ce0169](https://github.com/mozilla/fxa/commit/344ce0169))
- l10n: setup localization for delete account page ([0ddb09e8b](https://github.com/mozilla/fxa/commit/0ddb09e8b))
- settings: localize page title ([480c70203](https://github.com/mozilla/fxa/commit/480c70203))
- settings: add avatar editing page component ([228169fd6](https://github.com/mozilla/fxa/commit/228169fd6))
- l10n: setup localization for auth errors ([a84b0a27a](https://github.com/mozilla/fxa/commit/a84b0a27a))
- fxa-settings: add delete account page ([16ee46a34](https://github.com/mozilla/fxa/commit/16ee46a34))
- settings: add avatar editing page component ([691173c37](https://github.com/mozilla/fxa/commit/691173c37))
- l10n: Add initial fluent l10n for settings v2 ([c95ee6f8a](https://github.com/mozilla/fxa/commit/c95ee6f8a))

### Other changes

- settings: localize main settings page ([72d39f99d](https://github.com/mozilla/fxa/commit/72d39f99d))
- deps-dev: bump @testing-library/jest-dom from 5.11.0 to 5.11.9 ([d0f1f6301](https://github.com/mozilla/fxa/commit/d0f1f6301))
- deps: bump react-hook-form from 6.11.0 to 6.14.2 ([43255fb24](https://github.com/mozilla/fxa/commit/43255fb24))
- settings: add l10n to two step auth ([f84c2747c](https://github.com/mozilla/fxa/commit/f84c2747c))
- eslint: count jsx var usage ([97fc3aaf3](https://github.com/mozilla/fxa/commit/97fc3aaf3))
- settings: use small .ftl files ([2cc276ea4](https://github.com/mozilla/fxa/commit/2cc276ea4))

## 1.198.2

No changes.

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
