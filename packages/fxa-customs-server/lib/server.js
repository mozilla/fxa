#!/usr/bin/env node

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict'

var Memcached = require('memcached')
var restify = require('restify')
var safeJsonFormatter = require('restify-safe-json-formatter')
var packageJson = require('../package.json')
var blockReasons = require('./block_reasons')
var P = require('bluebird')
P.promisifyAll(Memcached.prototype)

// Create and return a restify server instance
// from the given config.

module.exports = function createServer(config, log) {

  var startupDefers = []

  // Setup blocklist manager
  if (config.ipBlocklist.enable) {
    var IPBlocklistManager = require('./ip_blocklist_manager')(log, config)
    var blockListManager = new IPBlocklistManager()
    startupDefers.push(blockListManager.load(config.ipBlocklist.lists, config.ipBlocklist.logOnlyLists))
    blockListManager.pollForUpdates()
  }

  var mc = new Memcached(
    config.memcache.address,
    {
      timeout: 500,
      retries: 1,
      retry: 1000,
      reconnect: 1000,
      idle: 30000,
      namespace: 'fxa~'
    }
  )

  var reputationService = require('./reputationService')(config, log)
  const Settings = require('./settings/settings')(config, mc, log)
  var limits = require('./settings/limits')(config, Settings, log)
  var allowedIPs = require('./settings/allowed_ips')(config, Settings, log)
  var allowedEmailDomains = require('./settings/allowed_email_domains')(config, Settings, log)
  var requestChecks = require('./settings/requestChecks')(config, Settings, log)

  if (config.updatePollIntervalSeconds) {
    [
      allowedEmailDomains,
      allowedIPs,
      limits,
      requestChecks
    ].forEach(settings => {
      settings.refresh({ pushOnMissing: true }).catch(() => {})
      settings.pollForUpdates()
    })
  }

  var IpEmailRecord = require('./ip_email_record')(limits)
  var EmailRecord = require('./email_record')(limits)
  var IpRecord = require('./ip_record')(limits)
  var UidRecord = require('./uid_record')(limits)
  var smsRecord = require('./sms_record')(limits)

  var handleBan = P.promisify(require('./bans/handler')(config.memcache.recordLifetimeSeconds, mc, EmailRecord, IpRecord, log))

  // optional SQS-based IP/email banning API
  if (config.bans.region && config.bans.queueUrl) {
    var bans = require('./bans')(log)
    bans(config.bans, mc)
    log.info({ op: 'listeningSQS', sqsRegion: config.bans.region, sqsQueueUrl: config.bans.queueUrl })
  }

  var api = restify.createServer({
    formatters: {
      'application/json; q=0.9': safeJsonFormatter
    }
  })
  api.use(restify.bodyParser())

  function logError(err) {
    log.error({ op: 'memcachedError', err: err })
    throw err
  }

  function fetchRecords(ip, email, phoneNumber) {
    var promises = [
      // get records and ignore errors by returning a new record
      mc.getAsync(ip).then(IpRecord.parse, IpRecord.parse),
      reputationService.get(ip)
    ]

    // The /checkIpOnly endpoint has no email (or phoneNumber)
    if (email) {
      promises.push(mc.getAsync(email).then(EmailRecord.parse, EmailRecord.parse))
      promises.push(mc.getAsync(ip + email).then(IpEmailRecord.parse, IpEmailRecord.parse))
    }

    // Check against SMS records to make sure that this request
    // can send to this phone number
    if (phoneNumber) {
      promises.push(mc.getAsync(phoneNumber).then(smsRecord.parse, smsRecord.parse))
    }

    return P.all(promises)
  }

  function setRecord(key, record) {
    var lifetime = Math.max(config.memcache.recordLifetimeSeconds, record.getMinLifetimeMS() / 1000)
    return mc.setAsync(key, record, lifetime)
  }

  function setRecords(ip, ipRecord, email, emailRecord, ipEmailRecord, phoneNumber, smsRecord) {
    let promises = [
      setRecord(ip, ipRecord)
    ]

    if (email) {
      if (emailRecord) {
        promises.push(setRecord(email, emailRecord))
      }

      if (ipEmailRecord) {
        promises.push(setRecord(ip + email, ipEmailRecord))
      }
    }

    if (phoneNumber && smsRecord) {
      promises.push(setRecord(phoneNumber, smsRecord))
    }

    return P.all(promises)
  }

  function allowWhitelisted (result, ip, email) {
    // Regardless of any preceding checks, there are some IPs and emails
    // that we won't block. These are typically for Mozilla QA purposes.
    // They should be checked after everything else so as not to pay the
    // overhead of checking the many requests that are *not* QA-related.
    if (result.block || result.suspect) {
      if (ip in allowedIPs.ips || (email && allowedEmailDomains.isAllowed(email))) {
        log.info({
          op: 'request.check.allowed',
          ip: ip,
          block: result.block,
          suspect: result.suspect
        })
        result.block = false
        result.suspect = false
      }
    }
  }

  function optionallyReportIp (result, ip, action) {
    if (result.block && result.blockReason !== blockReasons.IP_BAD_REPUTATION) {
      reputationService.report(ip, `fxa:request.check.block.${action}`)
    }
  }

  function max(prev, cur) {
    return Math.max(prev, cur)
  }

  function normalizedEmail(rawEmail) {
    return rawEmail.toLowerCase()
  }

  api.post(
    '/check',
    function (req, res, next) {
      var email = req.body.email
      var ip = req.body.ip
      var action = req.body.action
      var headers = req.body.headers || {}
      var payload = req.body.payload || {}

      if (!email || !ip || !action) {
        var err = {code: 'MissingParameters', message: 'email, ip and action are all required'}
        log.error({ op: 'request.check', email: email, ip: ip, action: action, err: err })
        res.send(400, err)
        return next()
      }
      email = normalizedEmail(email)

      // Phone number is optional
      var phoneNumber
      if (req.body.payload && req.body.payload.phoneNumber) {
        phoneNumber = req.body.payload.phoneNumber
      }


      fetchRecords(ip, email, phoneNumber)
        .spread(
          function (ipRecord, reputation, emailRecord, ipEmailRecord, smsRecord) {
            if (ipRecord.isBlocked()) {
              // a blocked ip should just be ignored completely
              // it's malicious, it shouldn't penalize emails or allow
              // (most) escape hatches. just abort!
              return {
                block: true,
                retryAfter: ipRecord.retryAfter()
              }
            }

            var wantsUnblock = req.body.payload && req.body.payload.unblockCode
            var blockEmail = emailRecord.update(action, !!wantsUnblock)
            var blockIpEmail = ipEmailRecord.update(action)
            var blockIp = ipRecord.update(action, email)

            var blockSMS = 0
            if (smsRecord) {
              blockSMS = smsRecord.update(action)
            }

            if (blockIpEmail && ipEmailRecord.unblockIfReset(emailRecord.pr)) {
              blockIpEmail = 0
            }

            var retryAfter = [blockEmail, blockIpEmail, blockIp, blockSMS].reduce(max)
            var block = retryAfter > 0
            var suspect = false
            var blockReason = null

            if (block) {
              blockReason = blockReasons.OTHER
            }

            if (requestChecks.treatEveryoneWithSuspicion || reputationService.isSuspectBelow(reputation)) {
              suspect = true
            }
            // The private branch puts some additional request checks here.
            // We just use the variables so that eslint doesn't complain about them.
            payload || headers

            var canUnblock = emailRecord.canUnblock()

            // IP's that are in blocklist should be blocked
            // and not return a retryAfter because it is not known
            // when they would be removed from blocklist
            if (config.ipBlocklist.enable && blockListManager.contains(ip)) {
              block = true
              blockReason = blockReasons.IP_IN_BLOCKLIST
              retryAfter = 0
            }

            if (reputationService.isBlockBelow(reputation)) {
              block = true
              retryAfter = ipRecord.retryAfter()
              blockReason = blockReasons.IP_BAD_REPUTATION
            }

            return setRecords(ip, ipRecord, email, emailRecord, ipEmailRecord, phoneNumber, smsRecord)
              .then(
                function () {
                  return {
                    block: block,
                    blockReason: blockReason,
                    retryAfter: retryAfter,
                    unblock: canUnblock,
                    suspect: suspect
                  }
                }
              )
          }
        )
        .then(
          function (result) {
            allowWhitelisted(result, ip, email)

            log.info({
              op: 'request.check',
              email: email,
              ip: ip,
              action: action,
              block: result.block,
              unblock: result.unblock,
              suspect: result.suspect
            })
            res.send({
              block: result.block,
              retryAfter: result.retryAfter,
              unblock: result.unblock,
              suspect: result.suspect
            })

            optionallyReportIp(result, ip, action)
          },
          function (err) {
            log.error({ op: 'request.check', email: email, ip: ip, action: action, err: err })

            // Default is to block request on any server based error
            res.send({
              block: true,
              retryAfter: limits.rateLimitIntervalSeconds,
              unblock: false
            })
          }
        )
        .done(next, next)
    }
  )

  api.post(
    '/checkAuthenticated',
    function (req, res, next) {
      var action = req.body.action
      var ip = req.body.ip
      var uid = req.body.uid

      if(!action || !ip || !uid){
        var err = {code: 'MissingParameters', message: 'action, ip and uid are all required'}
        log.error({op:'request.checkAuthenticated', action: action, ip: ip, uid: uid, err: err})
        res.send(400, err)
        return next()
      }

      mc.getAsync(uid)
        .then(UidRecord.parse, UidRecord.parse)
        .then(
          function (uidRecord) {
            var retryAfter = uidRecord.addCount(action, uid)

            return setRecord(uid, uidRecord)
              .then(
                function () {
                  return {
                    block: retryAfter > 0,
                    retryAfter: retryAfter
                  }
                }
              )
          }
        )
        .then(
          function (result) {
            log.info({ op: 'request.checkAuthenticated', block: result.block })
            res.send(result)

            if (result.block) {
              reputationService.report(ip, 'fxa:request.checkAuthenticated.block.' + action)
            }
          },
          function (err) {
            log.error({ op: 'request.checkAuthenticated', err: err })
            // Default is to block request on any server based error
            res.send({
              block: true,
              retryAfter: limits.blockIntervalSeconds
            })

            reputationService.report(ip, 'fxa:request.checkAuthenticated.block.' + action)
          }
        )
        .done(next, next)
    }
  )

  api.post('/checkIpOnly', (req, res, next) => {
    const action = req.body.action
    const ip = req.body.ip

    if (! action || ! ip) {
      const err = { code: 'MissingParameters', message: 'action and ip are both required' }
      log.error({ op:'request.checkAuthenticated', action: action, ip: ip, err: err })
      res.send(400, err)
      return next()
    }

    fetchRecords(ip)
      .spread((ipRecord, reputation) => {
        if (ipRecord.isBlocked()) {
          return { block: true, retryAfter: ipRecord.retryAfter() }
        }

        const suspect = requestChecks.treatEveryoneWithSuspicion || reputationService.isSuspectBelow(reputation)
        let retryAfter = ipRecord.update(action)
        let block = retryAfter > 0
        let blockReason

        if (block) {
          blockReason = blockReasons.OTHER
        }

        if (config.ipBlocklist.enable && blockListManager.contains(ip)) {
          block = true
          blockReason = blockReasons.IP_IN_BLOCKLIST
          retryAfter = 0
        }

        if (reputationService.isBlockBelow(reputation)) {
          block = true
          retryAfter = ipRecord.retryAfter()
          blockReason = blockReasons.IP_BAD_REPUTATION
        }

        return setRecords(ip, ipRecord)
          .then(() => ({ block, blockReason, retryAfter, suspect }))
      })
      .then(result => {
        allowWhitelisted(result, ip)

        log.info({
          op: 'request.checkIpOnly',
          ip,
          action,
          block: result.block,
          blockReason: result.blockReason,
          suspect: result.suspect
        })

        res.send({
          block: result.block,
          retryAfter: result.retryAfter,
          suspect: result.suspect
        })

        optionallyReportIp(result, ip, action)
      }, err => {
        log.error({ op: 'request.checkIpOnly', ip: ip, action: action, err: err })
        res.send({ block: true, retryAfter: limits.ipRateLimitIntervalSeconds })
      })
      .done(next, next)
  })

  api.post(
    '/failedLoginAttempt',
    function (req, res, next) {
      var email = req.body.email
      var ip = req.body.ip
      var errno = Number(req.body.errno) || 999
      if (!email || !ip) {
        var err = {code: 'MissingParameters', message: 'email and ip are both required'}
        log.error({ op: 'request.failedLoginAttempt', email: email, ip: ip, err: err })
        res.send(400, err)
        return next()
      }
      email = normalizedEmail(email)

      fetchRecords(ip, email)
        .spread(
          function (ipRecord, reputation, emailRecord, ipEmailRecord) {
            ipRecord.addBadLogin({ email: email, errno: errno })
            ipEmailRecord.addBadLogin()

            if (ipRecord.isOverBadLogins()) {
              reputationService.report(ip, 'fxa:request.failedLoginAttempt.isOverBadLogins')
            }

            return setRecords(ip, ipRecord, email, emailRecord, ipEmailRecord)
              .then(
                function () {
                  return {}
                }
              )
          }
        )
        .then(
          function (result) {
            log.info({ op: 'request.failedLoginAttempt', email: email, ip: ip, errno: errno })
            res.send(result)
          },
          function (err) {
            log.error({ op: 'request.failedLoginAttempt', email: email, ip: ip, err: err })
            res.send(500, err)
          }
        )
        .done(next, next)
    }
  )

  api.post(
    '/passwordReset',
    function (req, res, next) {
      var email = req.body.email
      if (!email) {
        var err = {code: 'MissingParameters', message: 'email is required'}
        log.error({ op: 'request.passwordReset', email: email, err: err })
        res.send(400, err)
        return next()
      }
      email = normalizedEmail(email)

      mc.getAsync(email)
        .then(EmailRecord.parse, EmailRecord.parse)
        .then(
          function (emailRecord) {
            emailRecord.passwordReset()
            return setRecord(email, emailRecord).catch(logError)
          }
        )
        .then(
          function () {
            log.info({ op: 'request.passwordReset', email: email })
            res.send({})
          },
          function (err) {
            log.error({ op: 'request.passwordReset', email: email, err: err })
            res.send(500, err)
          }
        )
        .done(next, next)
    }
  )

  api.post(
    '/blockEmail',
    function (req, res, next) {
      var email = req.body.email
      if (!email) {
        var err = {code: 'MissingParameters', message: 'email is required'}
        log.error({ op: 'request.blockEmail', email: email, err: err })
        res.send(400, err)
        return next()
      }
      email = normalizedEmail(email)

      handleBan({ ban: { email: email } })
        .then(
          function () {
            log.info({ op: 'request.blockEmail', email: email })
            res.send({})
          }
        )
        .catch(
          function (err) {
            log.error({ op: 'request.blockEmail', email: email, err: err })
            res.send(500, err)
          }
        )
        .done(next, next)
    }
  )

  api.post(
    '/blockIp',
    function (req, res, next) {
      var ip = req.body.ip
      if (!ip) {
        var err = {code: 'MissingParameters', message: 'ip is required'}
        log.error({ op: 'request.blockIp', ip: ip, err: err })
        res.send(400, err)
        return next()
      }

      handleBan({ ban: { ip: ip } })
        .then(
          function () {
            log.info({ op: 'request.blockIp', ip: ip })
            res.send({})
          }
        )
        .catch(
          function (err) {
            log.error({ op: 'request.blockIp', ip: ip, err: err })
            res.send(500, err)
          }
        )
        .then(
          function () {
            reputationService.report(ip, 'fxa:request.blockIp')
          }
        )
        .done(next, next)
    }
  )

  api.get(
    '/',
    function (req, res, next) {
      res.send({ version: packageJson.version })
      next()
    }
  )

  api.get(
    '/limits',
    function (req, res, next) {
      res.send(limits)
      next()
    }
  )

  api.get(
    '/allowedIPs',
    function (req, res, next) {
      res.send(Object.keys(allowedIPs.ips))
      next()
    }
  )

  api.get(
    '/allowedEmailDomains',
    function (req, res, next) {
      res.send(Object.keys(allowedEmailDomains.domains))
      next()
    }
  )

  return P.all(startupDefers)
    .then(function () {
      return api
    })
}
