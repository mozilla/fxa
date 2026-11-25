# entitlements-metering

This library was generated with [Nx](https://nx.dev).

## Building

Run `nx build entitlements-metering` to build the library.

## Running unit tests

Run `nx run entitlements-metering:test-unit` to execute the unit tests via [Jest](https://jestjs.io).

## Running the threshold sweep

Run `nx run payments-api:metering-sweep` to do one pass over every active meter. Threshold notifications, session-window usage queries, and the metrics job read its output. [mozilla/entitlements](https://github.com/mozilla/entitlements) runs the sweep on a schedule, locally and in production.

## Running the metrics job

Run `nx run payments-api:metering-metrics` to send usage gauges for every meter the sweep has seen. For each meter it reports the limit, the subjects with usage today (UTC), and the subjects notified at each threshold in the current window. Locally, run the sweep first, or the job has no meters to report. In production this runs as a Kubernetes CronJob every 5 minutes.
