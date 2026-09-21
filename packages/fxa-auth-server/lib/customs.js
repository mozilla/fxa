/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const Sentry = require('@sentry/node');
const { config } = require('../config');
const { EmailNormalization } = require('fxa-shared/email/email-normalization');

const localizeTimestamp =
  require('../../../libs/shared/l10n/src').localizeTimestamp({
    supportedLanguages: config.get('i18n').supportedLanguages,
    defaultLanguage: config.get('i18n').defaultLanguage,
  });
const serviceName = 'customs';

let emailNormalization = new EmailNormalization(
  config.get('rateLimit.emailAliasNormalization')
);

function _reloadEmailNormalization() {
  emailNormalization = new EmailNormalization(
    config.get('rateLimit.emailAliasNormalization')
  );
}

function toOpts(ip, email, uid) {
  const opts = {};
  if (ip) {
    opts.ip = ip;
  }
  if (email) {
    opts.email = emailNormalization.normalizeEmailAliases(email);
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

/**
 * Rate limiting for the auth server. Decisions come from the rate-limit library,
 * which works directly with Redis. Every method no-ops when that library is absent.
 */
class CustomsClient {
  constructor(log, error, statsd, rateLimit) {
    this.log = log;
    this.error = error;
    this.statsd = statsd;
    this.rateLimit = rateLimit;
  }

  async check(request, email, action) {
    const opts = toOpts(request?.app?.clientAddress, email, undefined);
    await this.checkV2(request, 'check', action, opts, email);
  }

  async checkAuthenticated(request, uid, email, action) {
    const opts = toOpts(request?.app?.clientAddress, email, uid);
    await this.checkV2(request, 'checkAuthenticated', action, opts, email);
  }

  async checkIpOnly(request, action) {
    const opts = toOpts(request?.app?.clientAddress, undefined, undefined);
    await this.checkV2(request, 'checkIpOnly', action, opts);
  }

  /**
   * Rate limits on a credential hash, for actions checked before the account
   * behind it is known.
   */
  async checkToken(request, action, tokenHash) {
    const opts = toOpts(request?.app?.clientAddress);
    opts.token = tokenHash;
    await this.checkV2(request, 'checkToken', action, opts);
  }

  async flag(ip, info) {
    // noop since this is being deprecated
    return Promise.resolve();
  }

  async reset(request, email) {
    await this.resetV2(request, email);
  }

  v2Enabled() {
    return this.rateLimit != null;
  }

  async checkV2(request, type, action, opts, nonNormalizedEmail) {
    if (this.rateLimit == null) {
      return;
    }

    if (!opts) {
      throw this.error.unexpectedError('Missing parameter opts');
    }

    // No rule for this action, and rateLimit.check throws on those.
    if (!this.rateLimit.supportsAction(action)) {
      this.statsd?.increment(`${serviceName}.check.v1`, [`action:${action}`]);
      return;
    }

    // The config can specify that certain ips, emails, or uids should be excluded
    // from rate limit checks. Pass the raw email so an ignoreEmails pattern can
    // match a +suffix that opts.email no longer carries.
    const skip = this.rateLimit.skip(action, opts, nonNormalizedEmail);
    if (skip) {
      this.statsd.increment(`${serviceName}.check.v2.skip`, [
        opts.ip_email ? 'ip_email' : '',
        opts.ip_uid ? 'ip_uid' : '',
        opts.ip ? 'ip' : '',
        opts.email ? 'email' : '',
        opts.uid ? 'uid' : '',
      ]);
      return;
    }

    this.statsd?.increment(`${serviceName}.check.v2`, [`action:${action}`]);

    let result = null;
    try {
      result = await this.rateLimit.check(action, {
        ip: opts.ip,
        email: opts.email,
        uid: opts.uid,
        ip_email: opts.ip_email,
        ip_uid: opts.ip_uid,
        token: opts.token,
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
      return;
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
    // A self-serve success may only clear counters attributable to that
    // principal. Drop the raw ip (shared across everyone behind a NAT/VPN) so it
    // cannot wipe ip-keyed anti-spray counters for other users. ip_email is
    // derived inside toOpts and survives.
    delete opts.ip;
    await this.rateLimit.unblock(opts);
  }
}

CustomsClient._reloadEmailNormalization = _reloadEmailNormalization;

module.exports = CustomsClient;
