## 1.198.0

### Bug fixes

- gql-api: return HTTP 415 on unsupported req content type ([a5762ea8c](https://github.com/mozilla/fxa/commit/a5762ea8c))

### Other changes

- gql-api: allow fewer CORS HTTP methods ([a599e6b83](https://github.com/mozilla/fxa/commit/a599e6b83))
- deps: update eslint to v7 ([7cf502be2](https://github.com/mozilla/fxa/commit/7cf502be2))
- deps: updated @types/graphql-upload ([af9705337](https://github.com/mozilla/fxa/commit/af9705337))
- deps: bump graphql from 14.6.0 to 15.4.0 ([d28e79655](https://github.com/mozilla/fxa/commit/d28e79655))

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
