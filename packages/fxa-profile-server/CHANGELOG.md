## 1.148.5

No changes.

## 1.148.4

No changes.

## 1.148.3

No changes.

## 1.148.2

### Other changes

* release: Merge branch 'train-147' into train-148-merge-147 (66e170d45)

## 1.148.1

No changes.

## 1.148.0

### New features

- auth-server: invalidate per-profile cache on subscription changes (c65b89557)

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

### Bug fixes

- build: Add nsp exception to auth and profile servers (63e4708ef)
- build: npm audit fix (4839fcc5e)

## 1.146.4

No changes.

## 1.146.3

No changes.

## 1.146.2

No changes.

## 1.146.1

No changes.

## 1.146.0

### New features

- profile-server: offer DELETE /v1/cache/{uid} resource to clear cached profile data (43531c974)

### Other changes

- deps: fxa-profile-server npm audit changes (788c88a8b)

## 1.145.5

No changes.

## 1.145.4

No changes.

## 1.145.3

No changes.

## 1.145.2

No changes.

## 1.145.1

No changes.

## 1.145.0

### Other changes

- deps: remove newrelic step one (675c08924)

## 1.144.4

No changes.

## 1.144.3

No changes.

## 1.144.2

No changes.

## 1.144.1

No changes.

## 1.144.0

No changes.

## 1.143.4

No changes.

## 1.143.3

No changes.

## 1.143.2

No changes.

## 1.143.1

No changes.

## 1.143.0

### Bug fixes

- security: update HSTS to 31536000 (8c49ee21d)

### Other changes

- deps: bump fxa-shared to 1.0.28 (df90697b5)
- ci: Remove CI config from within packages subdir. (66990a8f4)

## 1.142.1

No changes.

## 1.142.0

No changes.

## 1.141.8

No changes.

## 1.141.7

No changes.

## 1.141.6

No changes.

## 1.141.5

No changes.

## 1.141.4

No changes.

## 1.141.3

No changes.

## 1.141.2

### Other changes

- package: manually bump version strings to 1.141.1 (737265b25)

## 1.141.1

No changes.

## 1.141.0

### Other changes

- style: added prettier to fxa-profile-server (6ed4dd58e)

## 1.140.3

No changes.

## 1.140.2

No changes.

## 1.140.1

No changes.

## 1.140.0

No changes.

## 1.139.2

No changes.

## 1.139.1

No changes.

## 1.139.0

No changes.

## 1.138.4

No changes.

## 1.138.3

No changes.

## 1.138.2

No changes.

## 1.138.1

No changes.

## 1.138.0

No changes.

## 1.137.4

No changes.

## 1.137.3

No changes.

## 1.137.2

No changes.

## 1.137.1

No changes.

## 1.137.0

### Bug fixes

- url: base, homepage, bug url updated for all packages in package.json (cee3dc741)
- profile-server: cache invalidation for profile when creds carry newer date (7c27ef765)
- caching: Add Cache-Control header to profile images uploaded to S3 (700d0e89b)

### Other changes

- ui: update default avatars (9a256d20a)

## 1.136.6

No changes.

## 1.136.5

No changes.

## 1.136.4

No changes.

## 1.136.3

No changes.

## 1.136.2

No changes.

## 1.136.1

No changes.

## 1.136.0

### New features

- subscriptions: add APIs to manage subscriptions and report capabilities (de1d4e434)

## 1.135.6

No changes.

## 1.135.5

No changes.

## 1.135.4

No changes.

## 1.135.3

No changes.

## 1.135.2

No changes.

## 1.135.1

No changes.

## 1.135.0

### Other changes

- packages: remove old release tagging scripts and docs (6f168c244)

## 1.134.5

No changes.

## 1.134.4

No changes.

## 1.134.3

No changes.

## 1.134.2

No changes.

<a name="1.133.0"></a>

# [1.133.0](https://github.com/mozilla/fxa-profile-server/compare/v1.132.0...v1.133.0) (2019-03-19)

### Bug Fixes

