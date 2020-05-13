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

### Code Organization

- `bin/` - Program directory (Note the runnable versions will be under `dist/` when compiled)
  - `worker` - Primary entry point for running the support-panel in production.
- `config/` - Configuration loader and `.json` files for runtime environments.
- `lib/`
  - `api` - Hapi routes and controller.
  - `server` - Hapi server setup and CSP configuration for above `api`.
- `test` - Unit tests, organized in matching heirarchy with the root supprt-panel directory.
- `types` - Additional TypeScript definitions for dependencies missing type information.

## Testing

This package uses [Mocha](https://mochajs.org/) to test its code. By default `npm test` will test all files ending under `test/`, and uses `ts-node` so it can process TypeScript files.

Test specific tests with the following commands:

```bash
# Test only test/lib/api.spec.ts
npx mocha -r ts-node/register test/lib/api.spec.ts

# Grep for "has a heartbeat"
npx mocha -r ts-node/register test/*/** -g "has a heartbeat"
```

Refer to Mocha's [CLI documentation](https://mochajs.org/#command-line-usage) for more advanced test configuration.

## Architectural decisions

The FxA team has made intentional decisions when it comes to the design of this package and its related packages' code bases. Learn more in the following ADRs:

- 0009 - [Consistency in testing tools](https://github.com/mozilla/fxa/blob/master/docs/adr/0009-testing-stacks.md)
