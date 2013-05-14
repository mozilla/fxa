const Hapi = require('hapi');
const CC = require('compute-cluster')
const config = require('../lib/config')

const hour = 1000 * 60 * 60

var cc = new CC({ module: __dirname + '/sign.js' })
var db = {} // TODO

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
    path: '/login',
    config: {
      handler: login,
      validate: {
        payload: {
          email: Hapi.types.String().email().required(),
          password: Hapi.types.String().required() // for testing only
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

function login(request) {
  db.get(
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
        request.reply({ token: token })
      }
    }
  )
}

module.exports = {
  routes: routes
}
