# recovery-phone

Recovery phone account library for FxA that handles recovery phone functionality and database operations.

## Building

Run `nx build recovery-phone` to build the library.

## Running unit tests

Run `nx test-unit accounts-recovery-phone` to execute the unit tests via [Jest](https://jestjs.io).

## Running integration tests

Make sure local infra (ie databases) are spun up by checking status. `yarn pm2 status` should show redis and mysql instances running. If not, run `yarn start infrastructure`.

Run `nx test-integration accounts-recovery-phone` to execute the integration tests via [Jest](https://jestjs.io).
