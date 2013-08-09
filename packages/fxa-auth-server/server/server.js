/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

module.exports = function (path, Hapi, toobusy) {

  function create(log, config, routes, tokens) {

    var server = Hapi.createServer(
      config.bind_to.host,
      config.bind_to.port,
      {
        auth: {
          sessionToken: {
            scheme: 'hawk',
            getCredentialsFunc: tokens.SessionToken.getCredentials
          },
          keyFetchToken: {
            scheme: 'hawk',
            getCredentialsFunc: tokens.KeyFetchToken.getCredentials
          },
          accountResetToken: {
            scheme: 'hawk',
            getCredentialsFunc: tokens.AccountResetToken.getCredentials
          },
          authToken: {
            scheme: 'hawk',
            getCredentialsFunc: tokens.AuthToken.getCredentials
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

    server.ext(
      'onRequest',
      function (request, next) {
        var exit = false
        if (toobusy()) {
          exit = Hapi.error.serverTimeout('Server too busy')
        }
        log.debug({ path: request.path })
        next(exit)
      }
    )

    server.ext(
      'onPreHandler',
      function (r, next) {
        log.debug(
          {
            path: r.path,
            auth: r.auth.isAuthenticated,
            uid: r.auth.credentials ? r.auth.credentials.uid : null,
            payload: r.payload
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
          log.error(
            {
              code: response.response.code,
              error: response.response.payload.error,
              message: response.response.payload.message,
            }
          )
        }
        else {
          log.debug(
            {
              path: request.path,
              response: response.raw
            }
          )
        }

        next()
    })

    server.pack.require('lout', function(err){
      if (err) {
        console.log('Failed loading plugin: lout (doc generator)')
      }
    })

    return server
  }

  return {
    create: create
  }
}


