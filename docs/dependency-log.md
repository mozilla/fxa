# Dependency Update Log

This is a living document. It summarizes the results of the last round of updates for each package. When you update it please change the **Last Update** section at the top and replace the dated sections for each package you updated. The dated sections should include the results of `npm outdated --long` from _after_ you've updated, to show which packages are still behind and any notes for future updaters.

## Last Update

- Date: 2020-03-18
- Packages: fxa-shared
- Updater: dannycoates

# Packages

## root

### 2020-03-12

updated all

## 123done

## browserid-verifier

## fortress

## fxa-admin-panel

## fxa-admin-server

## fxa-auth-db-mysql

## fxa-auth-server

## fxa-content-server

## fxa-customs-server

## fxa-dev-launcher

## fxa-email-event-proxy

## fxa-event-broker

## fxa-geodb

## fxa-js-client

## fxa-metrics-processor

## fxa-payments-server

## fxa-profile-server

## fxa-shared

### 2020-03-18

exceptions:

```
Package          Current  Wanted  Latest  Location    Package Type  Homepage
accept-language   2.0.17  2.0.17  3.0.18  fxa-shared  dependencies  https://github.com/tinganho/node-accept-language
celebrate         10.1.0  10.1.0  12.0.1  fxa-shared  dependencies  https://github.com/arb/celebrate#readme
node-uap           0.0.3     git     git  fxa-shared  dependencies  https://github.com/fedot/node-uap
redis              2.8.0   2.8.0   3.0.2  fxa-shared  dependencies  https://github.com/NodeRedis/node_redis
```

- accept-language
  - we're on an ancient version
  - no changelog so it's unclear if there's any breaking changes
  - no known vulnerabilities so leaving as is
- celebrate
  - requires joi@17
  - probably needs schema changes
- node-uap
  - we're on a git fork
  - we should evaluate other options
- redis
  - did not attempt update
  - not updating because our larger redis strategy may change in the near future

## fxa-support-panel
