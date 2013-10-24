/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

module.exports = function (path, url, Hapi, toobusy, error) {

  function create(log, config, routes, tokens) {

    // Hawk needs to calculate request signatures based on public URL,
    // not the local URL to which it is bound.
    var publicURL = url.parse(config.public_url);
    var defaultPorts = {
      "http:": 80,
      "https:": 443,
    }
    var hawkOptions = {
      host: publicURL.hostname,
      port: publicURL.port ? publicURL.port : defaultPorts[publicURL.protocol]
    }

    var server = Hapi.createServer(
      config.bind_to.host,
      config.bind_to.port,
      {
        auth: {
          sessionToken: {
            scheme: 'hawk',
            hawk: hawkOptions,
            getCredentialsFunc: tokens.SessionToken.getCredentials
          },
          keyFetchToken: {
            scheme: 'hawk',
            hawk: hawkOptions,
            getCredentialsFunc: tokens.KeyFetchToken.getCredentials
          },
          accountResetToken: {
            scheme: 'hawk',
            hawk: hawkOptions,
            getCredentialsFunc: tokens.AccountResetToken.getCredentials
          },
          authToken: {
            scheme: 'hawk',
            hawk: hawkOptions,
            getCredentialsFunc: tokens.AuthToken.getCredentials
          },
          forgotPasswordToken: {
            scheme: 'hawk',
            hawk: hawkOptions,
            getCredentialsFunc: tokens.ForgotPasswordToken.getCredentials
          }
        },
        cors: true,
        files: {
          relativeTo: __dirname
        },
        views: {
          basePath: __dirname,
          path: 'templates',
          engines: {
            html: 'handlebars'
          }
        }
      }
    )

    server.route(routes)

    server.app.log = log

    //TODO throttle extension

    // twice the default max lag of 70ms
    toobusy.maxLag(140)

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
            response = error.wrap(response.response.payload);
          }
          if (config.env !== 'production') {
            response.response.payload.log = request.app.traced
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

    // server.pack.require('lout', function(err){
    //   if (err) {
    //     console.log('Failed loading plugin: lout (doc generator)')
    //   }
    // })

    return server
  }

  return {
    create: create
  }
}


