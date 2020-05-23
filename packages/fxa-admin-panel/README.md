# Firefox Accounts Admin Panel

This is an internal resource for FxA Admins to access a set of convenience tools.

## Development

- `npm run start|stop|restart` to start, stop, and restart the server as a PM2 process
- `npm run build` to create a production build

**External imports**

You can import React components into this project. This is currently restricted to `fxa-react`:

```javascript
// e.g. assuming the component HelloWorld exists
import HelloWorld from 'fxa-react/components/HelloWorld';
```

## Testing

This package uses [Jest](https://jestjs.io/) to test both the frontend and server. By default `npm test` will run all NPM test scripts:

- `npm run test:frontend` will test the React App frontend under `src/`
- `npm run test:server` will test the Express server under `server/`

Test specific tests with the following commands:

```bash
# Test frontend tests for the component EmailBlocks
npm run test:frontend -- EmailBlocks

# Grep frontend tests for "displays the error"
npm run test:frontend -- -t "displays the error"

# Test server tests for the file server/lib/csp
npm run test:server -- server/lib/csp

# Grep server tests for "simple server routes"
npm run test:server -- -t "simple server routes"
```

Note that prior to testing you may need to create a build of the React App. You can do this by running `npm run build`.

Refer to Jest's [CLI documentation](https://jestjs.io/docs/en/cli) for more advanced test configuration.

## License

MPL-2.0
