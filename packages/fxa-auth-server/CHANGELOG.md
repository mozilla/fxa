<a name="1.67.0"></a>
# [1.67.0](https://github.com/mozilla/fxa-auth-mailer/compare/v1.64.0...v1.67.0) (2016-08-11)


### Bug Fixes

* **deps:** update dev dependencies ([77ff484](https://github.com/mozilla/fxa-auth-mailer/commit/77ff484))
* **mailer:** fix undefined translation choice (#195) r=vbudhram ([b57c733](https://github.com/mozilla/fxa-auth-mailer/commit/b57c733)), closes [(#195](https://github.com/(/issues/195) [#192](https://github.com/mozilla/fxa-auth-mailer/issues/192)
* **mailer:** Slow down the verification reminder emails in dev. (#181) ([e9cc256](https://github.com/mozilla/fxa-auth-mailer/commit/e9cc256)), closes [mozilla/fxa-content-server#3929](https://github.com/mozilla/fxa-content-server/issues/3929)
* **style:** Change to supported apostrophe (#199) r=vladikoff ([eee72ae](https://github.com/mozilla/fxa-auth-mailer/commit/eee72ae))

### Features

* **location:** add location data to emails (#180) r=vladikoff,shane-tomlinson ([5c9f671](https://github.com/mozilla/fxa-auth-mailer/commit/5c9f671))
* **mailer:** Remove the account lockout feature. (#187) r=vladikoff ([f91a327](https://github.com/mozilla/fxa-auth-mailer/commit/f91a327)), closes [#186](https://github.com/mozilla/fxa-auth-mailer/issues/186)
* **metrics:** Add utm_* metrics (#190) ([de9bf89](https://github.com/mozilla/fxa-auth-mailer/commit/de9bf89))



<a name="1.64.0"></a>
# [1.64.0](https://github.com/mozilla/fxa-auth-mailer/compare/v1.63.0...v1.64.0) (2016-06-27)


### Bug Fixes

* **bind:** should by default bind to localhost ([60087f6](https://github.com/mozilla/fxa-auth-mailer/commit/60087f6))
* **eslint:** in this case, yes, we do just ignore the error ([e11093f](https://github.com/mozilla/fxa-auth-mailer/commit/e11093f))

### chore

* **build:** Add a script to generate version info ([4f12ad1](https://github.com/mozilla/fxa-auth-mailer/commit/4f12ad1))
* **build:** Refactor gruntfile into individual task files. ([2e7ad8d](https://github.com/mozilla/fxa-auth-mailer/commit/2e7ad8d))
* **eslint:** make eslint rules consistent ([94fe068](https://github.com/mozilla/fxa-auth-mailer/commit/94fe068)), closes [#175](https://github.com/mozilla/fxa-auth-mailer/issues/175)
* **mozlog:** update from mozlog@2.0.3 to 2.0.5 ([3cd552e](https://github.com/mozilla/fxa-auth-mailer/commit/3cd552e))

### Features

* **build:** Add version-tagging grunt tasks ([268900a](https://github.com/mozilla/fxa-auth-mailer/commit/268900a))
* **metrics:** include type of reminder in the email query ([0ab0ad2](https://github.com/mozilla/fxa-auth-mailer/commit/0ab0ad2))
* **reminders:** add verification reminders ([a235d88](https://github.com/mozilla/fxa-auth-mailer/commit/a235d88)), closes [#99](https://github.com/mozilla/fxa-auth-mailer/issues/99)



