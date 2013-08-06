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
    server.on(
      'log',
      function (event) {
        log.trace({ hapiEvent: event })
      }
    )

    server.on(
      'request',
      function (request, event) {
        log.trace({ hapiEvent: event })
      }
    )

    //TODO throttle extension

    server.ext(
      'onRequest',
      function (request, next) {
        var exit = false
        if (toobusy()) {
          exit = Hapi.error.serverTimeout('Server too busy')
        }
        next(exit)
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
          log.error({
            code: response.response.code,
            error: response.response.payload.error,
            msg: response.message,
          })
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


