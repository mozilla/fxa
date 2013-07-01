/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const Hapi = require('hapi');
const fs = require('fs');
const CC = require('compute-cluster');
const config = require('../lib/config').root();
const prereqs = require('../lib/prereqs');

const hour = 1000 * 60 * 60;

var cc = new CC({ module: __dirname + '/sign.js' });

var account = require('../lib/account');

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
      description: "Creates an account associated with an email address," +
        " passing along SRP information and a wrapped key (used for class B data storage).",
      handler: create,
      validate: {
        payload: {
          email: Hapi.types.String().email().required(),
          verifier: Hapi.types.String().required(),
          salt: Hapi.types.String().required(),
          params: Hapi.types.Object(), // TODO: what are these?
          wrapKb: Hapi.types.String() // TODO: required?
        }
      }
    }
  },
  {
    method: 'POST',
    path: '/sign',
    config: {
      handler: sign,
      pre: [ prereqs.principle ],
      validate: {
        payload: {
          email: Hapi.types.String().without('token'), // for testing only
          publicKey: Hapi.types.String().required(),
          duration: Hapi.types.Number().integer().min(0).max(24 * hour).required(),
          token: Hapi.types.String().without('email')
        }
      }
    }
  },
  {
    method: 'POST',
    path: '/startLogin',
    config: {
      handler: startLogin,
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
          password: Hapi.types.String().without('A'),
          A: Hapi.types.String().without('password').with('M'),
          M: Hapi.types.String().with('A')
        }
      }
    }
  },
  {
    method: 'POST',
    path: '/signToken',
    config: {
      handler: getSignToken,
      validate: {
        payload: {
          accountToken: Hapi.types.String().required()
        },
        response: {
          schema: {
            signToken: Hapi.types.String().required()
          }
        }
      }
    }
  },
  {
    method: 'POST',
    path: '/resetToken',
    config: {
      handler: getResetToken,
      validate: {
        payload: {
          accountToken: Hapi.types.String().required()
        },
        response: {
          schema: {
            resetToken: Hapi.types.String().required()
          }
        }
      }
    }
  },
  {
    method: 'POST',
    path: '/resetPassword',
    config: {
      handler: resetPassword,
      validate: {
        payload: {
          resetToken: Hapi.types.String().required(),
          verifier: Hapi.types.String().required(),
          params: Hapi.types.Object(),
          wrapKb: Hapi.types.String()
        }
      }
    }
  },
];

function wellKnown(request) {
  request.reply({
    'public-key': fs.readFileSync(config.publicKeyFile),
    'authentication': '/sign_in.html',
    'provisioning': '/provision.html'
  });
}

function create(request) {
  account.create(
    request.payload,
    function (err, record) {
      if (err) {
        request.reply(err);
      }
      else if (record) {
        request.reply({ status: 'ok' });
      }
      else {
        //TODO do stuff
        request.reply('ok');
      }
    }
  );
}

function sign(request) {
  var principle = request.pre.principle;

  cc.enqueue(
    {
      email: principle,
      publicKey: request.payload.publicKey,
      duration: request.payload.duration
    },
    function (err, result) {
      if (err || result.err) {
        request.reply(Hapi.error.internal('Unable to sign certificate', err || result.err));
      }
      else {
        request.reply(result.cert);
      }
    }
  );
}

function startLogin(request) {

  account.startLogin(
    request.payload.email,
    function (err, result) {
      if (err) {
        request.reply(err);
      }
      else {
        request.reply(result);
      }
    }
  );

}

function finishLogin(request) {

  function respond(err, result) {
    if (err) {
      request.reply(err);
    }
    else {
      request.reply(result);
    }
  }

  if (request.payload.password) {
    account.finishLoginWithPassword(
      request.payload.sessionId,
      request.payload.password,
      respond
    );
  }
  else {
    account.finishLoginWithSRP(
      request.payload.sessionId,
      request.payload.A,
      request.payload.M,
      respond
    );
  }
}

function getSignToken(request) {

  account.getSignToken(
    request.payload.accountToken,
    function (err, result) {
      if (err) {
        request.reply(err);
      }
      else {
        request.reply(result);
      }
    }
  );
}

function getResetToken(request) {

  account.getResetToken(
    request.payload.accountToken,
    function (err, result) {
      if (err) {
        request.reply(err);
      }
      else {
        request.reply(result);
      }
    }
  );
}

function resetPassword(request) {
  account.resetPassword(
    request.payload.resetToken,
    request.payload,
    function (err) {
      if (err) {
        request.reply(err);
      }
      else {
        request.reply('ok');
      }
    }
  );
}

module.exports = {
  routes: routes
};
