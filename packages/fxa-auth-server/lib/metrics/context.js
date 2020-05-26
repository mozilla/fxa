/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const bufferEqualConstantTime = require('buffer-equal-constant-time');
const crypto = require('crypto');
const HEX_STRING = require('../routes/validators').HEX_STRING;
const isA = require('@hapi/joi');

const FLOW_ID_LENGTH = 64;

// These match validation in the content server backend.
// We should probably refactor them to fxa-shared.
const ENTRYPOINT_SCHEMA = isA
  .string()
  .max(128)
  .regex(/^[\w.:-]+$/);
const UTM_SCHEMA = isA
  .string()
  .max(128)
  // eslint-disable-next-line no-useless-escape
  .regex(/^[\w\/.%-]+$/);
const UTM_CAMPAIGN_SCHEMA = UTM_SCHEMA.allow(
  'page+referral+-+not+part+of+a+campaign'
);

const SCHEMA = isA
  .object({
    // The metrics context device id is a client-generated property
    // that is entirely separate to the devices table in our db.
    // All clients can generate a metrics context device id, whereas
    // only Sync creates records in the devices table.
    deviceId: isA.string().length(32).regex(HEX_STRING).optional(),
    entrypoint: ENTRYPOINT_SCHEMA.optional(),
    entrypointExperiment: ENTRYPOINT_SCHEMA.optional(),
    entrypointVariation: ENTRYPOINT_SCHEMA.optional(),
    flowId: isA.string().length(64).regex(HEX_STRING).optional(),
    flowBeginTime: isA.number().integer().positive().optional(),
    utmCampaign: UTM_CAMPAIGN_SCHEMA.optional(),
    utmContent: UTM_SCHEMA.optional(),
    utmMedium: UTM_SCHEMA.optional(),
    utmSource: UTM_SCHEMA.optional(),
    utmTerm: UTM_SCHEMA.optional(),
    productId: isA.string().max(128).optional(),
    planId: isA.string().max(128).optional(),
  })
  .unknown(false)
  .and('flowId', 'flowBeginTime');

