/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

module.exports = function (path, url, Hapi, toobusy, error) {

  const HEX_STRING = /^(?:[a-fA-F0-9]{2})+$/

  function create(log, config, routes, db, noncedb) {

    // Hawk needs to calculate request signatures based on public URL,
    // not the local URL to which it is bound.
    var publicURL = url.parse(config.public_url);
    var defaultPorts = {
      "http:": 80,
      "https:": 443,
    }
    var hawkOptions = {
      host: publicURL.hostname,
      port: publicURL.port ? publicURL.port : defaultPorts[publicURL.protocol],
      timestampSkewSec: 60,
      nonceFunc: function nonceCheck(nonce, ts, cb) {
        var maxValidTime = ts + hawkOptions.timestampSkewSec
        var ttl = Math.ceil(maxValidTime - (Date.now() / 1000))
        if (ttl <= 0) {
          return cb('stale timestamp')
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
      config.bind_to.host,
      config.bind_to.port,
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
        cors: true,
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
    if (config.toobusy.max_lag > 0) {
      toobusy.maxLag(config.toobusy.max_lag)
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
          if (config.env !== 'production') {
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


