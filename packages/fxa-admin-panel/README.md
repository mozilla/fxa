# Firefox Accounts Admin Panel

The FxA Admin Panel is an internal resource for FxA Admins to access a set of convenience tools.

Outside of local development, this application is protected by SSO, a VPN connection, and "guest list" login wall to ensure those without administrator privileges cannot access the service.

## Development

- `yarn start|stop|restart` to start, stop, and restart the server as a PM2 process
- `yarn build` to create a production build
- `yarn test` to run unit tests

## Getting Started

This service will automatically spin up when `yarn start` is [ran from the root directory](https://github.com/mozilla/fxa#getting-started). A small Express server serves a React application and exposes the server config file for the client to consume via a meta tag.

The React dev server runs at [localhost:8092](http://localhost:8092/) which can be useful when building components if you'd like an auto page refresh on file changes, however, the Express server that serves the React application and proxies its static resources runs at [localhost:8091](http://localhost:8091/). Develop on `:8091` if you need access to anything set in the server configuration file, including the URI for connecting to the `fxa-admin-server`.

API calls are done through [Apollo Client](https://www.apollographql.com/docs/react/) with [GraphQL](https://graphql.org/learn/) to communicate with the `fxa-admin-server`. See [its documentation](https://github.com/mozilla/fxa/tree/main/packages/fxa-admin-server) to connect to the playground, a place to view the API docs and schema, and to write and test queries and mutations before using them in a component.

## External imports

You can import React components from other packages into this project. This is currently restricted to `fxa-react`:

```javascript
// e.g. assuming the component HelloWorld exists
import HelloWorld from 'fxa-react/components/HelloWorld';
```

See the [`fxa-react` section of the `fxa-settings` docs](https://github.com/mozilla/fxa/tree/main/packages/fxa-settings#fxa-react) for more info on sharing or moving components into this package.

## Testing

This package uses [Jest](https://jestjs.io/) to test both the frontend and server. By default `yarn test` will run all test scripts:

- `yarn test:frontend` will test the React App frontend under `src/`
- `yarn test:server` will test the Express server under `server/`

Test specific tests with the following commands:

```bash
# Test frontend tests for the component AccountSearch
yarn test:frontend AccountSearch

# Grep frontend tests for "displays the error"
yarn test:frontend -t "displays the error"

# Test server tests for the file server/lib/csp
yarn test:server server/lib/csp

# Grep server tests for "simple server routes"
yarn test:server -t "simple server routes"
```

Refer to Jest's [CLI documentation](https://jestjs.io/docs/en/cli) for more advanced test configuration.

## License

MPL-2.0
