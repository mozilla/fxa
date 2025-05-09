/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const axios = require('axios');
const { config } = require('../config');
const { createHttpAgent, createHttpsAgent } = require('../lib/http-agent');
const { performance } = require('perf_hooks');

const localizeTimestamp =
  require('../../../libs/shared/l10n/src').localizeTimestamp({
    supportedLanguages: config.get('i18n').supportedLanguages,
    defaultLanguage: config.get('i18n').defaultLanguage,
  });
const serviceName = 'customs';

class CustomsClient {
  constructor(url, log, error, statsd, rateLimit) {
    this.log = log;
    this.error = error;
    this.statsd = statsd;
    this.rateLimit = rateLimit;

    const customsHttpAgentConfig = config.get('customsHttpAgent');

    if (url !== 'none') {
      this.httpAgent = createHttpAgent(
        customsHttpAgentConfig.maxSockets,
        customsHttpAgentConfig.maxFreeSockets,
        customsHttpAgentConfig.timeoutMs,
        customsHttpAgentConfig.freeSocketTimeoutMs
      );
      this.httpsAgent = createHttpsAgent(
        customsHttpAgentConfig.maxSockets,
        customsHttpAgentConfig.maxFreeSockets,
        customsHttpAgentConfig.timeoutMs,
        customsHttpAgentConfig.freeSocketTimeoutMs
      );
      this.axiosInstance = axios.create({
        baseURL: url,
        httpAgent: this.httpAgent,
        httpsAgent: this.httpsAgent,
      });
    }
  }

  async makeRequest(endpoint, requestData) {
    if (!this.axiosInstance) {
      return;
    }

    const method = endpoint.replaceAll('/', '');
    const startTime = performance.now();

    try {
      this.logHttpAgentStatus();

      const response = await this.axiosInstance.post(endpoint, requestData);

      if (this.statsd) {
        this.statsd.timing(
          `${serviceName}.${method}.success`,
          performance.now() - startTime
        );
      }

      return response.data;
    } catch (err) {
      if (this.statsd) {
        this.statsd.timing(
          `${serviceName}.${method}.failure`,
          performance.now() - startTime
        );
      }

      if (err.errno > -1 || (err.statusCode && err.statusCode < 500)) {
        throw err;
      } else {
        throw this.error.backendServiceFailure(
          serviceName,
          'POST',
          { method: 'POST', path: endpoint },
          err
        );
      }
    }
  }

  async check(request, email, action, version) {
    const result = await this.makeRequest('/check', {
      ...this.sanitizePayload({
        ip: request.app.clientAddress,
        email,
        action,

        // Payload in this case is additional user related data (ie phone number)
        payload: this.sanitizePayload(request.payload),

        // Headers and query params are used only in the `check` endpoint to
        // verify request is from a real user
        query: request.query,
        headers: request.headers,
      }),
    });

    this.optionallyReportStatsD('request.check', action, result);
    return this.handleCustomsResult(request, result);
  }

  async checkAuthenticated(request, uid, action) {
    const result = await this.makeRequest('/checkAuthenticated', {
      ...this.sanitizePayload({
        action,
        ip: request.app.clientAddress,
        uid,
      }),
    });

    this.optionallyReportStatsD('request.checkAuthenticated', action, result);
    return this.handleCustomsResult(request, result);
  }

  async checkIpOnly(request, action) {
    const result = await this.makeRequest('/checkIpOnly', {
      ...this.sanitizePayload({
        action,
        ip: request.app.clientAddress,
      }),
    });

    this.optionallyReportStatsD('request.checkIpOnly', action, result);
    return this.handleCustomsResult(request, result);
  }

  async flag(ip, info) {
    await this.makeRequest('/failedLoginAttempt', {
      ...this.sanitizePayload({
        ip,
        email: info.email,
        errno: info.errno || this.error.ERRNO.UNEXPECTED_ERROR,
      }),
    });
  }

  async reset(request, email) {
    await this.makeRequest('/passwordReset', {
      ...this.sanitizePayload({
        ip: request.app.clientAddress,
        email,
      }),
    });
  }

  /**
   * Remove sensitive fields from the payload before sending to customs.
   *
   * @param payload
   * @return {*}
   */
  sanitizePayload(payload) {
    if (!payload) {
      return;
    }

    const clonePayload = { ...payload };
    const fieldsToOmit = ['authPW', 'oldAuthPW', 'paymentToken'];
    fieldsToOmit.forEach((name) => delete clonePayload[name]);

    return clonePayload;
  }

