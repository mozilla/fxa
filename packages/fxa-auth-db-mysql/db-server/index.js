/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var restify = require('restify');
var bufferize = require('./lib/bufferize');
var version = require('../package.json').version;
var errors = require('./lib/error');
const safeJsonFormatter = require('./lib/safeJsonFormatter');

function createServer(db) {
  var implementation = db.constructor.name || '__anonymousconstructor__';

  function reply(fn) {
    return function(req, res, next) {
      fn(req.params, req.body, req.query)
        .then(
          handleSuccess.bind(null, req, res),
          handleError.bind(null, req, res)
        )
        .then(next, next);
    };
  }

  function withIdAndBody(fn) {
    return reply(function(params, body, query) {
      return fn.call(db, params.id, body);
    });
  }

  function withBodyAndQuery(fn) {
    return reply(function(params, body, query) {
      return fn.call(db, body, query);
    });
  }

  function withParams(fn) {
    return reply(function(params, body, query) {
      return fn.call(db, params);
    });
  }

  function withSpreadParams(fn) {
    return reply(function(params, body, query) {
      return fn.apply(db, Object.keys(params).map(k => params[k]));
    });
  }

  function withParamsAndBody(fn) {
    return reply(function(params, body, query) {
      return fn.call(db, params, body);
    });
  }

  function withSpreadParamsAndBody(fn) {
    return reply(function(params, body, query) {
      return fn.apply(
        db,
        Object.keys(params)
          .map(k => params[k])
          .concat([body])
      );
    });
  }

  const api = restify.createServer({
    formatters: {
      'application/json; q=0.9': safeJsonFormatter,
    },
    // Auth-server accepts 255 unicode email address and sends them over has hex encoded values.
    // These values could be as large as 1530 characters.
    maxParamLength: 1530,
  });

  // Allow Keep-Alive connections from the auth-server to be idle up to two
  // minutes before closing the connection. If this is not set, the default
  // idle-time is 5 seconds.  This can cause a lot of unneeded churn in server
  // connections. Setting this to 120s makes node8 behave more like node6. -
  // https://nodejs.org/docs/latest-v8.x/api/http.html#http_server_keepalivetimeout
  api.server.keepAliveTimeout = 120000;

  api.use(restify.plugins.bodyParser());
  api.use(restify.plugins.queryParser());
  api.use(
    bufferize.bufferizeRequest.bind(
      null,
      new Set([
        // These are all the different params that we handle as binary Buffers,
        // but are passed into the API as hex strings.
        'authKey',
        'authSalt',
        'data',
        'deviceId',
        'emailCode',
        'flowId',
        'id',
        'kA',
        'keyBundle',
        'passCode',
        'recoveryKeyId',
        'sessionTokenId',
        'refreshTokenId',
        'tokenId',
        'tokenVerificationId',
        'uid',
        'verifyHash',
        'wrapWrapKb',
      ])
    )
  );

  api.get('/account/:id', withIdAndBody(db.account));
  api.del('/account/:id', withIdAndBody(db.deleteAccount));
  api.put('/account/:id', withIdAndBody(db.createAccount));
  api.post('/account/:id/checkPassword', withIdAndBody(db.checkPassword));
  api.post('/account/:id/reset', withIdAndBody(db.resetAccount));
  api.post('/account/:id/resetTokens', withIdAndBody(db.resetAccountTokens));
  api.post(
    '/account/:id/verifyEmail/:emailCode',
    op(function(req) {
      return db.verifyEmail(req.params.id, req.params.emailCode);
    })
  );
  api.post('/account/:id/locale', withIdAndBody(db.updateLocale));
  api.get('/account/:id/sessions', withIdAndBody(db.sessions));

  api.get('/account/:id/emails', withIdAndBody(db.accountEmails));
  api.post('/account/:id/emails', withIdAndBody(db.createEmail));
  api.del(
    '/account/:id/emails/:email',
    op(function(req) {
      return db.deleteEmail(
        req.params.id,
        bufferize.hexToUtf8(req.params.email)
      );
    })
  );

  api.get(
    '/email/:email',
    op(function(req) {
      return db.getSecondaryEmail(bufferize.hexToUtf8(req.params.email));
    })
  );
  api.get(
    '/email/:email/account',
    op(function(req) {
      return db.accountRecord(bufferize.hexToUtf8(req.params.email));
    })
  );
  api.post(
    '/email/:email/account/:id',
    op(function(req) {
      return db.setPrimaryEmail(
        req.params.id,
        bufferize.hexToUtf8(req.params.email)
      );
    })
  );

  api.get('/sessionToken/:id', withIdAndBody(db.sessionToken));
  api.del('/sessionToken/:id', withIdAndBody(db.deleteSessionToken));
  api.put('/sessionToken/:id', withIdAndBody(db.createSessionToken));
  api.post('/sessionToken/:id/update', withIdAndBody(db.updateSessionToken));

  api.get('/keyFetchToken/:id', withIdAndBody(db.keyFetchToken));
  api.del('/keyFetchToken/:id', withIdAndBody(db.deleteKeyFetchToken));
  api.put('/keyFetchToken/:id', withIdAndBody(db.createKeyFetchToken));

  api.get(
    '/keyFetchToken/:id/verified',
    withIdAndBody(db.keyFetchTokenWithVerificationStatus)
  );
  api.post('/tokens/:id/verify', withIdAndBody(db.verifyTokens));
  api.post(
    '/tokens/:id/verifyWithMethod',
    withIdAndBody(db.verifyTokensWithMethod)
  );
  api.post('/tokens/:code/verifyCode', withParamsAndBody(db.verifyTokenCode));

  api.get('/accountResetToken/:id', withIdAndBody(db.accountResetToken));
  api.del('/accountResetToken/:id', withIdAndBody(db.deleteAccountResetToken));

  api.get('/passwordChangeToken/:id', withIdAndBody(db.passwordChangeToken));
  api.del(
    '/passwordChangeToken/:id',
    withIdAndBody(db.deletePasswordChangeToken)
  );
  api.put(
    '/passwordChangeToken/:id',
    withIdAndBody(db.createPasswordChangeToken)
  );

  api.get('/passwordForgotToken/:id', withIdAndBody(db.passwordForgotToken));
  api.del(
    '/passwordForgotToken/:id',
    withIdAndBody(db.deletePasswordForgotToken)
  );
  api.put(
    '/passwordForgotToken/:id',
    withIdAndBody(db.createPasswordForgotToken)
  );
  api.post(
    '/passwordForgotToken/:id/update',
    withIdAndBody(db.updatePasswordForgotToken)
  );
  api.post(
    '/passwordForgotToken/:id/verified',
    withIdAndBody(db.forgotPasswordVerified)
  );

  api.get('/verificationReminders', withBodyAndQuery(db.fetchReminders));
  api.post(
    '/verificationReminders',
    withBodyAndQuery(db.createVerificationReminder)
  );
  api.del('/verificationReminders', withBodyAndQuery(db.deleteReminder));

  api.get('/securityEvents/:id/ip/:ipAddr', withParams(db.securityEvents));
  api.post('/securityEvents', withBodyAndQuery(db.createSecurityEvent));
  api.get(
    '/securityEvents/:id',
    op(req => {
      return db.securityEventsByUid(req.params.id);
    })
  );
  api.del(
    '/securityEvents/:id',
    op(req => {
      return db.deleteSecurityEventsByUid(req.params.id);
    })
  );

  api.get('/emailBounces/:id', withIdAndBody(db.fetchEmailBounces));
  api.post('/emailBounces', withBodyAndQuery(db.createEmailBounce));

  api.get('/emailRecord/:id', withIdAndBody(db.emailRecord));
  api.head('/emailRecord/:id', withIdAndBody(db.accountExists));

  api.get('/totp/:id', withIdAndBody(db.totpToken));
  api.del('/totp/:id', withIdAndBody(db.deleteTotpToken));
  api.put('/totp/:id', withIdAndBody(db.createTotpToken));
  api.post('/totp/:id/update', withIdAndBody(db.updateTotpToken));

  api.get('/__heartbeat__', withIdAndBody(db.ping));

  api.get('/account/:id/devices', withIdAndBody(db.accountDevices));
  api.get('/account/:uid/device/:deviceId', withSpreadParams(db.device));
  api.put(
    '/account/:uid/device/:deviceId',
    withSpreadParamsAndBody(db.createDevice)
  );
  api.post(
    '/account/:uid/device/:deviceId/update',
    withSpreadParamsAndBody(db.updateDevice)
  );
  api.del('/account/:uid/device/:deviceId', withSpreadParams(db.deleteDevice));

  function op(fn) {
    return function(req, res, next) {
      fn.call(null, req)
        .then(
          handleSuccess.bind(null, req, res),
          handleError.bind(null, req, res)
        )
        .then(next, next);
    };
  }

  api.get(
    '/account/:uid/tokens/:tokenVerificationId/device',
    op(function(req) {
      return db.deviceFromTokenVerificationId(
        req.params.uid,
        req.params.tokenVerificationId
      );
    })
  );

  api.put(
    '/account/:uid/unblock/:code',
    op(function(req) {
      return db.createUnblockCode(req.params.uid, req.params.code);
    })
  );

  api.del(
    '/account/:uid/unblock/:code',
    op(function(req) {
      return db.consumeUnblockCode(req.params.uid, req.params.code);
    })
  );

  api.put(
    '/signinCodes/:code',
    op(req =>
      db.createSigninCode(
        req.params.code,
        req.body.uid,
        req.body.createdAt,
        req.body.flowId
      )
    )
  );

  api.post(
    '/signinCodes/:code/consume',
    op(req => db.consumeSigninCode(req.params.code))
  );

  api.post(
    '/account/:id/recoveryCodes',
    op(req => {
      return db.replaceRecoveryCodes(req.params.id, req.body.count);
    })
  );

  api.post(
    '/account/:id/recoveryCodes/:code',
    op(req => db.consumeRecoveryCode(req.params.id, req.params.code))
  );

  api.get(
    '/account/:id/recoveryKey/:recoveryKeyId',
    withParams(db.getRecoveryKey)
  );
  api.get('/account/:id/recoveryKey', withIdAndBody(db.recoveryKeyExists));
  api.del('/account/:id/recoveryKey', withParams(db.deleteRecoveryKey));
  api.post('/account/:id/recoveryKey', withIdAndBody(db.createRecoveryKey));

  api.get(
    '/account/:id/subscriptions/:subscriptionId',
    op(req =>
      db.getAccountSubscription(req.params.id, req.params.subscriptionId)
    )
  );
  api.put(
    '/account/:id/subscriptions/:subscriptionId',
    op(req =>
      db.createAccountSubscription(
        req.params.id,
        req.params.subscriptionId,
        req.body.productName,
        req.body.createdAt
      )
    )
  );
  api.del(
    '/account/:id/subscriptions/:subscriptionId',
    op(req =>
      db.deleteAccountSubscription(req.params.id, req.params.subscriptionId)
    )
  );
  api.post(
    '/account/:uid/subscriptions/:subscriptionId/cancel',
    op(req =>
      db.cancelAccountSubscription(
        req.params.uid,
        req.params.subscriptionId,
        req.body.cancelledAt
      )
    )
  );
  api.get(
    '/account/:id/subscriptions',
    withIdAndBody(db.fetchAccountSubscriptions)
  );

  api.get('/', function(req, res, next) {
    res.send({ version: version, implementation: implementation });
    next();
  });

  api.get('/__version__', function(req, res, next) {
    res.send({ version: version, implementation: implementation });
    next();
  });

  function handleSuccess(req, res, result) {
    api.emit('success', {
      code: 200,
      route: req.route.name,
      method: req.method,
      path: req.url,
      t: Date.now() - req.time(),
    });
    if (Array.isArray(result)) {
      res.send(result.map(bufferize.unbuffer));
    } else {
      // When performing a `HEAD` request, the content type is not
      // set, manually set to application/json
      if (req.method === 'HEAD') {
        res.setHeader('Content-Type', 'application/json');
      }

      res.send(bufferize.unbuffer(result || {}));
    }
  }

  function handleError(req, res, err) {
    if (typeof err !== 'object') {
      err = { message: err || 'none' };
    }

    var statusCode = err.code || 500;

    api.emit('failure', {
      code: statusCode,
      route: req.route ? req.route.name : 'unknown',
      method: req.method,
      path: req.url,
      err: err,
      t: Date.now() - req.time(),
    });

    res.send(statusCode, {
      message: err.message,
      errno: err.errno,
      error: err.error,
      code: err.code,
    });
  }

  var memInterval = setInterval(function() {
    api.emit('mem', process.memoryUsage());
  }, 15000);
  memInterval.unref();

  api.on('NotFound', function(req, res) {
    handleError(req, res, errors.notFound());
  });

  return api;
}

module.exports = {
  createServer: createServer,
  errors: errors,
};
