/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const Hapi = require('hapi');
const CC = require('compute-cluster')
const config = require('../lib/config')

const hour = 1000 * 60 * 60

var cc = new CC({ module: __dirname + '/sign.js' })
var kv = require('../lib/kvstore').connect()

var routes = [
  {
    method: 'GET',
    path: '/.well-known/browserid',
    config: {
      handler: wellKnown
    }
  },
  {
    method: 'GET',
    path: '/sign_in.html',
    config: {
      handler: {
        file: './sign_in.html'
      }
    }
  },
  {
    method: 'GET',
    path: '/provision.html',
    config: {
      handler: {
        file: './provision.html'
      }
    }
  },
  {
    method: 'POST',
    path: '/create',
    config: {
      handler: create,
      validate: {
        payload: {
          email: Hapi.types.String().email().required(),
          verifier: Hapi.types.String().required(),
          params: Hapi.types.String(),
          kB: Hapi.types.String()
        }
      }
    }
  },
  {
    method: 'POST',
    path: '/sign',
    config: {
      handler: sign,
      validate: {
        payload: {
          email: Hapi.types.String().required(), // for testing only
          publicKey: Hapi.types.String().required(),
          duration: Hapi.types.Number().integer().min(0).max(24 * hour).required(),
          token: Hapi.types.String()
        }
      }
    }
  },
  {
    method: 'POST',
    path: '/beginLogin',
    config: {
      handler: beginLogin,
      validate: {
        payload: {
          email: Hapi.types.String().email().required()
        }
      }
    }
  },
  {
    method: 'POST',
    path: '/finishLogin',
    config: {
      handler: finishLogin,
      validate: {
        payload: {
          sessionId: Hapi.types.String().required(),
          password: Hapi.types.String().required()
        }
      }
    }
  }
];

function wellKnown(request) {
  request.reply({
    'public-key': config.idpPublicKey,
    'authentication': '/sign_in.html',
    'provisioning': '/provision.html'
  })
}

function create(request) {
  kv.get(
    request.payload.email,
    function (err, record) {
      if (err) {
        request.reply(Hapi.error.internal('Database errror', err))
      }
      else if (record) {
        request.reply('ok')
      }
      else {
        //TODO do stuff
        request.reply('ok')
      }
    }
  )
}

function sign(request) {
  // TODO validate token, get email from token
  cc.enqueue(
    request.payload,
    function (err, result) {
      if (err || result.err) {
        request.reply(Hapi.error.internal('Unable to sign certificate', err || result.err))
      }
      else {
        request.reply(result.cert)
      }
    }
  )
}

function beginLogin(request) {
  kv.get(
    request.payload.email,
    function (err, record) {
      if (err) {
        request.reply(Hapi.error.internal('Unable to get email', err))
      }
      else if (!record) {
        request.reply(Hapi.error.notFound('Unknown email'))
      }
      else {
        var token = 'TODO'
        request.reply({ sessionId: token })
      }
    }
  )
}

function finishLogin(request) {
  // TODO lookup sessionId, verify email/password
  var accountToken = 'TODO'
  var kA = 'TODO'
  var kB = 'TODO'
  request.reply({
    accountToken: accountToken,
    kA: kA,
    kB: kB
  })
}

module.exports = {
  routes: routes
}
