<a name="1.81.0"></a>
# [1.81.0](https://github.com/mozilla/fxa-auth-server/compare/v1.80.0...v1.81.0) (2017-02-22)


### Bug Fixes

* **dev:** disable ip profile in dev (#1643) r=vbudhram ([d9b6bd9](https://github.com/mozilla/fxa-auth-server/commit/d9b6bd9))
* **docs:** Document that devices should reigster before attempting to sync. (#1667); r=phil ([496be0e](https://github.com/mozilla/fxa-auth-server/commit/496be0e))
* **docs:** document the /sms endpoint ([7226ce0](https://github.com/mozilla/fxa-auth-server/commit/7226ce0))
* **logging:** log errors when we encounter unexpected createdAt values ([a3d4f56](https://github.com/mozilla/fxa-auth-server/commit/a3d4f56))
* **push:** notify a device connected only when account verified ([901525b](https://github.com/mozilla/fxa-auth-server/commit/901525b)), closes [#1651](https://github.com/mozilla/fxa-auth-server/issues/1651)
* **server:** disallow any query or payload params without validation (#1668) r=vladikoff ([0acab56](https://github.com/mozilla/fxa-auth-server/commit/0acab56))
* **sms:** make the fallback error case work sanely ([3eff2d3](https://github.com/mozilla/fxa-auth-server/commit/3eff2d3))
* **tests:** add missing tests for log.begin and log.summary calls ([e1265ff](https://github.com/mozilla/fxa-auth-server/commit/e1265ff))

### chore

* **docs:** Add some more details on metrics db column contents. ([06913c6](https://github.com/mozilla/fxa-auth-server/commit/06913c6))

### Features

* **api:** add an endpoint for sending SMS messages ([d35d442](https://github.com/mozilla/fxa-auth-server/commit/d35d442))
* **email:** record email bounces in database ([b4279c1](https://github.com/mozilla/fxa-auth-server/commit/b4279c1))
* **logging:** add optional uid and locale to flow event data ([038d457](https://github.com/mozilla/fxa-auth-server/commit/038d457))
* **server:** auto-unbuffer binary data when crossing API boundaries ([35115f9](https://github.com/mozilla/fxa-auth-server/commit/35115f9))

### Refactor

* **server:** unify the unbuffering functions to one place ([a649b78](https://github.com/mozilla/fxa-auth-server/commit/a649b78))
* **unblock:** Graduate sign-in unblock ([5f07f22](https://github.com/mozilla/fxa-auth-server/commit/5f07f22))

### style

* **lib:** update let to const when possible ([29c9f39](https://github.com/mozilla/fxa-auth-server/commit/29c9f39))



<a name="1.80.0"></a>
# [1.80.0](https://github.com/mozilla/fxa-auth-server/compare/v1.78.0...v1.80.0) (2017-02-07)


### Bug Fixes

* **docs:** document recent flow event changes (#1630), r=@vbudhram ([e5eaccf](https://github.com/mozilla/fxa-auth-server/commit/e5eaccf))
* **email:** turn on SES Event Publishing metrics ([9105f87](https://github.com/mozilla/fxa-auth-server/commit/9105f87))
* **logging:** Log bounced complaint ([0fa378e](https://github.com/mozilla/fxa-auth-server/commit/0fa378e))
* **logging:** Log templates that don't have flow event data (#1618), r=@philbooth ([e6a1b87](https://github.com/mozilla/fxa-auth-server/commit/e6a1b87))
* **push:** Try to always send a deviceName in the 'device connected' push message. (#1633); ([2b4777a](https://github.com/mozilla/fxa-auth-server/commit/2b4777a))
* **shrinkwrap:** update shrinkwrap to latest version ([1a709fa](https://github.com/mozilla/fxa-auth-server/commit/1a709fa))
* **style:** adjust config code style issue ([bb5f5d0](https://github.com/mozilla/fxa-auth-server/commit/bb5f5d0))

### chore

* **mailer:** update fxa-auth-mailer (and other shrinkwrap) (#1620) ([04aa467](https://github.com/mozilla/fxa-auth-server/commit/04aa467))
* **travis:** add node6 test target (#1632) r=vladikoff ([05f9dd6](https://github.com/mozilla/fxa-auth-server/commit/05f9dd6))

### Features

* **ci:** add config for cross-repo testing ([81428f3](https://github.com/mozilla/fxa-auth-server/commit/81428f3))
* **docs:** document the fix for duplicate flow events (#1634) r=vladikoff ([da5edc5](https://github.com/mozilla/fxa-auth-server/commit/da5edc5)), closes [#1634](https://github.com/mozilla/fxa-auth-server/issues/1634)
* **email:** Add flow events for email delivery notifications (#1626), r=@philbooth ([2e84e07](https://github.com/mozilla/fxa-auth-server/commit/2e84e07))
* **ip-profiling:** make IP Profiling allowed recency use config (#1615), r=@vbudhram ([ca4419a](https://github.com/mozilla/fxa-auth-server/commit/ca4419a)), closes [#1614](https://github.com/mozilla/fxa-auth-server/issues/1614)
* **logs:** log endpoint errors for better debugging (#1627) r=vbudhram,philbooth ([3719437](https://github.com/mozilla/fxa-auth-server/commit/3719437))

### Refactor

* **email:** Don't flag logins with incorrect email case (#1623). r=@rfk ([88cd267](https://github.com/mozilla/fxa-auth-server/commit/88cd267))
* **tests:** Reorganize local tests (#1629) r=vladikoff,philbooth ([38d4957](https://github.com/mozilla/fxa-auth-server/commit/38d4957))



<a name="1.79.0"></a>
# [1.79.0](https://github.com/mozilla/fxa-auth-server/compare/v1.78.0...v1.79.0) (2017-01-30)


### Bug Fixes

* **email:** turn on SES Event Publishing metrics ([9105f87](https://github.com/mozilla/fxa-auth-server/commit/9105f87))
* **logging:** Log bounced complaint ([0fa378e](https://github.com/mozilla/fxa-auth-server/commit/0fa378e))
* **logging:** Log templates that don't have flow event data (#1618), r=@philbooth ([e6a1b87](https://github.com/mozilla/fxa-auth-server/commit/e6a1b87))

### chore

* **mailer:** update fxa-auth-mailer (and other shrinkwrap) (#1620) ([04aa467](https://github.com/mozilla/fxa-auth-server/commit/04aa467))

### Features

* **ci:** add config for cross-repo testing ([81428f3](https://github.com/mozilla/fxa-auth-server/commit/81428f3))
* **email:** Add flow events for email delivery notifications (#1626), r=@philbooth ([2e84e07](https://github.com/mozilla/fxa-auth-server/commit/2e84e07))
* **ip-profiling:** make IP Profiling allowed recency use config (#1615), r=@vbudhram ([ca4419a](https://github.com/mozilla/fxa-auth-server/commit/ca4419a)), closes [#1614](https://github.com/mozilla/fxa-auth-server/issues/1614)
* **logs:** log endpoint errors for better debugging (#1627) r=vbudhram,philbooth ([3719437](https://github.com/mozilla/fxa-auth-server/commit/3719437))

### Refactor

* **email:** Don't flag logins with incorrect email case (#1623). r=@rfk ([88cd267](https://github.com/mozilla/fxa-auth-server/commit/88cd267))
* **tests:** Reorganize local tests (#1629) r=vladikoff,philbooth ([38d4957](https://github.com/mozilla/fxa-auth-server/commit/38d4957))



<a name="1.78.0"></a>
# [1.78.0](https://github.com/mozilla/fxa-auth-server/compare/v1.77.0...v1.78.0) (2017-01-11)


### Bug Fixes

* **logging:** handle /v1 path prefix in route summary flow events ([686306e](https://github.com/mozilla/fxa-auth-server/commit/686306e))

### Refactor

* **logging:** remove request argument from log methods ([a8f8c4a](https://github.com/mozilla/fxa-auth-server/commit/a8f8c4a))



<a name="1.77.0"></a>
# [1.77.0](https://github.com/mozilla/fxa-auth-server/compare/v1.76.1...v1.77.0) (2017-01-04)


### Bug Fixes

* **customs:** Mark suspicious requests, even if they were rate-limited. ([02e8f19](https://github.com/mozilla/fxa-auth-server/commit/02e8f19))
* **docs:** add unblock code API docs ([3655cfd](https://github.com/mozilla/fxa-auth-server/commit/3655cfd)), closes [#1577](https://github.com/mozilla/fxa-auth-server/issues/1577)
* **emails:** remove /v1/ api prefix (#1605); r=rfk ([5e99cf3](https://github.com/mozilla/fxa-auth-server/commit/5e99cf3)), closes [#1605](https://github.com/mozilla/fxa-auth-server/issues/1605) [#1059](https://github.com/mozilla/fxa-auth-server/issues/1059)
* **unblock:** Use normalized email address for feature-flag calculation. ([83ef76a](https://github.com/mozilla/fxa-auth-server/commit/83ef76a))

### Refactor

* **server:** eliminate duplicate calls to user-agent parser ([4ac625c](https://github.com/mozilla/fxa-auth-server/commit/4ac625c))
* **signin:** Add support for sending flow metrics in email (#1593); r=pb,vladikoff ([6955261](https://github.com/mozilla/fxa-auth-server/commit/6955261))
* **signin:** Extract unblock-code-checking into a separate helper function. ([0c4beb7](https://github.com/mozilla/fxa-auth-server/commit/0c4beb7))
* **signin:** Use new verify account sync template and add location data to others (#1600), r= ([6fc0c50](https://github.com/mozilla/fxa-auth-server/commit/6fc0c50))



<a name="1.76.1"></a>
## [1.76.1](https://github.com/mozilla/fxa-auth-server/compare/v1.76.0...v1.76.1) (2016-12-21)


### Bug Fixes

* **logging:** silence spurious "missing token" error noise ([f8f8a21](https://github.com/mozilla/fxa-auth-server/commit/f8f8a21))
* **pool:** Reject with an Error instance for HTTP errors. ([60c15c8](https://github.com/mozilla/fxa-auth-server/commit/60c15c8))

### Refactor

* **signin:** Skip sign-in confirmation depending on account age (#1591), r=@seanmonstar, @rfk ([1d1fa41](https://github.com/mozilla/fxa-auth-server/commit/1d1fa41))



<a name="1.76.0"></a>
# [1.76.0](https://github.com/mozilla/fxa-auth-server/compare/v1.75.2...v1.76.0) (2016-12-14)


### Bug Fixes

* **server:** remove redundant metrics context fields ([f027f0b](https://github.com/mozilla/fxa-auth-server/commit/f027f0b))
* **server:** tolerate missing payload in AppError.translate ([a19ff6d](https://github.com/mozilla/fxa-auth-server/commit/a19ff6d))
* **signup:** Return canonical email address in 'account exists' error. (#1589), r=@vbudhram ([ddd4fdb](https://github.com/mozilla/fxa-auth-server/commit/ddd4fdb))



<a name="1.75.2"></a>
## [1.75.2](https://github.com/mozilla/fxa-auth-server/compare/v1.75.1...v1.75.2) (2016-12-05)


### Bug Fixes

* **docs:** add links to prs under "significant changes" (#1582) r=vladikoff ([1d49428](https://github.com/mozilla/fxa-auth-server/commit/1d49428))
* **server:** make account.reset a flow event ([ed9ec79](https://github.com/mozilla/fxa-auth-server/commit/ed9ec79))
* **unblock:** Remove 'context' check from unblock feature-flag. ([764c96a](https://github.com/mozilla/fxa-auth-server/commit/764c96a))

### chore

* **login:** Remove the legacy `contentToken` parameter from login ([505b627](https://github.com/mozilla/fxa-auth-server/commit/505b627))



<a name="1.75.1"></a>
## [1.75.1](https://github.com/mozilla/fxa-auth-server/compare/v1.75.0...v1.75.1) (2016-12-02)




<a name="1.75.0"></a>
# [1.75.0](https://github.com/mozilla/fxa-auth-server/compare/v1.74.1...v1.75.0) (2016-11-30)


### Bug Fixes

* **bypass:** Don't bypass sign-in confirmation for forced emails (#1554), r=@seanmonstar ([1fa95a9](https://github.com/mozilla/fxa-auth-server/commit/1fa95a9))
* **customs:** Sanitize 'oldAuthPW' field when sending to customs ([76aad23](https://github.com/mozilla/fxa-auth-server/commit/76aad23))
* **devices:** add special-case recognition of Firefox-iOS (#1558) r=vladikoff ([1d1d16b](https://github.com/mozilla/fxa-auth-server/commit/1d1d16b))
* **docs:** document recent fix that affects flow events (#1560), r=@vbudhram ([70ff376](https://github.com/mozilla/fxa-auth-server/commit/70ff376)), closes [#1560](https://github.com/mozilla/fxa-auth-server/issues/1560)
* **docs:** document recent flow event changes ([7c97bb8](https://github.com/mozilla/fxa-auth-server/commit/7c97bb8))
* **error:** Include more specific error messages in invalidToken(). ([b38bace](https://github.com/mozilla/fxa-auth-server/commit/b38bace))
* **logging:** remove raw token data from error log (#1572) r=vladikoff ([f9112d1](https://github.com/mozilla/fxa-auth-server/commit/f9112d1))
* **server:** propagate metrics context in /account/reset ([30ec03d](https://github.com/mozilla/fxa-auth-server/commit/30ec03d))
* **tests:** Test fixes for upcoming change to db-mysql behaviour (#1552); r=vladikoff ([8cd0a8e](https://github.com/mozilla/fxa-auth-server/commit/8cd0a8e)), closes [#1552](https://github.com/mozilla/fxa-auth-server/issues/1552)

### chore

* **debug:** Expose debug port for spawned process (#1550) r=vladikoff ([767d53d](https://github.com/mozilla/fxa-auth-server/commit/767d53d))
* **shrinkwrap:** add npm script for shrinkwrap (#1568) r=vladikoff ([3be3e63](https://github.com/mozilla/fxa-auth-server/commit/3be3e63)), closes [#1564](https://github.com/mozilla/fxa-auth-server/issues/1564)
* **tests:** Make remote db tests independent ([d3635e3](https://github.com/mozilla/fxa-auth-server/commit/d3635e3))
* **travis:** remove the old tmp workaround ([5032982](https://github.com/mozilla/fxa-auth-server/commit/5032982))

### Features

* **metrics:** log flowEvents of all requests ([7153da7](https://github.com/mozilla/fxa-auth-server/commit/7153da7))
* **signin:** Remove feature flag from sign-in confirmation. (#1530); r=vbudhram ([5f0f3ba](https://github.com/mozilla/fxa-auth-server/commit/5f0f3ba))



<a name="1.74.1"></a>
## [1.74.1](https://github.com/mozilla/fxa-auth-server/compare/v1.74.0...v1.74.1) (2016-11-16)


### Bug Fixes

* **unblock:** rethrow customs server error when account is unknown ([b5bda6b](https://github.com/mozilla/fxa-auth-server/commit/b5bda6b))



<a name="1.74.0"></a>
# [1.74.0](https://github.com/mozilla/fxa-auth-server/compare/v1.73.1...v1.74.0) (2016-11-15)


### Bug Fixes

* **docs:** document the recent flow event changes ([0a31229](https://github.com/mozilla/fxa-auth-server/commit/0a31229))
* **logging:** drop invalid metrics context data ([97ad615](https://github.com/mozilla/fxa-auth-server/commit/97ad615))

### chore

* **cleanup:** Remove signer-stub.js (#1541), r=@seanmonstar ([edcc433](https://github.com/mozilla/fxa-auth-server/commit/edcc433))

### Features

* **metrics:** Emit an `account.changedPassword` activity event. ([37c408d](https://github.com/mozilla/fxa-auth-server/commit/37c408d))
* **profiling:** IP Profiling (#1525), r=@seanmonstar ([21723e8](https://github.com/mozilla/fxa-auth-server/commit/21723e8))
* **unblock:** log when an unverfied user successfully unblocked ([b9a7111](https://github.com/mozilla/fxa-auth-server/commit/b9a7111))

### test

* **all:** switch tap runner for mocha ([6c815d0](https://github.com/mozilla/fxa-auth-server/commit/6c815d0))



<a name="1.73.1"></a>
## [1.73.1](https://github.com/mozilla/fxa-auth-server/compare/v1.73.0...v1.73.1) (2016-11-07)


### Bug Fixes

* **reminders:** fix disabled state (#1536) r=vbudhram ([d01e115](https://github.com/mozilla/fxa-auth-server/commit/d01e115)), closes [#1536](https://github.com/mozilla/fxa-auth-server/issues/1536) [#1408](https://github.com/mozilla/fxa-auth-server/issues/1408)



<a name="1.73.0"></a>
# [1.73.0](https://github.com/mozilla/fxa-auth-server/compare/v1.72.0...v1.73.0) (2016-11-02)


### Bug Fixes

* **lib:** make all calls to crypto.randomBytes async ([9f59235](https://github.com/mozilla/fxa-auth-server/commit/9f59235)), closes [#1474](https://github.com/mozilla/fxa-auth-server/issues/1474)
* **push:** do not throw if push fails on the notify endpoint ([90b37d5](https://github.com/mozilla/fxa-auth-server/commit/90b37d5)), closes [#1510](https://github.com/mozilla/fxa-auth-server/issues/1510)
* **unblock:** Fix db.createUnblockCode - code generation is async. ([2d1a6a2](https://github.com/mozilla/fxa-auth-server/commit/2d1a6a2)), closes [#1531](https://github.com/mozilla/fxa-auth-server/issues/1531)

### Features

* **docs:** document the event data available in redshift/redash ([9611019](https://github.com/mozilla/fxa-auth-server/commit/9611019))
* **logging:** emit a flow.complete event ([44e044b](https://github.com/mozilla/fxa-auth-server/commit/44e044b))
* **metrics:** add account.login.blocked flow event ([15cd8d8](https://github.com/mozilla/fxa-auth-server/commit/15cd8d8))
* **metrics:** add account.login.invalidUnblockCode flow event ([2e3ea80](https://github.com/mozilla/fxa-auth-server/commit/2e3ea80))
* **metrics:** add flow events for email sent and clicked" ([d903b6c](https://github.com/mozilla/fxa-auth-server/commit/d903b6c)), closes [#1511](https://github.com/mozilla/fxa-auth-server/issues/1511)
* **metrics:** Add password reset flow metrics (#1520), r=@philbooth ([145d537](https://github.com/mozilla/fxa-auth-server/commit/145d537))
* **metrics:** set metricsContext expiry to 2 hours ([2f03ce5](https://github.com/mozilla/fxa-auth-server/commit/2f03ce5)), closes [#1513](https://github.com/mozilla/fxa-auth-server/issues/1513)
* **unblock:** change unblock codes to base32 (#1529) r=vladikoff ([f82db02](https://github.com/mozilla/fxa-auth-server/commit/f82db02)), closes [#1497](https://github.com/mozilla/fxa-auth-server/issues/1497)

### style

* **error:** order ERRNO constant numerically ([2f6b203](https://github.com/mozilla/fxa-auth-server/commit/2f6b203)), closes [#1518](https://github.com/mozilla/fxa-auth-server/issues/1518)

### test

* **lint:** add lint for synchronous randomBytes usage ([f4d02a1](https://github.com/mozilla/fxa-auth-server/commit/f4d02a1))



<a name="1.72.0"></a>
# [1.72.0](https://github.com/mozilla/fxa-auth-server/compare/v1.71.1...v1.72.0) (2016-10-19)


### Bug Fixes

* **deps:** Update shrinkwrap for the new auth-mailer ([05da657](https://github.com/mozilla/fxa-auth-server/commit/05da657))
* **logging:** device.created is not a flow event ([82e579c](https://github.com/mozilla/fxa-auth-server/commit/82e579c))
* **logging:** emit flow events for sign-in unblock, not activity events (#1508); r=seanmonstar ([9a4e89c](https://github.com/mozilla/fxa-auth-server/commit/9a4e89c))
* **node6:** update to scrypt-hash@1.1.14 for node6 compat (#1494) r=vladikoff ([aee737c](https://github.com/mozilla/fxa-auth-server/commit/aee737c))
* **push:** Add metrics events for reason=accountConfirm ([d2dc5c0](https://github.com/mozilla/fxa-auth-server/commit/d2dc5c0))
* **scripts:** nicely stringify regexps when logging config ([479b034](https://github.com/mozilla/fxa-auth-server/commit/479b034))

### Features

* **hpkp:** Add hpkp support (#1499), r=@philbooth ([9b77446](https://github.com/mozilla/fxa-auth-server/commit/9b77446))
* **push:** Add VAPID identification to push messages. (#1468); r=philbooth ([6e6b28c](https://github.com/mozilla/fxa-auth-server/commit/6e6b28c))
* **unblock:** add Signin Unblock feature ([c3a66c2](https://github.com/mozilla/fxa-auth-server/commit/c3a66c2)), closes [#1398](https://github.com/mozilla/fxa-auth-server/issues/1398)

### Refactor

* **email:** Fix lint ([383198a](https://github.com/mozilla/fxa-auth-server/commit/383198a))
* **email:** Remove `sendEmailIfUnverified` ([d742d67](https://github.com/mozilla/fxa-auth-server/commit/d742d67))
* **logging:** decorate request object with metricsContext methods ([16cf030](https://github.com/mozilla/fxa-auth-server/commit/16cf030))
* **logging:** eliminate the event argument from stash and gather ([4dd3f7e](https://github.com/mozilla/fxa-auth-server/commit/4dd3f7e))
* **logging:** move activity/flow event decision out of log object ([957a883](https://github.com/mozilla/fxa-auth-server/commit/957a883))



<a name="1.71.2"></a>
## [1.71.2](https://github.com/mozilla/fxa-auth-server/compare/v1.71.1...v1.71.2) (2016-10-11)


### Bug Fixes

* **push:** Add metrics events for reason=accountConfirm; r=seanmonstar ([45dfa20](https://github.com/mozilla/fxa-auth-server/commit/45dfa20))



<a name="1.71.1"></a>
## [1.71.1](https://github.com/mozilla/fxa-auth-server/compare/v1.71.0...v1.71.1) (2016-10-05)


### Bug Fixes

* **tests:** es-ES is now 100% supported (#1493) ([23234c6](https://github.com/mozilla/fxa-auth-server/commit/23234c6))



<a name="1.71.0"></a>
# [1.71.0](https://github.com/mozilla/fxa-auth-server/compare/v1.70.1...v1.71.0) (2016-10-05)


### Bug Fixes

* **config:** increase flowId expiration to 2 hours (#1487); r=jrgm,rfk ([798ef83](https://github.com/mozilla/fxa-auth-server/commit/798ef83))
* **config:** return parsed RegExp instances from config ([020235f](https://github.com/mozilla/fxa-auth-server/commit/020235f))
* **deps:** downgrade to hapi 14 (#1485) r=seanmonstar ([fe803da](https://github.com/mozilla/fxa-auth-server/commit/fe803da))
* **logging:** device.created is not a flow event (#1483), r=@vbudhram ([7337af0](https://github.com/mozilla/fxa-auth-server/commit/7337af0))
* **push:** notify devices after successful sign-in confirmation ([190442f](https://github.com/mozilla/fxa-auth-server/commit/190442f))
* **server:** add unit tests for the request helpers ([9a4954d](https://github.com/mozilla/fxa-auth-server/commit/9a4954d))
* **server:** hide session token lastAccessTime updates behind a flag ([51d7cdd](https://github.com/mozilla/fxa-auth-server/commit/51d7cdd))

### chore

* **deps:** update l10n, shrinkwrap ([16d3d99](https://github.com/mozilla/fxa-auth-server/commit/16d3d99))
* **git:** ignore npm-debug.log ([3529d47](https://github.com/mozilla/fxa-auth-server/commit/3529d47))
* **mocks:** Extract mockCustoms into shared helper. ([39bd65a](https://github.com/mozilla/fxa-auth-server/commit/39bd65a))

### Features

* **customs:** Rate-limit verification of email codes. ([2580333](https://github.com/mozilla/fxa-auth-server/commit/2580333))
* **geo:** add state code to location response (#1478) r=vbudhram ([eabfcc6](https://github.com/mozilla/fxa-auth-server/commit/eabfcc6))
* **logging:** Log email template header if available (#1466), r=@jbuck ([cccd899](https://github.com/mozilla/fxa-auth-server/commit/cccd899))
* **reset:** Accept metricsContext bundle on password-reset endpoints. ([05a3b4e](https://github.com/mozilla/fxa-auth-server/commit/05a3b4e))



<a name="1.70.1"></a>
## [1.70.1](https://github.com/mozilla/fxa-auth-server/compare/v1.70.0...v1.70.1) (2016-10-03)


### Bug Fixes

* **deps:** downgrade to hapi 14 ([7c6d5f7](https://github.com/mozilla/fxa-auth-server/commit/7c6d5f7))



<a name="1.70.0"></a>
# [1.70.0](https://github.com/mozilla/fxa-auth-server/compare/v1.69.0...v1.70.0) (2016-09-24)


### Bug Fixes

* **deps:** update dev deps and latest eslint ([a929f9c](https://github.com/mozilla/fxa-auth-server/commit/a929f9c))
* **email:** Refactor to send `sendEmailIfUnverified` via query params, add `emailSent` to re ([19753fc](https://github.com/mozilla/fxa-auth-server/commit/19753fc))
* **emails:** Fix bug when signin with unverified session and not using signin confirmation ([ad9272c](https://github.com/mozilla/fxa-auth-server/commit/ad9272c))
* **emails:** Fixed comment ([aaccab2](https://github.com/mozilla/fxa-auth-server/commit/aaccab2))
* **emails:** Fixed regression where verification email was being sent to already verified ema ([41f4632](https://github.com/mozilla/fxa-auth-server/commit/41f4632))
* **emails:** PR Fixes ([9d30cc0](https://github.com/mozilla/fxa-auth-server/commit/9d30cc0))
* **emails:** Remove extra `customs.flag` mock ([7929de7](https://github.com/mozilla/fxa-auth-server/commit/7929de7))
* **logging:** ignore account.signed flow events from the content server ([f3f2468](https://github.com/mozilla/fxa-auth-server/commit/f3f2468))
* **process:** remove process.domain in token.js (#1456) r=rfk ([9fb1f71](https://github.com/mozilla/fxa-auth-server/commit/9fb1f71)), closes [#740](https://github.com/mozilla/fxa-auth-server/issues/740)
* **push:** Fix and re-enable the end-to-end push tests. (#1467) r=vladikoff ([f5f3abf](https://github.com/mozilla/fxa-auth-server/commit/f5f3abf)), closes [(#1467](https://github.com/(/issues/1467)
* **security:** Fix the security event calls to the DB. ([f780e59](https://github.com/mozilla/fxa-auth-server/commit/f780e59)), closes [#1464](https://github.com/mozilla/fxa-auth-server/issues/1464)
* **security:** Use correct param names in call to db-server ([abb23af](https://github.com/mozilla/fxa-auth-server/commit/abb23af))
* **tests:** make stub implementation of gather match reality ([94c377f](https://github.com/mozilla/fxa-auth-server/commit/94c377f))

### chore

* **deps:** update to latest version of hapi (#1330) r=rfk,seanmonstar,vbudhram ([b3adbcf](https://github.com/mozilla/fxa-auth-server/commit/b3adbcf))
* **nsp:** remove exceptions (#1455) r=seanmonstar ([55e93b6](https://github.com/mozilla/fxa-auth-server/commit/55e93b6))

### Features

* **customs:** return localized retry after data (#1453) r=vbudhram ([5603ad3](https://github.com/mozilla/fxa-auth-server/commit/5603ad3))
* **devices:** add tablet detection ([e09406a](https://github.com/mozilla/fxa-auth-server/commit/e09406a))
* **security:** record event names and ip addresses for important events ([05485b4](https://github.com/mozilla/fxa-auth-server/commit/05485b4))



<a name="1.69.0"></a>
# [1.69.0](https://github.com/mozilla/fxa-auth-server/compare/v1.68.0...v1.69.0) (2016-09-09)


### Bug Fixes

* **config:** Remove unused URL opions from mailer config. ([8de1230](https://github.com/mozilla/fxa-auth-server/commit/8de1230))
* **deps:** use poolee@1.0.1 (#1436) ([ba11125](https://github.com/mozilla/fxa-auth-server/commit/ba11125))
* **emails:** On login, delegate email sending to auth-server (#1435), r=@rfk ([e072e35](https://github.com/mozilla/fxa-auth-server/commit/e072e35))
* **geodb:** 8.8.8.8 in latest data not in Mountain View; point to moz MTV ([db23e8e](https://github.com/mozilla/fxa-auth-server/commit/db23e8e))

### chore

* **deps:** update shrinkwrap ([aa14433](https://github.com/mozilla/fxa-auth-server/commit/aa14433))

### feature

* **newrelic:** add optional newrelic integration ([c811ebe](https://github.com/mozilla/fxa-auth-server/commit/c811ebe))



<a name="1.68.0"></a>
# [1.68.0](https://github.com/mozilla/fxa-auth-server/compare/v1.67.0...v1.68.0) (2016-08-24)


### Bug Fixes

* **docs:** document the new flow events ([7ffa73c](https://github.com/mozilla/fxa-auth-server/commit/7ffa73c))
* **geodb:** if you write a module that takes a hash argument, call it with a hash argument ([3feefa6](https://github.com/mozilla/fxa-auth-server/commit/3feefa6))
* **geodb:** load at startup and log configuration used (#1414) r=vladikoff ([4085c78](https://github.com/mozilla/fxa-auth-server/commit/4085c78))
* **geodb:** update to fxa-geodb 0.0.7 (#1418) ([b8b6e2b](https://github.com/mozilla/fxa-auth-server/commit/b8b6e2b))
* **logging:** not all activity events are flow events (#1416) r=vladikoff ([1a6c3af](https://github.com/mozilla/fxa-auth-server/commit/1a6c3af))
* **logs:** account.verified & account.confirmed are mutually exclusive ([d59edd3](https://github.com/mozilla/fxa-auth-server/commit/d59edd3))
* **logs:** look in response.source for uid ([2224f87](https://github.com/mozilla/fxa-auth-server/commit/2224f87))
* **password:** Remove raw token support ([882317d](https://github.com/mozilla/fxa-auth-server/commit/882317d)), closes [#1351](https://github.com/mozilla/fxa-auth-server/issues/1351)
* **reminders:** fix issue with reminder rate (#1410) ([c4c087e](https://github.com/mozilla/fxa-auth-server/commit/c4c087e)), closes [(#1410](https://github.com/(/issues/1410) [#1408](https://github.com/mozilla/fxa-auth-server/issues/1408)
* **server:** reinstate default user agent fallback (#1422) r=vladikoff ([470fd52](https://github.com/mozilla/fxa-auth-server/commit/470fd52))

### chore

* **deps:** update dev deps, fix husky issues (#1430), r=@vbudhram ([a610337](https://github.com/mozilla/fxa-auth-server/commit/a610337)), closes [(#1430](https://github.com/(/issues/1430) [#1429](https://github.com/mozilla/fxa-auth-server/issues/1429)

### Features

* **l10n:** localize device list (#1420) r=vbudhram ([7a91f31](https://github.com/mozilla/fxa-auth-server/commit/7a91f31)), closes [#1404](https://github.com/mozilla/fxa-auth-server/issues/1404)
* **metrics:** add flowEvent support to all activityEvents and customs (#1409) r=philbooth ([8d36f00](https://github.com/mozilla/fxa-auth-server/commit/8d36f00)), closes [#1403](https://github.com/mozilla/fxa-auth-server/issues/1403)

### Refactor

* **l10n:** use fxa-shared locale list (#1411) ([b70caed](https://github.com/mozilla/fxa-auth-server/commit/b70caed))



<a name="1.67.0"></a>
# [1.67.0](https://github.com/mozilla/fxa-auth-server/compare/v1.66.1...v1.67.0) (2016-08-11)


### Bug Fixes

* **config:** Added new url configs for mailer (#1397) r=vladikoff ([d44cb56](https://github.com/mozilla/fxa-auth-server/commit/d44cb56))
* **deps:** update shrinkwrap, add missing deps (#1407) r=vbudhram ([5062a66](https://github.com/mozilla/fxa-auth-server/commit/5062a66))
* **device:** remember devices to push-notify before resetting account on password change/rese ([69c1eef](https://github.com/mozilla/fxa-auth-server/commit/69c1eef)), closes [#1391](https://github.com/mozilla/fxa-auth-server/issues/1391)
* **devices:** serialize push payload in /devices/notify route ([b91a982](https://github.com/mozilla/fxa-auth-server/commit/b91a982)), closes [#1386](https://github.com/mozilla/fxa-auth-server/issues/1386)
* **e2e-email:** fix e2e-email test ([4e1d200](https://github.com/mozilla/fxa-auth-server/commit/4e1d200))
* **login:** fix handling of sign-in confirmation for keyless logins ([3f03557](https://github.com/mozilla/fxa-auth-server/commit/3f03557))
* **password:** Remove raw token support ([bb5f28b](https://github.com/mozilla/fxa-auth-server/commit/bb5f28b)), closes [#1351](https://github.com/mozilla/fxa-auth-server/issues/1351)
* **server:** assign fresh createdAt timestamp to passwordForgotTokens ([21c5df7](https://github.com/mozilla/fxa-auth-server/commit/21c5df7))
* **server:** ensure tokens get a fresh createdAt timestamp (#1389) r=vladikoff ([6acb9e0](https://github.com/mozilla/fxa-auth-server/commit/6acb9e0))
* **server:** reinstate placeholder devices for sync sessions ([e12cd08](https://github.com/mozilla/fxa-auth-server/commit/e12cd08))
* **server:** remove unused createAccountResetToken method ([2c95903](https://github.com/mozilla/fxa-auth-server/commit/2c95903))
* **ses:** add status and diagnosticCode for bounce (#1401) r=seanmonstar,vbudhram ([61941e8](https://github.com/mozilla/fxa-auth-server/commit/61941e8)), closes [#834](https://github.com/mozilla/fxa-auth-server/issues/834)
* **tests:** remove duplicate assignment ([7659b58](https://github.com/mozilla/fxa-auth-server/commit/7659b58))

### chore

* **deps:** update shrinkwrap ([10f857a](https://github.com/mozilla/fxa-auth-server/commit/10f857a))

### Features

* **geolocation:** add geolocation data to emails (#1334) ([8132d55](https://github.com/mozilla/fxa-auth-server/commit/8132d55))
* **logging:** emit an account.confirmed activity event ([4107e58](https://github.com/mozilla/fxa-auth-server/commit/4107e58))
* **push:** Send proper push messages for password change/reset (#1381) r=vladikoff,rfk ([8cd9403](https://github.com/mozilla/fxa-auth-server/commit/8cd9403)), closes [#1380](https://github.com/mozilla/fxa-auth-server/issues/1380)
* **server:** Rate limit account/devices/notify with the new UIDRecord (#1394) r=vladikoff ([09aee43](https://github.com/mozilla/fxa-auth-server/commit/09aee43)), closes [#1372](https://github.com/mozilla/fxa-auth-server/issues/1372)



<a name="1.66.1"></a>
## [1.66.1](https://github.com/mozilla/fxa-auth-server/compare/v1.66.0...v1.66.1) (2016-07-29)


### Bug Fixes

* **signin:** No signin confirmation for email regexp match if keys not requested ([61d1de4](https://github.com/mozilla/fxa-auth-server/commit/61d1de4)), closes [#1374](https://github.com/mozilla/fxa-auth-server/issues/1374)

### chore

* **signin:** Add commentary about temporary workarounds in sign-in confirmation config. ([e62b1c0](https://github.com/mozilla/fxa-auth-server/commit/e62b1c0))



<a name="1.66.0"></a>
# [1.66.0](https://github.com/mozilla/fxa-auth-server/compare/v1.65.3...v1.66.0) (2016-07-27)


### Bug Fixes

* **deps:** update fxa-content-server-l10n dependency ([ab3b232](https://github.com/mozilla/fxa-auth-server/commit/ab3b232))
* **deps:** update most dev dependencies ([dc4c5ff](https://github.com/mozilla/fxa-auth-server/commit/dc4c5ff))
* **deps:** update request to latest version (#1370) r=vbudhram ([0e3c463](https://github.com/mozilla/fxa-auth-server/commit/0e3c463))
* **deps:** update tap and db mysql dependencies (#1356) r=vladikoff ([93723eb](https://github.com/mozilla/fxa-auth-server/commit/93723eb)), closes [#1353](https://github.com/mozilla/fxa-auth-server/issues/1353)
* **server:** Fixes based on @vladikoff and @rfk feedback. ([29d7fde](https://github.com/mozilla/fxa-auth-server/commit/29d7fde))
* **server:** remove metricsContext from payloads where it is never sent ([0649a30](https://github.com/mozilla/fxa-auth-server/commit/0649a30))
* **server:** remove placeholder device records for sync sessions ([c4c6733](https://github.com/mozilla/fxa-auth-server/commit/c4c6733))
* **server:** Return undefined from Customs.prototype.flag if everyting is OK ([e265694](https://github.com/mozilla/fxa-auth-server/commit/e265694))
* **tests:** disable e2e tests until push server fixed (#1369) r=vbudhram ([bf72778](https://github.com/mozilla/fxa-auth-server/commit/bf72778)), closes [(#1369](https://github.com/(/issues/1369)
* **tests:** fix test runner to exit with proper exit code ([b978b6e](https://github.com/mozilla/fxa-auth-server/commit/b978b6e))
* **tests:** switch coverage tool, adjust log_tests (#1348) r=vbudhram ([8451a56](https://github.com/mozilla/fxa-auth-server/commit/8451a56)), closes [#1340](https://github.com/mozilla/fxa-auth-server/issues/1340)

### chore

* **deps:** update tap testing to latest version (#1339) r=vladikoff ([6648da0](https://github.com/mozilla/fxa-auth-server/commit/6648da0))
* **server:** Add some comments about why a some strange patterns are used. ([2fba045](https://github.com/mozilla/fxa-auth-server/commit/2fba045))

### Features

* **account:** devices push notify endpoint ([699caa1](https://github.com/mozilla/fxa-auth-server/commit/699caa1)), closes [#1357](https://github.com/mozilla/fxa-auth-server/issues/1357)
* **server:** Remove the account lockout feature. ([df3b0de](https://github.com/mozilla/fxa-auth-server/commit/df3b0de)), closes [#1359](https://github.com/mozilla/fxa-auth-server/issues/1359)
* **signin:** Always do sign-in confirmation on suspicious requests. ([cb8f33b](https://github.com/mozilla/fxa-auth-server/commit/cb8f33b))

### Refactor

* **customs:** Add function to scrub payload before performing customs check ([f44872d](https://github.com/mozilla/fxa-auth-server/commit/f44872d))
* **push:** provide pushToDevice, pushToDevices and pushToAllDevices methods ([89083cd](https://github.com/mozilla/fxa-auth-server/commit/89083cd))



<a name="1.65.3"></a>
## [1.65.3](https://github.com/mozilla/fxa-auth-server/compare/v1.65.2...v1.65.3) (2016-07-21)


### Bug Fixes

* **l10n:** bump content-server-l10n to current HEAD ([e097090](https://github.com/mozilla/fxa-auth-server/commit/e097090))



<a name="1.65.2"></a>
## [1.65.2](https://github.com/mozilla/fxa-auth-server/compare/v1.65.0...v1.65.2) (2016-07-19)


### Bug Fixes

* **server:** remove placeholder device records for sync sessions ([1af5624](https://github.com/mozilla/fxa-auth-server/commit/1af5624))



<a name="1.65.0"></a>
# [1.65.0](https://github.com/mozilla/fxa-auth-server/compare/v1.64.0...v1.65.0) (2016-07-14)


### Bug Fixes

* **config:** adjust local dev config to support signin confirmation (#1313) r=vbudhram,shane- ([282271b](https://github.com/mozilla/fxa-auth-server/commit/282271b))
* **customs:** Report errno to customs when password check fails. ([bdd5d0c](https://github.com/mozilla/fxa-auth-server/commit/bdd5d0c))
* **deps:** update npm-shrinkwrap.json w/ newest auth-mailer & fxa-content-server-l10n (#129 ([56b6ad1](https://github.com/mozilla/fxa-auth-server/commit/56b6ad1))
* **docs:** correct the acitvity event data documentation (#1322) r=vladikoff ([9b8747b](https://github.com/mozilla/fxa-auth-server/commit/9b8747b))
* **log:** Add comments and clarify naming for logging methods. ([35c7f68](https://github.com/mozilla/fxa-auth-server/commit/35c7f68))
* **server:** fix bad sessionTokenId arg in call to updateDevice (#1324) r=vladikoff ([4777a8a](https://github.com/mozilla/fxa-auth-server/commit/4777a8a)), closes [(#1324](https://github.com/(/issues/1324)
* **server:** remove default user agent fallback pending legal ok ([8b8f00d](https://github.com/mozilla/fxa-auth-server/commit/8b8f00d))
* **signin:** Let /password/change/finish accept session tokens by id. ([b589b79](https://github.com/mozilla/fxa-auth-server/commit/b589b79))
* **verify:** Don't sent post-verify email when `service` is blank. ([06bf05a](https://github.com/mozilla/fxa-auth-server/commit/06bf05a))

### chore

* **docs:** add more docs to activity events. (#1304) r=philbooth ([31177ad](https://github.com/mozilla/fxa-auth-server/commit/31177ad)), closes [#1202](https://github.com/mozilla/fxa-auth-server/issues/1202)
* **nsp:** Add NSP exception for https://nodesecurity.io/advisories/121 ([9465a99](https://github.com/mozilla/fxa-auth-server/commit/9465a99))
* **scripts:** Add stricter error handling to bash scripts ([7d595c2](https://github.com/mozilla/fxa-auth-server/commit/7d595c2))
* **tests:** allow passing a glob to npm test ([37f0fe4](https://github.com/mozilla/fxa-auth-server/commit/37f0fe4))

### docs

* **config:** clarify sample rate for sign in confirmation (#1315) r=vladikoff ([bc9d79d](https://github.com/mozilla/fxa-auth-server/commit/bc9d79d))

### Features

* **customs:** Send more request metadata to customs-server for checking. ([70944d3](https://github.com/mozilla/fxa-auth-server/commit/70944d3))
* **docs:** document the new activity events ([62b1255](https://github.com/mozilla/fxa-auth-server/commit/62b1255))
* **logging:** emit account.deleted activity event ([01828ab](https://github.com/mozilla/fxa-auth-server/commit/01828ab))
* **metrics:** Drop invalid flowids so they dont confuse our metrics. ([8827b91](https://github.com/mozilla/fxa-auth-server/commit/8827b91))
* **server:** emit new activity events for kpi dashboards ([ace64e7](https://github.com/mozilla/fxa-auth-server/commit/ace64e7))
* **server:** synthesize device records for sync sessions ([b536fd7](https://github.com/mozilla/fxa-auth-server/commit/b536fd7))
* **signin:** Add support for keyFetchToken verification (#1320), r=@rfk ([10ee322](https://github.com/mozilla/fxa-auth-server/commit/10ee322))

### Refactor

* **openid:** remove openid login support ([8cb651e](https://github.com/mozilla/fxa-auth-server/commit/8cb651e)), closes [#1336](https://github.com/mozilla/fxa-auth-server/issues/1336)



<a name="1.64.0"></a>
# [1.64.0](https://github.com/mozilla/fxa-auth-server/compare/v1.63.0...v1.64.0) (2016-06-23)


### Bug Fixes

* **account:** fix payload typo in device update ([673dd5d](https://github.com/mozilla/fxa-auth-server/commit/673dd5d))
* **config:** improve sign-in confirmation email regex ([33301c5](https://github.com/mozilla/fxa-auth-server/commit/33301c5))
* **logs:** Log the uid when reporting push errors. ([db9e5f4](https://github.com/mozilla/fxa-auth-server/commit/db9e5f4))
* **mail:** Remove the "resend blackout period". ([27082be](https://github.com/mozilla/fxa-auth-server/commit/27082be))
* **metrics:** Monitor for clients sending obsolete contentToken parameter. ([1d58b3e](https://github.com/mozilla/fxa-auth-server/commit/1d58b3e))
* **push:** Avoid blocking event loop when pushing to lots of devices. ([1be85c3](https://github.com/mozilla/fxa-auth-server/commit/1be85c3))
* **tests:** add verify_code tests ([e4eb4d8](https://github.com/mozilla/fxa-auth-server/commit/e4eb4d8))

### Features

* **config:** accept CORS requests from multiple origins ([f792d35](https://github.com/mozilla/fxa-auth-server/commit/f792d35))
* **email:** add verification reminders ([5007b4d](https://github.com/mozilla/fxa-auth-server/commit/5007b4d)), closes [#1081](https://github.com/mozilla/fxa-auth-server/issues/1081)
* **login:** Log an error on login if account has too many active sessions. ([ca9524b](https://github.com/mozilla/fxa-auth-server/commit/ca9524b))
* **metrics:** add metrics for reminder queries ([aca4185](https://github.com/mozilla/fxa-auth-server/commit/aca4185))
* **push:** Log an error if pushing notifications to too many active devices. ([5b81e10](https://github.com/mozilla/fxa-auth-server/commit/5b81e10))
* **signin:** Add regex for enabling signin confirmation (#1290) r=pbooth ([fa02ee8](https://github.com/mozilla/fxa-auth-server/commit/fa02ee8))

### Refactor

* **tests:** eliminate duplicate setup in local route tests ([e8cd5df](https://github.com/mozilla/fxa-auth-server/commit/e8cd5df))

### chore

* **changelog:** Generate changelog for v1.63.0 release ([0ca8367](https://github.com/mozilla/fxa-auth-server/commit/0ca8367))
* **deps:** Update to latest version of mozlog ([aa3b4e7](https://github.com/mozilla/fxa-auth-server/commit/aa3b4e7)), closes [#1279](https://github.com/mozilla/fxa-auth-server/issues/1279)
* **nsp:** update .nsprc and travis.yml ([9d047b5](https://github.com/mozilla/fxa-auth-server/commit/9d047b5)), closes [#1295](https://github.com/mozilla/fxa-auth-server/issues/1295)
* **shrinkwrap:** update fxa-auth-mailer ([1ced8c9](https://github.com/mozilla/fxa-auth-server/commit/1ced8c9))



<a name="1.63.0"></a>
## [1.63.0](https://github.com/mozilla/fxa-auth-server/compare/v1.62.1...v1.63.0) (2016-06-06)


### Bug Fixes

* **api:** remove device registration from signup/login endpoints ([21ad7f3](https://github.com/mozilla/fxa-auth-server/commit/21ad7f3))
* **e2e-email:** fix e2e-email for all locales ([0250e50](https://github.com/mozilla/fxa-auth-server/commit/0250e50))
* **mail:** Remove the "resend blackout period". ([27082be](https://github.com/mozilla/fxa-auth-server/commit/27082be))
* **push:** add verification push event to push log ([e5d609a](https://github.com/mozilla/fxa-auth-server/commit/e5d609a))
* **verify:** Only send post-verify email when service=sync ([e0cacf8](https://github.com/mozilla/fxa-auth-server/commit/e0cacf8))

### chore

* **deps:** Update to latest version of fxa-auth-mailer ([bc1ae49](https://github.com/mozilla/fxa-auth-server/commit/bc1ae49))
* **git:** Run a quick linting task on pre-push ([0c8767a](https://github.com/mozilla/fxa-auth-server/commit/0c8767a))

### Features

* **device:** emit create and delete events to SNS ([c90e44e](https://github.com/mozilla/fxa-auth-server/commit/c90e44e)), closes [#1186](https://github.com/mozilla/fxa-auth-server/issues/1186)
* **devices:** notify a device when it has been disconnected ([fcb9e80](https://github.com/mozilla/fxa-auth-server/commit/fcb9e80)), closes [#1139](https://github.com/mozilla/fxa-auth-server/issues/1139)
* **devices:** notify other devices of a new device ([6ed2697](https://github.com/mozilla/fxa-auth-server/commit/6ed2697)), closes [#1250](https://github.com/mozilla/fxa-auth-server/issues/1250)
* **events:** Include metrics context in SQS events ([d5dc75b](https://github.com/mozilla/fxa-auth-server/commit/d5dc75b))
* **metrics:** Log metrics about whether metrics are transmitted correctly. ([c4119f1](https://github.com/mozilla/fxa-auth-server/commit/c4119f1))
* **signin:** Updated password/change/finish and account/reset ([333451e](https://github.com/mozilla/fxa-auth-server/commit/333451e))



<a name="1.62.1"></a>
## [1.62.1](https://github.com/mozilla/fxa-auth-server/compare/v1.62.0...v1.62.1) (2016-05-20)


### Bug Fixes

* **deps:** Update to auth-db-mysql train-62 ([685054d](https://github.com/mozilla/fxa-auth-server/commit/685054d))



<a name="1.62.0"></a>
# [1.62.0](https://github.com/mozilla/fxa-auth-server/compare/v1.61.0...v1.62.0) (2016-05-19)


### Bug Fixes

* **clientAddress:** Cope better with X-Forwarded-For having fewer items than expected. ([fd85359](https://github.com/mozilla/fxa-auth-server/commit/fd85359))
* **push:** adjust metrics increment logs ([8120c76](https://github.com/mozilla/fxa-auth-server/commit/8120c76)), closes [#1253](https://github.com/mozilla/fxa-auth-server/issues/1253)

### Features

* **errors:** Add API and docs for new "request blocked" errno 125. ([d7edef8](https://github.com/mozilla/fxa-auth-server/commit/d7edef8))
* **locale:** add Arabic locale support ([a13e32a](https://github.com/mozilla/fxa-auth-server/commit/a13e32a))
* **locale:** add Finnish locale ([8646591](https://github.com/mozilla/fxa-auth-server/commit/8646591))
* **push:** document the format of the push payloads ([9fa65ce](https://github.com/mozilla/fxa-auth-server/commit/9fa65ce))
* **push:** Prepare codebase for data payloads ([b60c464](https://github.com/mozilla/fxa-auth-server/commit/b60c464))

### Refactor

* **reset:** Adds sessionToken as an optional param for /account/reset (#1265) ([8b796b3](https://github.com/mozilla/fxa-auth-server/commit/8b796b3))



<a name="1.61.0"></a>
# [1.61.0](https://github.com/mozilla/fxa-auth-server/compare/v1.60.0...v1.61.0) (2016-05-04)


### Bug Fixes

* **device:** Restrict device name to display-safe unicode characters ([79acb18](https://github.com/mozilla/fxa-auth-server/commit/79acb18))
* **devices:** Avoid spurious writes to device record if nothing has changed ([4330f2d](https://github.com/mozilla/fxa-auth-server/commit/4330f2d))
* **push:** Disallow storing of public-key values until we're ready to use them. ([12265c3](https://github.com/mozilla/fxa-auth-server/commit/12265c3))
* **tests:** Fix typo in test name ([dbc0de0](https://github.com/mozilla/fxa-auth-server/commit/dbc0de0))

### Features

* **devices:** Add metrics on device updates, and a flag to disable them ([af748be](https://github.com/mozilla/fxa-auth-server/commit/af748be))
* **log:** includes uid in summary for account create and login ([1232f95](https://github.com/mozilla/fxa-auth-server/commit/1232f95)), closes [#1225](https://github.com/mozilla/fxa-auth-server/issues/1225)
* **mailer:** Add "re-confirm your email" templates. ([f7508cb](https://github.com/mozilla/fxa-auth-server/commit/f7508cb))
* **push:** Add event logging for password changes and resets. ([0db73f5](https://github.com/mozilla/fxa-auth-server/commit/0db73f5))
* **push:** Notify devices when the password is changed or reset. ([77e53bf](https://github.com/mozilla/fxa-auth-server/commit/77e53bf))

### chore

* **nsp:** Update convict, add .nsprc file to silence some NSP warnings ([038f46e](https://github.com/mozilla/fxa-auth-server/commit/038f46e))



<a name="1.60.0"></a>
# [1.60.0](https://github.com/mozilla/fxa-auth-server/compare/v1.59.0...v1.60.0) (2016-04-19)


### Bug Fixes

* **bulk-mailer:** Remove the locale prefix on filenames w/ --write ([1c0959d](https://github.com/mozilla/fxa-auth-server/commit/1c0959d))
* **bulk-mailer:** Set error rate to 0, we are done testing. ([897de10](https://github.com/mozilla/fxa-auth-server/commit/897de10))
* **clientAddress:** allow location of the client ip address in forward headers to be specified in co ([517fbff](https://github.com/mozilla/fxa-auth-server/commit/517fbff))
* **customs:** Check more password-related actions with customs-server. ([8ceedb6](https://github.com/mozilla/fxa-auth-server/commit/8ceedb6))
* **deps:** fix node-uap commit sha ([e2aa184](https://github.com/mozilla/fxa-auth-server/commit/e2aa184))
* **email:** Add feature-flag for new-login notification email. ([3d4d5f9](https://github.com/mozilla/fxa-auth-server/commit/3d4d5f9))
* **email:** Point to latest auth-mailer ([17123ee](https://github.com/mozilla/fxa-auth-server/commit/17123ee))
* **email:** reinstate new sync device emails ([93a78de](https://github.com/mozilla/fxa-auth-server/commit/93a78de))
* **email:** send additional template data for new-login email. ([177e192](https://github.com/mozilla/fxa-auth-server/commit/177e192))
* **must-reset:** exit code 1 on reset account error ([c100a48](https://github.com/mozilla/fxa-auth-server/commit/c100a48))
* **tests:** Build and test fixes for latest fxa-auth-mailer update. ([493f917](https://github.com/mozilla/fxa-auth-server/commit/493f917))

### Features

* **bulk-mailer:** `--errors` and `--unsent` now have defaults. ([eec2e72](https://github.com/mozilla/fxa-auth-server/commit/eec2e72))
* **customs:** include errno in customs flags and merge fixes ([3dcdaf8](https://github.com/mozilla/fxa-auth-server/commit/3dcdaf8))
* **reset:** Ability to put a users account in a "must reset" state, per dannycoates (PATCH) ([d7638a6](https://github.com/mozilla/fxa-auth-server/commit/d7638a6))
* **scripts:** Add a bulk mailer ([296f152](https://github.com/mozilla/fxa-auth-server/commit/296f152))

### chore

* **bulk-mailer:** Settle on the "password_reset_required" template ([f02e292](https://github.com/mozilla/fxa-auth-server/commit/f02e292))
* **bulk-mailer:** Stop all processing on error. ([de8e355](https://github.com/mozilla/fxa-auth-server/commit/de8e355))
* **convict:** use convict .getProperties(), not deprecated .root() ([4fa61c0](https://github.com/mozilla/fxa-auth-server/commit/4fa61c0))
* **customs:** use named error constant for UNEXPECTED_ERROR ([d417644](https://github.com/mozilla/fxa-auth-server/commit/d417644))
* **docs:** Add more docs to the reset-send-batch script. ([107062a](https://github.com/mozilla/fxa-auth-server/commit/107062a))



<a name="1.59.0"></a>
# [1.59.0](https://github.com/mozilla/fxa-auth-server/compare/v1.58.1...v1.59.0) (2016-03-28)


### Bug Fixes

* **email:** Clean up accounts with invalid emails on status poll. ([5233391](https://github.com/mozilla/fxa-auth-server/commit/5233391))

### Features

* **logging:** add metrics context metadata to activity events ([09d3851](https://github.com/mozilla/fxa-auth-server/commit/09d3851))
* **metrics:** track push email status checks ([eb3920e](https://github.com/mozilla/fxa-auth-server/commit/eb3920e)), closes [#1220](https://github.com/mozilla/fxa-auth-server/issues/1220)

### Reverts

* **metrics:** disable logging hask skew to datadog ([7a1bc82](https://github.com/mozilla/fxa-auth-server/commit/7a1bc82)), closes [#1215](https://github.com/mozilla/fxa-auth-server/issues/1215)

### chore

* **changelog:** Remove duplicate changelog entries ([18b8899](https://github.com/mozilla/fxa-auth-server/commit/18b8899))
* **shrinkwrap:** bump to auth-mailer#f4098f9 and content-l10n#b61acfa and no other changes ([72b5d55](https://github.com/mozilla/fxa-auth-server/commit/72b5d55))
* **shrinkwrap:** bump to fxa-auth-db-mysql#v0.59.0 ([bf01283](https://github.com/mozilla/fxa-auth-server/commit/bf01283))



<a name="1.58.1"></a>
## [1.58.1](https://github.com/mozilla/fxa-auth-server/compare/v1.58.0...v1.58.1) (2016-03-17)


### chore

* **deps:** fix shrinkwrap for latest auth-db-mysql version ([2880e67](https://github.com/mozilla/fxa-auth-server/commit/2880e67))


<a name="1.58.0"></a>
# [1.58.0](https://github.com/mozilla/fxa-auth-server/compare/v1.57.0...v1.58.0) (2016-03-17)


### Bug Fixes

* **api:** permit null lastAccessTime in devices response ([474032d](https://github.com/mozilla/fxa-auth-server/commit/474032d))
* **api:** reject emails without a dot in the domain ([434e460](https://github.com/mozilla/fxa-auth-server/commit/434e460))
* **tests:** sanely handle unicode email addresses in account tests ([71e4126](https://github.com/mozilla/fxa-auth-server/commit/71e4126))

### chore

* **api:** Add signin config value ([0beade7](https://github.com/mozilla/fxa-auth-server/commit/0beade7))



<a name="1.57.1"></a>
## [1.57.1](https://github.com/mozilla/fxa-auth-server/compare/v1.57.0...v1.57.1) (2016-03-04)


### Bug Fixes
* **email:** Restrict unicode chars allowed in email addresses. ([81a42de](https://github.com/mozilla/fxa-auth-server/commit/81a42de))



<a name="1.57.0"></a>
# [1.57.0](https://github.com/mozilla/fxa-auth-server/compare/v1.56.0...v1.57.0) (2016-03-01)


### Bug Fixes

* **api:** permit lastAccessTime 0 in devices response ([4059323](https://github.com/mozilla/fxa-auth-server/commit/4059323))
* **bounces:** Cope with quoted email addresses in bounce notifications. ([9b976e7](https://github.com/mozilla/fxa-auth-server/commit/9b976e7))
* **config:** adjust localized post-verification links ([c7c73c9](https://github.com/mozilla/fxa-auth-server/commit/c7c73c9))
* **deps:** Migrate to more up-to-date user-agent parsing lib. ([8106c8b](https://github.com/mozilla/fxa-auth-server/commit/8106c8b))
* **e2e-email:** fix expected link s@/en-US/firefox/sync/@/firefox/sync/@ ([5396868](https://github.com/mozilla/fxa-auth-server/commit/5396868))
* **logging:** Remove PII from logged error object details. ([9e4bcde](https://github.com/mozilla/fxa-auth-server/commit/9e4bcde))
* **push:** add TTL to push requests ([ed98cc6](https://github.com/mozilla/fxa-auth-server/commit/ed98cc6)), closes [#1187](https://github.com/mozilla/fxa-auth-server/issues/1187)

### Features

* **api:** Add get account status by email endpoint ([5d7ca53](https://github.com/mozilla/fxa-auth-server/commit/5d7ca53))
* **devices:** added fxa-deviceId to the signed certificate ([a866e8f](https://github.com/mozilla/fxa-auth-server/commit/a866e8f))
* **logging:** Log hawk timestamp skew to statsd for easier analysis. ([0c153fb](https://github.com/mozilla/fxa-auth-server/commit/0c153fb))

### Refactor

* **bounces:** Make bounce-handling code testable, add some tests. ([a1da228](https://github.com/mozilla/fxa-auth-server/commit/a1da228))
* **errors:** Define named constants for errno values. ([8680d22](https://github.com/mozilla/fxa-auth-server/commit/8680d22))
* **tests:** Use a shared helper function for mocking out logging. ([52dc521](https://github.com/mozilla/fxa-auth-server/commit/52dc521))

### chore

* **dependencies:** upgrade mozlog to 2.0.3 ([afa5926](https://github.com/mozilla/fxa-auth-server/commit/afa5926))
* **shrinkwrap:** update fxa-content-server-l10n to 4bf305a1 ([efeef25](https://github.com/mozilla/fxa-auth-server/commit/efeef25))
* **test:** no need to test with node v0.12 ([3ae34da](https://github.com/mozilla/fxa-auth-server/commit/3ae34da))



<a name="1.56.0"></a>
# [1.56.0](https://github.com/mozilla/fxa-auth-server/compare/v1.55.1...v1.56.0) (2016-02-11)


### Bug Fixes

* **config:** Pass 'options.extra.email' to hapi-fxa-oauth, not 'options.email'. ([68572fa](https://github.com/mozilla/fxa-auth-server/commit/68572fa))
* **e2e-email:** adjust expected query arguments for auth-mailer#118 ([b8b345c](https://github.com/mozilla/fxa-auth-server/commit/b8b345c))
* **hawk:** Update to latest hapi-auth-hawk ([078ddc0](https://github.com/mozilla/fxa-auth-server/commit/078ddc0))
* **tests:** Update tests for new fxa-auth-mailer behaviour ([0f25ddd](https://github.com/mozilla/fxa-auth-server/commit/0f25ddd))

### Features

* **config:** Add 'oauth.keepAlive' config option. ([f8abfe2](https://github.com/mozilla/fxa-auth-server/commit/f8abfe2))
* **push:** respond to 400 level errors from the push server by clearing device push info ([b37dc91](https://github.com/mozilla/fxa-auth-server/commit/b37dc91)), closes [#1151](https://github.com/mozilla/fxa-auth-server/issues/1151)

### chore

* **e2e-email:** bg is now translated for 'Firefox Account Verified' ([e5baead](https://github.com/mozilla/fxa-auth-server/commit/e5baead))
* **shrinkwrap:** update shrinkwrap to pick up fxa-auth-mailer#01f8ee75 ([64ca8c0](https://github.com/mozilla/fxa-auth-server/commit/64ca8c0))



<a name="1.55.1"></a>
## [1.55.1](https://github.com/mozilla/fxa-auth-server/compare/v1.55.0...v1.55.1) (2016-01-31)


### Bug Fixes

* **sessiontokens:** effectively disable sessionToken updates ([8c9597d](https://github.com/mozilla/fxa-auth-server/commit/8c9597d))



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
