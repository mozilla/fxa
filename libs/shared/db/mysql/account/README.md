# Accounts Database Models

The Accounts database is a legacy MySQL database (thus some of the awkward charset handling) that was
originally used by the `fxa-auth-server` repository, before a series of merges into the `fxa` monorepo.
This database has been referred to previously as the auth-server database, as that was the main service
using it. Currently the database is used by the auth-server, the graphql-api service, and various cron jobs.

## Running unit tests

Run `nx test shared-db-mysql-account` to execute the unit tests via [Jest](https://jestjs.io).
