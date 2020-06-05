#!/usr/bin/env node

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const Hapi = require('@hapi/hapi');
const Memcached = require('memcached');
const packageJson = require('../package.json');
const blockReasons = require('./block_reasons');
const P = require('bluebird');
P.promisifyAll(Memcached.prototype);
const { configureSentry } = require('./sentry');
const dataflow = require('./dataflow');

module.exports = async function createServer(config, log) {
  var startupDefers = [];

  // Setup blocklist manager
  if (config.ipBlocklist.enable) {
    var IPBlocklistManager = require('./ip_blocklist_manager')(log, config);
    var blockListManager = new IPBlocklistManager();
    startupDefers.push(
      blockListManager.load(
        config.ipBlocklist.lists,
        config.ipBlocklist.logOnlyLists
      )
    );
    blockListManager.pollForUpdates();
  }

  var mc = new Memcached(config.memcache.address, {
    timeout: 500,
    retries: 1,
    retry: 1000,
    reconnect: 1000,
    idle: 30000,
    namespace: 'fxa~',
  });

  var reputationService = require('./reputationService')(config, log);
  const Settings = require('./settings/settings')(config, mc, log);
  var limits = require('./settings/limits')(config, Settings, log);
  var allowedIPs = require('./settings/allowed_ips')(config, Settings, log);
  var allowedEmailDomains = require('./settings/allowed_email_domains')(
    config,
    Settings,
    log
  );
  const allowedPhoneNumbers = require('./settings/allowed_phone_numbers')(
    config,
    Settings,
    log
  );
  var requestChecks = require('./settings/requestChecks')(
    config,
    Settings,
    log
  );

  const {
    fetchRecord,
    fetchRecords,
    setRecords,
    setRecord,
  } = require('./records')(
    mc,
    reputationService,
    limits,
    config.memcache.recordLifetimeSeconds
  );

  const checkUserDefinedRateLimitRules = require('./user_defined_rules')(
    config,
    fetchRecord,
    setRecords
  );

  dataflow(config, log, fetchRecords, setRecord);

  if (config.updatePollIntervalSeconds) {
    [
      allowedEmailDomains,
      allowedIPs,
      allowedPhoneNumbers,
      limits,
      requestChecks,
    ].forEach((settings) => {
      settings.refresh({ pushOnMissing: true }).catch(() => {});
      settings.pollForUpdates();
    });
  }

  const handleBan = require('./bans/handler')(fetchRecords, setRecords, log);

  const api = Hapi.server({
    port: config.listen.port,
    host: config.listen.host,
    // To reduce connection timeouts, increase the server and socket timeouts
    routes: { timeout: { server: 4 * 60 * 1000, socket: 8 * 60 * 1000 } },
  });

  // Allow Keep-Alive connections from the auth-server to be idle up to two
  // minutes before closing the connection. If this is not set, the default
  // idle-time is 5 seconds.  This can cause a lot of unneeded churn in server
  // connections. Setting this to 120s makes node8 behave more like node6. -
  // https://nodejs.org/docs/latest-v8.x/api/http.html#http_server_keepalivetimeout
  api.listener.keepAliveTimeout = 2 * 60 * 1000;

  await configureSentry(api, config, log);

  function logError(err) {
    log.error({ op: 'memcachedError', err: err });
    throw err;
  }

  function isAllowed(ip, email, phoneNumber) {
    return (
      allowedIPs.isAllowed(ip) ||
      allowedEmailDomains.isAllowed(email) ||
      allowedPhoneNumbers.isAllowed(phoneNumber)
    );
  }

  function allowWhitelisted(result, ip, email, phoneNumber) {
    // Regardless of any preceding checks, there are some IPs, emails,
    // and phone numbers that we won't block. These are typically for
    // Mozilla QA purposes. They should be checked after everything
    // else so as not to pay the overhead of checking the many requests
    // that are *not* QA-related.
    if (result.block || result.suspect) {
      if (isAllowed(ip, email, phoneNumber)) {
        log.info({
          op: 'request.check.allowed',
          ip: ip,
          block: result.block,
          suspect: result.suspect,
        });
        result.block = false;
        result.suspect = false;
      }
    }
  }

  function optionallyReportIp(result, ip, action) {
    if (result.block && result.blockReason !== blockReasons.IP_BAD_REPUTATION) {
      reputationService.report(ip, `fxa:request.check.block.${action}`);
    }
  }

  function max(prev, cur) {
    return Math.max(prev, cur);
  }

  function normalizedEmail(rawEmail) {
    const lowercaseEmail = rawEmail.toLowerCase();

    if (/@gmail\.com$/.test(lowercaseEmail)) {
      // gmail addresses have some special rules:
      // Everything from `+` to the end of the local part is ignored.
      // All periods are ignored.
      // Remove these optional portions so that these emails are treated the same:
      // attacker@gmail.com
      // attacker+20190507@gmail.com
      // a.ttack.e.r+is+a+goon@gmail.com
      const [local, domain] = lowercaseEmail.split('@');
      return `${local.replace(/\+.*$/, '').replace(/\./g, '')}@${domain}`;
    }

    return lowercaseEmail;
  }

  api.route({
    method: 'POST',
    path: '/check',
    handler: async (req, h) => {
      let email = req.payload.email;
      const { ip, action } = req.payload;
      const headers = req.headers || {};
      const payload = req.payload.payload || {};

      if (!email || !ip || !action) {
        const err = {
          code: 'MissingParameters',
          message: 'email, ip and action are all required',
        };
        log.error({ op: 'request.check', email, ip, action, err });
        return h.response(err).code(400);
      }
      email = normalizedEmail(email);

      // Phone number is optional
      let phoneNumber;
      if (payload.phoneNumber) {
        phoneNumber = payload.phoneNumber;
      }

      async function checkRecords({
        ipRecord,
        reputation,
        emailRecord,
        ipEmailRecord,
        smsRecord,
      }) {
        if (ipRecord.isBlocked() || ipRecord.isDisabled()) {
          // a blocked ip should just be ignored completely
          // it's malicious, it shouldn't penalize emails or allow
          // (most) escape hatches. just abort!
          return {
            block: true,
            retryAfter: ipRecord.retryAfter(),
          };
        }

        // Check each record type to see if a retryAfter has been set
        const wantsUnblock = payload.unblockCode;
        const blockEmail = emailRecord.update(action, !!wantsUnblock);
        let blockIpEmail = ipEmailRecord.update(action);
        const blockIp = ipRecord.update(action, email);

        let blockSMS = 0;
        if (smsRecord) {
          blockSMS = smsRecord.update(action);
        }

        if (blockIpEmail && ipEmailRecord.unblockIfReset(emailRecord.pr)) {
          blockIpEmail = 0;
        }

        let retryAfter = [blockEmail, blockIpEmail, blockIp, blockSMS].reduce(
          max
        );
        let block = retryAfter > 0;
        let suspect = false;
        let blockReason = null;

        if (block) {
          blockReason = blockReasons.OTHER;
        }

        if (
          requestChecks.treatEveryoneWithSuspicion ||
          reputationService.isSuspectBelow(reputation) ||
          ipRecord.isSuspected() ||
          emailRecord.isSuspected()
        ) {
          suspect = true;
        }

        if (!block && action === 'accountLogin') {
          // All login requests should include a valid flowId.
          if (!payload.metricsContext || !payload.metricsContext.flowId) {
            // Unless they're legacy user-agents that we know will not include it.
            var isExemptUA = false;
            var userAgent = headers['user-agent'];
            isExemptUA = requestChecks.flowIdExemptUserAgentCompiledREs.some(
              function (re) {
                return re.test(userAgent);
              }
            );
            // Or unless it's for non-signin-related reasons, e.g. changing password.
            // We know these requests will not include it.
            var isExemptRequest = false;
            if (payload.reason && payload.reason !== 'signin') {
              isExemptRequest = true;
            }
            if (!isExemptUA && !isExemptRequest) {
              // By default we just treat a missing flowId as suspicious,
              // but config can change this to a hard block.
              suspect = true;
              if (requestChecks.flowIdRequiredOnLogin) {
                block = true;
              }
            }
          }
        }

        const canUnblock = emailRecord.canUnblock();

        // IP's that are in blocklist should be blocked
        // and not return a retryAfter because it is not known
        // when they would be removed from blocklist
        if (config.ipBlocklist.enable && blockListManager.contains(ip)) {
          block = true;
          blockReason = blockReasons.IP_IN_BLOCKLIST;
          retryAfter = 0;
        }

        if (reputationService.isBlockBelow(reputation)) {
          block = true;
          retryAfter = ipRecord.retryAfter();
          blockReason = blockReasons.IP_BAD_REPUTATION;
        }

        // smsRecord is optional, trying to save an undefined record results in an error
        const recordsToSave = [
          ipRecord,
          emailRecord,
          ipEmailRecord,
          smsRecord,
        ].filter((record) => !!record);
        await setRecords(...recordsToSave);
        return {
          block,
          blockReason,
          retryAfter,
          unblock: canUnblock,
          suspect,
        };
      }

      function createResponse(result) {
        const { block, unblock, suspect, blockReason } = result;

        allowWhitelisted(result, ip, email, phoneNumber);

        log.info({
          op: 'request.check',
          email,
          ip,
          action,
          block,
          unblock,
          suspect,
        });

        const response = {
          block: result.block,
          retryAfter: result.retryAfter,
          unblock: result.unblock,
          suspect: result.suspect,
        };

        if (blockReason) {
          response['blockReason'] = blockReason;
        }

        optionallyReportIp(result, ip, action);

        return response;
      }

      function handleError(err) {
        log.error({
          op: 'request.check',
          email: email,
          ip: ip,
          action: action,
          err: err,
        });

        // Default is to block request on any server based error
        return {
          block: true,
          retryAfter: limits.rateLimitIntervalSeconds,
          unblock: false,
        };
      }

      return fetchRecords({ ip, email, phoneNumber })
        .then(checkRecords)
        .then((result) =>
          checkUserDefinedRateLimitRules(result, action, email, ip)
        )
        .then(createResponse, handleError);
    },
  });

  api.route({
    method: 'POST',
    path: '/checkAuthenticated',
    handler: async (req, h) => {
      var action = req.payload.action;
      var ip = req.payload.ip;
      var uid = req.payload.uid;

      if (!action || !ip || !uid) {
        var err = {
          code: 'MissingParameters',
          message: 'action, ip and uid are all required',
        };
        log.error({
          op: 'request.checkAuthenticated',
          action: action,
          ip: ip,
          uid: uid,
          err: err,
        });
        return h.response(err).code(400);
      }

      return fetchRecords({ uid })
        .then(({ uidRecord }) => {
          var retryAfter = uidRecord.addCount(action, uid);
          return setRecords(uidRecord).then(function () {
            return {
              block: retryAfter > 0,
              retryAfter: retryAfter,
            };
          });
        })
        .then(
          function (result) {
            log.info({ op: 'request.checkAuthenticated', block: result.block });

            if (result.block) {
              reputationService.report(
                ip,
                'fxa:request.checkAuthenticated.block.' + action
              );
            }

            return result;
          },
          function (err) {
            log.error({ op: 'request.checkAuthenticated', err: err });
            // Default is to block request on any server based error

            reputationService.report(
              ip,
              'fxa:request.checkAuthenticated.block.' + action
            );

            return {
              block: true,
              retryAfter: limits.blockIntervalSeconds,
            };
          }
        );
    },
  });

  api.route({
    method: 'POST',
    path: '/checkIpOnly',
    handler: async (req, h) => {
      const action = req.payload.action;
      const ip = req.payload.ip;

      if (!action || !ip) {
        const err = {
          code: 'MissingParameters',
          message: 'action and ip are both required',
        };
        log.error({
          op: 'request.checkIpOnly',
          action: action,
          ip: ip,
          err: err,
        });
        return h.response(err).code(400);
      }

      return fetchRecords({ ip })
        .then(({ ipRecord, reputation }) => {
          if (ipRecord.isBlocked() || ipRecord.isDisabled()) {
            return { block: true, retryAfter: ipRecord.retryAfter() };
          }

          const suspect =
            requestChecks.treatEveryoneWithSuspicion ||
            reputationService.isSuspectBelow(reputation);
          let retryAfter = ipRecord.update(action);
          let block = retryAfter > 0;
          let blockReason;

          if (block) {
            blockReason = blockReasons.OTHER;
          }

          if (config.ipBlocklist.enable && blockListManager.contains(ip)) {
            block = true;
            blockReason = blockReasons.IP_IN_BLOCKLIST;
            retryAfter = 0;
          }

          if (reputationService.isBlockBelow(reputation)) {
            block = true;
            retryAfter = ipRecord.retryAfter();
            blockReason = blockReasons.IP_BAD_REPUTATION;
          }

          return setRecords(ipRecord).then(() => ({
            block,
            blockReason,
            retryAfter,
            suspect,
          }));
        })
        .then(
          (result) => {
            allowWhitelisted(result, ip);

            log.info({
              op: 'request.checkIpOnly',
              ip,
              action,
              block: result.block,
              blockReason: result.blockReason,
              suspect: result.suspect,
            });

            const response = {
              block: result.block,
              retryAfter: result.retryAfter,
              suspect: result.suspect,
            };

            if (result.blockReason) {
              response['blockReason'] = result.blockReason;
            }

            optionallyReportIp(result, ip, action);

            return response;
          },
          (err) => {
            log.error({
              op: 'request.checkIpOnly',
              ip: ip,
              action: action,
              err: err,
            });
            return {
              block: true,
              retryAfter: limits.ipRateLimitIntervalSeconds,
            };
          }
        );
    },
  });

  api.route({
    method: 'POST',
    path: '/failedLoginAttempt',
    handler: async (req, h) => {
      let email = req.payload.email;
      const ip = req.payload.ip;
      const errno = Number(req.payload.errno) || 999;
      if (!email || !ip) {
        const err = {
          code: 'MissingParameters',
          message: 'email and ip are both required',
        };
        log.error({
          op: 'request.failedLoginAttempt',
          email: email,
          ip: ip,
          err: err,
        });
        return h.response(err).code(400);
      }
      email = normalizedEmail(email);

      return fetchRecords({ ip, email })
        .then(function ({ ipRecord, emailRecord, ipEmailRecord }) {
          ipRecord.addBadLogin({ email: email, errno: errno });
          ipEmailRecord.addBadLogin();

          if (ipRecord.isOverBadLogins()) {
            reputationService.report(
              ip,
              'fxa:request.failedLoginAttempt.isOverBadLogins'
            );
          }

          return setRecords(ipRecord, emailRecord, ipEmailRecord).then(
            function () {
              return {};
            }
          );
        })
        .then(
          function (result) {
            log.info({
              op: 'request.failedLoginAttempt',
              email: email,
              ip: ip,
              errno: errno,
            });
            return result;
          },
          function (err) {
            log.error({
              op: 'request.failedLoginAttempt',
              email: email,
              ip: ip,
              err: err,
            });
            return h.response(err).code(500);
          }
        );
    },
  });

  api.route({
    method: 'POST',
    path: '/passwordReset',
    handler: async (req, h) => {
      var email = req.payload.email;
      if (!email) {
        const err = { code: 'MissingParameters', message: 'email is required' };
        log.error({ op: 'request.passwordReset', email: email, err: err });
        return h.response(err).code(400);
      }
      email = normalizedEmail(email);

      const { emailRecord } = await fetchRecords({ email });
      emailRecord.passwordReset();

      try {
        await setRecords(emailRecord);
        return {};
      } catch (err) {
        logError(err);
        return h.response(err).code(500);
      }
    },
  });

  api.route({
    method: 'POST',
    path: '/blockEmail',
    handler: async (req, h) => {
      var email = req.payload.email;
      if (!email) {
        const err = { code: 'MissingParameters', message: 'email is required' };
        log.error({ op: 'request.blockEmail', email: email, err: err });
        return h.response(err).code(400);
      }
      email = normalizedEmail(email);

      return handleBan({ ban: { email: email } })
        .then(function () {
          log.info({ op: 'request.blockEmail', email: email });
          return {};
        })
        .catch(function (err) {
          log.error({ op: 'request.blockEmail', email: email, err: err });
          return h.response(err).code(500);
        });
    },
  });

  api.route({
    method: 'POST',
    path: '/blockIp',
    handler: async (req, h) => {
      var ip = req.payload.ip;
      if (!ip) {
        const err = { code: 'MissingParameters', message: 'ip is required' };
        log.error({ op: 'request.blockIp', ip: ip, err: err });
        return h.response(err).code(400);
      }

      try {
        await handleBan({ ban: { ip: ip } });
        reputationService.report(ip, 'fxa:request.blockIp');
        log.info({ op: 'request.blockIp', ip: ip });
        return {};
      } catch (err) {
        log.error({ op: 'request.blockIp', ip: ip, err: err });
        return h.response(err).code(500);
      }
    },
  });

  api.route({
    method: 'GET',
    path: '/',
    handler: async () => {
      return { version: packageJson.version };
    },
  });

  api.route({
    method: 'GET',
    path: '/limits',
    handler: async () => {
      return limits;
    },
  });

  api.route({
    method: 'GET',
    path: '/allowedIPs',
    handler: async () => {
      return Object.keys(allowedIPs.ips);
    },
  });

  api.route({
    method: 'GET',
    path: '/allowedEmailDomains',
    handler: async () => {
      return Object.keys(allowedEmailDomains.domains);
    },
  });

  api.route({
    method: 'GET',
    path: '/allowedPhoneNumbers',
    handler: async () => {
      return allowedPhoneNumbers.toJSON();
    },
  });

  return P.all(startupDefers).then(function () {
    return api;
  });
};