  optionallyReportStatsD(name, action, options) {
    if (!options) {
      return;
    }

    if (this.statsd) {
      const tags = { action, block: options.block, ...options };
      this.statsd.increment(`${serviceName}.${name}`, tags);
    }
  }

  handleCustomsResult(request, result) {
    if (!result) {
      return;
    }

    if (result.suspect) {
      request.app.isSuspiciousRequest = true;
    }

    if (result.block) {
      // Log a flow event that the user got blocked.
      request.emitMetricsEvent('customs.blocked');
      const unblock = !!result.unblock;

      if (result.retryAfter) {
        // Create a localized retryAfterLocalized value from retryAfter.
        // For example '713' becomes '12 minutes' in English.
        const retryAfterLocalized = localizeTimestamp.format(
          Date.now() + result.retryAfter * 1000,
          request.headers['accept-language']
        );

        throw this.error.tooManyRequests(
          result.retryAfter,
          retryAfterLocalized,
          false
        );
      }

      throw this.error.requestBlocked(unblock);
    }
  }

  logHttpAgentStatus() {
    if (this.axiosInstance && this.statsd) {
      this.logStatus(this.httpAgent, 'httpAgent');
      this.logStatus(this.httpsAgent, 'httpsAgent');
    }
  }

  logStatus(agent, name) {
    if (agent) {
      const status = agent.getCurrentStatus();
      this.statsd.gauge(`${name}.createSocketCount`, status.createSocketCount);
      this.statsd.gauge(
        `${name}.createSocketErrorCount`,
        status.createSocketErrorCount
      );
      this.statsd.gauge(`${name}.closeSocketCount`, status.closeSocketCount);
      this.statsd.gauge(`${name}.errorSocketCount`, status.errorSocketCount);
      this.statsd.gauge(
        `${name}.timeoutSocketCount`,
        status.timeoutSocketCount
      );
      this.statsd.gauge(`${name}.requestCount`, status.requestCount);

      Object.keys(status.freeSockets).forEach((addr, value) => {
        this.statsd.gauge(`${name}.freeSockets.${addr}`, value);
      });

      Object.keys(status.sockets).forEach((addr, value) => {
        this.statsd.gauge(`${name}.sockets.${addr}`, value);
      });
    }
  }

  // #region Customs V2

  /**
   * Version 2 Customs Approach
   * =======================================================================================
   * We are versioning the function names in order to make the upgrade easy. Once customs v2
   * (aka the rate limiting lib) has baked and we are confident in the functionality we can
   * deprecate the old functions, and use these instead. Note, that v2 uses a library which
   * makes the calls more direct and simplifies things a bit
   */

  async checkRateLimit(request, action, email) {
    this._rateLimit('check', action, {
      ip: request?.app?.clientAddress,
      email,
    });
  }

  async checkAuthenticatedRateLimit(request, uid, action) {
    this._rateLimit('checkAuthenticated', action, {
      ip: request?.app?.clientAddress,
      uid,
    });
  }

  async checkIpOnlyRateLimit(request, action) {
    this._rateLimit('checkIpOnly', action, {
      ip: request?.app?.clientAddress,
    });
  }

  async _rateLimit(type, action, opts) {
    const result = await this.rateLimit.check(action, opts);

    // If statsd was provided, record metrics
    if (this.statsd) {
      this.statsd.increment(`${serviceName}.request.v2.${type}`, {
        action,
        block: result != null,
        blockReason: result?.reason || '',
      });
    }

    // If no result, we can short circuit
    if (result == null) {
      return;
    }

    // We use the rate limiter to allow X number unblock attempts per day. Once
    // unblock attempts have been exhausted, the user cannot request an unblock
    // code and must wait until the unblockEmail ban duration has expired. Similar
    // logic existed in the old customs server, but these sorts of decisions are
    // actually domain of the service using customs and not customs itself, so
    // this is the revised approach.
    let canUnblock = false;
    if (email) {
      const unblockResult = this.rateLimit.check('unblockEmail', {
        email,
      });
      canUnblock = unblockResult == null;
    }

    request.emitMetricsEvent('customs.blocked');

    if (result.retryAfter) {
      const retryAfterLocalized = localizeTimestamp.format(
        Date.now() + result.retryAfter * 1000,
        request.headers['accept-language']
      );
      throw this.error.tooManyRequests(
        result.retryAfter,
        retryAfterLocalized,
        canUnblock
      );
    } else {
      // Note, the previous implementation would throw this error if there was no
      // retryAfter value. However, in the new implementation there is always a retry
      // after value, because not having one creates bad UX. Therefore, the following
      // error should not actually be raised in practice.
      throw this.error.requestBlocked(unblock);
    }
  }
  // #endregion
}

module.exports = CustomsClient;
