## 1.149.1

No changes.

## 1.149.0

### Other changes

- deps: move auth server from shrinkwrap to package-lock (8e4af3095)

## 1.148.8

No changes.

## 1.148.7

No changes.

## 1.148.6

No changes.

## 1.148.5

No changes.

## 1.148.4

No changes.

## 1.148.3

No changes.

## 1.148.2

### Other changes

- release: Merge branch 'train-147' into train-148-merge-147 (66e170d45)

## 1.148.1

No changes.

## 1.148.0

### New features

- add vscode tasks for running tests and debugger (dac5e8b98)

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

- build: npm audit fix (4839fcc5e)
- db: Reset `keysChangedAt` to NULL if we don't know its correct value. (89a8423d4)

## 1.146.4

No changes.

## 1.146.3

No changes.

## 1.146.2

No changes.

## 1.146.1

No changes.

## 1.146.0

No changes.

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

### Bug fixes

- subscriptions: bump account profileUpdatedAt when subscriptions are changed (8c21351b4)

### Refactorings

- db: rename productName to productId (5d709f96d)

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

### New features

- recovery: Clear recovery keys when resetting account (f1f93cc19)

## 1.143.0

### Other changes

- support-panel: call out stored procedures with specific grants (4450eccc9)
- ci: Remove CI config from within packages subdir. (66990a8f4)

## 1.142.1

No changes.

## 1.142.0

### New features

- support-panel: support live user queries (79534bc49)
- routes: securityEvents GET and DELETE added with uid (90750377b)

### Bug fixes

- docs: remove extra code indents that messed up formatting (ae014390d)

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

### New features

- subscriptions: implement reactivation of cancelled subscriptions (e0391a658)
- script: script for reading security events from db (ea21cf4e9)

### Bug fixes

- tests: add remote db tests for subscription cancellation (1bd4b2607)
- scripts: expect semi-colons in db migration script (1d1c630c1)
- format: fixed up COTRIBUTING.md files (a0422c6ae)

### Other changes

- subs: remove `|| []` from call to db.fetchAccountSubscriptions (4f816d103)
- style: added prettier precommit hook (2820ac733)
- style: added prettier to fxa-auth-db-mysql (963cdd235)

## 1.140.3

No changes.

## 1.140.2

No changes.

## 1.140.1

No changes.

## 1.140.0

### New features

- clients: Add a route for listing all attached clients. (13f0e20ad)

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

### New features

- subscriptions: support deferred cancellation of subscriptions (4ee71842d)

### Refactorings

- tests: switch from insist to chai for assertions (e93fdf9aa)

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

No changes.

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

### New features

- accounts: add ability to associate subscriptions with an account (e9ffe4374)

### Bug fixes

- package: update grunt to fix nsp warning in fxa-auth-db-mysql (0591237c0)

### Other changes

- db: remove old scrypt-hash dependency from auth db (42816c67a)
- packages: remove old release tagging scripts and docs (6f168c244)

## 1.134.5

No changes.

## 1.134.4

No changes.

## 1.134.3

No changes.

## 1.134.2

No changes.

<a name="1.133.1"></a>

## [1.133.1](https://github.com/mozilla/fxa-auth-db-mysql/compare/v1.133.0...v1.133.1) (2019-03-19)

### Features

