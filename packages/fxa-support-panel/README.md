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
