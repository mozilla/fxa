/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// Handle events from the DataFlow fraud detection pipeline.

'use strict';

const { PubSub } = require('@google-cloud/pubsub');

const VALID_ACTIONS = new Set(['report', 'suspect', 'block', 'disable']);
const TYPES = new Map([['email', 'email'], ['sourceaddress', 'ip']]);

/**
 * Initialise the DataFlow handler.
 *
 * @param {Object} config
 * @param {Object} log
 * @param {Function} fetchRecords
 * @param {Function} setRecords
 */
module.exports = (config, log, fetchRecords, setRecords) => {
  if (!config.dataflow.enabled) {
    // no-op if not enabled
    return;
  }

  const { projectId, subscriptionName } = config.dataflow.gcpPubSub;
  const { reportOnly } = config.dataflow;

  if (!projectId) {
    throw new Error(
      'Missing configuration option, `dataflow.gcpPubSub.projectId`'
    );
  }

  if (!subscriptionName) {
    throw new Error(
      'Missing configuration option, `dataflow.gcpPubSub.subscriptionName`'
    );
  }

  const pubsub = new PubSub({ projectId });

  const subscription = pubsub.subscription(subscriptionName);
  subscription.on('message', handleMessage);
  subscription.on('error', error => {
    log.error({
      op: 'dataflow.subscription.error',
      error: String(error),
    });
  });

  /**
   * Handle a message.
   *
   * @param {Object} message
   */
  async function handleMessage(message) {
    try {
      const action = parseMessage(message);
      const type = TYPES.get(action.indicator_type);

      if (reportOnly || action.suggested_action === 'report') {
        log.warn({
          op: 'dataflow.report',
          [type]: action.indicator,
          severity: action.severity,
          confidence: action.confidence,
          heuristic: action.heuristic,
          heuristic_description: action.heuristic_description,
          reason: action.reason,
          suggested_action: action.suggested_action,
        });
      } else {
        const records = await fetchRecords({
          [type]: action.indicator,
        });

        records[type][action.suggested_action]();

        await setRecords(records);
      }

      message.ack();

      log.info({
        op: 'dataflow.message.success',
        id: message.id,
        [type]: action.indicator,
        suggested_action: action.suggested_action,
        reportOnly,
      });
    } catch (error) {
      log.error({
        op: 'dataflow.message.error',
        id: message.id,
        data: message.data,
        error: error.message,
      });

      message.nack();
    }
  }

  /**
   * Parse a message.
   *
   * @param {Object} message
   * @returns {Action}
   */
  function parseMessage(message) {
    if (!message || !Buffer.isBuffer(message.data)) {
      throw new TypeError('invalid message');
    }

    /*
     * @typedef {Object} Action
     * @property {String} timestamp             - ISO 8601 timestamp
     * @property {String} id                    - String-serialised UUID
     * @property {String} indicator_type        - `email` or `sourceaddress`
     * @property {String} indicator             - An email or IP address
     * @property {String} severity              - `info`, `warn` or `critical`
     * @property {Number} confidence            - Confidence percentage
     * @property {String} heuristic             - Originating heuristic
     * @property {String} heuristic_description - Heuristic description
     * @property {String} reason                - Reason
     * @property {String} suggested_action      - `report`, `suspect`, `block` or `disable`
     * @property {Object} details               - Custom data
     */
    const action = JSON.parse(message.data.toString());

    assertAction(action);

    return action;
  }

  /**
   * Throw if action fields contain unexpected values.
   *
   * @param {Action} action
   */
  function assertAction({ suggested_action, indicator_type, indicator }) {
    if (!VALID_ACTIONS.has(suggested_action)) {
      throw new TypeError(`invalid suggested_action: ${suggested_action}`);
    }

    if (!TYPES.has(indicator_type)) {
      throw new TypeError(`invalid indicator_type: ${indicator_type}`);
    }

    const type = typeof indicator;
    if (type !== 'string' || indicator === '') {
      throw new TypeError(`invalid indicator: ${type}`);
    }
  }
};