- **devices:** Add ability to associate a device record with a refesh token. ([1123e32](https://github.com/mozilla/fxa-auth-db-mysql/commit/1123e32))

<a name="1.133.0"></a>

# [1.133.0](https://github.com/mozilla/fxa-auth-db-mysql/compare/v1.132.0...v1.133.0) (2019-03-19)

### chore

- **devices:** Add explicit deletes to replace `ON DELETE CASCADE`. ([75aba96](https://github.com/mozilla/fxa-auth-db-mysql/commit/75aba96))
- **package:** update shrinkwrap ([f629704](https://github.com/mozilla/fxa-auth-db-mysql/commit/f629704))

<a name="1.132.0"></a>

# [1.132.0](https://github.com/mozilla/fxa-auth-db-mysql/compare/v1.130.0...v1.132.0) (2019-03-05)

### chore

- **deploy:** upgrade to node 10 ([f3bc954](https://github.com/mozilla/fxa-auth-db-mysql/commit/f3bc954))
- **deps:** update nyc ([db987c3](https://github.com/mozilla/fxa-auth-db-mysql/commit/db987c3))
- **routes:** Remove last vestiges of `sessionWithDevice` route. ([0e5115b](https://github.com/mozilla/fxa-auth-db-mysql/commit/0e5115b))

### Features

- **account:** Add `profileChangedAt` and `keysChangedAt` to the `accounts` table. ([02e944c](https://github.com/mozilla/fxa-auth-db-mysql/commit/02e944c))

### test

- **demo:** add some comments to pt-osc demo ([c85cc7a](https://github.com/mozilla/fxa-auth-db-mysql/commit/c85cc7a))
- **demo:** set up triggers like pt-osc and check ([ecb87b3](https://github.com/mozilla/fxa-auth-db-mysql/commit/ecb87b3))

<a name="1.130.0"></a>

# [1.130.0](https://github.com/mozilla/fxa-auth-db-mysql/compare/v1.129.0...v1.130.0) (2019-02-05)

### chore

- **ci:** run tests on node 10 ([5467e2f](https://github.com/mozilla/fxa-auth-db-mysql/commit/5467e2f))

### Refactor

- **crypto:** fall back to node's scrypt implementation ([932f2dd](https://github.com/mozilla/fxa-auth-db-mysql/commit/932f2dd))

<a name="1.129.0"></a>

# [1.129.0](https://github.com/mozilla/fxa-auth-db-mysql/compare/v1.128.1...v1.129.0) (2019-01-24)

### Bug Fixes

- **test:** add a test script to add account rows ([3aa09cd](https://github.com/mozilla/fxa-auth-db-mysql/commit/3aa09cd))

<a name="1.128.1"></a>

## [1.128.1](https://github.com/mozilla/fxa-auth-db-mysql/compare/v1.128.0...v1.128.1) (2019-01-09)

### chore

- **deps:** reshrink to get ramda deps ([260063b](https://github.com/mozilla/fxa-auth-db-mysql/commit/260063b))

<a name="1.128.0"></a>

# [1.128.0](https://github.com/mozilla/fxa-auth-db-mysql/compare/v1.127.0...v1.128.0) (2019-01-08)

### Bug Fixes

- **query:** remove `ROW_COUNT()` from remaining procedures ([4e8b058](https://github.com/mozilla/fxa-auth-db-mysql/commit/4e8b058))
- **query:** update set primary email query to not check if email is verified ([b9bc3c7](https://github.com/mozilla/fxa-auth-db-mysql/commit/b9bc3c7))

### Features

- **npm:** update shrink script ([96b3ce5](https://github.com/mozilla/fxa-auth-db-mysql/commit/96b3ce5))

<a name="1.127.0"></a>

# [1.127.0](https://github.com/mozilla/fxa-auth-db-mysql/compare/v1.126.0...v1.127.0) (2018-12-11)

### chore

- **scripts:** ignore newly failing stored procedures ([edf0bb4](https://github.com/mozilla/fxa-auth-db-mysql/commit/edf0bb4))

### Features

- **scripts:** check for FOREIGN KEY in migration lint script ([82170eb](https://github.com/mozilla/fxa-auth-db-mysql/commit/82170eb))
- **scripts:** check for missing expected encodings on procedure args ([daf2677](https://github.com/mozilla/fxa-auth-db-mysql/commit/daf2677))
- **scripts:** lint-ignore tables that already have foreign keys ([3aeca8e](https://github.com/mozilla/fxa-auth-db-mysql/commit/3aeca8e))

### Refactor

- **scripts:** harmonise row count stuff with rest of lint script ([6065fe8](https://github.com/mozilla/fxa-auth-db-mysql/commit/6065fe8))

<a name="1.126.0"></a>

# [1.126.0](https://github.com/mozilla/fxa-auth-db-mysql/compare/v1.125.0...v1.126.0) (2018-11-27)

### Bug Fixes

- **account:** don't use `LOWER(uid)` in account query ([d2cfe49](https://github.com/mozilla/fxa-auth-db-mysql/commit/d2cfe49))
- **account:** update accountRecord to specify charset for inEmail ([a45c8a0](https://github.com/mozilla/fxa-auth-db-mysql/commit/a45c8a0))
- **tests:** Don't put binary data into fake email addresses. ([5c83dec](https://github.com/mozilla/fxa-auth-db-mysql/commit/5c83dec))

<a name="1.125.0"></a>

# [1.125.0](https://github.com/mozilla/fxa-auth-db-mysql/compare/v1.124.1...v1.125.0) (2018-11-14)

### Bug Fixes

- **scripts:** stop the explain script tripping over git grep colours ([ff0ac5c](https://github.com/mozilla/fxa-auth-db-mysql/commit/ff0ac5c))

### chore

- **db:** use mariadb-friendly drop index syntax ([f01b520](https://github.com/mozilla/fxa-auth-db-mysql/commit/f01b520))
- **scripts:** lint-ignore consumeRecoveryCode_2 and setPrimaryEmail_3 ([5ddf863](https://github.com/mozilla/fxa-auth-db-mysql/commit/5ddf863))

### Features

- **scripts:** add ROW_COUNT() checks to the procedure-linting script ([0eb0142](https://github.com/mozilla/fxa-auth-db-mysql/commit/0eb0142))

<a name="1.124.1"></a>

## [1.124.1](https://github.com/mozilla/fxa-auth-db-mysql/compare/v1.124.0...v1.124.1) (2018-11-02)

### Bug Fixes

- **package:** update deps ([d44e10f](https://github.com/mozilla/fxa-auth-db-mysql/commit/d44e10f))

<a name="1.124.0"></a>

# [1.124.0](https://github.com/mozilla/fxa-auth-db-mysql/compare/v1.123.3...v1.124.0) (2018-10-30)

<a name="1.123.3"></a>

## [1.123.3](https://github.com/mozilla/fxa-auth-db-mysql/compare/v1.123.2...v1.123.3) (2018-10-30)

### Bug Fixes

- **accountRecord:** Rollback `accountRecord_4` due to unexplained performance issues. ([034b3b0](https://github.com/mozilla/fxa-auth-db-mysql/commit/034b3b0))
- **migration:** Fix typo in SP name in reverse migration for 91. ([5b08dba](https://github.com/mozilla/fxa-auth-db-mysql/commit/5b08dba))

<a name="1.123.2"></a>

## [1.123.2](https://github.com/mozilla/fxa-auth-db-mysql/compare/v1.123.1...v1.123.2) (2018-10-26)

### Bug Fixes

- **account:** rollback `profileChangedAt` migration ([4b4f7d4](https://github.com/mozilla/fxa-auth-db-mysql/commit/4b4f7d4))

<a name="1.123.1"></a>

## [1.123.1](https://github.com/mozilla/fxa-auth-db-mysql/compare/v1.122.1...v1.123.1) (2018-10-22)

<a name="1.123.0"></a>

# [1.123.0](https://github.com/mozilla/fxa-auth-db-mysql/compare/v1.121.0...v1.123.0) (2018-10-16)

### Bug Fixes

- **account:** delete recovery codes, recovery keys, security events on account delete ([a8d0467](https://github.com/mozilla/fxa-auth-db-mysql/commit/a8d0467))
- **mem:** ensure emailBounces are stored most-recent first ([ccf6c3c](https://github.com/mozilla/fxa-auth-db-mysql/commit/ccf6c3c))
- **performance:** Add index for scanning signinCodes by uid. ([905e716](https://github.com/mozilla/fxa-auth-db-mysql/commit/905e716))

### chore

- **deps:** Update deps to fix security warnings, remove nsp ([5581297](https://github.com/mozilla/fxa-auth-db-mysql/commit/5581297))

<a name="1.122.1"></a>

## [1.122.1](https://github.com/mozilla/fxa-auth-db-mysql/compare/v1.121.1...v1.122.1) (2018-10-22)

<a name="1.122.0"></a>

# [1.122.0](https://github.com/mozilla/fxa-auth-db-mysql/compare/v1.121.0...v1.122.0) (2018-10-02)

### Features

- **account:** add `profileChangedAt` property to account table ([24917b7](https://github.com/mozilla/fxa-auth-db-mysql/commit/24917b7))

<a name="1.121.1"></a>

## [1.121.1](https://github.com/mozilla/fxa-auth-db-mysql/compare/v1.121.0...v1.121.1) (2018-10-18)

### Bug Fixes

- **account:** update stored procedures to be more replication friendly ([3c1dd5a](https://github.com/mozilla/fxa-auth-db-mysql/commit/3c1dd5a))

<a name="1.121.0"></a>

# [1.121.0](https://github.com/mozilla/fxa-auth-db-mysql/compare/v1.120.0...v1.121.0) (2018-09-18)

### chore

- **scripts:** disable the explain script in production ([52447bb](https://github.com/mozilla/fxa-auth-db-mysql/commit/52447bb))
- **scripts:** tweak some old migrations to fix explain errors ([9e9457c](https://github.com/mozilla/fxa-auth-db-mysql/commit/9e9457c))

### Features

- **scripts:** add an ignore file for the explain script ([b90688c](https://github.com/mozilla/fxa-auth-db-mysql/commit/b90688c))
- **scripts:** add script to automate MySQL EXPLAIN checks ([31fff59](https://github.com/mozilla/fxa-auth-db-mysql/commit/31fff59))

<a name="1.120.0"></a>

# [1.120.0](https://github.com/mozilla/fxa-auth-db-mysql/compare/v1.118.1...v1.120.0) (2018-09-06)

### Bug Fixes

- **devices:** Reinstate device commands, with performance fixes. (#389) r=@vladikoff,@philboot ([a01e4aa](https://github.com/mozilla/fxa-auth-db-mysql/commit/a01e4aa)), closes [#384](https://github.com/mozilla/fxa-auth-db-mysql/issues/384) [#384](https://github.com/mozilla/fxa-auth-db-mysql/issues/384)
- **recovery:** hash recovery key ([fe12332](https://github.com/mozilla/fxa-auth-db-mysql/commit/fe12332))
- **scripts:** remove nonsense (but harmless) comparison of bool to -1 (#394) r=@vladikoff ([13ca415](https://github.com/mozilla/fxa-auth-db-mysql/commit/13ca415))

### chore

- **db:** ensure mem db behaves like mysql db ([8d5d55f](https://github.com/mozilla/fxa-auth-db-mysql/commit/8d5d55f))
- **docs:** update mysql docs (#391) r=@rfk ([64634d4](https://github.com/mozilla/fxa-auth-db-mysql/commit/64634d4))

<a name="1.119.1"></a>

## [1.119.1](https://github.com/mozilla/fxa-auth-db-mysql/compare/v1.118.1...v1.119.1) (2018-08-23)

### Bug Fixes

- **devices:** Reinstate device commands, with performance fixes. (#389) r=@vladikoff,@philboot ([a01e4aa](https://github.com/mozilla/fxa-auth-db-mysql/commit/a01e4aa)), closes [#384](https://github.com/mozilla/fxa-auth-db-mysql/issues/384) [#384](https://github.com/mozilla/fxa-auth-db-mysql/issues/384)

### chore

- **db:** ensure mem db behaves like mysql db ([8d5d55f](https://github.com/mozilla/fxa-auth-db-mysql/commit/8d5d55f))

<a name="1.119.0"></a>

# [1.119.0](https://github.com/mozilla/fxa-auth-db-mysql/compare/v1.118.1...v1.119.0) (2018-08-21)

### chore

- **db:** ensure mem db behaves like mysql db ([8d5d55f](https://github.com/mozilla/fxa-auth-db-mysql/commit/8d5d55f))

<a name="1.118.1"></a>

## [1.118.1](https://github.com/mozilla/fxa-auth-db-mysql/compare/v1.118.0...v1.118.1) (2018-08-18)

### chore

- **db:** stop calling the upsertAvailableCommands procedure ([06554f5](https://github.com/mozilla/fxa-auth-db-mysql/commit/06554f5))

<a name="1.118.0"></a>

# [1.118.0](https://github.com/mozilla/fxa-auth-db-mysql/compare/v1.117.0...v1.118.0) (2018-08-14)

### Bug Fixes

- **restify:** set keepAliveTimeout correctly on api.server object (#381) ([afc376c](https://github.com/mozilla/fxa-auth-db-mysql/commit/afc376c))
- **restify:** set server.keepAliveTimeout to 120s, similar to in node6 (#380) ([5ece670](https://github.com/mozilla/fxa-auth-db-mysql/commit/5ece670))

<a name="1.117.0"></a>

# [1.117.0](https://github.com/mozilla/fxa-auth-db-mysql/compare/v1.116.0...v1.117.0) (2018-07-24)

### Bug Fixes

- **tests:** move local utils tests so they get run by npm t (#377) r=@vladikoff ([677d02b](https://github.com/mozilla/fxa-auth-db-mysql/commit/677d02b))

### Features

- **ci:** update to circle 2 (#375) r=@vbudhram ([5d7b35b](https://github.com/mozilla/fxa-auth-db-mysql/commit/5d7b35b))
- **recovery:** update account recovery GET/DEL to not accept recoveryKeyId (#374), r=@rfk ([29b9b4b](https://github.com/mozilla/fxa-auth-db-mysql/commit/29b9b4b))

<a name="1.116.0"></a>

# [1.116.0](https://github.com/mozilla/fxa-auth-db-mysql/compare/v1.115.0...v1.116.0) (2018-07-11)

### chore

- **package:** update shrinkwrap ([98755f7](https://github.com/mozilla/fxa-auth-db-mysql/commit/98755f7))
- **release:** Merge mozilla/train-115 into master r=@shane-tomlinson ([b5c0f0e](https://github.com/mozilla/fxa-auth-db-mysql/commit/b5c0f0e))

### Features

- **scripts:** add boilerplate to detect missing migrations ([7ef4c66](https://github.com/mozilla/fxa-auth-db-mysql/commit/7ef4c66))

### Refactor

- **recovery:** Use base32 for recovery code generation (#372), r=@vbudhram ([77a6fdd](https://github.com/mozilla/fxa-auth-db-mysql/commit/77a6fdd))

<a name="1.115.0"></a>

# [1.115.0](https://github.com/mozilla/fxa-auth-db-mysql/compare/v1.114.1...v1.115.0) (2018-06-27)

<a name="1.114.1"></a>

## [1.114.1](https://github.com/mozilla/fxa-auth-db-mysql/compare/v1.114.0...v1.114.1) (2018-06-13)

### Bug Fixes

- **docker:** base image node:8-alpine and upgrade to npm6 ([c66d3f0](https://github.com/mozilla/fxa-auth-db-mysql/commit/c66d3f0))

<a name="1.114.0"></a>

# [1.114.0](https://github.com/mozilla/fxa-auth-db-mysql/compare/v1.113.1...v1.114.0) (2018-06-13)

### Features

- **devices:** Allow devices to register "available commands". (#354); r=philbooth,eoger ([10bb799](https://github.com/mozilla/fxa-auth-db-mysql/commit/10bb799))

<a name="1.113.1"></a>

## [1.113.1](https://github.com/mozilla/fxa-auth-db-mysql/compare/v1.113.0...v1.113.1) (2018-05-30)

### Reverts

- **devices:** Revert "available commands" for train-113. (#360); r=jrgm ([cbe7981](https://github.com/mozilla/fxa-auth-db-mysql/commit/cbe7981))

<a name="1.113.0"></a>

# [1.113.0](https://github.com/mozilla/fxa-auth-db-mysql/compare/v1.112.0...v1.113.0) (2018-05-30)

### chore

- **ci:** Remove coveralls from travis config. (#355) ([c94fe0b](https://github.com/mozilla/fxa-auth-db-mysql/commit/c94fe0b))

### Features

- **devices:** Allow devices to register "available commands". (#354); r=philbooth,eoger ([69816f6](https://github.com/mozilla/fxa-auth-db-mysql/commit/69816f6))
- **recovery:** Add initial account recovery support (#357), r=@rfk, @philbooth ([f6716ad](https://github.com/mozilla/fxa-auth-db-mysql/commit/f6716ad))

<a name="1.112.0"></a>

# [1.112.0](https://github.com/mozilla/fxa-auth-db-mysql/compare/v1.111.0...v1.112.0) (2018-05-16)

### Bug Fixes

- **deps:** update to restify 7.1 and mysql 2.15 (#351), r=@rfk ([4415850](https://github.com/mozilla/fxa-auth-db-mysql/commit/4415850))
- **restify:** set a sane max param length value for restify ([d84c827](https://github.com/mozilla/fxa-auth-db-mysql/commit/d84c827))
- **restify:** update param size ([bb78be2](https://github.com/mozilla/fxa-auth-db-mysql/commit/bb78be2))

### Features

- **changelog:** Add an "acknowledgements" section to some changelog entries. (#350) ([5a27b0a](https://github.com/mozilla/fxa-auth-db-mysql/commit/5a27b0a))

<a name="1.111.0"></a>

# [1.111.0](https://github.com/mozilla/fxa-auth-db-mysql/compare/v1.110.0...v1.111.0) (2018-05-02)

### Bug Fixes

- **npm:** update shrinkwrap to npm 5.8 (#344) r=@jrgm ([a841d06](https://github.com/mozilla/fxa-auth-db-mysql/commit/a841d06))
- **tests:** increase timeout on recovery code tests (#339), r=@jrgm ([f202197](https://github.com/mozilla/fxa-auth-db-mysql/commit/f202197))

### Features

- **node:** update to node 8 (#341) r=@jrgm ([8bcc7dd](https://github.com/mozilla/fxa-auth-db-mysql/commit/8bcc7dd))

### Refactor

- **db:** Fixes #340 Remove column createdAt on recoveryCode table (#342), r=@vbudhram ([1b59224](https://github.com/mozilla/fxa-auth-db-mysql/commit/1b59224)), closes [#340](https://github.com/mozilla/fxa-auth-db-mysql/issues/340) [(#342](https://github.com/(/issues/342)

<a name="1.110.0"></a>

# [1.110.0](https://github.com/mozilla/fxa-auth-db-mysql/compare/v1.109.0...v1.110.0) (2018-04-18)

### Bug Fixes

- **codes:** remove current recovery codes before applying migration (#337), r=@rfk ([23cbc61](https://github.com/mozilla/fxa-auth-db-mysql/commit/23cbc61))
- **codes:** update recovery code requirements (#333), r=@philbooth ([2ca7d9f](https://github.com/mozilla/fxa-auth-db-mysql/commit/2ca7d9f))
- **devices:** Rename pushbox capability to messages and add messages.sendtab capability (#335) ([5a1535a](https://github.com/mozilla/fxa-auth-db-mysql/commit/5a1535a))

<a name="1.109.0"></a>

# [1.109.0](https://github.com/mozilla/fxa-auth-db-mysql/compare/v1.107.1...v1.109.0) (2018-04-04)

### Bug Fixes

- **codes:** drop all codes when one is consumed (#326) r=@rfk ([f6ab498](https://github.com/mozilla/fxa-auth-db-mysql/commit/f6ab498))
- **node:** Use Node.js v6.14.0 (#332) ([1400a26](https://github.com/mozilla/fxa-auth-db-mysql/commit/1400a26))
- **unblock:** update consume unblock code (#330) r=@vladikoff ([9bdb47b](https://github.com/mozilla/fxa-auth-db-mysql/commit/9bdb47b))
- **verify:** update verifyWithMethod to update a session verification status (#329), r=@philb ([9c433ba](https://github.com/mozilla/fxa-auth-db-mysql/commit/9c433ba))

### Features

- **mysql:** Add config option for REQUIRED_SQL_MODES. (#334) r=@philbooth,@vladikoff ([a229ddc](https://github.com/mozilla/fxa-auth-db-mysql/commit/a229ddc))
- **mysql:** STRICT_ALL_TABLES and NO_ENGINE_SUBSTITUTION required in sql (#327) r=@vladikoff ([c226b07](https://github.com/mozilla/fxa-auth-db-mysql/commit/c226b07))

### Acknowledgements

Thanks to Yusuf Yazir <y.yazir@rocketmail.com> for suggesting a security improvement
in the handling of unblock codes ([Bug 1368827](https://bugzilla.mozilla.org/show_bug.cgi?id=1368827)).

<a name="1.108.0"></a>

# [1.108.0](https://github.com/mozilla/fxa-auth-db-mysql/compare/v1.107.0...v1.108.0) (2018-03-20)

### Bug Fixes

- **buffers:** convert remaining Buffer to Buffer.from r=@vladikoff ([5092779](https://github.com/mozilla/fxa-auth-db-mysql/commit/5092779)), closes [#316](https://github.com/mozilla/fxa-auth-db-mysql/issues/316)
- **db:** remove database configuration option, hardcode 'fxa'  (#314) r=@vladikoff ([c2e21dd](https://github.com/mozilla/fxa-auth-db-mysql/commit/c2e21dd)), closes [#290](https://github.com/mozilla/fxa-auth-db-mysql/issues/290)
- **email:** Use email buffer for DEL ‘/email/:email’ route (#315), r=@vladikoff, @vbudhram ([cc6e08b](https://github.com/mozilla/fxa-auth-db-mysql/commit/cc6e08b))
- **test:** correct promises error handling (#325) r=@eoger ([7effcb3](https://github.com/mozilla/fxa-auth-db-mysql/commit/7effcb3))

### chore

- **api:** remove bufferization from db layer ([818edcf](https://github.com/mozilla/fxa-auth-db-mysql/commit/818edcf))

### Features

- **devices:** Devices capabilities (#320) r=@philbooth ([4808a1c](https://github.com/mozilla/fxa-auth-db-mysql/commit/4808a1c))
- **node:** update to node v6.13.1 r=@jbuck ([7727d88](https://github.com/mozilla/fxa-auth-db-mysql/commit/7727d88))
- **totp:** initial recovery codes (#319), r=@philbooth ([995d52b](https://github.com/mozilla/fxa-auth-db-mysql/commit/995d52b))

<a name="1.108.0"></a>

# [1.108.0](https://github.com/mozilla/fxa-auth-db-mysql/compare/v1.107.0...v1.108.0) (2018-03-20)

### Bug Fixes

- **buffers:** convert remaining Buffer to Buffer.from r=@vladikoff ([5092779](https://github.com/mozilla/fxa-auth-db-mysql/commit/5092779)), closes [#316](https://github.com/mozilla/fxa-auth-db-mysql/issues/316)
- **db:** remove database configuration option, hardcode 'fxa'  (#314) r=@vladikoff ([c2e21dd](https://github.com/mozilla/fxa-auth-db-mysql/commit/c2e21dd)), closes [#290](https://github.com/mozilla/fxa-auth-db-mysql/issues/290)
- **email:** Use email buffer for DEL ‘/email/:email’ route (#315), r=@vladikoff, @vbudhram ([cc6e08b](https://github.com/mozilla/fxa-auth-db-mysql/commit/cc6e08b))
- **test:** correct promises error handling (#325) r=@eoger ([7effcb3](https://github.com/mozilla/fxa-auth-db-mysql/commit/7effcb3))

### chore

- **api:** remove bufferization from db layer ([818edcf](https://github.com/mozilla/fxa-auth-db-mysql/commit/818edcf))

### Features

- **devices:** Devices capabilities (#320) r=@philbooth ([4808a1c](https://github.com/mozilla/fxa-auth-db-mysql/commit/4808a1c))
- **node:** update to node v6.13.1 r=@jbuck ([7727d88](https://github.com/mozilla/fxa-auth-db-mysql/commit/7727d88))
- **totp:** initial recovery codes (#319), r=@philbooth ([995d52b](https://github.com/mozilla/fxa-auth-db-mysql/commit/995d52b))

<a name="1.107.1"></a>

# [1.107.1](https://github.com/mozilla/fxa-auth-db-mysql/compare/v1.107.0...v1.107.1) (2018-03-21)

### Bug Fixes

- **emails:** Make all request paths containing an email use hex encoding. (#1); r=philbooth ([6059aca](https://github.com/mozilla/fxa-auth-db-mysql/commit/6059aca))

<a name="1.107.0"></a>

# [1.107.0](https://github.com/mozilla/fxa-auth-db-mysql/compare/v1.106.0...v1.107.0) (2018-03-07)

### chore

- **tests:** cleanup `sessionToken` endpoints and docs, r=@philbooth, @rfk ([da2e9ef](https://github.com/mozilla/fxa-auth-db-mysql/commit/da2e9ef))

### Features

- **totp:** Add initial totp session verification logic (#309), r=@philbooth ([ee19e1b](https://github.com/mozilla/fxa-auth-db-mysql/commit/ee19e1b))
- **totp:** vlad updates for totp (#313) r=@vladikoff ([f6d603c](https://github.com/mozilla/fxa-auth-db-mysql/commit/f6d603c))

<a name="1.106.0"></a>

# [1.106.0](https://github.com/mozilla/fxa-auth-db-mysql/compare/v1.105.0...v1.106.0) (2018-02-21)

### Bug Fixes

- **token:** Fix mem verifyTokenCode (#303), r=@rfk, @philbooth ([6a4fb67](https://github.com/mozilla/fxa-auth-db-mysql/commit/6a4fb67)), closes [(#303](https://github.com/(/issues/303)

### chore

- **deps:** update deps, fix nsp (#308) r=@philbooth ([0d874f9](https://github.com/mozilla/fxa-auth-db-mysql/commit/0d874f9)), closes [(#308](https://github.com/(/issues/308)

### Features

- **sessions:** Add support for reauth on an existing session. (#305); r=philbooth ([fdff3e9](https://github.com/mozilla/fxa-auth-db-mysql/commit/fdff3e9))
- **totp:** Add totp management api (#299), r=@philbooth ([9b8efcb](https://github.com/mozilla/fxa-auth-db-mysql/commit/9b8efcb))

<a name="1.105.0"></a>

# [1.105.0](https://github.com/mozilla/fxa-auth-db-mysql/compare/v1.104.0...v1.105.0) (2018-02-06)

### Features

- **tests:** make tests more independent (#293), r=@philbooth, @rfk ([c7d3638](https://github.com/mozilla/fxa-auth-db-mysql/commit/c7d3638))

<a name="1.104.0"></a>

# [1.104.0](https://github.com/mozilla/fxa-auth-db-mysql/compare/v1.103.0...v1.104.0) (2018-01-23)

### Bug Fixes

- **pruning:** Avoid accidental full-table scans when pruning session tokens. (#295); r=philboo ([5c6622c](https://github.com/mozilla/fxa-auth-db-mysql/commit/5c6622c))
- **scripts:** add SET NAMES to reverse migration boilerplate (#296), r=@vbudhram ([0790b89](https://github.com/mozilla/fxa-auth-db-mysql/commit/0790b89))

### Features

- **devices:** return session token id from deleteDevice ([a2dd244](https://github.com/mozilla/fxa-auth-db-mysql/commit/a2dd244))

<a name="1.103.0"></a>

# [1.103.0](https://github.com/mozilla/fxa-auth-db-mysql/compare/v1.101.0...v1.103.0) (2018-01-09)

### Bug Fixes

- **node:** use node 6.12.3 (#291) r=@vladikoff ([6080c0c](https://github.com/mozilla/fxa-auth-db-mysql/commit/6080c0c))

### Features

- **logs:** add Sentry for errors (#292) r=@vbudhram ([6348a95](https://github.com/mozilla/fxa-auth-db-mysql/commit/6348a95)), closes [#288](https://github.com/mozilla/fxa-auth-db-mysql/issues/288)

<a name="1.101.0"></a>

# [1.101.0](https://github.com/mozilla/fxa-auth-db-mysql/compare/v1.100.0...v1.101.0) (2017-11-29)

### Features

- **codes:** add support for verifying token short code (#287) r=@vladikoff,@rfk ([ac0b814](https://github.com/mozilla/fxa-auth-db-mysql/commit/ac0b814))

### Refactor

- **dbserver:** clean up the db server package (#289) r=@rfk ([c3d8e6e](https://github.com/mozilla/fxa-auth-db-mysql/commit/c3d8e6e))

<a name="1.100.0"></a>

# [1.100.0](https://github.com/mozilla/fxa-auth-db-mysql/compare/v1.98.0...v1.100.0) (2017-11-15)

### Bug Fixes

- **newrelic:** futureproofing comment and up to newrelic@2.3.2 with npm run shrink (#285) r=@vl ([bfc1963](https://github.com/mozilla/fxa-auth-db-mysql/commit/bfc1963))
- **newrelic:** newrelic native requires make, python, gyp, c++; update node 6.12.0 (#286) r=@vl ([4b7e696](https://github.com/mozilla/fxa-auth-db-mysql/commit/4b7e696))
- **travis:** run tests with 6 and current stable (failure not allowed anymore) ([c4e0e98](https://github.com/mozilla/fxa-auth-db-mysql/commit/c4e0e98))

<a name="1.98.0"></a>

# [1.98.0](https://github.com/mozilla/fxa-auth-db-mysql/compare/v1.97.0...v1.98.0) (2017-10-26)

### chore

- **docker:** Update to node v6.11.5 for security fix ([7cc3251](https://github.com/mozilla/fxa-auth-db-mysql/commit/7cc3251))

<a name="1.97.0"></a>

# [1.97.0](https://github.com/mozilla/fxa-auth-db-mysql/compare/v1.96.1...v1.97.0) (2017-10-04)

### Features

- **db:** prune session tokens (again) ([67bd8fb](https://github.com/mozilla/fxa-auth-db-mysql/commit/67bd8fb))

<a name="1.96.1"></a>

## [1.96.1](https://github.com/mozilla/fxa-auth-db-mysql/compare/v1.96.0...v1.96.1) (2017-09-20)

### Bug Fixes

- **db:** call latest version of the prune stored procedure (#281) r=vladikoff ([2c34f2e](https://github.com/mozilla/fxa-auth-db-mysql/commit/2c34f2e))

<a name="1.96.0"></a>

# [1.96.0](https://github.com/mozilla/fxa-auth-db-mysql/compare/v1.95.1...v1.96.0) (2017-09-19)

### Bug Fixes

- **tokens:** revert session-token pruning ([ecde71b](https://github.com/mozilla/fxa-auth-db-mysql/commit/ecde71b))

<a name="1.95.1"></a>

## [1.95.1](https://github.com/mozilla/fxa-auth-db-mysql/compare/v1.95.0...v1.95.1) (2017-09-12)

### Bug Fixes

- **mysql:** update all device procedures to use utf8mb4 (#276) r=jbuck,rfk ([7d22ad8](https://github.com/mozilla/fxa-auth-db-mysql/commit/7d22ad8))
- **tokens:** prune old session tokens that have no device record ([8fad575](https://github.com/mozilla/fxa-auth-db-mysql/commit/8fad575))

<a name="1.95.0"></a>

# [1.95.0](https://github.com/mozilla/fxa-auth-db-mysql/compare/v1.94.1...v1.95.0) (2017-09-06)

### chore

- **docs:** update node version in docs to 6 ([63fbdf2](https://github.com/mozilla/fxa-auth-db-mysql/commit/63fbdf2))

### Features

- **schema:** add a pushEndpointExpired column to devices ([d8e93c4](https://github.com/mozilla/fxa-auth-db-mysql/commit/d8e93c4))

<a name="1.94.1"></a>

## [1.94.1](https://github.com/mozilla/fxa-auth-db-mysql/compare/v1.94.0...v1.94.1) (2017-08-23)

### Features

- **db:** add utf8mb4 support (#267) r=rfk ([549d39f](https://github.com/mozilla/fxa-auth-db-mysql/commit/549d39f))

<a name="1.94.0"></a>

# [1.94.0](https://github.com/mozilla/fxa-auth-db-mysql/compare/v1.93.0...v1.94.0) (2017-08-21)

### chore

- **ci:** remove node4 test targets from travis-ci (#270) r=vladikoff ([9523d02](https://github.com/mozilla/fxa-auth-db-mysql/commit/9523d02))
- **email:** Remove emailRecord depreciation (#269), r=@philbooth ([0a7c2c6](https://github.com/mozilla/fxa-auth-db-mysql/commit/0a7c2c6))

### Features

- **schema:** add a uaFormFactor column to sessionTokens (#271) r=vladikoff ([774b6c1](https://github.com/mozilla/fxa-auth-db-mysql/commit/774b6c1))

<a name="1.93.0"></a>

# [1.93.0](https://github.com/mozilla/fxa-auth-db-mysql/compare/v1.92.0...v1.93.0) (2017-08-09)

### Features

- **docker:** update to node 6 (#266) r=jbuck ([7b13cea](https://github.com/mozilla/fxa-auth-db-mysql/commit/7b13cea))

<a name="1.92.0"></a>

# [1.92.0](https://github.com/mozilla/fxa-auth-db-mysql/compare/v1.91.2...v1.92.0) (2017-07-26)

### chore

- **scripts:** add a script to generate migration boilerplate (#261) r=vladikoff ([45949c5](https://github.com/mozilla/fxa-auth-db-mysql/commit/45949c5))
- **tests:** don't make eslint a prerequisite for the tests (#258), r=@vbudhram ([ddae438](https://github.com/mozilla/fxa-auth-db-mysql/commit/ddae438))

<a name="1.91.2"></a>

## [1.91.2](https://github.com/mozilla/fxa-auth-db-mysql/compare/v1.91.1...v1.91.2) (2017-07-17)

### Features

- **schema:** drop the uaFormFactor column from sessionTokens (#262), r=@vbudhram ([f23098a](https://github.com/mozilla/fxa-auth-db-mysql/commit/f23098a))

<a name="1.91.1"></a>

## [1.91.1](https://github.com/mozilla/fxa-auth-db-mysql/compare/v1.91.0...v1.91.1) (2017-07-12)

### Bug Fixes

- **nodejs:** upgrade to 4.8.4 for security fixes ([450e931](https://github.com/mozilla/fxa-auth-db-mysql/commit/450e931))

<a name="1.91.0"></a>

# [1.91.0](https://github.com/mozilla/fxa-auth-db-mysql/compare/v1.90.0...v1.91.0) (2017-07-12)

### Features

- **email:** Add change email (#254), r=@philbooth ([7253d09](https://github.com/mozilla/fxa-auth-db-mysql/commit/7253d09))
- **email:** correctly return `createdAt` when using accountRecord (#256), r=@philbooth ([70a1a39](https://github.com/mozilla/fxa-auth-db-mysql/commit/70a1a39))
- **schema:** add a uaFormFactor column to sessionTokens ([e99bc19](https://github.com/mozilla/fxa-auth-db-mysql/commit/e99bc19))

<a name="1.90.0"></a>

# [1.90.0](https://github.com/mozilla/fxa-auth-db-mysql/compare/v1.89.1...v1.90.0) (2017-06-28)

### chore

- **eslint:** update to latest eslint (#252) r=vbudhram ([1157bb2](https://github.com/mozilla/fxa-auth-db-mysql/commit/1157bb2))
- **train:** uplift train 89 (#253), r=@philbooth ([06944e8](https://github.com/mozilla/fxa-auth-db-mysql/commit/06944e8))

### Features

- **db:** store flowIds with signinCodes ([3fac7d7](https://github.com/mozilla/fxa-auth-db-mysql/commit/3fac7d7))
- **email:** Update procedures to use email table (#245), r=@philbooth, @rfk ([b896063](https://github.com/mozilla/fxa-auth-db-mysql/commit/b896063))
- **tokens:** Add ability to reset accounts tokens (#249), r=@philbooth ([92199bc](https://github.com/mozilla/fxa-auth-db-mysql/commit/92199bc))

<a name="1.89.3"></a>

## [1.89.3](https://github.com/mozilla/fxa-auth-db-mysql/compare/v1.89.2...v1.89.3) (2017-06-21)

### Features

- **email:** Don't use subquery on email verify update (#251), r=@jbuck ([102dea4](https://github.com/mozilla/fxa-auth-db-mysql/commit/102dea4))

<a name="1.89.2"></a>

## [1.89.2](https://github.com/mozilla/fxa-auth-db-mysql/compare/v1.89.1...v1.89.2) (2017-06-21)

### Features

- **email:** Remove temporary table from `accountEmails` query (#250), r=@rfk, @jbuck ([e9d0335](https://github.com/mozilla/fxa-auth-db-mysql/commit/e9d0335))

<a name="1.89.1"></a>

## [1.89.1](https://github.com/mozilla/fxa-auth-db-mysql/compare/v1.89.0...v1.89.1) (2017-06-14)

### Features

- **email:** Add email table migration script (#247), r=@rfk, @jbuck ([9ef8cbf](https://github.com/mozilla/fxa-auth-db-mysql/commit/9ef8cbf))

<a name="1.89.0"></a>

# [1.89.0](https://github.com/mozilla/fxa-auth-db-mysql/compare/v1.87.0...v1.89.0) (2017-06-13)

### Features

- **db:** enable signinCode expiry ([2b53553](https://github.com/mozilla/fxa-auth-db-mysql/commit/2b53553))
- **email:** Keep account email and emails table in sync (#241), r=@rfk, @philbooth ([78d5559](https://github.com/mozilla/fxa-auth-db-mysql/commit/78d5559))

### Refactor

- **test:** refactor our tests to use Mocha instead of TAP ([0441ea9](https://github.com/mozilla/fxa-auth-db-mysql/commit/0441ea9))

<a name="1.87.0"></a>

# [1.87.0](https://github.com/mozilla/fxa-auth-db-mysql/compare/v1.85.0...v1.87.0) (2017-05-17)

### Bug Fixes

- **docs:** update authors and node.js version in README ([5610b92](https://github.com/mozilla/fxa-auth-db-mysql/commit/5610b92))
- **email:** Use correct delete account procedure (#231) ([4a16bf3](https://github.com/mozilla/fxa-auth-db-mysql/commit/4a16bf3))

### chore

- **docker:** Use official node image & update to Node.js v4.8.2 (#225) r=vladikoff ([2298e38](https://github.com/mozilla/fxa-auth-db-mysql/commit/2298e38))

### Features

- **docker:** add custom feature branch (#237) r=jrgm ([d21a8df](https://github.com/mozilla/fxa-auth-db-mysql/commit/d21a8df))
- **email:** Add get email endpoint (#227), r=@vladikoff, @rfk ([8f5653c](https://github.com/mozilla/fxa-auth-db-mysql/commit/8f5653c))
- **signinCodes:** migration and endpoints for signinCodes table (#235), r=@vbudhram ([b740793](https://github.com/mozilla/fxa-auth-db-mysql/commit/b740793))
- **tokens:** prune tokens older than 3 months (#224) r=vladikoff ([fdc19c1](https://github.com/mozilla/fxa-auth-db-mysql/commit/fdc19c1)), closes [#219](https://github.com/mozilla/fxa-auth-db-mysql/issues/219)

<a name="1.86.0"></a>

# [1.86.0](https://github.com/mozilla/fxa-auth-db-mysql/compare/v1.85.0...v1.86.0) (2017-05-01)

### Bug Fixes

- **docs:** update authors and node.js version in README ([6d89d30](https://github.com/mozilla/fxa-auth-db-mysql/commit/6d89d30))

### chore

- **docker:** Use official node image & update to Node.js v4.8.2 (#225) r=vladikoff ([2298e38](https://github.com/mozilla/fxa-auth-db-mysql/commit/2298e38))

### Features

- **email:** Add get email endpoint (#227), r=@vladikoff, @rfk ([8f5653c](https://github.com/mozilla/fxa-auth-db-mysql/commit/8f5653c))
- **tokens:** prune tokens older than 3 months (#224) r=vladikoff ([fdc19c1](https://github.com/mozilla/fxa-auth-db-mysql/commit/fdc19c1)), closes [#219](https://github.com/mozilla/fxa-auth-db-mysql/issues/219)

<a name="1.85.0"></a>

# [1.85.0](https://github.com/mozilla/fxa-auth-db-mysql/compare/v0.83.0...v1.85.0) (2017-04-18)

### Bug Fixes

- **install:** add formatter to main package.json (#222) ([f4cb995](https://github.com/mozilla/fxa-auth-db-mysql/commit/f4cb995))
- **security:** escape json output (#220) r=vladikoff ([13b9f70](https://github.com/mozilla/fxa-auth-db-mysql/commit/13b9f70))

### chore

- **dependencies:** update all our production dependencies (#217) r=vladikoff ([e008849](https://github.com/mozilla/fxa-auth-db-mysql/commit/e008849))

<a name="0.83.0"></a>

# [0.83.0](https://github.com/mozilla/fxa-auth-db-mysql/compare/v0.82.0...v0.83.0) (2017-03-21)

### Bug Fixes

- **config:** Add environment variable for ipHmacKey ([65f6d78](https://github.com/mozilla/fxa-auth-db-mysql/commit/65f6d78))
- **emailBounces:** receive the email parameter in the url as hex ([e1c078b](https://github.com/mozilla/fxa-auth-db-mysql/commit/e1c078b))
- **security-events:** Correctly handle tokenless security events in mem backend (#215) r=vladikoff,sea ([0f816cb](https://github.com/mozilla/fxa-auth-db-mysql/commit/0f816cb))

### Features

- **email:** Add support for adding additional emails (#211), r=@seanmonstar, @rfk ([1c436c9](https://github.com/mozilla/fxa-auth-db-mysql/commit/1c436c9))

<a name="0.82.0"></a>

# [0.82.0](https://github.com/mozilla/fxa-auth-db-mysql/compare/v0.81.0...v0.82.0) (2017-03-06)

### Features

- **docker:** add docker via Circle CI (#212) r=jbuck,seanmonstar ([8f913be](https://github.com/mozilla/fxa-auth-db-mysql/commit/8f913be)), closes [#208](https://github.com/mozilla/fxa-auth-db-mysql/issues/208)
- **sessions:** update the sessions query to include device information (#203) r=vbudhram ([70dcc5b](https://github.com/mozilla/fxa-auth-db-mysql/commit/70dcc5b))

<a name="0.81.0"></a>

# [0.81.0](https://github.com/mozilla/fxa-auth-db-mysql/compare/v0.76.0...v0.81.0) (2017-02-23)

### Bug Fixes

- **email:** Return `createdAt` when calling db.emailRecord (#209), r=@rfk ([1a226cc](https://github.com/mozilla/fxa-auth-db-mysql/commit/1a226cc))
- **reminders:** adjust mysql procedures (#200) r=rfk ([4b6a92d](https://github.com/mozilla/fxa-auth-db-mysql/commit/4b6a92d))
- **style:** replace tab char with a space (#207) r=rfk ([44470ad](https://github.com/mozilla/fxa-auth-db-mysql/commit/44470ad))

### Features

- **db:** add emailBounces table ([4fe29fa](https://github.com/mozilla/fxa-auth-db-mysql/commit/4fe29fa))
- **tokens:** add prune token maxAge and update pruning (#206); r=rfk ([699c352](https://github.com/mozilla/fxa-auth-db-mysql/commit/699c352))
- **tokens:** get the device associated with a tokenVerificationId (#204) r=vladikoff ([7f45075](https://github.com/mozilla/fxa-auth-db-mysql/commit/7f45075))

<a name="0.76.0"></a>

# [0.76.0](https://github.com/mozilla/fxa-auth-db-mysql/compare/v0.75.0...v0.76.0) (2016-12-13)

### Bug Fixes

- **schema:** Complete final phase of several previous migrations ([7eddbc9](https://github.com/mozilla/fxa-auth-db-mysql/commit/7eddbc9))

### chore

- **deps:** add new shrinkwrap command (#193) ([b33c750](https://github.com/mozilla/fxa-auth-db-mysql/commit/b33c750)), closes [#189](https://github.com/mozilla/fxa-auth-db-mysql/issues/189)

<a name="0.75.0"></a>

# [0.75.0](https://github.com/mozilla/fxa-auth-db-mysql/compare/v0.74.0...v0.75.0) (2016-11-30)

### Bug Fixes

- **bufferize:** Only bufferize params we explicitly want as buffers. (#182); r=philbooth ([a461769](https://github.com/mozilla/fxa-auth-db-mysql/commit/a461769))
- **bufferize:** Only bufferize params we explicitly want as buffers. (#187) r=vladikoff ([aad12bb](https://github.com/mozilla/fxa-auth-db-mysql/commit/aad12bb))

### Reverts

- **bufferize:** revert the extra bufferize logic ([e913a66](https://github.com/mozilla/fxa-auth-db-mysql/commit/e913a66))

<a name="0.74.0"></a>

# [0.74.0](https://github.com/mozilla/fxa-auth-db-mysql/compare/v0.72.0...v0.74.0) (2016-11-15)

### chore

- **lint:** Include ./bin/\*.js in eslint coverage ([6c8eeba](https://github.com/mozilla/fxa-auth-db-mysql/commit/6c8eeba))
- **securityEvents:** Stop writing to the `securityEvents.tokenId` column. ([1e3763d](https://github.com/mozilla/fxa-auth-db-mysql/commit/1e3763d))

### Features

- **eventLog:** Remove the unused "eventLog" feature. ([a138e76](https://github.com/mozilla/fxa-auth-db-mysql/commit/a138e76))

<a name="0.72.0"></a>

# [0.72.0](https://github.com/mozilla/fxa-auth-db-mysql/compare/v0.71.0...v0.72.0) (2016-10-19)

### Bug Fixes

- **securityEvents:** Tweak securityEvents db queries based on @jrgm feedback ([ffa5561](https://github.com/mozilla/fxa-auth-db-mysql/commit/ffa5561))

<a name="0.71.0"></a>

# [0.71.0](https://github.com/mozilla/fxa-auth-db-mysql/compare/v0.70.0...v0.71.0) (2016-10-05)

### Bug Fixes

- **travis:** drop node 0.10 test config ([c1b1841](https://github.com/mozilla/fxa-auth-db-mysql/commit/c1b1841))

### chore

- **travis:** add node 6 explicitly to travis (#175) r=vladikoff ([c1556ab](https://github.com/mozilla/fxa-auth-db-mysql/commit/c1556ab))

### Features

- **unblock:** add unblockCode support ([12fb9df](https://github.com/mozilla/fxa-auth-db-mysql/commit/12fb9df))

<a name="0.70.0"></a>

# [0.70.0](https://github.com/mozilla/fxa-auth-db-mysql/compare/v0.69.0...v0.70.0) (2016-09-24)

### Bug Fixes

- **security:** Fix the endpoints for /securityEvents. ([5dfd5f8](https://github.com/mozilla/fxa-auth-db-mysql/commit/5dfd5f8)), closes [#171](https://github.com/mozilla/fxa-auth-db-mysql/issues/171)

### Features

- **db:** return account.email from accountDevices ([b090367](https://github.com/mozilla/fxa-auth-db-mysql/commit/b090367))
- **security:** add security events ([cc31172](https://github.com/mozilla/fxa-auth-db-mysql/commit/cc31172))

<a name="0.69.0"></a>

# [0.69.0](https://github.com/mozilla/fxa-auth-db-mysql/compare/v0.68.0...v0.69.0) (2016-09-09)

### Bug Fixes

- **db:** don't return zombie devices from accountDevices ([6e5c2db](https://github.com/mozilla/fxa-auth-db-mysql/commit/6e5c2db))
- **db:** Fix the typo ([7bfdf91](https://github.com/mozilla/fxa-auth-db-mysql/commit/7bfdf91))
- **db:** Update resetAccount to not delete from accountUnlockCodes ([616602a](https://github.com/mozilla/fxa-auth-db-mysql/commit/616602a))
- **shrinkwrap:** refresh shrinkwrap ([83d94d4](https://github.com/mozilla/fxa-auth-db-mysql/commit/83d94d4))

### feature

- **newrelic:** add optional newrelic integration ([fca7e2e](https://github.com/mozilla/fxa-auth-db-mysql/commit/fca7e2e))

### Refactor

- **db:** Remove account unlock related code. ([340e299](https://github.com/mozilla/fxa-auth-db-mysql/commit/340e299))

<a name="0.68.0"></a>

# [0.68.0](https://github.com/mozilla/fxa-auth-db-mysql/compare/v0.67.0...v0.68.0) (2016-08-24)

### Bug Fixes

- **db:** ensure that devices get deleted with session tokens ([840dda6](https://github.com/mozilla/fxa-auth-db-mysql/commit/840dda6))
- **db:** use an index when deleting device records by sessionToken id. ([f5bbb60](https://github.com/mozilla/fxa-auth-db-mysql/commit/f5bbb60))
- **scripts:** add process.exit to populate script ([7820fdc](https://github.com/mozilla/fxa-auth-db-mysql/commit/7820fdc))
- **scripts:** ensure changelog is updated sanely ([24376cc](https://github.com/mozilla/fxa-auth-db-mysql/commit/24376cc))

### Features

- **scripts:** add device records to the populate script ([c235696](https://github.com/mozilla/fxa-auth-db-mysql/commit/c235696))

# 0.67.0

- fix(deps): update dev dependencies #143
- fix(deps): update prod dependencies #144
- chore(readme): update travis status badge url
- fix(tests): switch coverage tool, add coveralls #145
- chore(deps): update to latest request and sinon #148
- feat(db): Remove account lockout #147
- fix(db): remove createAccountResetToken stored procedure and endpoint #154
- refactor(db): remove openId #153
- feat(db): Record whether we _must_ verify each unverified token #155

# 0.63.0

- feat(db): implement verification state for key fetch tokens #138
- chore(travis): drop node 0.12 support #139
- feat(reminders): add verification reminders #127
- chore(mozlog): update from mozlog@2.0.3 to 2.0.5 #140
- chore(scripts): sort scripts alphabetically #140
- chore(shrinkwrap): add "npm run shrinkwrap" script #140

# 0.62.0

- feat(mx-stats): Add a script to print stats on popular mail providers #134
- feat(db): store push keys according to the current implementation #133
- feat(db): implement new token verification logic #132

# 0.59.0

- fix(logging): log connection config and charset info at startup #131
- fix(tests): adjust notifier tests monkeypatching to accept mozlog signature #130
- fix(logging): adjust logging method calls to use mozlog signature #130
- fix(tests): enforce mozlog rules in test logger #130

# 0.58.0

- fix(db): expunge devices in resetAccount sproc #128

# 0.57.0

- feat(devices): added sessionWithDevice endpoint
- chore(dependencies): upgrade mozlog to 2.0.3

# 0.55.0

- feat(docker): Additional Dockerfile for self-hosting #121
- docs(contributing): Mention git commit guidelines #122

# train-53

- chore(deps): Update mysql package dependency to latest version #112
- fix(tests): Upgrade test runner and fix some test declarations #112

# train-51

- fix(travis): build and test on 0.10, 0.12 and 4.x, and allow failure on >= 5.x
- chore(shrinkwrap): update npm-shrinkwrap.json

# train-50.1

- fix(db): fix memory-store initialisation of device fields to null #117
- fix(version): print out constructor class name; adds /**version** alias #118

# train-50

- chore(nsp): re-added shrinkwrap validation to travis
- fix(server): fix bad route parameter name
- feat(db): update devices to match new requirements

# train-49

- reverted some dependencies to previous versions due to #113

# train-48

- feat(db): add device registration and management endpoints #110

# train-46

- feat(db): add endpoint to return a user's sessions #102
- feat(db): return accountCreatedAt from sessionToken stored procedure #105
- chore(metadata): Update package metadata for stand-alone server lib. #106

# train-45

- fix(metrics): measure request count and time in perf tests - #97
- fix(metrics): append delimiter to metrics output - #94
- chore(version): generate legacy-format output for ./config/version.json - #101
- chore(metrics): add script for creating dummy session tokens - #100
- chore(metrics): report latency in performance tests - #99
- chore(eslint): change complexity rule - #96
- chore(metrics): add scripts for perf-testing metrics queries - #88

# train-44

- There are no longer separate fxa-auth-db-mysql and fxa-auth-db-server repositories - assemble all db repos - #56
- preliminary support for authenticating with OpenID - #78
- feat(db): add script for reporting metrics #80
- feat(db): store user agent and last-access time in sessionTokens - #65
- refactor(config): Use human-readable duration values in config - #62
- fix(tests): used a randomized openid url - #92
- fix(db): default user-agent fields to null in memory backend - #90
- fix(server): prevent insane bufferization of non-hex parameters - #89
- chore(configs): eliminate sub-directory dotfiles - #69
- chore(package): expose scripts for running and testing db-mem - #71
- chore(project): merge db-server project admin/config stuff to top level - #74
- chore(docs): update readme and api docs for merged repos - #76
- reshuffle package.json (use file paths, not file: url) - #77
- chore(coverage): exclude fxa-auth-db-server/node_modules from coverage checks - #82

# train-42

- fix(tests): pass server object to backend tests - #63
- refactor(db): remove verifyHash from responses - #48
- chore(shrinkwrap): update shrinkwrap for verifyHash removal - #61
- chore(shrinkwrap): update shrinkwrap, principally to head of fxa-auth-db-server - #63

# train-41

- feat(api): Return the account email address on passwordChangeToken - #59
- chore(travis): Tell Travis to use #fxa-bots - #60

# train-40

- fix(notifications): always return a promise from db.processUnpublishedEvents, fixes #49 - #52
- fix(npm): Update npm-shrinkwrap to include the last version of fxa-auth-db-server - #50
- chore(cleanup): Fixed some syntax errors reported by ESLint - #55
- fix(db): Return 400 on incorrect password - #53
- refactor(db): Remove old stored procedures that are no longer used - #57

# train-39

- fix(npm): Update npm-shrinkwrap to include the last version of fxa-auth-db-server - #50
- Added checkPassword_1 stored procedure - #45
- Use array for Mysql read() bound parameters - #45
- chore(license): Update license to be SPDX compliant - #46

# train-37

- refactor(lib): move most things into lib/
- build(travis): Test on both io.js v1 and v2
- chore(shrinkwrap): update shrinkwrap picking up lib changes in fxa-auth-db-server

# train-36

- refactor(db): Change table access in stored procedures to be consistent - #36
- fix(db): Fix reverse patches 8->7 and 9->8 - #38
- fix(package): Remove uuid completely since no longer needed - #37
- chore(package): Update to mysql-patcher@0.7.0 - #39
- chore(copyright): Update to grunt-copyright v0.2.0 - #40
- chore(test): Test on node.js v0.10, v0.12 and the latest io.js - #41

# train-35

- there was no train-35 for fxa-auth-db-mysql

# train-34

- feat(events): Publish account events to notification server in a background loop - #25
  - Note: this feature is disabled by default (see 'config.notifications.publishUrl'),
    and will not be enabled in train-34
- fix(notifier): allow us to use the json secret key from the auth-server directly for the notifier - #29
- fix(db): do not set createdAt, verifierSetAt or normalizedEmail here - #31
- fix(logging): load the logger from the new location - #32
- fix(release): add tasks "grunt version" and "grunt version:patch" to - #34
- chore(tests): Remove console logging during test run - #25
- chore(tests): Don't assume log.info message order during tests - #25
- chore(tests): Remove some apparently-unused files in 'test' directory - #25
- chore(package.json): add extra fields related to the repo - #30
- chore(shrinkwrap): update shrinkwrap - #33

# train-33

- Log account activity events for later publishing to notification service - #20
- Fix tests to do more reliable error-message detection - #20
- Correctly pass pool name when getting a connection - #23
- Use mozlog for logging - #21
- Log memory-usage stats emitted by fxa-auth-db-server - #24
- Some documentation and packaging tweaks - #17, #18

# train-32

- Add ability to mark an account as "locked" for security reasons - #7
- Add support for docker-based development workflow - #13

# train-31

- Only fail with a DB patch level less than the one expected
- (hotfix) regenerated npm-shrinkwrap.json that uses the correct version of fxa-auth-db-server - #15
