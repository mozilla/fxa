<a name="0.71.0"></a>
# [0.71.0](https://github.com/mozilla/fxa-profile-server/compare/v0.70.0...v0.71.0) (2016-10-05)


### Bug Fixes

* **config:** Add env key to required config variables ([232480f](https://github.com/mozilla/fxa-profile-server/commit/232480f))
* **config:** Add env key to required config variables (#211) r=vladikoff ([3ad6ae6](https://github.com/mozilla/fxa-profile-server/commit/3ad6ae6))
* **deps:** downgrade to hapi 14 (#213) r=vladikoff ([2df72b6](https://github.com/mozilla/fxa-profile-server/commit/2df72b6))
* **deps:** update to latest hapi, joi and boom. requires node 4+ ([d975d21](https://github.com/mozilla/fxa-profile-server/commit/d975d21))



<a name="0.70.0"></a>
# [0.70.0](https://github.com/mozilla/fxa-profile-server/compare/v0.69.0...v0.70.0) (2016-09-21)


### Bug Fixes

* **log:** add remoteAddressChain to summary (#208) r=jrgm ([05ae545](https://github.com/mozilla/fxa-profile-server/commit/05ae545))



<a name="0.68.0"></a>
# [0.68.0](https://github.com/mozilla/fxa-profile-server/compare/v0.67.1...v0.68.0) (2016-08-24)


### Features

* **customs:** turn off customs until server support, update tests (#206) ([629fb31](https://github.com/mozilla/fxa-profile-server/commit/629fb31))
* **server:** rate limit avatar uploads (#201) r=vladikoff ([954c1a1](https://github.com/mozilla/fxa-profile-server/commit/954c1a1)), closes [#132](https://github.com/mozilla/fxa-profile-server/issues/132)



<a name="0.67.1"></a>
## [0.67.1](https://github.com/mozilla/fxa-profile-server/compare/v0.67.0...v0.67.1) (2016-08-10)


### Bug Fixes

* **tests:** fix docker racing tests ([d50aa7f](https://github.com/mozilla/fxa-profile-server/commit/d50aa7f))

### chore

* **docs:** add circleci badge ([ba1ecb4](https://github.com/mozilla/fxa-profile-server/commit/ba1ecb4))



<a name="0.67.0"></a>
## 0.67.0 (2016-08-10)


### Bug Fixes

* **config:** Add production as allowed environment ([ceec964](https://github.com/mozilla/fxa-profile-server/commit/ceec964))
* **config:** Add production as allowed environment in code ([c8c1c22](https://github.com/mozilla/fxa-profile-server/commit/c8c1c22))
* **config:** only allow https gravatars (#204) ([08b44fa](https://github.com/mozilla/fxa-profile-server/commit/08b44fa))
* **config:** Quoting syntax ([2eb7235](https://github.com/mozilla/fxa-profile-server/commit/2eb7235))
* **deps:** update dev dependencies ([37e73bc](https://github.com/mozilla/fxa-profile-server/commit/37e73bc))
* **deps:** updating prod dependencies ([0138ffa](https://github.com/mozilla/fxa-profile-server/commit/0138ffa))
* **dev:** stop all child servers if one crashes ([0922c16](https://github.com/mozilla/fxa-profile-server/commit/0922c16))
* **docker:** Output version.json in RPMflow and Dockerflow compatible locations ([2648593](https://github.com/mozilla/fxa-profile-server/commit/2648593))

### chore

* **config:** Remove unused git key from config ([548937a](https://github.com/mozilla/fxa-profile-server/commit/548937a))
* **deps:** Update Dockerfile to node@0.10.46 ([1ce332c](https://github.com/mozilla/fxa-profile-server/commit/1ce332c))
* **release:** bump version with 'grunt version' (#200) r=jrgm,vbudhram ([1fe5765](https://github.com/mozilla/fxa-profile-server/commit/1fe5765)), closes [#73](https://github.com/mozilla/fxa-profile-server/issues/73)

### Features

* **docker:** Add npm scripts for starting web server & worker ([98e3374](https://github.com/mozilla/fxa-profile-server/commit/98e3374))
* **docker:** Switch to exec so signals get passed through correctly ([34ba601](https://github.com/mozilla/fxa-profile-server/commit/34ba601))



<a name="0.63.0"></a>
## 0.63.0 (2016-06-02)


#### Bug Fixes

* **docker:**
  * Back to the original login config ([a9a0ab4c](https://github.com/mozilla/fxa-profile-server/commit/a9a0ab4c82eb88152ecf5b07c2c1d7f94e51c9c0))
  * Docker login still requires email ([65b8dd12](https://github.com/mozilla/fxa-profile-server/commit/65b8dd1263f0ecf61bda6a60f57612e9af5418a1))
  * Login to Docker Hub ([90df64a0](https://github.com/mozilla/fxa-profile-server/commit/90df64a0d26c7e9ce5a7d2b4ba715766d04d9039))
  * Quote environment variables ([5632c3d0](https://github.com/mozilla/fxa-profile-server/commit/5632c3d02c011645ff189fd6bc29cdbae34de861))
  * Replace "commit" with "hash" ([058edccf](https://github.com/mozilla/fxa-profile-server/commit/058edccff4adf981e7412c2520b51a8494f75e03))
  * Display version.json in CircleCI output ([b39e7658](https://github.com/mozilla/fxa-profile-server/commit/b39e76584e31b1a404e139ed59ea60750e998b3a))
  * Re-order directory creation ([660d61b2](https://github.com/mozilla/fxa-profile-server/commit/660d61b2fa1f8d5bad81c990ac389ae4ddedbcbd))
  * Copy pre-install script before running install ([b7139363](https://github.com/mozilla/fxa-profile-server/commit/b7139363649b6d0f3ccc177e1beb346cf8dd0837))


#### Features

* **docker:**
  * Add CloudOps Dockerfile & CircleCI build instructions ([b18c78f7](https://github.com/mozilla/fxa-profile-server/commit/b18c78f71688719608bacac3d6198915755516c0))
  * Add /__lbheartbeat__ endpoint for Dockerflow compatibility ([d4f3863d](https://github.com/mozilla/fxa-profile-server/commit/d4f3863d2eb98cea26463d7e53c681f305e74f04))


<a name="0.61.0"></a>
## 0.61.0 (2016-05-04)


#### Bug Fixes

* **avatars:** protect graphicsmagick from CVE-2016-3714 ([51d35cd5](https://github.com/mozilla/fxa-profile-server/commit/51d35cd5adf8e263182156aef2f0dd4c2080a54d))


<a name="0.59.0"></a>
## 0.59.0 (2016-03-30)


<a name="0.57.0"></a>
## 0.57.0 (2016-03-05)


#### Bug Fixes

* **display_name:** Disallow astral characters in display_name. ([b2c9e1d6](https://github.com/mozilla/fxa-profile-server/commit/b2c9e1d6076f735951c30871296b8b966fd246e0))


#### Features

* **docker:** Additional Dockerfile for self-hosting ([f493869b](https://github.com/mozilla/fxa-profile-server/commit/f493869bcdae79a3254e5df5e3a2e4692976e678))


<a name="0.53.1"></a>
### 0.53.1 (2016-01-13)


#### Bug Fixes

* **server:** profile scope is more selectively inserted into routes ([30f20073](https://github.com/mozilla/fxa-profile-server/commit/30f20073bf309254257d0c3b13adcc477fea54a4))


<a name="0.53.0"></a>
## 0.53.0 (2016-01-04)


#### Bug Fixes

* **travis:** build and test on 0.10, 0.12 and 4.x ([41acdda1](https://github.com/mozilla/fxa-profile-server/commit/41acdda191b8c87744203d700a589d621fae0601))


#### Features

* **openid:** make /v1/profile act as the OIDC UserInfo endpoint ([a86d0d4d](https://github.com/mozilla/fxa-profile-server/commit/a86d0d4d3113e4529712cd66ab89855f4299d145), closes [#175](https://github.com/mozilla/fxa-profile-server/issues/175))


<a name="0.50.1"></a>
### 0.50.1 (2015-12-01)


#### Bug Fixes

* **email:** improve handling of 4XX errors from auth server. ([835f7244](https://github.com/mozilla/fxa-profile-server/commit/835f72442b81429c84e8a7cfb9cbb635d9e525d0))


<a name="0.50.0"></a>
## 0.50.0 (2015-11-18)


#### Bug Fixes

* **build:**
  * add grunt-nsp ([6a62bdfe](https://github.com/mozilla/fxa-profile-server/commit/6a62bdfe06f95e584e2b3e705abb35d819bb9b7e), closes [#161](https://github.com/mozilla/fxa-profile-server/issues/161))
  * remove shrinkwrap validate ([db93e4e0](https://github.com/mozilla/fxa-profile-server/commit/db93e4e0a971e9fc7bffbcaf24d92d4dc0f68b5c))
* **config:** adjust lib gm limits for aws ([daff6c6f](https://github.com/mozilla/fxa-profile-server/commit/daff6c6fc1d3905b0718a55c8cc33945bd208023), closes [#167](https://github.com/mozilla/fxa-profile-server/issues/167))
* **mysql:** fix patcher version check to enforce patch >= n ([8db250f7](https://github.com/mozilla/fxa-profile-server/commit/8db250f7f10c4ceb5083898812cd9c8467d5616e), closes [#131](https://github.com/mozilla/fxa-profile-server/issues/131))
* **server:** set nodejs/request maxSockets to Infinity ([65efc72c](https://github.com/mozilla/fxa-profile-server/commit/65efc72ca615fc8f9f03ff697c483fc619bc4ede), closes [#102](https://github.com/mozilla/fxa-profile-server/issues/102))
* **upload:** add gm image identification ([55b0744e](https://github.com/mozilla/fxa-profile-server/commit/55b0744e68d672d2385d8ef51a97072c19e777bd), closes [#96](https://github.com/mozilla/fxa-profile-server/issues/96))
* **worker:** disable gzip encoding on requests to local worker ([40dfefd5](https://github.com/mozilla/fxa-profile-server/commit/40dfefd5fd66942057a9f532b7f6060b62484a7f), closes [#98](https://github.com/mozilla/fxa-profile-server/issues/98))


#### Features

* **email:**
  * fetch email from auth-server /account/profile ([aa3a140b](https://github.com/mozilla/fxa-profile-server/commit/aa3a140bc1bb3b47bada13c29e5c85c4850f77db), closes [#165](https://github.com/mozilla/fxa-profile-server/issues/165))
  * fetch email from auth-server /account/profile ([cc706457](https://github.com/mozilla/fxa-profile-server/commit/cc70645763332ab6b16acf5e122a1c82ce9831a1), closes [#165](https://github.com/mozilla/fxa-profile-server/issues/165))


<a name="0.49.0"></a>
## 0.49.0 (2015-11-03)


#### Bug Fixes

* **avatars:** graphicsmagick processing limits ([93edc141](https://github.com/mozilla/fxa-profile-server/commit/93edc14170d0acb1d47f1d6ec3bf8d5948d6e2e5), closes [#57](https://github.com/mozilla/fxa-profile-server/issues/57))


<a name="0.48.0"></a>
## 0.48.0 (2015-10-20)


#### Bug Fixes

* **avatars:** add configuration to adjust avatar upload size ([bc86f168](https://github.com/mozilla/fxa-profile-server/commit/bc86f16887d8ebc52125f4ed3a1e507e12924bac), closes [#158](https://github.com/mozilla/fxa-profile-server/issues/158))
* **server:** prevent null exception when oauth server is down ([cf1dc35d](https://github.com/mozilla/fxa-profile-server/commit/cf1dc35dfb6e5b10e786ccbc1efede8834aac549), closes [#151](https://github.com/mozilla/fxa-profile-server/issues/151))


<a name="0.47.0"></a>
## 0.47.0 (2015-10-07)


#### Features

* **display_name:** return 204 if user does not have a display name ([544e3323](https://github.com/mozilla/fxa-profile-server/commit/544e3323c6401d2c24625eb9a4114539cb36dbcc), closes [#144](https://github.com/mozilla/fxa-profile-server/issues/144))


<a name="0.46.0"></a>
## 0.46.0 (2015-09-23)


#### Features

* **logging:** add avatar.get activity event ([18cc9b93](https://github.com/mozilla/fxa-profile-server/commit/18cc9b9318c75fbb494faba9f917a422b7945d14), closes [#146](https://github.com/mozilla/fxa-profile-server/issues/146))


<a name="0.45.0"></a>
## 0.45.0 (2015-09-11)


#### Bug Fixes

* **run_dev:** add rimraf dependency back ([29c076d6](https://github.com/mozilla/fxa-profile-server/commit/29c076d61588ca660e7fc67c03204109371967a5), closes [#138](https://github.com/mozilla/fxa-profile-server/issues/138))
* **version:** use explicit path with git-config ([aa6535f2](https://github.com/mozilla/fxa-profile-server/commit/aa6535f2c40acba9b5a1acabd9745f9cc3bd3385))


<a name="0.44.0"></a>
## 0.44.0 (2015-08-26)


#### Bug Fixes

* **config:** add options events.region and events.queueUrl ([4c3c4135](https://github.com/mozilla/fxa-profile-server/commit/4c3c41357f595ad8fd44c52cbec05b7d696df9f7))
* **display_name:** Don't allow control characters in the display_name field. ([5b9e20d2](https://github.com/mozilla/fxa-profile-server/commit/5b9e20d224c4662db62b635398beb633dc5615ff), closes [#126](https://github.com/mozilla/fxa-profile-server/issues/126))
* **server:** return errno 104 if oauth server is drunk ([3bd6b14d](https://github.com/mozilla/fxa-profile-server/commit/3bd6b14d29d47751bebdb12ef506c6bf1a140241), closes [#121](https://github.com/mozilla/fxa-profile-server/issues/121))


#### Features

* **events:** add events to delete user data when account is deleted ([79d98a3d](https://github.com/mozilla/fxa-profile-server/commit/79d98a3d5e3ef94c326ad72a42f6f3ea60f73b3b), closes [#127](https://github.com/mozilla/fxa-profile-server/issues/127))


<a name="0.42.0"></a>
## 0.42.0 (2015-07-22)


#### Bug Fixes

* **display_name:** allow a blank display name ([e27223dd](https://github.com/mozilla/fxa-profile-server/commit/e27223ddcbb997cb9465466be763ed93de83b363))


<a name"0.39.0"></a>
## 0.39.0 (2015-06-10)


#### Features

* **avatar:** Add etag to the profile avatar API endpoint ([07569c5d](https://github.com/mozilla/fxa-profile-server/commit/07569c5d))
* **profile:** add etag to profile API endpoint ([dcf1bb64](https://github.com/mozilla/fxa-profile-server/commit/dcf1bb64))


<a name="0.36.0"></a>
## 0.36.0 (2015-04-30)


#### Bug Fixes

* **db:** race condition when asking for db multiple times at startup ([1bc2cae5](https://github.com/mozilla/fxa-profile-server/commit/1bc2cae55a065d5d979dd5e4494e51c3492c4e2f))


#### Features

* **profile:** return all /profile pieces that scopes allow ([35a4875f](https://github.com/mozilla/fxa-profile-server/commit/35a4875f868d5695d455e382673aba8db4586b91), closes [#108](https://github.com/mozilla/fxa-profile-server/issues/108))


<a name"0.35.0"></a>
## 0.35.0 (2015-04-13)


#### Bug Fixes

* **changelog:** set package.json repository correctly so conventional-changelog creates valid UR ([17100542](https://github.com/mozilla/fxa-profile-server/commit/17100542))
* **test:**
  * set maxSockets to Infinity for real ([d2795966](https://github.com/mozilla/fxa-profile-server/commit/d2795966))
  * expect new default size of 200x200 ([18f130f9](https://github.com/mozilla/fxa-profile-server/commit/18f130f9))


#### Features

* **displayName:** add a profile table with a displayName field ([ad6488eb](https://github.com/mozilla/fxa-profile-server/commit/ad6488eb))
* **mysql:** use mysql patcher to allow incremental schema updates ([2fbfbbda](https://github.com/mozilla/fxa-profile-server/commit/2fbfbbda))


<a name="0.33.0"></a>
## 0.33.0 (2015-03-16)


#### Bug Fixes

* **docs:** note "avatar" field in /v1/profile response ([0698d434](https://github.com/mozilla/fxa-profile-server/commit/0698d434ff1bc147d1676ce0b94c0ff832feba39))


#### Features

* **avatar:** add support for multiple image sizes ([187b0766](https://github.com/mozilla/fxa-profile-server/commit/187b07664882d5fdb16b4bd374baa5b5d3e2d274), closes [#68](https://github.com/mozilla/fxa-profile-server/issues/68), [#89](https://github.com/mozilla/fxa-profile-server/issues/89))
* **test:**
  * in load test, make image deletion optional ([b388fb62](https://github.com/mozilla/fxa-profile-server/commit/b388fb62fa2b9cd05a094871c401daa37d8c0765))
  * in load test, add delete after download ([4a433260](https://github.com/mozilla/fxa-profile-server/commit/4a433260f63516ee89aaaa31f9f21cb91882f851))


<a name="0.31.0"></a>
## 0.31.0 (2015-02-17)


#### Features

* **docker:** Dockerfile and README update for basic docker development workflow ([d424fb66](https://github.com/mozilla/fxa-profile-server/commit/d424fb6664f08bb783db4ecdf76bb805113b4485))
* **images:** delete images from s3 when asked to ([ec25152b](https://github.com/mozilla/fxa-profile-server/commit/ec25152b434b4b75939a5184b38210e326dea438))


<a name="0.26.1"></a>
### 0.26.1 (2014-11-17)


#### Bug Fixes

* **avatars:**
  * properly detect and report image upload errors ([902d0e68](https://github.com/mozilla/fxa-profile-server/commit/902d0e68cac6292acfeb8ed61f5708616a785532), closes [#79](https://github.com/mozilla/fxa-profile-server/issues/79))
  * return the profile image id after a post or upload ([85ffefc9](https://github.com/mozilla/fxa-profile-server/commit/85ffefc9d027b08fa923f2d23ff06a7e1153e31b))
* **config:** use ip addresses instead of localhost ([58defb67](https://github.com/mozilla/fxa-profile-server/commit/58defb67d921bce98001285b153ab7178d51245c))
* **logging:**
  * remove spaces from logging op name ([41fad890](https://github.com/mozilla/fxa-profile-server/commit/41fad890dbbb779d0f7b871067a9f6bd5d56cd5c))
  * remove spaces from logging op name in the worker ([290c9ed7](https://github.com/mozilla/fxa-profile-server/commit/290c9ed785dc14ed27936c217132582545c73af0), closes [#77](https://github.com/mozilla/fxa-profile-server/issues/77))


#### Features

* **logging:** use mozlog with heka format ([b27b48bf](https://github.com/mozilla/fxa-profile-server/commit/b27b48bf6116c86353f1523be91d6964a7fb48fd), closes [#71](https://github.com/mozilla/fxa-profile-server/issues/71))
* **server:** enable HSTS maxAge six months ([248e2e48](https://github.com/mozilla/fxa-profile-server/commit/248e2e48f86eaa9e053d26b599f0db2752be7e6c))


#### Breaking Changes

* Both the config and the output for logging has changed.
    Config can be removed, as the defaults are what should be used in
    production.
 ([b27b48bf](https://github.com/mozilla/fxa-profile-server/commit/b27b48bf6116c86353f1523be91d6964a7fb48fd))


<a name="0.26.0"></a>
## 0.26.0 (2014-11-12)


#### Features

* **logging:** use mozlog with heka format ([b27b48bf](https://github.com/mozilla/fxa-profile-server/commit/b27b48bf6116c86353f1523be91d6964a7fb48fd), closes [#71](https://github.com/mozilla/fxa-profile-server/issues/71))


#### Breaking Changes

* Both the config and the output for logging has changed.
    Config can be removed, as the defaults are what should be used in
    production.
 ([b27b48bf](https://github.com/mozilla/fxa-profile-server/commit/b27b48bf6116c86353f1523be91d6964a7fb48fd))


<a name="0.24.0"></a>
## 0.24.0 (2014-10-20)


#### Features

* **server:** enable HSTS maxAge six months ([248e2e48](https://github.com/mozilla/fxa-profile-server/commit/248e2e48f86eaa9e053d26b599f0db2752be7e6c))
