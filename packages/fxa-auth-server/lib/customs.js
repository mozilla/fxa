/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const axios = require('axios');
const Sentry = require('@sentry/node');
const { config } = require('../config');
const { createHttpAgent, createHttpsAgent } = require('../lib/http-agent');
const { performance } = require('perf_hooks');
const { normalizeEmail } = require('fxa-shared/email/helpers');

const localizeTimestamp =
  require('../../../libs/shared/l10n/src').localizeTimestamp({
    supportedLanguages: config.get('i18n').supportedLanguages,
    defaultLanguage: config.get('i18n').defaultLanguage,
  });
const serviceName = 'customs';

function toOpts(ip, email, uid) {
  const opts = {};
  if (ip) {
    opts.ip = ip;
  }
  if (email) {
    opts.email = normalizeEmail(email);
  }
  if (uid) {
    opts.uid = uid;
  }
  if (opts.ip && opts.email) {
    opts.ip_email = `${opts.ip}_${opts.email}`;
  }
  if (opts.ip && opts.uid) {
    opts.ip_uid = `${opts.ip}_${opts.uid}`;
  }

  return opts;
}

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

  async check(request, email, action) {
    const opts = toOpts(request?.app?.clientAddress, email, undefined);
    const checked = await this.checkV2(request, 'check', action, opts);
    if (checked) {
      return;
    }

    const result = await this.makeRequest('/check', {
      ...this.sanitizePayload({
        ip: request.app.clientAddress,
        email: normalizeEmail(email),
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

  async checkAuthenticated(request, uid, email, action) {
    const opts = toOpts(request?.app?.clientAddress, email, uid);
    const checked = await this.checkV2(
      request,
      'checkAuthenticated',
      action,
      opts
    );
    if (checked) {
      return;
    }

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
    const opts = toOpts(request?.app?.clientAddress, undefined, undefined);
    const checked = await this.checkV2(request, 'checkIpOnly', action, opts);
    if (checked) {
      return;
    }

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
        email: normalizeEmail(info.email),
        errno: info.errno || this.error.ERRNO.UNEXPECTED_ERROR,
      }),
    });
  }

  async reset(request, email) {
    await this.resetV2(request, email);

    await this.makeRequest('/passwordReset', {
      ...this.sanitizePayload({
        ip: request.app.clientAddress,
        email: normalizeEmail(email),
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
      const tags = { action };
      if (options.block != null) {
        tags.block = options.block;
      }
      if (options.suspect != null) {
        tags.suspect = options.suspect;
      }
      if (options.unblock != null) {
        tags.unblock = options.unblock;
      }
      if (options.blockReason != null) {
        tags.blockReason = options.blockReason;
      }
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
  v2Enabled() {
    return this.rateLimit != null;
  }

  /**
   * Version 2 Customs Approach
   * =======================================================================================
   * This uses a library provided by libs and works directly with Redis to make rate limiting
   * decisions. The previous customs check to see if there is 'new' configuration for the
   * customs action being checked. If there is, we will call into this code instead of calling
   * the legacy customs service.
   */
  async checkV2(request, type, action, opts) {
    // Short circuit if rate limit wasn't provided.
    if (this.rateLimit == null) {
      return false;
    }

    if (!opts) {
      throw this.error.unexpectedError('Missing parameter opts');
    }

    // Fallback to the legacy customs service approach, if v2 action isn't configured
    const actionConfigured = this.rateLimit.supportsAction(action);
    if (!actionConfigured) {
      this.statsd?.increment(`${serviceName}.check.v1`, [`action:${action}`]);
      return false;
    }

    // The config can specify that certain ips, emails, or uids should be excluded
    // from rate limit checks.
    const skip = this.rateLimit.skip(opts);
    if (skip) {
      this.statsd.increment(`${serviceName}.check.v2.skip`, [
        opts.ip_email ? 'ip_email' : '',
        opts.ip_uid ? 'ip_uid' : '',
        opts.ip ? 'ip' : '',
        opts.email ? 'email' : '',
        opts.uid ? 'uid' : '',
      ]);
      return true;
    }

    // Otherwise, call the new nx lib instead of the legacy service
    this.statsd?.increment(`${serviceName}.check.v2`, [`action:${action}`]);

    let result = null;
    try {
      result = await this.rateLimit.check(action, {
        ip: opts.ip,
        email: opts.email,
        uid: opts.uid,
        ip_email: opts.ip_email,
        ip_uid: opts.ip_uid,
      });
    } catch (err) {
      Sentry.captureException(err, {
        tags: {
          source: 'customs',
          action,
          type,
          ip_email: !!opts.ip_email,
          ip_uid: !!opts.ip_uid,
          ip: !!opts.ip,
          email: !!opts.email,
          uid: !!opts.uid,
        },
      });
      this.log?.error('customs-client', err);
      throw err;
    }

    // If statsd was provided, record metrics
    this.statsd?.increment(`${serviceName}.request.v2.${type}`, {
      action,
      block: result != null,
      blockReason: result?.reason || '',
    });

    // If no result, we exit. Check essentially passes.
    if (result == null) {
      return true;
    }

    // We use the rate limiter to allow X number unblock attempts per day. Once
    // unblock attempts have been exhausted, the user cannot request an unblock
    // code and must wait until the unblockEmail ban duration has expired. Similar
    // logic existed in the old customs server, but these sorts of decisions are
    // actually domain of the service using customs and not customs itself, so
    // this is the revised approach.
    let canUnblock = false;
    const { email, ip, uid, ip_email, ip_uid } = opts;
    if (
      email &&
      ip &&
      ip_email &&
      this.rateLimit.supportsAction('unblockEmail')
    ) {
      const unblockResult = await this.rateLimit.check('unblockEmail', {
        ip,
        email,
        uid,
        ip_email,
        ip_uid,
      });
      canUnblock = unblockResult == null;
    }

    request.emitMetricsEvent('customs.blocked');

    const retryAfterLocalized = localizeTimestamp.format(
      Date.now() + result.retryAfter,
      request.headers['accept-language']
    );

    throw this.error.tooManyRequests(
      result.retryAfter,
      retryAfterLocalized,
      canUnblock
    );
  }

  async resetV2(request, email) {
    if (this.rateLimit == null) {
      return;
    }

    const opts = toOpts(request?.app?.clientAddress, email);
    await this.rateLimit.unblock(opts);
  }
  // #endregion
}

module.exports = CustomsClient;
