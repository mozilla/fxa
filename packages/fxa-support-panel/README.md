# fxa-support-panel

The Firefox Accounts Support Panel is a small web service that is intended for use as
an embedded iframe in the Zendesk Support UX. It's intended to show Subscription Support
Agents relevant data about a users Firefox Account so that they may assist the users
support request.

## Software Architecture

The primary source of truth on FxA user data is the fxa-auth-server. That service is
configured to use OAuth for user and service access to account data, and has write access
to the user data. Since this view is intended purely for read-only access to user data for
assisting a support agent, this service instead queries a read-restricted version of the
fxa-auth-db-mysql service (fxa-auth-server uses a full read/write fxa-auth-db-mysql
service).

Read-only access is enforced on the database by using a MySQL user restricted to the stored
procedures needed to run the queries that fetch basic profile information.

## Testing

This package uses [Jest](https://mochajs.org/) to test its code. By default `yarn test` will test all files ending in `.spec.ts`.

Test commands:

```bash
# Test with coverage
yarn test:cov

# Test on file change
yarn test:watch
```
