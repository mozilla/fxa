/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const joi = require('joi');
const Sentry = require('@sentry/node');
const {
  overrideJoiMessages,
} = require('fxa-shared/sentry/joi-message-overrides');

const BODY_SCHEMA = {
  client_id: joi.string().required(),
  context: joi.object().required(),
};

module.exports = function (config, statsd) {
  // Get nimbus options from config
  const options = config.get('nimbus');

  return {
    method: 'post',
    path: '/nimbus-experiments',
    validate: {
      body: overrideJoiMessages(BODY_SCHEMA),
    },
    process: async function (req, res) {
      const requestReceivedTime = Date.now();
      const body = JSON.stringify({
        client_id: req.body.client_id,
        context: req.body.context,
      });

      const queryParams = new URLSearchParams({
        nimbus_preview: req.query && req.query.nimbusPreview === 'true',
      });

      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        controller.abort();
      }, options.timeout);

      try {
        const url = `${options.host}/v2/features/?${queryParams.toString()}`;
        const resp = await fetch(url, {
          method: 'POST',
          body,
          // A request to cirrus should not be more than 50ms,
          // but we give it a large enough padding.
          signal: controller.signal,
          headers: {
            'Content-Type': 'application/json',
          },
        });

        const features = await resp.text();
        res.end(features);

        // Record success
        if (statsd) {
          statsd.increment('cirrus.experiment-fetch-success');
        }
      } catch (err) {
        Sentry.captureException(err, {
          tags: {
            source: 'nimbus-experiments',
          },
        });

        // Return a 'service unavailable' error. We essentially failed
        // to communicate with the cirrus server, so experiments are
        // now unavailable...
        res.status(503);
        res.end();

        // Record failure
        if (statsd) {
          statsd.increment('cirrus.experiment-fetch-error');
        }
      } finally {
        clearTimeout(timeoutId);

        // Record processing time
        if (statsd) {
          statsd.timing(
            'cirrus.response-time',
            Date.now() - requestReceivedTime
          );
        }
      }
    },
  };
};
