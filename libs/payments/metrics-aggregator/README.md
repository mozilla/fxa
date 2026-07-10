# payments-metrics-aggregator

This library was generated with [Nx](https://nx.dev).

It contains the orchestration service that aggregates data from multiple
domain managers (customer, subscription, account, CMS, experiments) to
assemble payloads for Glean metrics events. The low-level Glean recording
primitives (manager, generated events, types, factories) live in
`@fxa/payments/metrics`.

This split exists so that domain libraries (e.g. `@fxa/payments/customer`,
`@fxa/payments/experiments`, `@fxa/shared/cms`) can depend on
`@fxa/payments/metrics` for plain event recording without pulling in the
managers that the aggregator orchestrates.

## Building

Run `nx build payments-metrics-aggregator` to build the library.

## Running unit tests

Run `nx test-unit payments-metrics-aggregator` to execute the unit tests via [Jest](https://jestjs.io).

## Running integration tests

Run `nx test-integration payments-metrics-aggregator` to execute the integration tests via [Jest](https://jestjs.io).
