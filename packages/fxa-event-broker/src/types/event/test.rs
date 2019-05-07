// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, you can obtain one at https://mozilla.org/MPL/2.0/.

use serde_json::{self, Error, Value as JsonValue};

use super::*;

#[test]
fn deserialize_events() -> Result<(), Error> {
    let json = include_str!("test-fixture.json");
    let envelopes: Vec<Envelope> = serde_json::from_str(json)?;

    assert_eq!(envelopes.len(), 2);

    let event: Event = serde_json::from_str(&envelopes[0].message)?;

    assert_eq!(event.event, "foo.bar");
    assert_eq!(event.timestamp, 1555076067000);
    assert_eq!(event.issuer, "api.accounts.firefox.com");
    assert_eq!(event.user_id.unwrap(), "deadbeef");
    assert_eq!(event.email_address.unwrap(), "fxa@example.com");
    assert_eq!(event.locale.unwrap(), "en-GB");
    assert_eq!(event.marketing_opt_in.unwrap(), true);
    assert_eq!(event.service.unwrap(), "baadf00d");
    assert_eq!(event.metrics_context.device_id.unwrap(), "a");
    assert_eq!(event.metrics_context.entrypoint.unwrap(), "b");
    assert_eq!(event.metrics_context.entrypoint_experiment.unwrap(), "c");
    assert_eq!(event.metrics_context.entrypoint_variation.unwrap(), "d");
    assert_eq!(event.metrics_context.flow_id.unwrap(), "e");
    assert_eq!(
        event.metrics_context.flow_begin_time.unwrap(),
        1555076910685
    );
    assert_eq!(event.metrics_context.utm_campaign.unwrap(), "f");
    assert_eq!(event.metrics_context.utm_content.unwrap(), "g");
    assert_eq!(event.metrics_context.utm_medium.unwrap(), "h");
    assert_eq!(event.metrics_context.utm_source.unwrap(), "i");
    assert_eq!(event.metrics_context.utm_term.unwrap(), "j");

    let event: Event = serde_json::from_str(&envelopes[1].message)?;

    assert_eq!(event.event, "baz.qux");
    assert_eq!(event.timestamp, 1555077255999);
    assert_eq!(event.issuer, "example.com");
    assert!(event.user_id.is_none());
    assert!(event.email_address.is_none());
    assert!(event.locale.is_none());
    assert!(event.marketing_opt_in.is_none());
    assert!(event.service.is_none());
    assert!(event.metrics_context.device_id.is_none());
    assert!(event.metrics_context.entrypoint.is_none());
    assert!(event.metrics_context.entrypoint_experiment.is_none());
    assert!(event.metrics_context.entrypoint_variation.is_none());
    assert!(event.metrics_context.flow_id.is_none());
    assert!(event.metrics_context.flow_begin_time.is_none());
    assert!(event.metrics_context.utm_campaign.is_none());
    assert!(event.metrics_context.utm_content.is_none());
    assert!(event.metrics_context.utm_medium.is_none());
    assert!(event.metrics_context.utm_source.is_none());
    assert!(event.metrics_context.utm_term.is_none());

    Ok(())
}

#[test]
fn serialize_event() -> Result<(), Error> {
    let json = include_str!("test-fixture.json");
    let envelopes: Vec<Envelope> = serde_json::from_str(json)?;
    let event: Event = serde_json::from_str(&envelopes[0].message)?;
    let json = serde_json::to_string(&event)?;
    let event: JsonValue = serde_json::from_str(&json)?;

    assert_eq!(event["event"], "foo.bar");
    assert_eq!(event["timestamp"], 1555076067000u64);
    assert_eq!(event["issuer"], "api.accounts.firefox.com");
    assert_eq!(event["user_id"], "deadbeef");
    assert_eq!(event["email_address"], "fxa@example.com");
    assert_eq!(event["locale"], "en-GB");
    assert_eq!(event["marketing_opt_in"], true);
    assert_eq!(event["service"], "baadf00d");
    assert_eq!(event["metrics_context"]["device_id"], "a");
    assert_eq!(event["metrics_context"]["entrypoint"], "b");
    assert_eq!(event["metrics_context"]["entrypoint_experiment"], "c");
    assert_eq!(event["metrics_context"]["entrypoint_variation"], "d");
    assert_eq!(event["metrics_context"]["flow_id"], "e");
    assert_eq!(
        event["metrics_context"]["flow_begin_time"],
        1555076910685u64
    );
    assert_eq!(event["metrics_context"]["utm_campaign"], "f");
    assert_eq!(event["metrics_context"]["utm_content"], "g");
    assert_eq!(event["metrics_context"]["utm_medium"], "h");
    assert_eq!(event["metrics_context"]["utm_source"], "i");
    assert_eq!(event["metrics_context"]["utm_term"], "j");

    let event: Event = serde_json::from_str(&envelopes[1].message)?;
    let json = serde_json::to_string(&event)?;

    assert_eq!(
        json,
        "{\"event\":\"baz.qux\",\"timestamp\":1555077255999,\"issuer\":\"example.com\"}"
    );

    Ok(())
}