module.exports = function (log, config) {
  const cache = require('../cache')(log, config, 'fxa-metrics~');

  return {
    stash,
    get,
    gather,
    propagate,
    clear,
    validate,
    setFlowCompleteSignal,
  };

  /**
   * Stashes metrics context metadata using a key derived from a token.
   * Asynchronous, returns a promise.
   *
   * A surprising aspect of this method's behaviour is that it silently
   * fails if the key already is already stashed. This is so that UTM
   * params can't be changed part-way through a flow.
   *
   * @name stashMetricsContext
   * @this request
   * @param token    token to stash the metadata against
   */
  async function stash(token) {
    const metadata = this.payload && this.payload.metricsContext;

    if (!metadata) {
      return;
    }

    metadata.service = this.payload.service || this.query.service;

    let cacheKey;
    try {
      cacheKey = getKey(token);
    } catch (err) {
      log.error('metricsContext.stash', {
        err,
        hasToken: !!token,
        hasId: !!(token && token.id),
        hasUid: !!(token && token.uid),
      });
      return;
    }

    try {
      return await cache.add(cacheKey, metadata);
    } catch (err) {
      log.warn('metricsContext.stash.add', { err });
    }
  }

  /**
   * Returns a promise that resolves to the current metrics context data,
   * which may come from the request payload or have been stashed previously.
   * If no there is no metrics context data, the promise resolves to an empty
   * object.
   *
   * Unlike the rest of the methods here, this is not exposed on the request
   * object and should not be called directly. Its result is instead exposed
   * using a lazy getter, which can be accessed via request.app.metricsContext.
   *
   * @param request
   */
  async function get(request) {
    let token;

    try {
      const metadata = request.payload && request.payload.metricsContext;

      if (metadata) {
        return metadata;
      }

      token = getToken(request);
      if (token) {
        return (await cache.get(getKey(token))) || {};
      }
    } catch (err) {
      log.error('metricsContext.get', {
        err,
        hasToken: !!token,
        hasId: !!(token && token.id),
        hasUid: !!(token && token.uid),
      });
    }

    return {};
  }

  /**
   * Gathers metrics context metadata onto data, using either metadata
   * passed in with a request or previously-stashed metadata for a
   * token. Asynchronous, returns a promise that resolves to data, with
   * metrics context metadata copied to it.
   *
   * @name gatherMetricsContext
   * @this request
   * @param data target object
   */
  async function gather(data) {
    const metadata = await this.app.metricsContext;

    if (metadata) {
      data.time = Date.now();
      data.device_id = metadata.deviceId;
      data.flow_id = metadata.flowId;
      data.flow_time = calculateFlowTime(data.time, metadata.flowBeginTime);
      data.flowBeginTime = metadata.flowBeginTime;
      data.flowCompleteSignal = metadata.flowCompleteSignal;
      data.flowType = metadata.flowType;

      if (metadata.service) {
        data.service = metadata.service;
      }

      const doNotTrack = this.headers && this.headers.dnt === '1';
      if (!doNotTrack) {
        data.entrypoint = metadata.entrypoint;
        data.entrypoint_experiment = metadata.entrypointExperiment;
        data.entrypoint_variation = metadata.entrypointVariation;
        data.utm_campaign = metadata.utmCampaign;
        data.utm_content = metadata.utmContent;
        data.utm_medium = metadata.utmMedium;
        data.utm_source = metadata.utmSource;
        data.utm_term = metadata.utmTerm;
        data.product_id = metadata.productId;
        data.plan_id = metadata.planId;
      }
    }

    return data;
  }

  function getToken(request) {
    if (request.auth && request.auth.credentials) {
      return request.auth.credentials;
    }

    if (request.payload && request.payload.uid && request.payload.code) {
      return {
        uid: request.payload.uid,
        id: request.payload.code,
      };
    }
  }

  /**
   * Propagates metrics context metadata from one token-derived key to
   * another. Asynchronous, returns a promise.
   *
   * @name propagateMetricsContext
   * @this request
   * @param oldToken    token to gather the metadata from
   * @param newToken    token to stash the metadata against
   */
  async function propagate(oldToken, newToken) {
    const oldKey = getKey(oldToken);
    let newKey;

    try {
      const metadata = await cache.get(oldKey);
      newKey = getKey(newToken);
      if (metadata) {
        try {
          return await cache.add(newKey, metadata);
        } catch (err) {
          log.warn('metricsContext.propagate.add', { err });
        }
      }
    } catch (err) {
      log.error('metricsContext.propagate', {
        err,
        hasOldToken: !!oldToken,
        hasOldTokenId: !!(oldToken && oldToken.id),
        hasOldTokenUid: !!(oldToken && oldToken.uid),
        hasNewToken: !!newToken,
        hasNewTokenId: !!(newToken && newToken.id),
        hasNewTokenUid: !!(newToken && newToken.uid),
      });
    }
  }

  /**
   * Attempt to clear previously-stashed metrics context metadata.
   *
   * @name clearMetricsContext
   * @this request
   */
  async function clear() {
    const token = getToken(this);
    if (token) {
      return await cache.del(getKey(token));
    }
  }

  /**
   * Checks whether a request's flowId and flowBeginTime are valid.
   * Returns a boolean, `true` if the request is valid, `false` if
   * it's invalid.
   *
   * @name validateMetricsContext
   * @this request
   */
  function validate() {
    if (!this.payload) {
      return logInvalidContext(this, 'missing payload');
    }

    const metadata = this.payload.metricsContext;

    if (!metadata) {
      return logInvalidContext(this, 'missing context');
    }
    if (!metadata.flowId) {
      return logInvalidContext(this, 'missing flowId');
    }
    if (!metadata.flowBeginTime) {
      return logInvalidContext(this, 'missing flowBeginTime');
    }

    const age = Date.now() - metadata.flowBeginTime;
    if (age > config.metrics.flow_id_expiry || age <= 0) {
      return logInvalidContext(this, 'expired flowBeginTime');
    }

    if (!HEX_STRING.test(metadata.flowId)) {
      return logInvalidContext(this, 'invalid flowId');
    }

    // The first half of the id is random bytes, the second half is a HMAC of
    // additional contextual information about the request.  It's a simple way
    // to check that the metrics came from the right place, without having to
    // share state between content-server and auth-server.
    const flowSignature = metadata.flowId.substr(
      FLOW_ID_LENGTH / 2,
      FLOW_ID_LENGTH
    );
    const flowSignatureBytes = Buffer.from(flowSignature, 'hex');
    const expectedSignatureBytes = calculateFlowSignatureBytes(metadata);
    if (!bufferEqualConstantTime(flowSignatureBytes, expectedSignatureBytes)) {
      return logInvalidContext(this, 'invalid signature');
    }

    log.info('metrics.context.validate', {
      valid: true,
    });
    return true;
  }

  function logInvalidContext(request, reason) {
    if (request.payload && request.payload.metricsContext) {
      delete request.payload.metricsContext.flowId;
      delete request.payload.metricsContext.flowBeginTime;
    }
    log.warn('metrics.context.validate', {
      valid: false,
      reason: reason,
    });
    return false;
  }

  function calculateFlowSignatureBytes(metadata) {
    const hmacData = [
      metadata.flowId.substr(0, FLOW_ID_LENGTH / 2),
      metadata.flowBeginTime.toString(16),
    ];
    // We want a digest that's half the length of a flowid,
    // and we want the length in bytes rather than hex.
    const signatureLength = FLOW_ID_LENGTH / 2 / 2;
    const key = config.metrics.flow_id_key;
    return crypto
      .createHmac('sha256', key)
      .update(hmacData.join('\n'))
      .digest()
      .slice(0, signatureLength);
  }

  /**
   * Sets the event name that will signal completion of the current flow.
   *
   * @name setMetricsFlowCompleteSignal
   * @this request
   * @param {String} flowCompleteSignal
   */
  function setFlowCompleteSignal(flowCompleteSignal, flowType) {
    if (this.payload && this.payload.metricsContext) {
      this.payload.metricsContext.flowCompleteSignal = flowCompleteSignal;
      this.payload.metricsContext.flowType = flowType;
    }
  }
};

function calculateFlowTime(time, flowBeginTime) {
  if (time <= flowBeginTime) {
    return 0;
  }

  return time - flowBeginTime;
}

function getKey(token) {
  if (!token || !token.uid || !token.id) {
    const err = new Error('Invalid token');
    throw err;
  }

  const hash = crypto.createHash('sha256');
  hash.update(token.uid);
  hash.update(token.id);

  return hash.digest('base64');
}

// HACK: Force the API docs to expand SCHEMA inline
module.exports.SCHEMA = SCHEMA;
module.exports.schema = SCHEMA.optional();
module.exports.requiredSchema = SCHEMA.required();
