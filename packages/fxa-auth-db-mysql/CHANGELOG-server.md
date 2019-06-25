train-42

- feat(api): Test to check passwordChangeToken returns the account.email address - #153
- fix(db): ensure that requests for bad paths are logged - #145
- refactor(tests): expect verifyHash to be absent from responses - #143
- chore(travis): Remove chilts from travis notifications - #156

train-41

- fix(db-api): propagate all error fields - #151
- chore(travis): Tell Travis to use #fxa-bots - #152

train-40

- feat(db-api): Add AppError.incorrectPassword for the backends to use in checkPassword - #146
- chore(lint): Clean up some syntax errors reported by ESLint - #147
- chore(lint): Remove more semi colons - #149
- chore(lint): Replace JSHint with ESLint - #149

train-39

- add check password api - #141
- docs(api): Server_API.md docs - #145
- chore(license): Update license to be SPDX compliant - #142
- refactor(lib): Move source files into lib/ to tidy up - #140
- build(travis): Test on both io.js v1 and v2 - #139

train-36

- chore(test): Test on node.js v0.10, v0.12 and the latest io.js - #138
- chore(copyright): Update to grunt-copyright v0.2.0 - #137
- refactor(tests): Generate test UIDs a different way (from crypto.randomBytes) - #136
- docs(db): Add docs to help with developing the db repos - #126

train-35

- fix(shrinkwrap): as discussed, only "top-level" repos get shrunkwrapped
- docs(changelog): belatedly add changelog note for train-34

train-34

- fix(db): set createdAt, verifierSetAt and normalizedEmail in the tests - #130
- fix(release): add tasks "grunt version" and "grunt version:patch" to create release tags - #132
- docs(readme): better readme for help implementing a storage backend - #129

train-33

- Tweak logging for compatibility with mozlog - #127
- Emit memory stats for operational logging - #128

train-32

- Add ability to mark an account as "locked" for security reasons - #123, #124

train-31

- Implemented the reverse backend, so now storage repos load the server

train-29

- Add a CONTRIBUTING.md and an AUTHORS file - #104, #117
- Remove references to the old .fxa_dbrc config file - #107, #113
- Failed stored procedures return errors correctly - #95, #94
- Add a unique index to passwordChangeTokens(uid) - #100
- fix(build): Adding --force flag onto grunt validate-shrinkwrap task - #98
- Update convict to newer version - #96
- NOTE: This train will require the addition of stored procedures and a new
  index on passwordChangeTokens to the stage and production databases

train-24

- Use the DB stored procedures, instead of raw SQL - #84
- NOTE: This train will require the addition of stored procedures to the stage and production databases

train-23

- no-op. Rebuild to use nodejs 0.10.32

train-22

- licence, jshint miscellany

train-21

- remove patchLevel from config, now in code - #69, #70
- update node-ass version - #75
- Use named mysql error constants rather than raw magic numbers - #74
- show prune messages at loglevel info - #73

train-20

- add code to remove stale tokens from
  fxa.{accountReset,passwordForgot,passwordChange}Tokens tables - issue #2
  - adds PROCEDURE `prune` to fxa database
  - controlled by options `pruneEvery' and`enablePruning'
- pass err.stack so bunyan actually prints more than "uncaughtException" - #68
- updates to use `mysql-patcher' modules in place of db_patcher script - #71, #72

train-19

- Switch to convict for config
- update ass version
- update restify and request for new qs module

train-18

- use a version of ass that does not pull in gh-badges at all: #58
- email argument is already a buffer: #56, #57
- add shrinkwrap; npm shrinkwrap --dev: #54
- fixed log object not having 'stat' in tests

train-17

- added locale to accounts #53

train-16

- NSTR

train-15

- code cleanup and test addition

train-14

- fix #33 - retryable is matching errno on the wrong object in some cases
- more tests
- fix coverage stats

train-13

- initial version
