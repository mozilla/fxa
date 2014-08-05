/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
var fs = require('fs');

var HEX_STRING = require('../routes/validators').HEX_STRING

module.exports = function (path, url, Hapi) {

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
                return cb(error.invalidToken())
              }
              return cb(null, token)
            },
            cb
          )
      }
    }

    var serverOptions = {
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
      },
      load: {
        maxEventLoopDelay: config.toobusy.maxLag,
        sampleInterval: 1000
      },
      security: {
        hsts: {
          maxAge: 15552000,
          includeSubdomains: true
        }
      },
      payload: {
        maxBytes: 16384
      }
    }

    if(config.useHttps) {
      serverOptions.tls = {
        key: fs.readFileSync(config.keyPath),
        cert: fs.readFileSync(config.certPath)
      }
    }

    var server = Hapi.createServer(
      config.listen.host,
      config.listen.port,
      serverOptions
    )

    server.pack.register(require('hapi-auth-hawk'), function (err) {
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

    server.ext(
      'onRequest',
      function (request, next) {
        log.begin('server.onRequest', request)
        next()
      }
    )

    function trimLocale(header) {
      if (!header || header.length < 256) {
        return header
      }
      var parts = header.split(',')
      var str = parts[0]
      if (str.length >= 255) { return null }
      for (var i = 1; i < parts.length && str.length + parts[i].length < 255; i++) {
        str += ',' + parts[i]
      }
      return str
    }

    server.ext(
      'onPreAuth',
      function (request, next) {
        // Construct source-ip-address chain for logging.
        var xff = (request.headers['x-forwarded-for'] || '').split(/\s*,\s*/)
        xff.push(request.info.remoteAddress)
        // Remove empty items from the list, in case of badly-formed header.
        request.app.remoteAddressChain = xff.filter(function(x){ return x })
        request.app.clientAddress = request.app.remoteAddressChain[0]
        request.app.acceptLanguage = trimLocale(request.headers['accept-language'])

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
