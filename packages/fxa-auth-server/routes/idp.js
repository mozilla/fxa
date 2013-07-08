/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const Hapi = require('hapi');
const fs = require('fs');
const CC = require('compute-cluster');
const config = require('../lib/config').root();
const crypto = require('crypto');

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
    method: 'GET',
    path: '/entropy',
    config: {
      handler: getEntropy
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
      auth: {
        strategy: 'hawk',
        payload: 'required'
      },
      tags: ["account"],
      validate: {
        payload: {
          publicKey: Hapi.types.String().required(),
          duration: Hapi.types.Number().integer().min(0).max(24 * hour).required()
        }
      }
    }
  },
  {
    method: 'POST',
    path: '/startLogin',
    handler: startLogin,
    config: getToken1Config
  },
  {
    method: 'POST',
    path: '/startResetToken',
    handler: startResetToken,
    config: getToken1Config
  },
  {
    method: 'POST',
    path: '/finishLogin',
    handler: finishLogin,
    config: getToken2Config
  },
  {
    method: 'POST',
    path: '/finishResetToken',
    handler: finishResetToken,
    config: getToken2Config
  },
  {
    method: 'POST',
    path: '/resetAccount',
    config: {
      handler: resetAccount,
      auth: {
        strategy: 'hawk',
        payload: 'required'
      },
      tags: ["account"],
      validate: {
        payload: {
          bundle: Hapi.types.String().required()
        }
      }
    }
  },
];

var getToken1Config = {
  description:
    "Begins an SRP login for the supplied email address, " +
    "returning the temporary sessionId and parameters for " +
    "key stretching and the SRP protocol for the client.",
  tags: ["srp", "account"],
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
};

var getToken2Config = {
  description:
    "Finishes the SRP dance, with the client providing " +
    "proof-of-knownledge of the password and receiving " +
    "the bundle encrypted with the shared key.",
  tags: ["srp", "account"],
  validate: {
    payload: {
      sessionId: T.String().required(),
      A: T.String().required(),
      M: T.String().required()
    },
    response: {
      schema: {
        bundle: T.String().required()
      }
    }
  }
};

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
  account.getUser(
    request.auth.credentials.uid,
    function (err, user) {
      if (err) { return request.reply(Hapi.error.internal('Unable to sign certificate', err)); }
      cc.enqueue(
        {
          email: user.email,
          publicKey: request.payload.publicKey,
          duration: request.payload.duration
        },
        function (err, result) {
          if (err || result.err) {
            request.reply(Hapi.error.internal('Unable to sign certificate', err || result.err));
          }
          else {
            request.reply(result);
          }
        }
      );
    }
  );
}


function getToken1(request) {

  account.getToken1(
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

function startLogin(request) { return getToken1(request); }
function startResetToken(request) { return getToken1(request); }


function getToken2(type, request) {
  account.getToken2(
    request.payload.sessionId,
    type,
    request.payload.A,
    request.payload.M,
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

function finishLogin(request) { return getToken2('sign', request); }
function finishResetToken(request) { return getToken2('reset', request); }


function resetAccount(request) {
  console.log('??', request.auth);
  console.log('??', request.payload);
  account.resetAccount(
    request.auth.credentials.token,
    request.payload.bundle,
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

function getEntropy(request) {
  crypto.randomBytes(32, function(err, buf) {
    request.reply(buf.toString('hex'));
  });
}

module.exports = {
  routes: routes
};
