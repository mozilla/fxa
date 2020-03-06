# fxa-metrics-processor

Note: this code is not yet in production use.

The FxA metrics processor is a Pub/Sub ETL worker that transforms raw log lines from the FxA auth, content, and payments servers into amplitude and activity/flow metrics events.

This package will be the eventual home for metrics processing code extracted from the FxA monorepo (fxa-shared, fxa-auth-server, fxa-content-server, fxa-payments-server), as well as the fxa-amplitude-send and fxa-activity-metrics repos.

Work in this package is tracked under the metrics epic, https://jira.mozilla.com/browse/FXA-838 (technically linked to https://github.com/mozilla/fxa/issues/3738, but a lot of the context is not synced over to GH).
