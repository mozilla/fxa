/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var HEX_STRING = require('../routes/validators').HEX_STRING

module.exports = function (path, url, Hapi, toobusy) {

  function create(log, error, config, routes, db) {

    // Hawk needs to calculate request signatures based on public URL,
    // not the local URL to which it is bound.
    var publicURL = url.parse(config.publicUrl)
    var defaultPorts = {
      "http:": 80,
      "https:": 443
    }
    var hawkOptions = {
      host: publicURL.hostname,
      port: publicURL.port ? publicURL.port : defaultPorts[publicURL.protocol],

      // We're seeing massive clock skew in deployed clients, and it's
      // making auth harder than it needs to be.  This effectively disables
      // the timestamp checks by setting it to a humongous value.
      timestampSkewSec: 20 * 365 * 24 * 60 * 60,  // 20 years, +/- a few days

      nonceFunc: function nonceCheck(nonce, ts, cb) {
        // Since we've disabled timestamp checks, there's not much point
        // keeping a nonce cache.  Instead we use this as an opportunity
        // to report on the clock skew values seen in the wild.
        var skew = (Date.now() / 1000) - (+ts)
        log.info({ op: 'server.nonceFunc', skew: skew })
        return cb()
      }
    }

    function makeCredentialFn(dbGetFn) {
      return function (id, cb) {
        log.trace({ op: 'DB.getToken', id: id })
        if (!HEX_STRING.test(id)) {
          return process.nextTick(cb.bind(null, null, null)) // not found
        }
        dbGetFn(Buffer(id, 'hex'))
          .done(
            function (token) {
              if (token.expired(Date.now())) {
                // TODO: delete token
                return cb(error.invalidToken())
              }
              return cb(null, token)
            },
            cb
          )
      }
    }

    var server = Hapi.createServer(
      config.listen.host,
      config.listen.port,
      {
        cors: {
          additionalExposedHeaders: ['Timestamp', 'Accept-Language']
        },
        files: {
          relativeTo: path.dirname(__dirname)
        },
        state: {
          cookies: {
            parse: false
          }
        }
      }
    )

    server.pack.require('hapi-auth-hawk', function (err) {
      server.auth.strategy(
        'sessionToken',
        'hawk',
        {
          getCredentialsFunc: makeCredentialFn(db.sessionToken.bind(db)),
          hawk: hawkOptions
        }
      )
      server.auth.strategy(
        'keyFetchToken',
        'hawk',
        {
          getCredentialsFunc: makeCredentialFn(db.keyFetchToken.bind(db)),
          hawk: hawkOptions
        }
      )
      server.auth.strategy(
        'accountResetToken',
        'hawk',
        {
          getCredentialsFunc: makeCredentialFn(db.accountResetToken.bind(db)),
          hawk: hawkOptions
        }
      )
      server.auth.strategy(
        'passwordForgotToken',
        'hawk',
        {
          getCredentialsFunc: makeCredentialFn(db.passwordForgotToken.bind(db)),
          hawk: hawkOptions
        }
      )
      server.auth.strategy(
        'passwordChangeToken',
        'hawk',
        {
          getCredentialsFunc: makeCredentialFn(db.passwordChangeToken.bind(db)),
          hawk: hawkOptions
        }
      )
    })

    server.route(routes)

    server.app.log = log

    //TODO throttle extension

    // Enable toobusy, unless it has been preffed off in the config.
    if (config.toobusy.maxLag > 0) {
      toobusy.maxLag(config.toobusy.maxLag)
    } else {
      toobusy = function() { return false; }
    }

    server.ext(
      'onRequest',
      function (request, next) {
        var exit = false
        if (toobusy()) {
          exit = error.serviceUnavailable()
        }
        log.begin('server.onRequest', request)
        next(exit)
      }
    )

    server.ext(
      'onPreAuth',
      function (request, next) {
        // Construct source-ip-address chain for logging.
        var xff = (request.headers['x-forwarded-for'] || '').split(/\s*,\s*/)
        xff.push(request.info.remoteAddress)
        // Remove empty items from the list, in case of badly-formed header.
        request.app.remoteAddressChain = xff.filter(function(x){ return x })
        request.app.clientAddress = request.app.remoteAddressChain[0]

        request.app.acceptLanguage = request.headers['accept-language']

        if (request.headers.authorization) {
          // Log some helpful details for debugging authentication problems.
          log.trace(
            {
              op: 'server.onPreAuth',
              rid: request.id,
              path: request.path,
              auth: request.headers.authorization,
              type: request.headers['content-type'] || ''
            }
          )
        }
        next()
      }
    )

    server.ext(
      'onPreResponse',
      function (request, next) {
        var response = request.response
        if (response.isBoom) {
          response = error.translate(response)
          if (config.env !== 'prod') {
            response.backtrace(request.app.traced)
          }
        }
        response.header('Strict-Transport-Security', 'max-age=10886400')
        response.header('Timestamp', '' + Math.floor(Date.now() / 1000))
        log.summary(request, response)
        next(response)
      }
    )

    return server
  }

  return {
    create: create
  }
}