- **logs:** unwrap nested errors in img-worker log ([1b2d581](https://github.com/mozilla/fxa-profile-server/commit/1b2d581))

### chore

- **package:** update shrinkwrap ([3a1b8de](https://github.com/mozilla/fxa-profile-server/commit/3a1b8de))

<a name="1.132.0"></a>

# [1.132.0](https://github.com/mozilla/fxa-profile-server/compare/v1.131.0...v1.132.0) (2019-03-05)

### chore

- **deps:** update deps to fix nsp warnings ([e2f3ef5](https://github.com/mozilla/fxa-profile-server/commit/e2f3ef5))

<a name="1.131.0"></a>

# [1.131.0](https://github.com/mozilla/fxa-profile-server/compare/v1.129.0...v1.131.0) (2019-02-21)

### Features

- **config:** Added the option to disable the requirement of config.events to be properly set ([c58405d](https://github.com/mozilla/fxa-profile-server/commit/c58405d))

<a name="1.129.0"></a>

# [1.129.0](https://github.com/mozilla/fxa-profile-server/compare/v1.128.0...v1.129.0) (2019-02-01)

### chore

- **deps:** Update Hapi ([74524d6](https://github.com/mozilla/fxa-profile-server/commit/74524d6))

<a name="1.128.0"></a>

# [1.128.0](https://github.com/mozilla/fxa-profile-server/compare/v1.126.0...v1.128.0) (2019-01-09)

### Bug Fixes

- **npm:** update to latest npmshrink ([8c4096d](https://github.com/mozilla/fxa-profile-server/commit/8c4096d))
- **test:** Avoid cross test pollution caused by mutating route objects. ([769d17d](https://github.com/mozilla/fxa-profile-server/commit/769d17d))

### Features

- **node:** switch to node 10 ([270914c](https://github.com/mozilla/fxa-profile-server/commit/270914c))

<a name="1.126.0"></a>

# [1.126.0](https://github.com/mozilla/fxa-profile-server/compare/v1.124.0...v1.126.0) (2018-11-27)

### Bug Fixes

- **audit:** rewrap deps to fix security warnings ([490bd56](https://github.com/mozilla/fxa-profile-server/commit/490bd56)), closes [#354](https://github.com/mozilla/fxa-profile-server/issues/354) [#355](https://github.com/mozilla/fxa-profile-server/issues/355)

### Refactor

- **headers:** remove HPKP headers ([69dfe39](https://github.com/mozilla/fxa-profile-server/commit/69dfe39)), closes [#352](https://github.com/mozilla/fxa-profile-server/issues/352)

<a name="1.124.0"></a>

# [1.124.0](https://github.com/mozilla/fxa-profile-server/compare/v1.123.0...v1.124.0) (2018-10-30)

### Bug Fixes

- **deps:** add filtered npm audit ([2492dd6](https://github.com/mozilla/fxa-profile-server/commit/2492dd6))
- **deps:** Update dependencies to resolve `npm audit` warnings. ([c6d84ee](https://github.com/mozilla/fxa-profile-server/commit/c6d84ee))
- **deps:** update to latest Sinon ([b6cf5d1](https://github.com/mozilla/fxa-profile-server/commit/b6cf5d1)), closes [#316](https://github.com/mozilla/fxa-profile-server/issues/316)

<a name="1.123.0"></a>

# [1.123.0](https://github.com/mozilla/fxa-profile-server/compare/v1.122.0...v1.123.0) (2018-10-16)

### Features

- **profile:** invalidate cache when profileChangedAt is older than id token value ([556a682](https://github.com/mozilla/fxa-profile-server/commit/556a682))
- **profile:** invalidate cache when profileChangedAt is older than id token value (#343), r=@r ([a26db23](https://github.com/mozilla/fxa-profile-server/commit/a26db23))

<a name="1.122.0"></a>

# [1.122.0](https://github.com/mozilla/fxa-profile-server/compare/v1.121.0...v1.122.0) (2018-10-02)

<a name="1.121.0"></a>

# [1.121.0](https://github.com/mozilla/fxa-profile-server/compare/v1.120.0...v1.121.0) (2018-09-18)

### Bug Fixes

- **ci:** remove nsp ([d671905](https://github.com/mozilla/fxa-profile-server/commit/d671905)), closes [#338](https://github.com/mozilla/fxa-profile-server/issues/338) [#339](https://github.com/mozilla/fxa-profile-server/issues/339)

<a name="1.120.0"></a>

# [1.120.0](https://github.com/mozilla/fxa-profile-server/compare/v1.118.0...v1.120.0) (2018-09-06)

<a name="1.119.0"></a>

# [1.119.0](https://github.com/mozilla/fxa-profile-server/compare/v1.118.0...v1.119.0) (2018-08-21)

<a name="1.118.0"></a>

# [1.118.0](https://github.com/mozilla/fxa-profile-server/compare/v1.117.0...v1.118.0) (2018-08-08)

### Features

- **scopes:** Use shared code lib for checking OAuth scopes. (#329) r=@vladikoff ([4602fc8](https://github.com/mozilla/fxa-profile-server/commit/4602fc8))

<a name="1.117.0"></a>

# [1.117.0](https://github.com/mozilla/fxa-profile-server/compare/v1.115.0...v1.117.0) (2018-07-24)

### chore

- **release:** Merge mozilla/train-115 into master r=@shane-tomlinson ([d30540f](https://github.com/mozilla/fxa-profile-server/commit/d30540f))

<a name="1.116.0"></a>

# [1.116.0](https://github.com/mozilla/fxa-profile-server/compare/v1.115.0...v1.116.0) (2018-07-11)

### chore

- **release:** Merge mozilla/train-115 into master r=@shane-tomlinson ([d30540f](https://github.com/mozilla/fxa-profile-server/commit/d30540f))

<a name="1.115.0"></a>

# [1.115.0](https://github.com/mozilla/fxa-profile-server/compare/v1.114.1...v1.115.0) (2018-06-27)

### Bug Fixes

- **docs:** Include "displayName" in example profile response. (#326) r=@vladikoff,@eoger ([b3b7e90](https://github.com/mozilla/fxa-profile-server/commit/b3b7e90)), closes [#325](https://github.com/mozilla/fxa-profile-server/issues/325)

### Features

- **ci:** migrate to CircleCI 2 (#321) r=@jbuck ([56e8d1e](https://github.com/mozilla/fxa-profile-server/commit/56e8d1e))

<a name="1.114.1"></a>

## [1.114.1](https://github.com/mozilla/fxa-profile-server/compare/v1.114.0...v1.114.1) (2018-06-13)

### Bug Fixes

- **docker:** base image node:8-alpine and upgrade to npm6 ([9d2dc18](https://github.com/mozilla/fxa-profile-server/commit/9d2dc18))

<a name="1.114.0"></a>

# [1.114.0](https://github.com/mozilla/fxa-profile-server/compare/v1.113.0...v1.114.0) (2018-06-13)

<a name="1.113.0"></a>

# [1.113.0](https://github.com/mozilla/fxa-profile-server/compare/v1.112.0...v1.113.0) (2018-05-30)

<a name="1.112.0"></a>

# [1.112.0](https://github.com/mozilla/fxa-profile-server/compare/v1.111.0...v1.112.0) (2018-05-16)

<a name="1.111.0"></a>

# [1.111.0](https://github.com/mozilla/fxa-profile-server/compare/v1.110.0...v1.111.0) (2018-05-02)

### Features

- **node:** update to node 8 (#319) r=@jrgm ([5138b86](https://github.com/mozilla/fxa-profile-server/commit/5138b86))

<a name="1.110.0"></a>

# [1.110.0](https://github.com/mozilla/fxa-profile-server/compare/v1.109.1...v1.110.0) (2018-04-18)

### Bug Fixes

- **mozlog:** fix deprecation warning (#315) r=@vladikoff ([5050602](https://github.com/mozilla/fxa-profile-server/commit/5050602)), closes [(#315](https://github.com/(/issues/315)
- **npm:** update to npm5 (#317) r=@shane-tomlinson ([6b45955](https://github.com/mozilla/fxa-profile-server/commit/6b45955))
- **traceback:** add mock for summary logs in tests (#314) r=@vladikoff ([39b4ab2](https://github.com/mozilla/fxa-profile-server/commit/39b4ab2)), closes [#203](https://github.com/mozilla/fxa-profile-server/issues/203)

### Features

- **cache:** Clear cache when receiving a "profileDataChanged" event. (#318); r=vbudhram ([23a7cbc](https://github.com/mozilla/fxa-profile-server/commit/23a7cbc))

<a name="1.109.1"></a>

## [1.109.1](https://github.com/mozilla/fxa-profile-server/compare/v1.109.0...v1.109.1) (2018-04-13)

### Bug Fixes

- **cache:** Ensure profile caching respects OAuth scopes. (#4); r=vladikoff,philbooth ([68dc42b](https://github.com/mozilla/fxa-profile-server/commit/68dc42b))

<a name="1.109.0"></a>

# [1.109.0](https://github.com/mozilla/fxa-profile-server/compare/v1.108.0...v1.109.0) (2018-04-04)

### Bug Fixes

- **node:** Use Node.js v6.14.0 (#312) r=@vladikoff ([8e91e81](https://github.com/mozilla/fxa-profile-server/commit/8e91e81))

### chore

- **tests:** Use nyc for code coverage. ([ecb4fec](https://github.com/mozilla/fxa-profile-server/commit/ecb4fec))

### Features

- **amr:** Report authentication info in profile data. ([afdbcf1](https://github.com/mozilla/fxa-profile-server/commit/afdbcf1))

<a name="1.108.0"></a>

# [1.108.0](https://github.com/mozilla/fxa-profile-server/compare/v1.107.0...v1.108.0) (2018-03-21)

### Bug Fixes

- **buffer:** Clean up 'Buffer' calls to deprecated API (#310) r=@vladikoff ([ed50ba1](https://github.com/mozilla/fxa-profile-server/commit/ed50ba1)), closes [#309](https://github.com/mozilla/fxa-profile-server/issues/309)

<a name="1.107.0"></a>

# [1.107.0](https://github.com/mozilla/fxa-profile-server/compare/v1.106.0...v1.107.0) (2018-03-07)

### chore

- **deps:** Update hapi to v16.6.3 (#308) ([7120d49](https://github.com/mozilla/fxa-profile-server/commit/7120d49))

### Features

- **avatars:** enable default avatar (#304) r=@rfk ([01b0e41](https://github.com/mozilla/fxa-profile-server/commit/01b0e41))
- **avatars:** enable default avatar (#307) r=@rfk ([9b33666](https://github.com/mozilla/fxa-profile-server/commit/9b33666))

### Reverts

- **avatars:** enable default avatar (#304) (#305) r=@rfk ([158eb63](https://github.com/mozilla/fxa-profile-server/commit/158eb63))

<a name="1.106.0"></a>

# [1.106.0](https://github.com/mozilla/fxa-profile-server/compare/v1.104.0...v1.106.0) (2018-02-21)

### chore

- **deps:** update deps, fix nsp (#301) r=@philbooth ([168aca3](https://github.com/mozilla/fxa-profile-server/commit/168aca3)), closes [(#301](https://github.com/(/issues/301)

<a name="1.104.0"></a>

# [1.104.0](https://github.com/mozilla/fxa-profile-server/compare/v1.103.0...v1.104.0) (2018-01-24)

### Bug Fixes

- **config:** mark config sentryDsn and mysql password sensitive (#298) r=@vladikoff ([f7a3717](https://github.com/mozilla/fxa-profile-server/commit/f7a3717))

<a name="1.103.0"></a>

# [1.103.0](https://github.com/mozilla/fxa-profile-server/compare/v1.100.0...v1.103.0) (2018-01-09)

### Bug Fixes

- **node:** use node 6.12.3 (#296) r=@vladikoff ([777fde2](https://github.com/mozilla/fxa-profile-server/commit/777fde2))

<a name="1.100.0"></a>

# [1.100.0](https://github.com/mozilla/fxa-profile-server/compare/v1.98.0...v1.100.0) (2017-11-15)

### Bug Fixes

- **logging:** Don't log raw numbers as log msg. (#293) r=@jbuck,@vladikoff ([e07e96b](https://github.com/mozilla/fxa-profile-server/commit/e07e96b))
- **node:** use node 6.12.0 (#294) r=@vladikoff ([e2573ae](https://github.com/mozilla/fxa-profile-server/commit/e2573ae))
- **travis:** run tests with 6 and 8 ([fa29eae](https://github.com/mozilla/fxa-profile-server/commit/fa29eae))

<a name="1.98.0"></a>

# [1.98.0](https://github.com/mozilla/fxa-profile-server/compare/v1.97.0...v1.98.0) (2017-10-26)

### chore

- **docker:** Update docker node to 6.11.5 (#290), r=@jbuck ([3d8e6b3](https://github.com/mozilla/fxa-profile-server/commit/3d8e6b3))
- **nsp:** nsp updates (#289); r=philbooth ([b36c437](https://github.com/mozilla/fxa-profile-server/commit/b36c437))

<a name="1.97.0"></a>

# [1.97.0](https://github.com/mozilla/fxa-profile-server/compare/v1.96.0...v1.97.0) (2017-10-03)

### chore

- **ci:** only test node 4, update nsp (#286) ([0cdcc41](https://github.com/mozilla/fxa-profile-server/commit/0cdcc41))
- **docs:** cleanup docs for POST /v1/avatar (#283) ([fafff0e](https://github.com/mozilla/fxa-profile-server/commit/fafff0e))

### Features

- **sentry:** add Sentry error reporting (#284) r=vbudhram ([fed2da7](https://github.com/mozilla/fxa-profile-server/commit/fed2da7))

<a name="1.96.0"></a>

# [1.96.0](https://github.com/mozilla/fxa-profile-server/compare/v1.95.1...v1.96.0) (2017-09-19)

### Features

- **cache:** Delete user cache on email change (#282), r=@rfk ([5c63044](https://github.com/mozilla/fxa-profile-server/commit/5c63044))

<a name="1.95.1"></a>

## [1.95.1](https://github.com/mozilla/fxa-profile-server/compare/v1.95.0...v1.95.1) (2017-09-13)

### chore

- **deps:** Update hapi to latest version. (#281) r=vladikoff ([08ba257](https://github.com/mozilla/fxa-profile-server/commit/08ba257))

<a name="1.95.0"></a>

# [1.95.0](https://github.com/mozilla/fxa-profile-server/compare/v1.94.0...v1.95.0) (2017-09-06)

### Bug Fixes

- **deps:** shrinkwrap ([95190ce](https://github.com/mozilla/fxa-profile-server/commit/95190ce))

### Features

- **deps:** add git to docker build ([147c32d](https://github.com/mozilla/fxa-profile-server/commit/147c32d))

### Refactor

- **lint:** remove jscs, update eslint rules ([cbe383a](https://github.com/mozilla/fxa-profile-server/commit/cbe383a))
- **routes:** remove the deprecated avatar list route ([8cf798b](https://github.com/mozilla/fxa-profile-server/commit/8cf798b))

<a name="1.94.0"></a>

# [1.94.0](https://github.com/mozilla/fxa-profile-server/compare/v1.93.0...v1.94.0) (2017-08-22)

### Bug Fixes

- **newrelic:** update to v2.1.0 ([0b32bbb](https://github.com/mozilla/fxa-profile-server/commit/0b32bbb))

<a name="1.93.0"></a>

# [1.93.0](https://github.com/mozilla/fxa-profile-server/compare/v1.92.0...v1.93.0) (2017-08-09)

### Bug Fixes

- **displayName:** length validation in post (#275) r=vladikoff ([21ca175](https://github.com/mozilla/fxa-profile-server/commit/21ca175))

<a name="1.92.0"></a>

# [1.92.0](https://github.com/mozilla/fxa-profile-server/compare/v1.91.0...v1.92.0) (2017-07-26)

### Bug Fixes

- **timeout:** bump generateTimeout to 11 seconds (#274) r=vladikoff ([7b5ed1b](https://github.com/mozilla/fxa-profile-server/commit/7b5ed1b))

### chore

- **config:** update cache emails to support yahoo (#272) r=vladikoff ([b01ab7a](https://github.com/mozilla/fxa-profile-server/commit/b01ab7a))

<a name="1.91.0"></a>

# [1.91.0](https://github.com/mozilla/fxa-profile-server/compare/v1.90.0...v1.91.0) (2017-07-12)

### Bug Fixes

- **cache:** fix cache config ([ce13b92](https://github.com/mozilla/fxa-profile-server/commit/ce13b92))
- **cache:** register server method on server creation ([29ce561](https://github.com/mozilla/fxa-profile-server/commit/29ce561))
- **nodejs:** upgrade to 6.11.1 for security fixes ([1cc9ca6](https://github.com/mozilla/fxa-profile-server/commit/1cc9ca6))
- **startup:** exit if server.start() returns an error ([b46d879](https://github.com/mozilla/fxa-profile-server/commit/b46d879))

### Features

- **avatar:** allow deleting the default avatar by not sending an id (#267) r=vladikoff ([41c4e78](https://github.com/mozilla/fxa-profile-server/commit/41c4e78))
- **config:** fix generateTimeout default setting in profile caching (#260) r=jbuck ([f46888c](https://github.com/mozilla/fxa-profile-server/commit/f46888c)), closes [(#260](https://github.com/(/issues/260)
- **node:** upgrade to Node 6 ([d4c8ec3](https://github.com/mozilla/fxa-profile-server/commit/d4c8ec3))

<a name="1.90.2"></a>

## [1.90.2](https://github.com/mozilla/fxa-profile-server/compare/v1.90.0...v1.90.2) (2017-07-10)

### Bug Fixes

- **cache:** fix cache config ([ce13b92](https://github.com/mozilla/fxa-profile-server/commit/ce13b92))
- **cache:** register server method on server creation ([29ce561](https://github.com/mozilla/fxa-profile-server/commit/29ce561))
- **startup:** exit if server.start() returns an error ([b46d879](https://github.com/mozilla/fxa-profile-server/commit/b46d879))

### Features

- **config:** fix generateTimeout default setting in profile caching (#260) r=jbuck ([f46888c](https://github.com/mozilla/fxa-profile-server/commit/f46888c)), closes [(#260](https://github.com/(/issues/260)
- **node:** upgrade to Node 6 ([d4c8ec3](https://github.com/mozilla/fxa-profile-server/commit/d4c8ec3))

<a name="1.90.1"></a>

## [1.90.1](https://github.com/mozilla/fxa-profile-server/compare/v1.90.0...v1.90.1) (2017-06-29)

### Bug Fixes

- **cache:** fix cache config ([e786768](https://github.com/mozilla/fxa-profile-server/commit/e786768))

<a name="1.90.0"></a>

# [1.90.0](https://github.com/mozilla/fxa-profile-server/compare/v1.89.0...v1.90.0) (2017-06-28)

### chore

- **logs:** add logging for caching profile (#256) r=vladikoff ([28d55b7](https://github.com/mozilla/fxa-profile-server/commit/28d55b7))
- **npm:** update newrelic to 1.40.0 (#257) r=vladikoff ([6b34c03](https://github.com/mozilla/fxa-profile-server/commit/6b34c03))

### Features

- **cache:** request caching for profile (#253) r=vladikoff ([814dd7f](https://github.com/mozilla/fxa-profile-server/commit/814dd7f)), closes [#242](https://github.com/mozilla/fxa-profile-server/issues/242)

<a name="1.89.0"></a>

# [1.89.0](https://github.com/mozilla/fxa-profile-server/compare/v1.88.0...v1.89.0) (2017-06-14)

### Features

- **db:** support emoji in display name (#248) r=rfk,jrgm ([90da3fa](https://github.com/mozilla/fxa-profile-server/commit/90da3fa))

<a name="1.88.0"></a>

# [1.88.0](https://github.com/mozilla/fxa-profile-server/compare/v1.86.0...v1.88.0) (2017-05-31)

### Bug Fixes

- **docker:** push to circle branch tag instead of latest (#249) r=vladikoff ([811d89d](https://github.com/mozilla/fxa-profile-server/commit/811d89d))

### chore

- **docker:** remove old docker file (#245) ([b433360](https://github.com/mozilla/fxa-profile-server/commit/b433360))

### Features

- **docker:** allow feature branches (#246) r=jrgm ([8f5821f](https://github.com/mozilla/fxa-profile-server/commit/8f5821f))

### Refactor

- **avatar:** remove POST avatar ([8fde69e](https://github.com/mozilla/fxa-profile-server/commit/8fde69e)), closes [#244](https://github.com/mozilla/fxa-profile-server/issues/244)

<a name="1.86.0"></a>

# [1.86.0](https://github.com/mozilla/fxa-profile-server/compare/v1.85.0...v1.86.0) (2017-05-03)

### chore

- **deps:** Update shrinkwrap ([49302fe](https://github.com/mozilla/fxa-profile-server/commit/49302fe))

<a name="1.85.0"></a>

# [1.85.0](https://github.com/mozilla/fxa-profile-server/compare/v1.84.0...v1.85.0) (2017-04-19)

### chore

- **docker:** Use official node image & update to Node.js v4.8.2 (#243) r=vladikoff ([c67c9f1](https://github.com/mozilla/fxa-profile-server/commit/c67c9f1))

<a name="1.84.0"></a>

# [1.84.0](https://github.com/mozilla/fxa-profile-server/compare/v1.83.0...v1.84.0) (2017-04-04)

### Features

- **push:** notify the auth-server when profile updated ([8f89dad](https://github.com/mozilla/fxa-profile-server/commit/8f89dad))

<a name="1.83.0"></a>

# [1.83.0](https://github.com/mozilla/fxa-profile-server/compare/v1.82.1...v1.83.0) (2017-03-21)

### Bug Fixes

- **config:** only force this settting if it's the default value ([54fcef1](https://github.com/mozilla/fxa-profile-server/commit/54fcef1))
- **version:** use cwd and env var to get version ([bcf9666](https://github.com/mozilla/fxa-profile-server/commit/bcf9666))

<a name="1.82.1"></a>

## [1.82.1](https://github.com/mozilla/fxa-profile-server/compare/v1.82.0...v1.82.1) (2017-03-09)

### Bug Fixes

- **docker:** Pin graphicsmagick to Alpine Linux v3.5 repo ([ae07870](https://github.com/mozilla/fxa-profile-server/commit/ae07870))

<a name="1.82.0"></a>

# [1.82.0](https://github.com/mozilla/fxa-profile-server/compare/v0.79.0...v1.82.0) (2017-03-09)

### Bug Fixes

- **logs:** add client_id to summary logs (#235) r=seanmonstar ([e4769b3](https://github.com/mozilla/fxa-profile-server/commit/e4769b3)), closes [#234](https://github.com/mozilla/fxa-profile-server/issues/234)

### chore

- **docker:** Update to node v4.8.0 (#237) r=vladikoff ([9dd59e9](https://github.com/mozilla/fxa-profile-server/commit/9dd59e9))

<a name="0.79.0"></a>

# [0.79.0](https://github.com/mozilla/fxa-profile-server/compare/v0.78.0...v0.79.0) (2017-01-25)

### Bug Fixes

- **config:** load proper development configuration ([dd7aee0](https://github.com/mozilla/fxa-profile-server/commit/dd7aee0))
- **docker:** Use shrinkwrap when installing (#232) r=vladikoff ([e797475](https://github.com/mozilla/fxa-profile-server/commit/e797475))
- **headers:** add cache-control headers to api endpoints ([edc7d5e](https://github.com/mozilla/fxa-profile-server/commit/edc7d5e))

### Refactor

- **headers:** re-use same header checks for all tests ([14e798c](https://github.com/mozilla/fxa-profile-server/commit/14e798c))

<a name="0.78.0"></a>

# [0.78.0](https://github.com/mozilla/fxa-profile-server/compare/v0.76.1...v0.78.0) (2017-01-10)

### Bug Fixes

- **config:** make NODE_ENV consistent across servers (#227) ([a7a822e](https://github.com/mozilla/fxa-profile-server/commit/a7a822e))
- **security:** enable x-content-type-options nosniff ([fb5a05d](https://github.com/mozilla/fxa-profile-server/commit/fb5a05d))
- **security:** enable X-XSS-Protection with 1; mode=block ([219fe99](https://github.com/mozilla/fxa-profile-server/commit/219fe99))
- **security:** set x-frame-options deny ([b033f93](https://github.com/mozilla/fxa-profile-server/commit/b033f93))

### Features

- **mysql:** Ensure db connections always run in strict mode. (#221); r=seanmonstar ([b10b88c](https://github.com/mozilla/fxa-profile-server/commit/b10b88c))

<a name="0.76.1"></a>

## [0.76.1](https://github.com/mozilla/fxa-profile-server/compare/v0.76.0...v0.76.1) (2016-12-19)

### Bug Fixes

- **avatars:** only delete avatars if avatars set ([adf16cf](https://github.com/mozilla/fxa-profile-server/commit/adf16cf))

<a name="0.76.0"></a>

# [0.76.0](https://github.com/mozilla/fxa-profile-server/compare/v0.75.0...v0.76.0) (2016-12-13)

### chore

- **deps:** Update requests depdendency (#225) r=vladikoff ([39fe21a](https://github.com/mozilla/fxa-profile-server/commit/39fe21a))
- **nodejs:** Upgrade to Node.js v4.7.0 ([39adfb8](https://github.com/mozilla/fxa-profile-server/commit/39adfb8))

<a name="0.75.0"></a>

# [0.75.0](https://github.com/mozilla/fxa-profile-server/compare/v0.74.0...v0.75.0) (2016-11-30)

### Bug Fixes

- **docs:** remove old docs ([b4194f0](https://github.com/mozilla/fxa-profile-server/commit/b4194f0))
- **tests:** add 410 gone tests ([3848d8b](https://github.com/mozilla/fxa-profile-server/commit/3848d8b))

### chore

- **shrinkwrap:** add npm script for shrinkwrap (#224) r=vladikoff ([4546e4e](https://github.com/mozilla/fxa-profile-server/commit/4546e4e)), closes [#223](https://github.com/mozilla/fxa-profile-server/issues/223)

### Features

- **hpkp:** Add hpkp headers to all requests (#207) r=vladikoff ([9bbdf88](https://github.com/mozilla/fxa-profile-server/commit/9bbdf88))
- **newrelic:** add optional newrelic integration (#222) r=vladikoff ([d78c64c](https://github.com/mozilla/fxa-profile-server/commit/d78c64c))

### Refactor

- **avatars:** remove avatar list and some selected avatar logic ([2bac088](https://github.com/mozilla/fxa-profile-server/commit/2bac088))

<a name="0.74.0"></a>

# [0.74.0](https://github.com/mozilla/fxa-profile-server/compare/v0.73.1...v0.74.0) (2016-11-15)

### Bug Fixes

- **docker:** Shrink docker image size (#220) r=vladikoff ([37f7402](https://github.com/mozilla/fxa-profile-server/commit/37f7402))

### chore

- **nodejs:** Upgrade to Node.js v4.6.2 ([a428830](https://github.com/mozilla/fxa-profile-server/commit/a428830))

<a name="0.73.1"></a>

## [0.73.1](https://github.com/mozilla/fxa-profile-server/compare/v0.73.0...v0.73.1) (2016-11-08)

### chore

- **nodejs:** Upgrade to Node.js v4.6.1 ([20a7f7b](https://github.com/mozilla/fxa-profile-server/commit/20a7f7b))

<a name="0.73.0"></a>

# [0.73.0](https://github.com/mozilla/fxa-profile-server/compare/v0.71.0...v0.73.0) (2016-11-02)

### Bug Fixes

- **config:** log config at info level at startup ([57adbe5](https://github.com/mozilla/fxa-profile-server/commit/57adbe5))
- **travis:** build on node 4 and 6 ([ff81c7c](https://github.com/mozilla/fxa-profile-server/commit/ff81c7c))

### chore

- **config:** remove obsolete awsbox config file (#215) ([80b2709](https://github.com/mozilla/fxa-profile-server/commit/80b2709))

<a name="0.71.0"></a>

# [0.71.0](https://github.com/mozilla/fxa-profile-server/compare/v0.70.0...v0.71.0) (2016-10-05)

### Bug Fixes

- **config:** Add env key to required config variables ([232480f](https://github.com/mozilla/fxa-profile-server/commit/232480f))
- **config:** Add env key to required config variables (#211) r=vladikoff ([3ad6ae6](https://github.com/mozilla/fxa-profile-server/commit/3ad6ae6))
- **deps:** downgrade to hapi 14 (#213) r=vladikoff ([2df72b6](https://github.com/mozilla/fxa-profile-server/commit/2df72b6))
- **deps:** update to latest hapi, joi and boom. requires node 4+ ([d975d21](https://github.com/mozilla/fxa-profile-server/commit/d975d21))

<a name="0.70.0"></a>

# [0.70.0](https://github.com/mozilla/fxa-profile-server/compare/v0.69.0...v0.70.0) (2016-09-21)

### Bug Fixes

- **log:** add remoteAddressChain to summary (#208) r=jrgm ([05ae545](https://github.com/mozilla/fxa-profile-server/commit/05ae545))

<a name="0.68.0"></a>

# [0.68.0](https://github.com/mozilla/fxa-profile-server/compare/v0.67.1...v0.68.0) (2016-08-24)

### Features

- **customs:** turn off customs until server support, update tests (#206) ([629fb31](https://github.com/mozilla/fxa-profile-server/commit/629fb31))
- **server:** rate limit avatar uploads (#201) r=vladikoff ([954c1a1](https://github.com/mozilla/fxa-profile-server/commit/954c1a1)), closes [#132](https://github.com/mozilla/fxa-profile-server/issues/132)

<a name="0.67.1"></a>

## [0.67.1](https://github.com/mozilla/fxa-profile-server/compare/v0.67.0...v0.67.1) (2016-08-10)

### Bug Fixes

- **tests:** fix docker racing tests ([d50aa7f](https://github.com/mozilla/fxa-profile-server/commit/d50aa7f))

### chore

- **docs:** add circleci badge ([ba1ecb4](https://github.com/mozilla/fxa-profile-server/commit/ba1ecb4))

<a name="0.67.0"></a>

## 0.67.0 (2016-08-10)

### Bug Fixes

- **config:** Add production as allowed environment ([ceec964](https://github.com/mozilla/fxa-profile-server/commit/ceec964))
- **config:** Add production as allowed environment in code ([c8c1c22](https://github.com/mozilla/fxa-profile-server/commit/c8c1c22))
- **config:** only allow https gravatars (#204) ([08b44fa](https://github.com/mozilla/fxa-profile-server/commit/08b44fa))
- **config:** Quoting syntax ([2eb7235](https://github.com/mozilla/fxa-profile-server/commit/2eb7235))
- **deps:** update dev dependencies ([37e73bc](https://github.com/mozilla/fxa-profile-server/commit/37e73bc))
- **deps:** updating prod dependencies ([0138ffa](https://github.com/mozilla/fxa-profile-server/commit/0138ffa))
- **dev:** stop all child servers if one crashes ([0922c16](https://github.com/mozilla/fxa-profile-server/commit/0922c16))
- **docker:** Output version.json in RPMflow and Dockerflow compatible locations ([2648593](https://github.com/mozilla/fxa-profile-server/commit/2648593))

### chore

- **config:** Remove unused git key from config ([548937a](https://github.com/mozilla/fxa-profile-server/commit/548937a))
- **deps:** Update Dockerfile to node@0.10.46 ([1ce332c](https://github.com/mozilla/fxa-profile-server/commit/1ce332c))
- **release:** bump version with 'grunt version' (#200) r=jrgm,vbudhram ([1fe5765](https://github.com/mozilla/fxa-profile-server/commit/1fe5765)), closes [#73](https://github.com/mozilla/fxa-profile-server/issues/73)

### Features

- **docker:** Add npm scripts for starting web server & worker ([98e3374](https://github.com/mozilla/fxa-profile-server/commit/98e3374))
- **docker:** Switch to exec so signals get passed through correctly ([34ba601](https://github.com/mozilla/fxa-profile-server/commit/34ba601))

<a name="0.63.0"></a>

## 0.63.0 (2016-06-02)

#### Bug Fixes

- **docker:**
  - Back to the original login config ([a9a0ab4c](https://github.com/mozilla/fxa-profile-server/commit/a9a0ab4c82eb88152ecf5b07c2c1d7f94e51c9c0))
  - Docker login still requires email ([65b8dd12](https://github.com/mozilla/fxa-profile-server/commit/65b8dd1263f0ecf61bda6a60f57612e9af5418a1))
  - Login to Docker Hub ([90df64a0](https://github.com/mozilla/fxa-profile-server/commit/90df64a0d26c7e9ce5a7d2b4ba715766d04d9039))
  - Quote environment variables ([5632c3d0](https://github.com/mozilla/fxa-profile-server/commit/5632c3d02c011645ff189fd6bc29cdbae34de861))
  - Replace "commit" with "hash" ([058edccf](https://github.com/mozilla/fxa-profile-server/commit/058edccff4adf981e7412c2520b51a8494f75e03))
  - Display version.json in CircleCI output ([b39e7658](https://github.com/mozilla/fxa-profile-server/commit/b39e76584e31b1a404e139ed59ea60750e998b3a))
  - Re-order directory creation ([660d61b2](https://github.com/mozilla/fxa-profile-server/commit/660d61b2fa1f8d5bad81c990ac389ae4ddedbcbd))
  - Copy pre-install script before running install ([b7139363](https://github.com/mozilla/fxa-profile-server/commit/b7139363649b6d0f3ccc177e1beb346cf8dd0837))

#### Features

- **docker:**
  - Add CloudOps Dockerfile & CircleCI build instructions ([b18c78f7](https://github.com/mozilla/fxa-profile-server/commit/b18c78f71688719608bacac3d6198915755516c0))
  - Add /**lbheartbeat** endpoint for Dockerflow compatibility ([d4f3863d](https://github.com/mozilla/fxa-profile-server/commit/d4f3863d2eb98cea26463d7e53c681f305e74f04))

<a name="0.61.0"></a>

## 0.61.0 (2016-05-04)

#### Bug Fixes

- **avatars:** protect graphicsmagick from CVE-2016-3714 ([51d35cd5](https://github.com/mozilla/fxa-profile-server/commit/51d35cd5adf8e263182156aef2f0dd4c2080a54d))

<a name="0.59.0"></a>

## 0.59.0 (2016-03-30)

<a name="0.57.0"></a>

## 0.57.0 (2016-03-05)

#### Bug Fixes

- **display_name:** Disallow astral characters in display_name. ([b2c9e1d6](https://github.com/mozilla/fxa-profile-server/commit/b2c9e1d6076f735951c30871296b8b966fd246e0))

#### Features

- **docker:** Additional Dockerfile for self-hosting ([f493869b](https://github.com/mozilla/fxa-profile-server/commit/f493869bcdae79a3254e5df5e3a2e4692976e678))

<a name="0.53.1"></a>

### 0.53.1 (2016-01-13)

#### Bug Fixes

- **server:** profile scope is more selectively inserted into routes ([30f20073](https://github.com/mozilla/fxa-profile-server/commit/30f20073bf309254257d0c3b13adcc477fea54a4))

<a name="0.53.0"></a>

## 0.53.0 (2016-01-04)

#### Bug Fixes

- **travis:** build and test on 0.10, 0.12 and 4.x ([41acdda1](https://github.com/mozilla/fxa-profile-server/commit/41acdda191b8c87744203d700a589d621fae0601))

#### Features

- **openid:** make /v1/profile act as the OIDC UserInfo endpoint ([a86d0d4d](https://github.com/mozilla/fxa-profile-server/commit/a86d0d4d3113e4529712cd66ab89855f4299d145), closes [#175](https://github.com/mozilla/fxa-profile-server/issues/175))

<a name="0.50.1"></a>

### 0.50.1 (2015-12-01)

#### Bug Fixes

- **email:** improve handling of 4XX errors from auth server. ([835f7244](https://github.com/mozilla/fxa-profile-server/commit/835f72442b81429c84e8a7cfb9cbb635d9e525d0))

<a name="0.50.0"></a>

## 0.50.0 (2015-11-18)

#### Bug Fixes

- **build:**
  - add grunt-nsp ([6a62bdfe](https://github.com/mozilla/fxa-profile-server/commit/6a62bdfe06f95e584e2b3e705abb35d819bb9b7e), closes [#161](https://github.com/mozilla/fxa-profile-server/issues/161))
  - remove shrinkwrap validate ([db93e4e0](https://github.com/mozilla/fxa-profile-server/commit/db93e4e0a971e9fc7bffbcaf24d92d4dc0f68b5c))
- **config:** adjust lib gm limits for aws ([daff6c6f](https://github.com/mozilla/fxa-profile-server/commit/daff6c6fc1d3905b0718a55c8cc33945bd208023), closes [#167](https://github.com/mozilla/fxa-profile-server/issues/167))
- **mysql:** fix patcher version check to enforce patch >= n ([8db250f7](https://github.com/mozilla/fxa-profile-server/commit/8db250f7f10c4ceb5083898812cd9c8467d5616e), closes [#131](https://github.com/mozilla/fxa-profile-server/issues/131))
- **server:** set nodejs/request maxSockets to Infinity ([65efc72c](https://github.com/mozilla/fxa-profile-server/commit/65efc72ca615fc8f9f03ff697c483fc619bc4ede), closes [#102](https://github.com/mozilla/fxa-profile-server/issues/102))
- **upload:** add gm image identification ([55b0744e](https://github.com/mozilla/fxa-profile-server/commit/55b0744e68d672d2385d8ef51a97072c19e777bd), closes [#96](https://github.com/mozilla/fxa-profile-server/issues/96))
- **worker:** disable gzip encoding on requests to local worker ([40dfefd5](https://github.com/mozilla/fxa-profile-server/commit/40dfefd5fd66942057a9f532b7f6060b62484a7f), closes [#98](https://github.com/mozilla/fxa-profile-server/issues/98))

#### Features

- **email:**
  - fetch email from auth-server /account/profile ([aa3a140b](https://github.com/mozilla/fxa-profile-server/commit/aa3a140bc1bb3b47bada13c29e5c85c4850f77db), closes [#165](https://github.com/mozilla/fxa-profile-server/issues/165))
  - fetch email from auth-server /account/profile ([cc706457](https://github.com/mozilla/fxa-profile-server/commit/cc70645763332ab6b16acf5e122a1c82ce9831a1), closes [#165](https://github.com/mozilla/fxa-profile-server/issues/165))

<a name="0.49.0"></a>

## 0.49.0 (2015-11-03)

#### Bug Fixes

- **avatars:** graphicsmagick processing limits ([93edc141](https://github.com/mozilla/fxa-profile-server/commit/93edc14170d0acb1d47f1d6ec3bf8d5948d6e2e5), closes [#57](https://github.com/mozilla/fxa-profile-server/issues/57))

<a name="0.48.0"></a>

## 0.48.0 (2015-10-20)

#### Bug Fixes

- **avatars:** add configuration to adjust avatar upload size ([bc86f168](https://github.com/mozilla/fxa-profile-server/commit/bc86f16887d8ebc52125f4ed3a1e507e12924bac), closes [#158](https://github.com/mozilla/fxa-profile-server/issues/158))
- **server:** prevent null exception when oauth server is down ([cf1dc35d](https://github.com/mozilla/fxa-profile-server/commit/cf1dc35dfb6e5b10e786ccbc1efede8834aac549), closes [#151](https://github.com/mozilla/fxa-profile-server/issues/151))

<a name="0.47.0"></a>

## 0.47.0 (2015-10-07)

#### Features

- **display_name:** return 204 if user does not have a display name ([544e3323](https://github.com/mozilla/fxa-profile-server/commit/544e3323c6401d2c24625eb9a4114539cb36dbcc), closes [#144](https://github.com/mozilla/fxa-profile-server/issues/144))

<a name="0.46.0"></a>

## 0.46.0 (2015-09-23)

#### Features

- **logging:** add avatar.get activity event ([18cc9b93](https://github.com/mozilla/fxa-profile-server/commit/18cc9b9318c75fbb494faba9f917a422b7945d14), closes [#146](https://github.com/mozilla/fxa-profile-server/issues/146))

<a name="0.45.0"></a>

## 0.45.0 (2015-09-11)

#### Bug Fixes

- **run_dev:** add rimraf dependency back ([29c076d6](https://github.com/mozilla/fxa-profile-server/commit/29c076d61588ca660e7fc67c03204109371967a5), closes [#138](https://github.com/mozilla/fxa-profile-server/issues/138))
- **version:** use explicit path with git-config ([aa6535f2](https://github.com/mozilla/fxa-profile-server/commit/aa6535f2c40acba9b5a1acabd9745f9cc3bd3385))

<a name="0.44.0"></a>

## 0.44.0 (2015-08-26)

#### Bug Fixes

- **config:** add options events.region and events.queueUrl ([4c3c4135](https://github.com/mozilla/fxa-profile-server/commit/4c3c41357f595ad8fd44c52cbec05b7d696df9f7))
- **display_name:** Don't allow control characters in the display_name field. ([5b9e20d2](https://github.com/mozilla/fxa-profile-server/commit/5b9e20d224c4662db62b635398beb633dc5615ff), closes [#126](https://github.com/mozilla/fxa-profile-server/issues/126))
- **server:** return errno 104 if oauth server is drunk ([3bd6b14d](https://github.com/mozilla/fxa-profile-server/commit/3bd6b14d29d47751bebdb12ef506c6bf1a140241), closes [#121](https://github.com/mozilla/fxa-profile-server/issues/121))

#### Features

- **events:** add events to delete user data when account is deleted ([79d98a3d](https://github.com/mozilla/fxa-profile-server/commit/79d98a3d5e3ef94c326ad72a42f6f3ea60f73b3b), closes [#127](https://github.com/mozilla/fxa-profile-server/issues/127))

<a name="0.42.0"></a>

## 0.42.0 (2015-07-22)

#### Bug Fixes

- **display_name:** allow a blank display name ([e27223dd](https://github.com/mozilla/fxa-profile-server/commit/e27223ddcbb997cb9465466be763ed93de83b363))

<a name"0.39.0"></a>

## 0.39.0 (2015-06-10)

#### Features

- **avatar:** Add etag to the profile avatar API endpoint ([07569c5d](https://github.com/mozilla/fxa-profile-server/commit/07569c5d))
- **profile:** add etag to profile API endpoint ([dcf1bb64](https://github.com/mozilla/fxa-profile-server/commit/dcf1bb64))

<a name="0.36.0"></a>

## 0.36.0 (2015-04-30)

#### Bug Fixes

- **db:** race condition when asking for db multiple times at startup ([1bc2cae5](https://github.com/mozilla/fxa-profile-server/commit/1bc2cae55a065d5d979dd5e4494e51c3492c4e2f))

#### Features

- **profile:** return all /profile pieces that scopes allow ([35a4875f](https://github.com/mozilla/fxa-profile-server/commit/35a4875f868d5695d455e382673aba8db4586b91), closes [#108](https://github.com/mozilla/fxa-profile-server/issues/108))

<a name"0.35.0"></a>

## 0.35.0 (2015-04-13)

#### Bug Fixes

- **changelog:** set package.json repository correctly so conventional-changelog creates valid UR ([17100542](https://github.com/mozilla/fxa-profile-server/commit/17100542))
- **test:**
  - set maxSockets to Infinity for real ([d2795966](https://github.com/mozilla/fxa-profile-server/commit/d2795966))
  - expect new default size of 200x200 ([18f130f9](https://github.com/mozilla/fxa-profile-server/commit/18f130f9))

#### Features

- **displayName:** add a profile table with a displayName field ([ad6488eb](https://github.com/mozilla/fxa-profile-server/commit/ad6488eb))
- **mysql:** use mysql patcher to allow incremental schema updates ([2fbfbbda](https://github.com/mozilla/fxa-profile-server/commit/2fbfbbda))

<a name="0.33.0"></a>

## 0.33.0 (2015-03-16)

#### Bug Fixes

- **docs:** note "avatar" field in /v1/profile response ([0698d434](https://github.com/mozilla/fxa-profile-server/commit/0698d434ff1bc147d1676ce0b94c0ff832feba39))

#### Features

- **avatar:** add support for multiple image sizes ([187b0766](https://github.com/mozilla/fxa-profile-server/commit/187b07664882d5fdb16b4bd374baa5b5d3e2d274), closes [#68](https://github.com/mozilla/fxa-profile-server/issues/68), [#89](https://github.com/mozilla/fxa-profile-server/issues/89))
- **test:**
  - in load test, make image deletion optional ([b388fb62](https://github.com/mozilla/fxa-profile-server/commit/b388fb62fa2b9cd05a094871c401daa37d8c0765))
  - in load test, add delete after download ([4a433260](https://github.com/mozilla/fxa-profile-server/commit/4a433260f63516ee89aaaa31f9f21cb91882f851))

<a name="0.31.0"></a>

## 0.31.0 (2015-02-17)

#### Features

- **docker:** Dockerfile and README update for basic docker development workflow ([d424fb66](https://github.com/mozilla/fxa-profile-server/commit/d424fb6664f08bb783db4ecdf76bb805113b4485))
- **images:** delete images from s3 when asked to ([ec25152b](https://github.com/mozilla/fxa-profile-server/commit/ec25152b434b4b75939a5184b38210e326dea438))

<a name="0.26.1"></a>

### 0.26.1 (2014-11-17)

#### Bug Fixes

- **avatars:**
  - properly detect and report image upload errors ([902d0e68](https://github.com/mozilla/fxa-profile-server/commit/902d0e68cac6292acfeb8ed61f5708616a785532), closes [#79](https://github.com/mozilla/fxa-profile-server/issues/79))
  - return the profile image id after a post or upload ([85ffefc9](https://github.com/mozilla/fxa-profile-server/commit/85ffefc9d027b08fa923f2d23ff06a7e1153e31b))
- **config:** use ip addresses instead of localhost ([58defb67](https://github.com/mozilla/fxa-profile-server/commit/58defb67d921bce98001285b153ab7178d51245c))
- **logging:**
  - remove spaces from logging op name ([41fad890](https://github.com/mozilla/fxa-profile-server/commit/41fad890dbbb779d0f7b871067a9f6bd5d56cd5c))
  - remove spaces from logging op name in the worker ([290c9ed7](https://github.com/mozilla/fxa-profile-server/commit/290c9ed785dc14ed27936c217132582545c73af0), closes [#77](https://github.com/mozilla/fxa-profile-server/issues/77))

#### Features

- **logging:** use mozlog with heka format ([b27b48bf](https://github.com/mozilla/fxa-profile-server/commit/b27b48bf6116c86353f1523be91d6964a7fb48fd), closes [#71](https://github.com/mozilla/fxa-profile-server/issues/71))
- **server:** enable HSTS maxAge six months ([248e2e48](https://github.com/mozilla/fxa-profile-server/commit/248e2e48f86eaa9e053d26b599f0db2752be7e6c))

#### Breaking Changes

- Both the config and the output for logging has changed.
  Config can be removed, as the defaults are what should be used in
  production.
  ([b27b48bf](https://github.com/mozilla/fxa-profile-server/commit/b27b48bf6116c86353f1523be91d6964a7fb48fd))

<a name="0.26.0"></a>

## 0.26.0 (2014-11-12)

#### Features

- **logging:** use mozlog with heka format ([b27b48bf](https://github.com/mozilla/fxa-profile-server/commit/b27b48bf6116c86353f1523be91d6964a7fb48fd), closes [#71](https://github.com/mozilla/fxa-profile-server/issues/71))

#### Breaking Changes

- Both the config and the output for logging has changed.
  Config can be removed, as the defaults are what should be used in
  production.
  ([b27b48bf](https://github.com/mozilla/fxa-profile-server/commit/b27b48bf6116c86353f1523be91d6964a7fb48fd))

<a name="0.24.0"></a>

## 0.24.0 (2014-10-20)

#### Features

- **server:** enable HSTS maxAge six months ([248e2e48](https://github.com/mozilla/fxa-profile-server/commit/248e2e48f86eaa9e053d26b599f0db2752be7e6c))
