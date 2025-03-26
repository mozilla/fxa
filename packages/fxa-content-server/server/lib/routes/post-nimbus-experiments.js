/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const config = require('../configuration');
const joi = require('joi');
const Sentry = require('@sentry/node');
const {
  overrideJoiMessages,
} = require('fxa-shared/sentry/joi-message-overrides');

const BODY_SCHEMA = {
  client_id: joi.string().required(),
  context: joi.object().required(),
};

module.exports = function (options = {}, statsd) {
  const requestReceivedTime = Date.now();
  return {
    method: 'post',
    path: '/nimbus-experiments',
    validate: {
      body: overrideJoiMessages(BODY_SCHEMA),
    },
    process: async function (req, res) {
      const body = JSON.stringify({
        client_id: req.body.client_id,
        context: req.body.context,
      });

      const previewMode = req.query?.nimbusPreview || false;
      const queryParams = new URLSearchParams({
        nimbus_preview: previewMode,
      });

      try {
        const resp = await fetch(
          `${
            config.getProperties().nimbus.host
          }/v2/features/?${queryParams.toString()}`,
          {
            method: 'POST',
            body,
            // A request to cirrus should not be more than 50ms,
            // but we give it a large enough padding.
            signal: AbortSignal.timeout(1000),
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );

        res.end(await resp.text());
      } catch (err) {
        Sentry.withScope(() => {
          let errorMsg = 'experiment fetch error';
          if (err.name === 'TimeoutError') {
            errorMsg =
              'Timeout: It took more than 1 seconds to get the result!';
          }
          Sentry.captureMessage(errorMsg, 'error');
        });
      } finally {
        const requestCompletedTime = Date.now();
        const responseTime = requestCompletedTime - requestReceivedTime;
        if (statsd) {
          statsd.increment('cirrus.response-time', { responseTime });
        }
      }
    },
  };
};
