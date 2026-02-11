# shared-error

This library serves as the base errors used via inheritance throughout the nx integrated libraries and applications. Many third-party libraries use the `verror` package, by extending our own version we can use `instanceOf` checks to easily identify their errors from our own.

## Building

Run `nx build shared-error` to build the library.

## Running unit tests

Run `nx test shared-error` to execute the unit tests via [Jest](https://jestjs.io).
