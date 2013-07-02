/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const Hapi = require('hapi');
const fs = require('fs');
const CC = require('compute-cluster');
const config = require('../lib/config').root();
const prereqs = require('../lib/prereqs');

const hour = 1000 * 60 * 60;
const T = Hapi.types;

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
      description:
        "Creates an account associated with an email address, " +
        "passing along SRP information (salt and verifier) " +
        "and a wrapped key (used for class B data storage).",
      tags: ["srp", "account"],
      handler: create,
      validate: {
        payload: {
          email: T.String().email().required(),
          verifier: T.String().required(),
          salt: T.String().required(),
          params: T.Object(), // TODO: what are these?
          wrapKb: T.String() // TODO: required?
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
      tags: ["account"],
      validate: {
        payload: {
          email: T.String().without('token'), // for testing only
          publicKey: T.String().required(),
          duration: T.Number().integer().min(0).max(24 * hour).required(),
          token: T.String().without('email')
        }
      }
    }
  },
  {
    method: 'POST',
    path: '/startLogin',
    config: {
      description:
        "Begins an SRP login for the supplied email address, " +
        "returning the temporary sessionId and parameters for " +
        "key stretching and the SRP protocol for the client.",
      tags: ["srp", "account"],
      handler: startLogin,
      validate: {
        payload: {
          email: T.String().email().required()
        },
        response: {
          schema: {
            sessionId: T.String(),
            stretch: T.Object({
              salt: T.String()
            }),
            srp: T.Object({
              N_bits: T.Number(), // number of bits for prime
              alg: T.String(),    // hash algorithm (sha256)
              s: T.String(),      // salt
              B: T.String()       // server's public key value
            })
          }
        }
      }
    }
  },
  {
    method: 'POST',
    path: '/finishLogin',
    config: {
      description:
        "Finishes the SRP dance, with the client providing " +
        "proof-of-knownledge of the password and receiving " +
        "the bundle encrypted with the shared key.",
      tags: ["srp", "account"],
      handler: finishLogin,
      validate: {
        payload: {
          sessionId: T.String().required(),
          password: T.String().without('A'),
          A: T.String().without('password').with('M'),
          M: T.String().with('A')
        },
        response: {
          schema: {
            bundle: T.String().without('kA').without('wrapKb'),
            accountToken: T.String(),
            kA: T.String().without('bundle'),
            wrapKb: T.String().without('bundle')
          }
        }
      }
    }
  },
  {
    method: 'POST',
    path: '/signToken',
    config: {
      tags: ["account"],
      handler: getSignToken,
      validate: {
        payload: {
          accountToken: T.String().required()
        },
        response: {
          schema: {
            signToken: T.String().required()
          }
        }
      }
    }
  },
  {
    method: 'POST',
    path: '/resetToken',
    config: {
      tags: ["account"],
      handler: getResetToken,
      validate: {
        payload: {
          accountToken: T.String().required()
        },
        response: {
          schema: {
            resetToken: T.String().required()
          }
        }
      }
    }
  },
  {
    method: 'POST',
    path: '/resetPassword',
    config: {
      tags: ["account"],
      handler: resetPassword,
      validate: {
        payload: {
          resetToken: T.String().required(),
          verifier: T.String().required(),
          params: T.Object(),
          wrapKb: T.String()
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
    function (err) {
      if (err) {
        request.reply(err);
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
