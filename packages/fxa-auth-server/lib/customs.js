/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const fetch = require('node-fetch');
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
  constructor(url, log, error, statsd) {
    this.log = log;
    this.error = error;
    this.statsd = statsd;
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
      this.baseURL = url;
    }
  }

  async makeRequest(endpoint, requestData) {
    if (!this.baseURL) {
      return;
    }

    const method = endpoint.replaceAll('/', '');
    const startTime = performance.now();

    try {
      this.logHttpAgentStatus();

      const url = this.baseURL + endpoint;
      let agent;
      try {
        const parsedUrl = new URL(url);
        agent =
          parsedUrl.protocol === 'https:' ? this.httpsAgent : this.httpAgent;
      } catch (err) {
        agent = this.httpAgent;
      }

      const options = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData),
        agent: agent,
      };

      const response = await fetch(url, options);

      if (!response.ok) {
        const error = new Error(`HTTP response error: ${response.status}`);
        error.statusCode = response.status;
        throw error;
      }

      if (this.statsd) {
        this.statsd.timing(
          `${serviceName}.${method}.success`,
          performance.now() - startTime
        );
      }

      const data = await response.json();
      return data;
    } catch (err) {
      if (this.statsd) {
        this.statsd.timing(
          `${serviceName}.${method}.failure`,
          performance.now() - startTime
        );
      }

      if (
        (err.errno !== undefined && err.errno > -1) ||
        (err.statusCode && err.statusCode < 500)
      ) {
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

  async check(request, email, action) {
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
          unblock
        );
      }

      throw this.error.requestBlocked(unblock);
    }
  }

  logHttpAgentStatus() {
    if (this.baseURL && this.statsd) {
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
}

module.exports = CustomsClient;
