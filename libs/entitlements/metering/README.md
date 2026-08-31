# entitlements-metering

This library was generated with [Nx](https://nx.dev).

## Building

Run `nx build entitlements-metering` to build the library.

## Running unit tests

Run `nx run entitlements-metering:test-unit` to execute the unit tests via [Jest](https://jestjs.io).

## Running the threshold sweep

Run `nx run payments-api:metering-sweep` to do one pass over every active meter. In production this runs as a Kubernetes CronJob.
