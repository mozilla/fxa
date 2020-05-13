# fxa-metrics-processor

Note: this code is not yet in production use.

The FxA metrics processor is a Pub/Sub ETL worker that transforms raw log lines from the FxA auth, content, and payments servers into amplitude and activity/flow metrics events.

This package will be the eventual home for metrics processing code extracted from the FxA monorepo (fxa-shared, fxa-auth-server, fxa-content-server, fxa-payments-server), as well as the fxa-amplitude-send and fxa-activity-metrics repos.

Work in this package is tracked under the metrics epic, https://jira.mozilla.com/browse/FXA-838 (technically linked to https://github.com/mozilla/fxa/issues/3738, but a lot of the context is not synced over to GH).

## Testing

This package uses [Mocha](https://mochajs.org/) to test its code. By default `npm test` will test all files ending under `src/test/`, and uses `ts-node` so it can process TypeScript files.

Test specific tests with the following commands:

```bash
# Test only src/test/lib/pubsub.spec.ts
npx mocha -r ts-node/register src/test/lib/pubsub.spec.ts

# Grep for "return messages"
npx mocha -r ts-node/register src/test/*/** -g "return messages"
```

Refer to Mocha's [CLI documentation](https://mochajs.org/#command-line-usage) for more advanced test configuration.

## Architectural decisions

The FxA team has made intentional decisions when it comes to the design of this package and its related packages' code bases. Learn more in the following ADRs:

- 0009 - [Consistency in testing tools](https://github.com/mozilla/fxa/blob/master/docs/adr/0009-testing-stacks.md)
