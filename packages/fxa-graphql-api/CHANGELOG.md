## 1.204.4

No changes.

## 1.204.3

No changes.

## 1.204.2

No changes.

## 1.204.1

### Bug fixes

- release: Add changelog notes and bump version for 204 ([5b8356e11](https://github.com/mozilla/fxa/commit/5b8356e11))

## 1.204.0

### Other changes

- deps-dev: bump ts-jest from 26.4.3 to 26.5.4 ([dc136b213](https://github.com/mozilla/fxa/commit/dc136b213))
- deps: bump ioredis from 4.25.0 to 4.26.0 ([5c2832d52](https://github.com/mozilla/fxa/commit/5c2832d52))
- deps: bump graphql-query-complexity from 0.7.2 to 0.8.0 ([31b326f68](https://github.com/mozilla/fxa/commit/31b326f68))
- deps-dev: bump @nestjs/cli from 7.5.4 to 7.6.0 ([063a441b1](https://github.com/mozilla/fxa/commit/063a441b1))

## 1.203.5

No changes.

## 1.203.4

No changes.

## 1.203.3

No changes.

## 1.203.2

No changes.

## 1.203.1

No changes.

## 1.203.0

### Other changes

- deps: bump @nestjs/core from 7.6.14 to 7.6.15 ([adfbdd3b3](https://github.com/mozilla/fxa/commit/adfbdd3b3))
- deps: bump objection from 2.2.7 to 2.2.15 ([626f62e58](https://github.com/mozilla/fxa/commit/626f62e58))
- deps: bump tslib from 2.0.1 to 2.1.0 ([db25da98e](https://github.com/mozilla/fxa/commit/db25da98e))
- deps: update convict ([52e626866](https://github.com/mozilla/fxa/commit/52e626866))
- deps-dev: bump @types/ioredis from 4.22.0 to 4.22.1 ([6a5575dcc](https://github.com/mozilla/fxa/commit/6a5575dcc))
- deps: bump apollo-server-express from 2.21.0 to 2.21.1 ([11bcc7d77](https://github.com/mozilla/fxa/commit/11bcc7d77))
- deps: bump @nestjs/core from 7.6.13 to 7.6.14 ([a335f90c7](https://github.com/mozilla/fxa/commit/a335f90c7))
- deps: bump class-transformer from 0.3.1 to 0.4.0 ([66bec644c](https://github.com/mozilla/fxa/commit/66bec644c))
- deps: bump @nestjs/mapped-types from 0.3.0 to 0.4.0 ([aedb056a1](https://github.com/mozilla/fxa/commit/aedb056a1))

## 1.202.3

No changes.

## 1.202.2

No changes.

## 1.202.1

No changes.

## 1.202.0

### Other changes

- deps-dev: bump nock from 13.0.7 to 13.0.11 ([f38836bf8](https://github.com/mozilla/fxa/commit/f38836bf8))
- deps: bump ioredis from 4.19.4 to 4.23.0 ([9d8fcbdba](https://github.com/mozilla/fxa/commit/9d8fcbdba))
- deps: bump @types/convict from 5.2.1 to 5.2.2 ([afdfd3993](https://github.com/mozilla/fxa/commit/afdfd3993))
- deps: bump @nestjs/core from 7.6.12 to 7.6.13 ([e0611af3b](https://github.com/mozilla/fxa/commit/e0611af3b))
- deps: bump apollo-server-express from 2.19.2 to 2.21.0 ([9ec043299](https://github.com/mozilla/fxa/commit/9ec043299))
- deps: bump rxjs from 6.6.3 to 6.6.6 ([62c3c2447](https://github.com/mozilla/fxa/commit/62c3c2447))
- deps-dev: bump @types/ioredis from 4.17.3 to 4.22.0 ([b41bc223a](https://github.com/mozilla/fxa/commit/b41bc223a))
- deps: bump @nestjs/graphql from 7.9.9 to 7.9.10 ([a6b3030cc](https://github.com/mozilla/fxa/commit/a6b3030cc))
- deps: bump @nestjs/common from 7.6.4 to 7.6.13 ([386ccc471](https://github.com/mozilla/fxa/commit/386ccc471))

## 1.201.1

No changes.

## 1.201.0

### New features

- settings: finish implementing delete avatar ([77aa4fd8d](https://github.com/mozilla/fxa/commit/77aa4fd8d))

### Bug fixes

- gql-api: validate token before deriving hawk credentials ([f77d695eb](https://github.com/mozilla/fxa/commit/f77d695eb))
- settings: account for sessionToken.mustVerify in new settings ([042ab46d5](https://github.com/mozilla/fxa/commit/042ab46d5))

### Other changes

- deps: bump @nestjs/graphql from 7.9.8 to 7.9.9 ([e6b62e0e0](https://github.com/mozilla/fxa/commit/e6b62e0e0))
- deps: bump @nestjs/config from 0.6.1 to 0.6.3 ([41b3ea4af](https://github.com/mozilla/fxa/commit/41b3ea4af))
- settings: "disable" updateAvatar mutation for now ([961c3ae43](https://github.com/mozilla/fxa/commit/961c3ae43))
- deps-dev: bump nock from 13.0.5 to 13.0.7 ([411638723](https://github.com/mozilla/fxa/commit/411638723))
- fxa-settings: add avatar delete mutation ([510c2faef](https://github.com/mozilla/fxa/commit/510c2faef))
- deps: bump @nestjs/platform-express from 7.6.11 to 7.6.12 ([1a216a0d8](https://github.com/mozilla/fxa/commit/1a216a0d8))
- deps-dev: bump supertest from 6.0.1 to 6.1.3 ([e7b4af55c](https://github.com/mozilla/fxa/commit/e7b4af55c))
- deps: bump @nestjs/core from 7.5.5 to 7.6.12 ([11b786463](https://github.com/mozilla/fxa/commit/11b786463))
- deps: bump graphql-parse-resolve-info from 4.9.0 to 4.11.0 ([5ba15f25d](https://github.com/mozilla/fxa/commit/5ba15f25d))
- deps-dev: bump @nestjs/cli from 7.5.3 to 7.5.4 ([7ed2326f7](https://github.com/mozilla/fxa/commit/7ed2326f7))

## 1.200.0

### New features

- fxa-settings: avatar uploads ([edaf607ead](https://github.com/mozilla/fxa/commit/edaf607ead))

### Other changes

- deps: bump @nestjs/platform-express from 7.5.5 to 7.6.11 ([ae4c586569](https://github.com/mozilla/fxa/commit/ae4c586569))
- deps: bump @nestjs/graphql from 7.9.1 to 7.9.8 ([2e1c276997](https://github.com/mozilla/fxa/commit/2e1c276997))
- deps: bump @nestjs/mapped-types from 0.1.1 to 0.3.0 ([50b07cab0a](https://github.com/mozilla/fxa/commit/50b07cab0a))
- deps: bump ioredis from 4.18.0 to 4.19.4 ([2401b869eb](https://github.com/mozilla/fxa/commit/2401b869eb))
- deps: bump graphql from 15.4.0 to 15.5.0 ([eae1a35dd0](https://github.com/mozilla/fxa/commit/eae1a35dd0))

## 1.199.0

### Bug fixes

- gql-api: don't send response after setting HTTP 415 ([421ef4d11](https://github.com/mozilla/fxa/commit/421ef4d11))

### Other changes

- deps: bump knex from 0.21.12 to 0.21.16 ([8ff4bb2b5](https://github.com/mozilla/fxa/commit/8ff4bb2b5))
- deps: bump graphql-query-complexity from 0.7.1 to 0.7.2 ([ab90e385f](https://github.com/mozilla/fxa/commit/ab90e385f))
- deps: bump helmet from 4.1.1 to 4.4.1 ([81cc8d6fb](https://github.com/mozilla/fxa/commit/81cc8d6fb))
- deps: bump @sentry/node from 6.0.0 to 6.0.1 ([3b6838b18](https://github.com/mozilla/fxa/commit/3b6838b18))
- deps: bump objection from 2.2.3 to 2.2.7 ([875a1ffbb](https://github.com/mozilla/fxa/commit/875a1ffbb))
- deps: bump @sentry/node from 5.29.1 to 6.0.0 ([147825a5b](https://github.com/mozilla/fxa/commit/147825a5b))
- deps: bump apollo-server from 2.19.0 to 2.19.2 ([48896ad58](https://github.com/mozilla/fxa/commit/48896ad58))

## 1.198.2

No changes.

## 1.198.1

### Other changes

- 4e70b3f04 merge main->train-198 ([4e70b3f04](https://github.com/mozilla/fxa/commit/4e70b3f04))

## 1.198.0

### Bug fixes

- gql-api: return HTTP 415 on unsupported req content type ([a5762ea8c](https://github.com/mozilla/fxa/commit/a5762ea8c))

### Other changes

- gql-api: allow fewer CORS HTTP methods ([a599e6b83](https://github.com/mozilla/fxa/commit/a599e6b83))
- deps: update eslint to v7 ([7cf502be2](https://github.com/mozilla/fxa/commit/7cf502be2))
- deps: updated @types/graphql-upload ([af9705337](https://github.com/mozilla/fxa/commit/af9705337))
- deps: bump graphql from 14.6.0 to 15.4.0 ([d28e79655](https://github.com/mozilla/fxa/commit/d28e79655))

## 1.197.3

No changes.

## 1.197.2

No changes.

## 1.197.1

### New features

- security: Add several security headers to graph-ql server ([041cfa148](https://github.com/mozilla/fxa/commit/041cfa148))

### Bug fixes

- gql-api: restore CatchGatewayError decorator ([1639c5400](https://github.com/mozilla/fxa/commit/1639c5400))

## 1.197.0

### Bug fixes

- use proper Sentry arguments ([16fc6592f](https://github.com/mozilla/fxa/commit/16fc6592f))

### Other changes

- deps: bump @nestjs/common from 7.5.5 to 7.6.4 ([afc29280a](https://github.com/mozilla/fxa/commit/afc29280a))

## 1.196.0

### New features

- gql-api: add customs check on query/mutations ([80fc6da3b](https://github.com/mozilla/fxa/commit/80fc6da3b))

### Bug fixes

- graphql-api: allow unverified sessions ([ebd1af0de](https://github.com/mozilla/fxa/commit/ebd1af0de))
- gql-api: disallow query in query string ([bc81dd323](https://github.com/mozilla/fxa/commit/bc81dd323))
- capture GraphQL errors in field resolvers ([007c47833](https://github.com/mozilla/fxa/commit/007c47833))

### Other changes

- deps: updated @sentry/integrations ([9efc0c5bf](https://github.com/mozilla/fxa/commit/9efc0c5bf))
- deps: bump @sentry/node from 5.23.0 to 5.29.1 ([0bc414ad2](https://github.com/mozilla/fxa/commit/0bc414ad2))
- deps-dev: bump @types/chance from 1.1.0 to 1.1.1 ([3938b8484](https://github.com/mozilla/fxa/commit/3938b8484))
- deps: updated @nestjs/\* deps ([4496c9649](https://github.com/mozilla/fxa/commit/4496c9649))
- deps: bump @nestjs/graphql from 7.7.0 to 7.9.1 ([48c46cbb6](https://github.com/mozilla/fxa/commit/48c46cbb6))
- deps-dev: bump supertest from 4.0.2 to 6.0.1 ([1a7f42dd0](https://github.com/mozilla/fxa/commit/1a7f42dd0))

## 1.195.4

No changes.

## 1.195.3

No changes.

## 1.195.2

### Bug fixes

- graphql-api: allow unverified sessions ([bca44e2ff](https://github.com/mozilla/fxa/commit/bca44e2ff))

## 1.195.1

### New features

- gql-api: add customs check on query/mutations ([10e0af619](https://github.com/mozilla/fxa/commit/10e0af619))

### Bug fixes

- gql-api: disallow query in query string ([be8bedcee](https://github.com/mozilla/fxa/commit/be8bedcee))

## 1.195.0

### New features

- gql-api: add cors ([41e405576](https://github.com/mozilla/fxa/commit/41e405576))
- graphql-api: convert to NestJS ([139029248](https://github.com/mozilla/fxa/commit/139029248))

## 1.194.0

### New features

- gql-api: limit query complexity ([315842825](https://github.com/mozilla/fxa/commit/315842825))

### Other changes

- deps: bump knex from 0.21.4 to 0.21.12 ([7b7222ca1](https://github.com/mozilla/fxa/commit/7b7222ca1))
- deps: bump graphql-parse-resolve-info from 4.7.0 to 4.9.0 ([161c14052](https://github.com/mozilla/fxa/commit/161c14052))

## 1.193.1

No changes.

## 1.193.0

### Other changes

- deps: bump apollo-server from 2.16.1 to 2.19.0 ([8d7247246](https://github.com/mozilla/fxa/commit/8d7247246))
- deps: update node version to 14 ([6c2b253c1](https://github.com/mozilla/fxa/commit/6c2b253c1))

## 1.192.0

### Other changes

- deps-dev: bump ts-sinon from 1.2.0 to 2.0.1 ([915aa0c86](https://github.com/mozilla/fxa/commit/915aa0c86))
- deps: bump @types/sinon from 9.0.7 to 9.0.8 ([f74dce522](https://github.com/mozilla/fxa/commit/f74dce522))

## 1.191.1

No changes.

## 1.191.0

### Other changes

- deps: bump @types/sinon from 9.0.5 to 9.0.7 ([253383773](https://github.com/mozilla/fxa/commit/253383773))

## 1.190.1

No changes.

## 1.190.0

### New features

- auth: Add Create/Delete for Account-Customer Relationship ([147bbe3f6](https://github.com/mozilla/fxa/commit/147bbe3f6))

## 1.189.1

No changes.

## 1.189.0

### Bug fixes

- settings: improve GQL error handling to avoid redirect loop ([64f03a544](https://github.com/mozilla/fxa/commit/64f03a544))

### Refactorings

- db access: 76536e5fe refactor(db access) - Extract direct db access from fxa-graphql-api to fxa-shared ([76536e5fe](https://github.com/mozilla/fxa/commit/76536e5fe))

### Other changes

- deps-dev: bump @types/superagent from 4.1.9 to 4.1.10 ([1f3ba46e3](https://github.com/mozilla/fxa/commit/1f3ba46e3))
- monorepo: move deps to correct sub-packages ([a8cc232b9](https://github.com/mozilla/fxa/commit/a8cc232b9))

## 1.188.1

No changes.

## 1.188.0

No changes.

## 1.187.3

No changes.

## 1.187.2

No changes.

## 1.187.1

No changes.

## 1.187.0

### New features

- docker: publish fxa-mono docker image ([2742c1d07](https://github.com/mozilla/fxa/commit/2742c1d07))

## 1.186.2

No changes.

## 1.186.1

No changes.

## 1.186.0

### New features

- settings: add verify secondary email to new settings ([96bd9e09c](https://github.com/mozilla/fxa/commit/96bd9e09c))
- gql: added destroySession mutation ([bb8791b95](https://github.com/mozilla/fxa/commit/bb8791b95))

### Bug fixes

- release: fixes versioning and changelogs ([c81c76d15](https://github.com/mozilla/fxa/commit/c81c76d15))

### Other changes

- deps: update yarn version and root level deps ([da2e99729](https://github.com/mozilla/fxa/commit/da2e99729))

## 1.185.1
