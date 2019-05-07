// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, you can obtain one at https://mozilla.org/MPL/2.0/.

//! Event types.

use serde::{Deserialize, Deserializer, Serialize};

#[cfg(test)]
mod test;

/// SNS wrapper around events,
/// to be discarded.
#[derive(Debug, Deserialize)]
pub struct Envelope {
    /// JSON-serialised event body.
    #[serde(alias = "Message")]
    pub message: String,
}

/// The main event structure,
/// as defined by the
/// [FxA Attached Service Notifications spec][spec].
///
/// Contains only a subset of all the available properties,
/// partly to restrict the data we send out
/// but also to prevent confusion about
/// the different timestamp names/formats.
///
/// [spec]: https://github.com/mozilla/fxa/blob/master/packages/fxa-auth-server/docs/service_notifications.md
#[derive(Debug, Deserialize, Serialize)]
pub struct Event {
    /// Event type.
    pub event: String,

    /// Event timestamp, in epoch-seconds.
    #[serde(alias = "ts")]
    pub timestamp: Timestamp,

    /// Event origin domain.
    #[serde(alias = "iss")]
    pub issuer: String,

    /// User id.
    #[serde(alias = "uid", skip_serializing_if = "Option::is_none")]
    pub user_id: Option<String>,

    /// User's primary email address.
    #[serde(alias = "email", skip_serializing_if = "Option::is_none")]
    pub email_address: Option<String>,

    /// User's locale.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub locale: Option<String>,

    /// Flag indicating whether the user has opted in to marketing emails.
    #[serde(alias = "marketingOptIn", skip_serializing_if = "Option::is_none")]
    pub marketing_opt_in: Option<bool>,

    /// Service name.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub service: Option<String>,

    /// Metrics metadata.
    #[serde(
        alias = "metricsContext",
        skip_serializing_if = "MetricsContext::is_empty"
    )]
    pub metrics_context: MetricsContext,
}

/// Conversion type that marshals
/// floating-point epoch-seconds to epoch-milliseconds.
#[derive(Debug, PartialEq, Serialize)]
pub struct Timestamp(u64);

impl<'d> Deserialize<'d> for Timestamp {
    fn deserialize<D>(deserializer: D) -> Result<Self, D::Error>
    where
        D: Deserializer<'d>,
    {
        let value: f64 = Deserialize::deserialize(deserializer)?;
        return Ok(Self((value * 1000.0) as u64));
    }
}

impl PartialEq<u64> for Timestamp {
    fn eq(&self, rhs: &u64) -> bool {
        self.0 == *rhs
    }
}

/// Metrics metadata.
#[derive(Debug, Deserialize, Serialize)]
pub struct MetricsContext {
    /// Metrics device id, which is a different thing to the FxA device id.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub device_id: Option<String>,

    /// Entrypoint to the flow.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub entrypoint: Option<String>,

    /// Experiment running at the entrypoint.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub entrypoint_experiment: Option<String>,

    /// Experiment variation at the entrypoint.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub entrypoint_variation: Option<String>,

    /// FxA flow id.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub flow_id: Option<String>,

    /// Timestamp for the beginning of the flow, in epoch-milliseconds.
    #[serde(alias = "flowBeginTime", skip_serializing_if = "Option::is_none")]
    pub flow_begin_time: Option<u64>,

    /// Marketing campaign id.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub utm_campaign: Option<String>,

    /// Marketing content id.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub utm_content: Option<String>,

    /// Marketing medium.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub utm_medium: Option<String>,

    /// Traffic source.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub utm_source: Option<String>,

    /// Search term.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub utm_term: Option<String>,
}

impl MetricsContext {
    pub fn is_empty(&self) -> bool {
        self.device_id.is_none()
            && self.entrypoint.is_none()
            && self.entrypoint_experiment.is_none()
            && self.entrypoint_variation.is_none()
            && self.flow_id.is_none()
            && self.flow_begin_time.is_none()
            && self.utm_campaign.is_none()
            && self.utm_content.is_none()
            && self.utm_medium.is_none()
            && self.utm_source.is_none()
            && self.utm_term.is_none()
    }
}
