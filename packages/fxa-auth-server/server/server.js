/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

module.exports = function (path, url, Hapi, toobusy) {

  const HEX_STRING = /^(?:[a-fA-F0-9]{2})+$/

  function create(log, error, config, routes, db, noncedb, i18n) {

    // Hawk needs to calculate request signatures based on public URL,
    // not the local URL to which it is bound.
    var publicURL = url.parse(config.publicUrl);
    var defaultPorts = {
      "http:": 80,
      "https:": 443,
    }
    var hawkOptions = {
      host: publicURL.hostname,
      port: publicURL.port ? publicURL.port : defaultPorts[publicURL.protocol],
      timestampSkewSec: 60,
      nonceFunc: function nonceCheck(nonce, ts, cb) {
        var maxValidTime = (+ts) + hawkOptions.timestampSkewSec
        var ttl = Math.ceil(maxValidTime - (Date.now() / 1000))
        if (ttl <= 0) {
          return cb()
        }
        noncedb.checkAndSetNonce(nonce, ttl)
               .done(
                 function() {
                   cb();
                 },
                 function(err) {
                   cb(err);
                 }
               )
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
            cb.bind(null, null),
            cb
          )
      }
    }

    var server = Hapi.createServer(
      config.listen.host,
      config.listen.port,
      {
        auth: {
          sessionToken: {
            scheme: 'hawk',
            hawk: hawkOptions,
            getCredentialsFunc: makeCredentialFn(db.sessionToken.bind(db))
          },
          keyFetchToken: {
            scheme: 'hawk',
            hawk: hawkOptions,
            getCredentialsFunc: makeCredentialFn(db.keyFetchToken.bind(db))
          },
          accountResetToken: {
            scheme: 'hawk',
            hawk: hawkOptions,
            getCredentialsFunc: makeCredentialFn(db.accountResetToken.bind(db))
          },
          authToken: {
            scheme: 'hawk',
            hawk: hawkOptions,
            getCredentialsFunc: makeCredentialFn(db.authToken.bind(db))
          },
          forgotPasswordToken: {
            scheme: 'hawk',
            hawk: hawkOptions,
            getCredentialsFunc: makeCredentialFn(db.forgotPasswordToken.bind(db))
          }
        },
        cors: {
          additionalExposedHeaders: ['Timestamp']
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
        log.info({ op: 'server.onRequest', rid: request.id, path: request.path })
        next(exit)
      }
    )

    // Log some helpful details for debugging authentication problems.
    server.ext(
      'onPreAuth',
      function (request, next) {
        if (request.headers.authorization) {
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

    // Select user's preferred language via the accept-language header.
    server.ext(
      'onPreHandler',
      function (request, next) {
        var acceptLanguage = request.headers['accept-language']
        if (acceptLanguage) {
          var accepted = i18n.parseAcceptLanguage(acceptLanguage)
          request.app.preferredLang = i18n.bestLanguage(accepted)
        }
        next()
      }
    )

    // Log a trace to mark that we're entering the handler.
    server.ext(
      'onPreHandler',
      function (request, next) {
        log.trace(
          {
            op: 'server.onPreHandler',
            rid: request.id,
            path: request.path,
            auth: request.auth.isAuthenticated,
            uid: request.auth.credentials ? request.auth.credentials.uid : null,
            payload: request.payload
          }
        )
        next()
      }
    )

    // Ensure that we have a Strict-Transport-Security header.
    server.ext(
      'onPreResponse',
      function (request, next) {
        var res = request.response()
        // error responses don't have `header`
        if (res.header) {
          res.header('Strict-Transport-Security', 'max-age=10886400')
        }
        next()
      }
    )

    // Ensure that errors are reported in our custom error format.
    server.ext(
      'onPreResponse',
      function (request, next) {
        var res = request.response()
        // error responses don't have `header`
        if (res.header) {
          res.header('Timestamp', ''+Math.floor(Date.now() / 1000))
        }
        next()
      }
    )

    server.ext(
      'onPreResponse',
      function (request, next) {
        var response = request.response()
        if (response.isBoom) {
          if (!response.response.payload.errno) {
            var details = response.response.payload
            // Hapi will automatically boomifies application-level errors.
            // Grab the original error back out so we can wrap it.
            if (response.response.code === 500 && response.data) {
              details = response.data
            }
            response = error.wrap(details)
          }
          if (config.env !== 'prod') {
            response.response.payload.log = request.app.traced
          }
          if (response.response.payload.domainThrown) {
            // node adds the domain which may have cycles and then hapi JSON.stringifies, derp!
            response.response.payload.domain = undefined
            response.response.payload.domainEmitter = undefined
            response.response.payload.domainBound = undefined
          }
          log.error(
            {
              op: 'server.onPreResponse',
              rid: request.id,
              path: request.path,
              err: response.response.payload
            }
          )
        }
        else {
          log.trace(
            {
              op: 'server.onPreResponse',
              rid: request.id,
              path: request.path,
              response: response.raw
            }
          )
        }
        next(response)
    })

    // Log a trace at the end of the response.
    server.on(
      'response',
      function (request) {
        log.info(
          {
            op: 'server.response',
            rid: request.id,
            path: request.path,
            t: Date.now() - request.info.received
          }
        )
      }
    )

    return server
  }

  return {
    create: create
  }
}


