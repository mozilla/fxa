<a name="1.55.0"></a>
# [1.55.0](https://github.com/mozilla/fxa-auth-server/compare/v1.53.0...v1.55.0) (2016-01-28)


### Bug Fixes

* **tokens:** extend token freshness threshold to 6 hours ([cffc099](https://github.com/mozilla/fxa-auth-server/commit/cffc099))

### Features

* **docker:** Add Dockerfile for self-hosting ([c96cec1](https://github.com/mozilla/fxa-auth-server/commit/c96cec1))
* **metrics:** Added additional user info on statsd messages ([fff4624](https://github.com/mozilla/fxa-auth-server/commit/fff4624))
* **push:** add account verification push updates ([b4d5822](https://github.com/mozilla/fxa-auth-server/commit/b4d5822)), closes [#1141](https://github.com/mozilla/fxa-auth-server/issues/1141)

### chore

* **deps:** update changelog template to 1.1.0 ([4f9af41](https://github.com/mozilla/fxa-auth-server/commit/4f9af41)), closes [#1152](https://github.com/mozilla/fxa-auth-server/issues/1152)
* **docs:** add activity events log ([6c6c307](https://github.com/mozilla/fxa-auth-server/commit/6c6c307)), closes [#312](https://github.com/mozilla/fxa-auth-server/issues/312)
* **e2e-email:** ko is now translated for some email strings ([4aaf43f](https://github.com/mozilla/fxa-auth-server/commit/4aaf43f))
* **shrinkwrap:** update shrinkwrap, notably for auth-mailer and content-server-l10n ([789cb8d](https://github.com/mozilla/fxa-auth-server/commit/789cb8d))

### docs

* **contributing:** Mention git commit guidelines ([d7bf16f](https://github.com/mozilla/fxa-auth-server/commit/d7bf16f))



<a name="1.53.0"></a>
# [1.53.0](https://github.com/mozilla/fxa-auth-server/compare/v1.51.1...v1.53.0) (2016-01-12)


### Bug Fixes

* **events:** emit an event for account reset so sync can update the generation ([7a8a0ad](https://github.com/mozilla/fxa-auth-server/commit/7a8a0ad)
* **e2e-email:** update localQuirks for new translations (cy) ([fb08283](https://github.com/mozilla/fxa-auth-server/commit/fb08283))
* **log:** add mozlog fmt properly ([35d8291](https://github.com/mozilla/fxa-auth-server/commit/35d8291)), closes [#1138](https://github.com/mozilla/fxa-auth-server/issues/1138)

### Features

* **activity:** log successful account resets ([f244af6](https://github.com/mozilla/fxa-auth-server/commit/f244af6)), closes [#1144](https://github.com/mozilla/fxa-auth-server/issues/1144)



<a name="1.51.1"></a>
## [1.51.1](https://github.com/mozilla/fxa-auth-server/compare/v1.51.0...v1.51.1) (2015-12-15)


### Bug Fixes

* **e2e-email:** update localQuirks for new translations ([f9f31d6](https://github.com/mozilla/fxa-auth-server/commit/f9f31d6))



<a name="1.51.0"></a>
# [1.51.0](https://github.com/mozilla/fxa-auth-server/compare/v1.50.1...v1.51.0) (2015-12-14)


### Bug Fixes

* **server:** add missing lastAccessTime field to devices response ([e28a4fa](https://github.com/mozilla/fxa-auth-server/commit/e28a4fa))
* **server:** require device name to be set explicitly ([417f494](https://github.com/mozilla/fxa-auth-server/commit/417f494))
* **travis:** install/use g++-4.8 for node 4.x build of scrypt-hash ([f129b7b](https://github.com/mozilla/fxa-auth-server/commit/f129b7b))



<a name="1.50.1"></a>
## [1.50.1](https://github.com/mozilla/fxa-auth-server/compare/v1.50.0...v1.50.1) (2015-11-23)


### Bug Fixes

* **auth-db-mysql:** update to latest fxa-auth-db-mysql @ 939f04e ([34f2ffb](https://github.com/mozilla/fxa-auth-server/commit/34f2ffb))
* **server:** permit null values in devices response ([3407f4e](https://github.com/mozilla/fxa-auth-server/commit/3407f4e))
* **server:** return isCurrentDevice from /account/devices ([c75a8a3](https://github.com/mozilla/fxa-auth-server/commit/c75a8a3))
* **tests:** ignore error on listen (when auth-db-mysql is already bound) ([0bab602](https://github.com/mozilla/fxa-auth-server/commit/0bab602))
* **tests:** repair travis-ci mysql testing to ensure auth-db-mysql is used ([6eb3639](https://github.com/mozilla/fxa-auth-server/commit/6eb3639))
* **tests:** unskip tests now that they are translated (GH-995) ([ebb60b6](https://github.com/mozilla/fxa-auth-server/commit/ebb60b6))
* **travis-ci:** check that auth-db-mysql reports "MySql" as constructor class name ([cd0e28e](https://github.com/mozilla/fxa-auth-server/commit/cd0e28e))

### Features

* **metrics:** send email-bounce-related metrics to statsd. ([203c054](https://github.com/mozilla/fxa-auth-server/commit/203c054))



<a name="1.50.0"></a>
# [1.50.0](https://github.com/mozilla/fxa-auth-server/compare/v1.49.0...v1.50.0) (2015-11-18)


### Bug Fixes

* **docs:** fix docs typo ([d238fa4](https://github.com/mozilla/fxa-auth-server/commit/d238fa4))
* **locale:** reenable pt-PT locale ([e6617f9](https://github.com/mozilla/fxa-auth-server/commit/e6617f9))
* **mail:** update email support url ([f051b21](https://github.com/mozilla/fxa-auth-server/commit/f051b21))
* **oauth:** look for the correct 'scope' param in oauth response, not 'scopes' ([7fc5030](https://github.com/mozilla/fxa-auth-server/commit/7fc5030))
* **server:** eliminate device validation discrepancies ([6722204](https://github.com/mozilla/fxa-auth-server/commit/6722204))
* **server:** refactor account promise chains to named functions ([05e50aa](https://github.com/mozilla/fxa-auth-server/commit/05e50aa))

### Features

* **oauth:** pass email=false when verifying oauth tokens ([f1306c9](https://github.com/mozilla/fxa-auth-server/commit/f1306c9)), closes [#1109](https://github.com/mozilla/fxa-auth-server/issues/1109)
* **server:** implement device registration api ([d7e976b](https://github.com/mozilla/fxa-auth-server/commit/d7e976b))



<a name="1.49.0"></a>
# [1.49.0](https://github.com/mozilla/fxa-auth-server/compare/v1.48.3...v1.49.0) (2015-11-04)


### Bug Fixes

* **e2e-email:** update for sr localization of subject ([40068d6](https://github.com/mozilla/fxa-auth-server/commit/40068d6))
* **tests:** Eliminate race condition in teardown of concurrent_tests ([bc85618](https://github.com/mozilla/fxa-auth-server/commit/bc85618))
* **tests:** wait for email delivery in concurrent_tests ([fe279ff](https://github.com/mozilla/fxa-auth-server/commit/fe279ff))

### Features

* **profile:** Add oauth-authenticated /account/profile endpoint. ([9ebec1a](https://github.com/mozilla/fxa-auth-server/commit/9ebec1a))



<a name="1.48.3"></a>
## [1.48.3](https://github.com/mozilla/fxa-auth-server/compare/v1.48.2...v1.48.3) (2015-10-29)


### Bug Fixes

* **e2e-email:** exit 1 on error ([5420049](https://github.com/mozilla/fxa-auth-server/commit/5420049))
* **startup:** if error on startup, log and exit ([2c4df03](https://github.com/mozilla/fxa-auth-server/commit/2c4df03))



<a name="1.48.2"></a>
## [1.48.2](https://github.com/mozilla/fxa-auth-server/compare/v1.48.1...v1.48.2) (2015-10-23)




<a name="1.48.1"></a>
## [1.48.1](https://github.com/mozilla/fxa-auth-server/compare/v1.48.0...v1.48.1) (2015-10-21)


### Bug Fixes

* **deps:** shrinkwrap excludes fxa-jwtool->pem-jwk dep if pem-jwk is a devDep ([ffe145e](https://github.com/mozilla/fxa-auth-server/commit/ffe145e))
* **deps:** shrinkwrap excludes fxa-jwtool->pem-jwk dep if pem-jwk is a devDep ([08f0dca](https://github.com/mozilla/fxa-auth-server/commit/08f0dca))



<a name="1.48.0"></a>
# [1.48.0](https://github.com/mozilla/fxa-auth-server/compare/v1.47.1...v1.48.0) (2015-10-21)


### Bug Fixes

* **email:** stop sending new sync device emails ([b7dcef4](https://github.com/mozilla/fxa-auth-server/commit/b7dcef4))

### Features

* **server:** optionally enforce a strict CORS origin ([664d73e](https://github.com/mozilla/fxa-auth-server/commit/664d73e))



<a name="1.47.1"></a>
## [1.47.1](https://github.com/mozilla/fxa-auth-server/compare/v1.47.0...v1.47.1) (2015-10-13)




<a name="1.47.0"></a>
# [1.47.0](https://github.com/mozilla/fxa-auth-server/compare/v1.46.0...v1.47.0) (2015-10-08)


### Features

* **i18n:** Enable Romainian `ro` support. ([c0f419b](https://github.com/mozilla/fxa-auth-server/commit/c0f419b)), closes [mozilla/fxa-content-server#3125](https://github.com/mozilla/fxa-content-server/issues/3125)
* **metrics:** send account verification time to statsd ([65870d3](https://github.com/mozilla/fxa-auth-server/commit/65870d3))



<a name="1.46.0"></a>
# [1.46.0](https://github.com/mozilla/fxa-auth-server/compare/v1.45.1...v1.46.0) (2015-09-23)


### Bug Fixes

* **logging:** use service query parameter in activityEvent ([243879a](https://github.com/mozilla/fxa-auth-server/commit/243879a))
* **tests:** changes for "Firefox Account Verified" in train-46 ([e630ed6](https://github.com/mozilla/fxa-auth-server/commit/e630ed6))
* **tests:** run mysql tests on travis ([f90a8c1](https://github.com/mozilla/fxa-auth-server/commit/f90a8c1)), closes [#1032](https://github.com/mozilla/fxa-auth-server/issues/1032)

### Features

* **basket:** send sync login events to basket ([28842c7](https://github.com/mozilla/fxa-auth-server/commit/28842c7))
* **db:** add function to return user's sessions array ([bfaddc5](https://github.com/mozilla/fxa-auth-server/commit/bfaddc5))
* **logging:** add createdAt to account.signed activity event ([ab4d815](https://github.com/mozilla/fxa-auth-server/commit/ab4d815))



<a name="1.45.0"></a>
# [1.45.0](https://github.com/mozilla/fxa-auth-server/compare/v1.44.1...v1.45.0) (2015-09-14)


### Bug Fixes

* **db:** decrease session token update frequency ([6924fba](https://github.com/mozilla/fxa-auth-server/commit/6924fba))
* **db:** properly encapsulate session token update logic ([92c94c1](https://github.com/mozilla/fxa-auth-server/commit/92c94c1))
* **loadtest:** adjust url for /.well-known/browserid ([85ddb43](https://github.com/mozilla/fxa-auth-server/commit/85ddb43))
* **metrics:** properly report account.uid for account.created ([da29324](https://github.com/mozilla/fxa-auth-server/commit/da29324))
* **tests:** changes to allow setting accept-language for some requests ([bdc9c36](https://github.com/mozilla/fxa-auth-server/commit/bdc9c36))
* **tests:** improved script to checking email of all supported locales ([67ffcd1](https://github.com/mozilla/fxa-auth-server/commit/67ffcd1))
* **tests:** update loadtest build script to work with latest PyFxA. ([08f4d2d](https://github.com/mozilla/fxa-auth-server/commit/08f4d2d))
* **version:** use explicit path with git-config ([986b5b8](https://github.com/mozilla/fxa-auth-server/commit/986b5b8))



<a name="1.44.0"></a>
# [1.44.0](https://github.com/mozilla/fxa-auth-server/compare/v1.42.0...v1.44.0) (2015-08-28)


### Bug Fixes

* **config:** update convict .root() to .getProperties() calls ([4b6cab9](https://github.com/mozilla/fxa-auth-server/commit/4b6cab9))
* **notifier:** calling undefined log.level method throws ([e413713](https://github.com/mozilla/fxa-auth-server/commit/e413713))
* **server:** check errno on database errors ([28627ee](https://github.com/mozilla/fxa-auth-server/commit/28627ee))
* **server:** improve identification of mobile user agents ([cf947d2](https://github.com/mozilla/fxa-auth-server/commit/cf947d2))
* **tests:** make smtp.redirectDomain configurable in remote tests ([6adc10f](https://github.com/mozilla/fxa-auth-server/commit/6adc10f))
* **tests:** unset user-agent fields are null ([a2a7b10](https://github.com/mozilla/fxa-auth-server/commit/a2a7b10))

### Features

* **db:** store user agent and last-access time in sessionTokens ([f0d80ff](https://github.com/mozilla/fxa-auth-server/commit/f0d80ff))
* **l10n:** add en-GB as a supported locale. ([980236a](https://github.com/mozilla/fxa-auth-server/commit/980236a))
* **l10n:** add fa as a supported locale. ([c4b3bd2](https://github.com/mozilla/fxa-auth-server/commit/c4b3bd2))
* **metrics:** add DataDog to activity events, email verified activity events ([63842b0](https://github.com/mozilla/fxa-auth-server/commit/63842b0)), closes [#922](https://github.com/mozilla/fxa-auth-server/issues/922)



<a name="1.42.0"></a>
# [1.42.0](https://github.com/mozilla/fxa-auth-server/compare/v1.41.0...v1.42.0) (2015-07-24)


### Bug Fixes

* **api:** accept service as a query parameter ([3d49b51](https://github.com/mozilla/fxa-auth-server/commit/3d49b51)), closes [#961](https://github.com/mozilla/fxa-auth-server/issues/961)
* **errors:** convert missing parameter errors correctly ([2bbdc7e](https://github.com/mozilla/fxa-auth-server/commit/2bbdc7e))
* **tests:** add an EventEmitter to test/mailbox ([4d0f95a](https://github.com/mozilla/fxa-auth-server/commit/4d0f95a))
* **tests:** skip 3 pt-BR specific tests due to no translation yet ([4659017](https://github.com/mozilla/fxa-auth-server/commit/4659017))
* **tests:** verifyHash should no longer be returned ([7db5996](https://github.com/mozilla/fxa-auth-server/commit/7db5996))



<a name="1.41.0"></a>
# [1.41.0](https://github.com/mozilla/fxa-auth-server/compare/v1.40.0...v1.41.0) (2015-07-07)




<a name="1.40.0"></a>
# [1.40.0](https://github.com/mozilla/fxa-auth-server/compare/v1.39.1...v1.40.0) (2015-06-30)


### Bug Fixes

* **db:** Test for 400 from checkPassword, which shows incorrect password ([45c1ea3](https://github.com/mozilla/fxa-auth-server/commit/45c1ea3))
* **password:** Revert changes induced by #954 pull request ([d3e3462](https://github.com/mozilla/fxa-auth-server/commit/d3e3462))

### Features

* Add account notification emails. ([34ae5d0](https://github.com/mozilla/fxa-auth-server/commit/34ae5d0))



<a name="1.39.0"></a>
# [1.39.0](https://github.com/mozilla/fxa-auth-server/compare/v1.38.0...v1.39.0) (2015-06-11)


### Bug Fixes

* **docs:** Fix Markdown link in api.md ([b65a5a6](https://github.com/mozilla/fxa-auth-server/commit/b65a5a6))
* **docs:** update documentation for example verification code, from 64 to 32 chars ([5c3bf0b](https://github.com/mozilla/fxa-auth-server/commit/5c3bf0b)), closes [#937](https://github.com/mozilla/fxa-auth-server/issues/937)
* **password:** revert part of GH-943; currently in broken state ([4a82735](https://github.com/mozilla/fxa-auth-server/commit/4a82735))
* **test:** add missing .bind's to deferred handlers ([0eaf5b4](https://github.com/mozilla/fxa-auth-server/commit/0eaf5b4))

### Features

* **log:** Add logging of various account event ([8b22c23](https://github.com/mozilla/fxa-auth-server/commit/8b22c23))



<a name="1.38.0"></a>
# [1.38.0](https://github.com/mozilla/fxa-auth-server/compare/v1.37.0...v1.38.0) (2015-05-27)


### Bug Fixes

* **env:** set RESEND_BLACKOUT_PERIOD to zero in development ([068820c](https://github.com/mozilla/fxa-auth-server/commit/068820c))
* **env:** updated development TRUSTED_JKUS to bring back support for the untrusted relier ([1472e74](https://github.com/mozilla/fxa-auth-server/commit/1472e74))
* **test:** use a version of node-ass with updated node-temp ([3b31c52](https://github.com/mozilla/fxa-auth-server/commit/3b31c52))

### Features

* **server:** Log the `service` and `reason` parameters for `/account/login`. ([fa7d1bd](https://github.com/mozilla/fxa-auth-server/commit/fa7d1bd))



<a name="1.37.0"></a>
# [1.37.0](https://github.com/mozilla/fxa-auth-server/compare/v1.36.0...v1.37.0) (2015-05-15)


### Bug Fixes

* **logging:** configuration changes per @whd ([f65106d](https://github.com/mozilla/fxa-auth-server/commit/f65106d))
* **pool:** Stop retrying requests to db-server ([179e1b5](https://github.com/mozilla/fxa-auth-server/commit/179e1b5)), closes [#921](https://github.com/mozilla/fxa-auth-server/issues/921)



<a name="1.36.0"></a>
# [1.36.0](https://github.com/mozilla/fxa-auth-server/compare/v1.35.0...v1.36.0) (2015-04-28)


### Bug Fixes

* **l10n:** pass config.i18n.defaultLanguage to fxa-auth-mailer ([eddc014](https://github.com/mozilla/fxa-auth-server/commit/eddc014))
* **mailer:** add a soft check that we are using the same locales as content-server ([0aa3da7](https://github.com/mozilla/fxa-auth-server/commit/0aa3da7))
* **mailer:** add some tests of various supported, unsupported and non-existent locales ([341a512](https://github.com/mozilla/fxa-auth-server/commit/341a512))
* **mailer:** split out the list of supported locales, for easier maintenance ([0251cb8](https://github.com/mozilla/fxa-auth-server/commit/0251cb8))
* **tests:** a config update now makes uk,hsb,dsb available ([a18ceae](https://github.com/mozilla/fxa-auth-server/commit/a18ceae))
* **tests:** update for some locales that have now translated fxa-auth-mailer strings ([92a444b](https://github.com/mozilla/fxa-auth-server/commit/92a444b))



<a name="1.35.0"></a>
# [1.35.0](https://github.com/mozilla/fxa-auth-server/compare/v1.34.1...v1.35.0) (2015-04-14)


### Bug Fixes

* **httpdb:** Set verifierSetAt for resetAccount() ([791ab91](https://github.com/mozilla/fxa-auth-server/commit/791ab91))
* **options:** -L, --locale <en[,zh-TW,de,...]>; Test only this csv list of locales ([e0a79ae](https://github.com/mozilla/fxa-auth-server/commit/e0a79ae))
* **travis:** set --force flag on validate-shrinkwrap ([327e4c3](https://github.com/mozilla/fxa-auth-server/commit/327e4c3))



<a name="1.33.0"></a>
# [1.33.0](https://github.com/mozilla/fxa-auth-server/compare/03aae55...v1.33.0) (2015-03-17)


### Bug Fixes

* **logging:** log emailRecord.uid as a hex string, not a byte array ([b9a1f67](https://github.com/mozilla/fxa-auth-server/commit/b9a1f67))
* **server:** Fix the "Cannot call method 'tooManyRequests' of undefined error. ([03aae55](https://github.com/mozilla/fxa-auth-server/commit/03aae55)), closes [#665](https://github.com/mozilla/fxa-auth-server/issues/665)


# Older versions

train-32
  * Add ability to put an account in "lockout" state after many auth failures - #867

train-32
  * Add ability to put an account in "lockout" state after many auth failures - #867

train-31
  * Don't forward restmail.net email addresses to basket API - #870

train-30
  * Add more fine-grained logging on basket API errors - #839, #856
  * Increase passwordForgotToken lifetime to 60mins - #862, #845
  * Tell basket that locale="en-US" when the user doesn't provide one explicitly - #863
  * Use shiny new PyFxA library for the python loadtests - #844

train-29
  * increased basket logging #857
  * deleted unused code #847

train-28
  * updated hapi to 7.5.3

train-27
  * updated fxa-auth-mailer for mail template changes
  * added locale to basket api response logging

train-26
  * no changes

train-25
  * no changes

train-24
  * added uid to /session/status #830
  * updated dependencies

train-23
  * improved operational affordances for scrypt max-pending limit #819
  * Fixed JWT related bugs for preVerifyToken #824 #825

train-22
  * basket API #818

train-21
  * added 'preVerifyToken' optional parameter to /account/create #784
  * reset customs state on password reset #798
  * added 'resume' optional parameter to email sending endpoints #793

train-20
  * limit the number of pending scrypt hashes #783

train-19
  * belated major version 1 bump but maintain minor version count
  * fixed uid logging issue #755
  * nonceFunc logging is now trace instead of info level
  * updated many dependencies
  * removed awsbox

train-18
  * fixed internal server error on /certificate/sign #771
  * removed mysql and heap DB implementations #769
  * fixed log uid encoding issue #765
  * updated documentation

train-17
  * added locale to account #751
  * better db related error messages for httpdb #754
  * updated customs-server #756

train-16
  * updated hapi to 6.0.2

train-15
  * allow routes to use a base path for hosting in a subdirectory
  * updated dependencies
  * use poolee module for HTTP requests
  * code reorganization

train-14
  * moved email sending into fxa-auth-mailer #730
  * updated hapi-auth-hawk to mitigate bug (#700) #731
  * added `use_https` config option #728
  * always return an error on `__heartbeat__` failure #726
  * updated documentation

train-13
  * added contributing file #719
  * added MPL license file
  * fix for certificate sign requests when the provided key is invalid #717
  * fixed hawk payload verification bug #713
  * updated base email templates #709

train-12
  * verify an account if its unverified when forgot password verification succeeds #694
  * added 'accountRecreated' flag to the request summary log line #695
  * deprecate smtp.verificationUrl and passwordResetUrl in favor of contentServer.url #696
  * Update the URL for the customs server #702
  * add http datastore api #684

train-11
  * moved customs-server (fraud/abuse) to its own repo #685
  * improved the email based rate-limiting behavior

train-10
  * added email_bouncer.js for processing SES email bounces #678
  * fixed an email validation bug #681

train-09
  * noop

train-08
  * added /account/status #656
  * added basic email rate limiting #664

train-07
  * improve concurrent duplicate request handling #626
  * improved test coverage #628
  * added SNS account delete notifier #629
  * added fxa-verifiedEmail to the signed certificate #630
  * removed dependency on redis #634
  * added db_patcher for db migrations #643
  * improved redirectTo domain validation
  * updated readme design doc link #616
  * added /password/forgot/status endpoint #636
  * added /session/status endpoint #637
  * exit key_server when stdout is piped and the other process exits
  * improved mysql connection error handling

train-06
  * stop logging OPTIONS requests #619
  * fixed /verify_email uid parameter validation
  * default config.env to prod #614

train-05
  * fixed some i18n issues #611
  * use npm shrinkwrap #603
  * don't send verify emails to verified accounts #609

train-04
  * added `lockdown` for stable dependencies #19
  * refactored mysql.js #588
  * allow repeat signup against unverified emails #593
  * added cache-control to /.well-known/browserid #597
  * collect loggable data before authentication #601

train-03
  * upgrade hapi to 2.4.0
  * fixed password reset account lockout bug #575
  * upgrade mysql to 2.1.0
  * added mysql stat log lines
  * default mysql pools to 10 connections instead of 100
  * improved mysql connection error handling #581
  * check and cache ts+nonce pairs, not just plain nonces #584
  * disable HAWK timestamp checking in authentication #585

train-02
  * added `fxa-lastAuthAt` to signed certificates #547
  * load test enhancements
  * fixed redirectTo bug in /recovery_email/resend_code #563
  * updated mysql module from 2.0.0 to 2.0.1
  * improved mysql error handling #566
  * implemented new request logging convention #565
  * fixed remote test timing issue #512
  * more comprehensive email address validation #573
  * added CHANGELOG :)

train-01
  * all the things
