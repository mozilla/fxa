<a name="1.81.0"></a>

# [1.81.0](https://github.com/mozilla/fxa-auth-mailer/compare/v1.80.0...v1.81.0) (2017-02-17)

### Bug Fixes

- **config:** change reminder poll for many servers (#257), r=@vbudhram ([a721920](https://github.com/mozilla/fxa-auth-mailer/commit/a721920))
- **git:** update husky to unbreak git hooks on ubuntu (#258) r=vladikoff ([83e9458](https://github.com/mozilla/fxa-auth-mailer/commit/83e9458))

### Features

- **mailer:** add support for sending SMS messages ([3bc1027](https://github.com/mozilla/fxa-auth-mailer/commit/3bc1027))

<a name="1.80.0"></a>

# [1.80.0](https://github.com/mozilla/fxa-auth-mailer/compare/v1.79.0...v1.80.0) (2017-02-07)

### Bug Fixes

- **dependencies:** update bluebird, nodemailer, convict, moment-timezone (#251) r=vladikoff ([02fbda3](https://github.com/mozilla/fxa-auth-mailer/commit/02fbda3))

<a name="1.79.0"></a>

# [1.79.0](https://github.com/mozilla/fxa-auth-mailer/compare/v1.78.0...v1.79.0) (2017-01-30)

<a name="1.78.0"></a>

# [1.78.0](https://github.com/mozilla/fxa-auth-mailer/compare/v1.77.0...v1.78.0) (2017-01-30)

### chore

- **docs:** update AUTHORS file (#252) ([1a96ee3](https://github.com/mozilla/fxa-auth-mailer/commit/1a96ee3))

### Features

- **mailer:** set up "SES Event Publishing" metrics ([56bd661](https://github.com/mozilla/fxa-auth-mailer/commit/56bd661))

### Refactor

- **mailer:** hoist headers, to be symmetric with other code ([a59e1bc](https://github.com/mozilla/fxa-auth-mailer/commit/a59e1bc))
- **templates:** Update to correct details styling (#248) ([42aafdf](https://github.com/mozilla/fxa-auth-mailer/commit/42aafdf))
- **templates:** Update to correct font-size and line height (#249) r=vladikoff,ryanfeeley ([d0cf249](https://github.com/mozilla/fxa-auth-mailer/commit/d0cf249)), closes [#246](https://github.com/mozilla/fxa-auth-mailer/issues/246)

<a name="1.77.0"></a>

# [1.77.0](https://github.com/mozilla/fxa-auth-mailer/compare/v1.76.0...v1.77.0) (2017-01-04)

### Bug Fixes

- **l10n:** update l10n SHA handling (#238) r=jrgm ([ebce13a](https://github.com/mozilla/fxa-auth-mailer/commit/ebce13a)), closes [#112](https://github.com/mozilla/fxa-auth-mailer/issues/112)
- **mailer:** prepare subject for string extraction ([d3c3968](https://github.com/mozilla/fxa-auth-mailer/commit/d3c3968))
- **metrics:** Add flowId and flowBeginTime to headers if avalible (#241), r=@seanmonstar ([4525f9c](https://github.com/mozilla/fxa-auth-mailer/commit/4525f9c))
- **strings:** add comma to ready, set, sync (#244) r=vbudhram ([f430684](https://github.com/mozilla/fxa-auth-mailer/commit/f430684))
- **template:** remove extra line break in templates ([1aa0464](https://github.com/mozilla/fxa-auth-mailer/commit/1aa0464))
- **templates:** remove suspicious_location template ([1d87721](https://github.com/mozilla/fxa-auth-mailer/commit/1d87721)), closes [#183](https://github.com/mozilla/fxa-auth-mailer/issues/183)

### Refactor

- **templates:** Add new sync template, add location data to password change, password reset ([98aaf76](https://github.com/mozilla/fxa-auth-mailer/commit/98aaf76))

<a name="1.76.0"></a>

# [1.76.0](https://github.com/mozilla/fxa-auth-mailer/compare/v1.75.1...v1.76.0) (2016-12-13)

### Bug Fixes

- **deps:** update prod dependencies ([d62080d](https://github.com/mozilla/fxa-auth-mailer/commit/d62080d))

<a name="1.75.1"></a>

## [1.75.1](https://github.com/mozilla/fxa-auth-mailer/compare/v1.75.0...v1.75.1) (2016-11-30)

### chore

- **deps:** pick up latest l10n, update shrinkwrap script ([85664b8](https://github.com/mozilla/fxa-auth-mailer/commit/85664b8))

<a name="1.75.0"></a>

# [1.75.0](https://github.com/mozilla/fxa-auth-mailer/compare/v1.72.0...v1.75.0) (2016-11-30)

### Bug Fixes

- **config:** add extra validation for supported locales ([0e12808](https://github.com/mozilla/fxa-auth-mailer/commit/0e12808))
- **config:** disable polling if pollTime === 0 (#236) ([9ea56a3](https://github.com/mozilla/fxa-auth-mailer/commit/9ea56a3))
- **tests:** increase testing coverage ([5d7cf07](https://github.com/mozilla/fxa-auth-mailer/commit/5d7cf07)), closes [#230](https://github.com/mozilla/fxa-auth-mailer/issues/230)

### chore

- **docs:** add coverage badge ([e831bce](https://github.com/mozilla/fxa-auth-mailer/commit/e831bce))
- **docs:** update node version in readme ([f805d09](https://github.com/mozilla/fxa-auth-mailer/commit/f805d09))

### Refactor

- **mailer:** Increase comprehensibility of device description (#227) r=vladikoff ([013f136](https://github.com/mozilla/fxa-auth-mailer/commit/013f136)), closes [#193](https://github.com/mozilla/fxa-auth-mailer/issues/193)

<a name="1.72.0"></a>

# [1.72.0](https://github.com/mozilla/fxa-auth-mailer/compare/v1.71.0...v1.72.0) (2016-10-19)

### Bug Fixes

- **mailer:** Sentence call all the email subject's ([9fc6626](https://github.com/mozilla/fxa-auth-mailer/commit/9fc6626)), closes [#214](https://github.com/mozilla/fxa-auth-mailer/issues/214)
- **mailer:** Use `monospace` for the unblock code for better legibility. ([aca2db4](https://github.com/mozilla/fxa-auth-mailer/commit/aca2db4))
- **travis:** test on node 4 and 6; always CXX=g++-4.8 ([44f76da](https://github.com/mozilla/fxa-auth-mailer/commit/44f76da))

### Features

- **mailer:** Add the signin unblock email ([4ca3de3](https://github.com/mozilla/fxa-auth-mailer/commit/4ca3de3))
- **mailer:** Remove the `Alternatively` link from all emails. ([55b6c3f](https://github.com/mozilla/fxa-auth-mailer/commit/55b6c3f)), closes [#228](https://github.com/mozilla/fxa-auth-mailer/issues/228)

### Refactor

- **mailer:** Use the location partial for the unblock_code template ([ee96417](https://github.com/mozilla/fxa-auth-mailer/commit/ee96417))

<a name="1.71.0"></a>

# [1.71.0](https://github.com/mozilla/fxa-auth-mailer/compare/v1.69.0...v1.71.0) (2016-10-05)

### Bug Fixes

- **coverage:** Add script to enabled code coverage for local tests (#218) ([d14d06b](https://github.com/mozilla/fxa-auth-mailer/commit/d14d06b))
- **mailer:** Fix the title size in the password reset related templates. ([54a0bd0](https://github.com/mozilla/fxa-auth-mailer/commit/54a0bd0)), closes [#217](https://github.com/mozilla/fxa-auth-mailer/issues/217)
- **mailer:** Swap the order of IP and Location. ([2b1dfdf](https://github.com/mozilla/fxa-auth-mailer/commit/2b1dfdf)), closes [#216](https://github.com/mozilla/fxa-auth-mailer/issues/216)

### chore

- **deps:** update shrinkwrap ([4b8b6b3](https://github.com/mozilla/fxa-auth-mailer/commit/4b8b6b3))

### Features

- **geo:** add state info into emails (#215) r=vbudhram ([5bb87c6](https://github.com/mozilla/fxa-auth-mailer/commit/5bb87c6))
- **headers:** Add email template name to headers sent (#213) r=vladikoff ([17ca63a](https://github.com/mozilla/fxa-auth-mailer/commit/17ca63a))
- **shared:** add new locales, pick up latest l10n ([bc5f104](https://github.com/mozilla/fxa-auth-mailer/commit/bc5f104))

<a name="1.70.0"></a>

# [1.70.0](https://github.com/mozilla/fxa-auth-mailer/compare/v1.69.0...v1.70.0) (2016-09-24)

### Features

- **headers:** Add email template name to headers sent (#213) r=vladikoff ([17ca63a](https://github.com/mozilla/fxa-auth-mailer/commit/17ca63a))

<a name="1.69.0"></a>

# [1.69.0](https://github.com/mozilla/fxa-auth-mailer/compare/v1.68.0...v1.69.0) (2016-09-09)

### Bug Fixes

- **deps:** update to poolee 1.0.1 (#205), r=@vbudhram ([96ed6e1](https://github.com/mozilla/fxa-auth-mailer/commit/96ed6e1)), closes [#202](https://github.com/mozilla/fxa-auth-mailer/issues/202)
- **links:** Remove non-functional "sign in" link. ([b455d74](https://github.com/mozilla/fxa-auth-mailer/commit/b455d74))
- **send:** improve error logging (#208) r=jrgm ([e8b23a2](https://github.com/mozilla/fxa-auth-mailer/commit/e8b23a2))

<a name="1.68.0"></a>

# [1.68.0](https://github.com/mozilla/fxa-auth-mailer/compare/v1.67.0...v1.68.0) (2016-08-24)

### Bug Fixes

- **l10n:** adjust default language (#200) r=vbudhram ([2c15420](https://github.com/mozilla/fxa-auth-mailer/commit/2c15420)), closes [#192](https://github.com/mozilla/fxa-auth-mailer/issues/192)

<a name="1.67.0"></a>

# [1.67.0](https://github.com/mozilla/fxa-auth-mailer/compare/v1.64.0...v1.67.0) (2016-08-11)

### Bug Fixes

- **deps:** update dev dependencies ([77ff484](https://github.com/mozilla/fxa-auth-mailer/commit/77ff484))
- **mailer:** fix undefined translation choice (#195) r=vbudhram ([b57c733](https://github.com/mozilla/fxa-auth-mailer/commit/b57c733)), closes [(#195](https://github.com/(/issues/195) [#192](https://github.com/mozilla/fxa-auth-mailer/issues/192)
- **mailer:** Slow down the verification reminder emails in dev. (#181) ([e9cc256](https://github.com/mozilla/fxa-auth-mailer/commit/e9cc256)), closes [mozilla/fxa-content-server#3929](https://github.com/mozilla/fxa-content-server/issues/3929)
- **style:** Change to supported apostrophe (#199) r=vladikoff ([eee72ae](https://github.com/mozilla/fxa-auth-mailer/commit/eee72ae))

### Features

- **location:** add location data to emails (#180) r=vladikoff,shane-tomlinson ([5c9f671](https://github.com/mozilla/fxa-auth-mailer/commit/5c9f671))
- **mailer:** Remove the account lockout feature. (#187) r=vladikoff ([f91a327](https://github.com/mozilla/fxa-auth-mailer/commit/f91a327)), closes [#186](https://github.com/mozilla/fxa-auth-mailer/issues/186)
- **metrics:** Add utm\_\* metrics (#190) ([de9bf89](https://github.com/mozilla/fxa-auth-mailer/commit/de9bf89))

<a name="1.64.0"></a>

# [1.64.0](https://github.com/mozilla/fxa-auth-mailer/compare/v1.63.0...v1.64.0) (2016-06-27)

### Bug Fixes

- **bind:** should by default bind to localhost ([60087f6](https://github.com/mozilla/fxa-auth-mailer/commit/60087f6))
- **eslint:** in this case, yes, we do just ignore the error ([e11093f](https://github.com/mozilla/fxa-auth-mailer/commit/e11093f))

### chore

- **build:** Add a script to generate version info ([4f12ad1](https://github.com/mozilla/fxa-auth-mailer/commit/4f12ad1))
- **build:** Refactor gruntfile into individual task files. ([2e7ad8d](https://github.com/mozilla/fxa-auth-mailer/commit/2e7ad8d))
- **eslint:** make eslint rules consistent ([94fe068](https://github.com/mozilla/fxa-auth-mailer/commit/94fe068)), closes [#175](https://github.com/mozilla/fxa-auth-mailer/issues/175)
- **mozlog:** update from mozlog@2.0.3 to 2.0.5 ([3cd552e](https://github.com/mozilla/fxa-auth-mailer/commit/3cd552e))

### Features

- **build:** Add version-tagging grunt tasks ([268900a](https://github.com/mozilla/fxa-auth-mailer/commit/268900a))
- **metrics:** include type of reminder in the email query ([0ab0ad2](https://github.com/mozilla/fxa-auth-mailer/commit/0ab0ad2))
- **reminders:** add verification reminders ([a235d88](https://github.com/mozilla/fxa-auth-mailer/commit/a235d88)), closes [#99](https://github.com/mozilla/fxa-auth-mailer/issues/99)
