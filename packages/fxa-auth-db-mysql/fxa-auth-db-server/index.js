/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var restify = require('restify')
var bufferize = require('./lib/bufferize')
var version = require('./package.json').version
var errors = require('./lib/error')

function createServer(db) {

  var implementation = db.constructor.name || '__anonymousconstructor__'

  function reply(fn) {
    return function (req, res, next) {
      fn(req.params, req.body, req.query)
        .then(
          handleSuccess.bind(null, req, res),
          handleError.bind(null, req, res)
        )
        .done(next, next)
    }
  }

  function withIdAndBody(fn) {
    return reply(function (params, body, query) {
      return fn.call(db, params.id, body)
    })
  }

  function withBodyAndQuery(fn) {
    return reply(function (params, body, query) {
      return fn.call(db, body, query)
    })
  }

  function withParams(fn) {
    return reply(function (params, body, query) {
      return fn.call(db, params)
    })
  }

  var api = restify.createServer()
  api.use(restify.bodyParser())
  api.use(restify.queryParser())
  api.use(bufferize.bufferizeRequest.bind(null, [
    'uaBrowser',
    'uaBrowserVersion',
    'uaOS',
    'uaOSVersion',
    'uaDeviceType'
  ]))

  api.get('/account/:id', withIdAndBody(db.account))
  api.del('/account/:id', withIdAndBody(db.deleteAccount))
  api.put('/account/:id', withIdAndBody(db.createAccount))
  api.get('/account/:id/devices', withIdAndBody(db.accountDevices))
  api.post('/account/:id/checkPassword', withIdAndBody(db.checkPassword))
  api.post('/account/:id/reset', withIdAndBody(db.resetAccount))
  api.post('/account/:id/verifyEmail', withIdAndBody(db.verifyEmail))
  api.post('/account/:id/locale', withIdAndBody(db.updateLocale))
  api.get('/account/:id/sessions', withIdAndBody(db.sessions))

  api.get('/sessionToken/:id', withIdAndBody(db.sessionToken))
  api.del('/sessionToken/:id', withIdAndBody(db.deleteSessionToken))
  api.put('/sessionToken/:id', withIdAndBody(db.createSessionToken))
  api.post('/sessionToken/:id/update', withIdAndBody(db.updateSessionToken))
  api.get('/sessionToken/:id/device', withIdAndBody(db.sessionWithDevice))

  api.get('/keyFetchToken/:id', withIdAndBody(db.keyFetchToken))
  api.del('/keyFetchToken/:id', withIdAndBody(db.deleteKeyFetchToken))
  api.put('/keyFetchToken/:id', withIdAndBody(db.createKeyFetchToken))

  api.get('/sessionToken/:id/verified', withIdAndBody(db.sessionTokenWithVerificationStatus))
  api.get('/keyFetchToken/:id/verified', withIdAndBody(db.keyFetchTokenWithVerificationStatus))
  api.post('/tokens/:id/verify', withIdAndBody(db.verifyTokens))

  api.get('/accountResetToken/:id', withIdAndBody(db.accountResetToken))
  api.del('/accountResetToken/:id', withIdAndBody(db.deleteAccountResetToken))

  api.get('/passwordChangeToken/:id', withIdAndBody(db.passwordChangeToken))
  api.del('/passwordChangeToken/:id', withIdAndBody(db.deletePasswordChangeToken))
  api.put('/passwordChangeToken/:id', withIdAndBody(db.createPasswordChangeToken))

  api.get('/passwordForgotToken/:id', withIdAndBody(db.passwordForgotToken))
  api.del('/passwordForgotToken/:id', withIdAndBody(db.deletePasswordForgotToken))
  api.put('/passwordForgotToken/:id', withIdAndBody(db.createPasswordForgotToken))
  api.post('/passwordForgotToken/:id/update', withIdAndBody(db.updatePasswordForgotToken))
  api.post('/passwordForgotToken/:id/verified', withIdAndBody(db.forgotPasswordVerified))

  api.get('/verificationReminders', withBodyAndQuery(db.fetchReminders))
  api.post('/verificationReminders', withBodyAndQuery(db.createVerificationReminder))
  api.del('/verificationReminders', withBodyAndQuery(db.deleteReminder))

  api.get('/securityEvents/:id/ip/:ipAddr', withParams(db.securityEvents))
  api.post('/securityEvents', withBodyAndQuery(db.createSecurityEvent))

  api.get('/emailRecord/:id', withIdAndBody(db.emailRecord))
  api.head('/emailRecord/:id', withIdAndBody(db.accountExists))

  api.get('/__heartbeat__', withIdAndBody(db.ping))

  api.put(
    '/account/:uid/device/:deviceId',
    function (req, res, next) {
      db.createDevice(req.params.uid, req.params.deviceId, req.body)
        .then(
          handleSuccess.bind(null, req, res),
          handleError.bind(null, req, res)
        )
        .done(next, next)
    }
  )
  api.post(
    '/account/:uid/device/:deviceId/update',
    function (req, res, next) {
      db.updateDevice(req.params.uid, req.params.deviceId, req.body)
        .then(
          handleSuccess.bind(null, req, res),
          handleError.bind(null, req, res)
        )
        .done(next, next)
    }
  )
  api.del(
    '/account/:uid/device/:deviceId',
    function (req, res, next) {
      db.deleteDevice(req.params.uid, req.params.deviceId)
        .then(
          handleSuccess.bind(null, req, res),
          handleError.bind(null, req, res)
        )
        .done(next, next)
    }
  )

  api.get(
    '/',
    function (req, res, next) {
      res.send({ version: version, implementation: implementation })
      next()
    }
  )

  api.get(
    '/__version__',
    function (req, res, next) {
      res.send({ version: version, implementation: implementation })
      next()
    }
  )

  function handleSuccess(req, res, result) {
    api.emit(
      'success',
      {
        code: 200,
        route: req.route.name,
        method: req.method,
        path: req.url,
        t: Date.now() - req.time()
      }
    )
    if (Array.isArray(result)) {
      res.send(result.map(bufferize.unbuffer))
    }
    else {
      res.send(bufferize.unbuffer(result || {}))
    }
  }

  function handleError (req, res, err) {
    if (typeof err !== 'object') {
      err = { message: err || 'none' }
    }

    var statusCode = err.code || 500

    api.emit(
      'failure',
      {
        code: statusCode,
        route: req.route ? req.route.name : 'unknown',
        method: req.method,
        path: req.url,
        err: err,
        t: Date.now() - req.time(),
      }
    )

    res.send(statusCode, {
      message: err.message,
      errno: err.errno,
      error: err.error,
      code: err.code
    })
  }

  var memInterval = setInterval(function() {
    api.emit('mem', process.memoryUsage())
  }, 15000)
  memInterval.unref()

  api.on('NotFound', function (req, res) {
    handleError(req, res, errors.notFound())
  })

  return api
}

module.exports = {
  createServer: createServer,
  errors: errors
}
