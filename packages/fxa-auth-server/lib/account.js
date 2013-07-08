const uuid = require('uuid');
const async = require('async');
const bigint = require('bigint');
const Hapi = require('hapi');
const config = require('./config');
const kv = require('./kv');
const util = require('./util');
const srp = require('./srp');
const srpParams = require('./srp_group_params');

const N_bits = config.get('srp.N_bits');
const alg = config.get('srp.alg_name');

var internalError = Hapi.Error.internal;
var badRequest = Hapi.Error.badRequest;
var notFound = Hapi.Error.notFound;

var emptyKey = Buffer(32);
emptyKey.fill(0);


/* user account model
 *
 * <email>/uid = <userId>
 *
 * <userId>/user = {
 *  email: <user email>
 *  params: <user params>
 *  verifier: <password verifier>
 *  kA: <kA key>
 *  wrapKb: <wrapped wrapKb key>
 *  resetTokens: {}
 *  signTokens: {}
 * }
 *
 * <sessionId>/session = {
 *  uid: <userId>
 * }
 *
 * <resetToken>/resetToken = {
 *  uid: <userId>
 * }
 *
 * <signToken>/signer = {
 *  uid: <userId>
 * }
 *
 * <tokenId>/hawk = {
 *  key: <reqHMACkey>
 *  algorithm: <'sha1' | 'sha256'>
 *  uid: <userId>,
 *  signToken: <signToken>
 * }
 *
 * */

exports.create = function(data, cb) {
  // generate user id
  var userId = util.getUserId();
  var userKey = userId + '/user';

  async.waterfall([
    // ensure that an account doesn't already exist for the email
    function(next) {
      kv.store.get(data.email + '/uid', function (err, doc) {
        if (doc) return next(badRequest('AccountExistsForEmail'));
        next(null);
      });
    },
    // link email to userid
    function(next) {
      kv.store.set(data.email + '/uid', userId, next);
    },
    // get new class A key
    util.getKA,
    // create user account
    function(key, next) {
      kv.store.set(userKey, {
        email: data.email,
        params: data.params,
        verifier: data.verifier,
        salt: data.salt,
        kA: key.toString('base64'),
        wrapKb: data.wrapKb,
        resetTokens: {},
        signTokens: {}
      }, next);
    }
  ], cb);
};

function generateSrpParams(doc, cb) {
  srp.genKey(
    function (err, b) {
      var user = doc.value;
      var p = {
        sid: util.getSessionId(),
        uid: doc.id,
        N: srpParams[N_bits].N,
        g: srpParams[N_bits].g,
        s: user.salt,
        v: bigint(user.verifier, 16),
        b: b,
        B: null
      };
      p.B = srp.getB(p.v, p.g, b, p.N, alg);
      cb(null, p);
    }
  );
}

function createSession(p, cb) {
  var B = p.B.toString(16);
  kv.cache.set(
    p.sid + '/session',
    {
      uid: p.uid,
      srp: {
        s: p.s,
        v: p.v.toString(16),
        b: p.b.toString(16),
        B: B
      }
    },
    function (err) {
      cb(err, {
        sessionId: p.sid,
        stretch: {
          salt: 'TODO'
        },
        srp: {
          N_bits: N_bits,
          alg: alg,
          s: p.s,
          B: B
        }
      });
    }
  );
}

// Initialize the SRP process
exports.getToken1 = function(email, cb) {
  async.waterfall([
    getId.bind(null, email),
    getUserDoc,
    generateSrpParams,
    createSession
  ], cb);
};

function getSession(key, cb) {
  kv.cache.get(key,
    function(err, session) {
      if (err) return cb(err);
      if (!session) return cb(badRequest('UnknownSession'));
      cb(null, session.value);
    }
  );
}

// Finish the SRP process and return account info
exports.getToken2 = function (sessionId, tokenType, A, M1, cb) {

  if (tokenType !== 'sign' && tokenType !== 'reset') {
    return cb(internalError('UnknownTokenType'));
  }

  var sessKey = sessionId + '/session';
  var uid, user, token;
  var K = null;
  A = bigint(A, 16);

  async.waterfall([
    // get session doc
    getSession.bind(null, sessKey),
    // check match key
    function (session, next) {
      uid = session.uid;
      var p = session.srp;
      var S = srp.server_getS(
        Buffer(p.s, 'hex'),
        bigint(p.v, 16),
        srpParams[N_bits].N,
        srpParams[N_bits].g,
        A,
        bigint(p.b, 16),
        alg
      );
      var M2 = srp.getM(A, bigint(p.B, 16), S);
      if (M1 === M2.toString(16)) {
        K = srp.getK(S, alg);
        getUser(uid, next);
      }
      else {
        // TODO: increment a bad guess counter
        next(badRequest('IncorrectPassword'));
      }
    },
    // store user
    function (result, next) {
      user = result;
      next(null);
    },
    // create token
    function(next) {
      if (tokenType === 'sign') {
        getSignToken(uid, next);
      }
      else {
        getResetToken(uid, 0, next);
      }
    },
    function(result, next) {
      token = result.token;
      kv.cache.set(
        result.keys.tokenId.toString('base64') + '/hawk',
        {
          key: result.keys.reqHMACkey.toString('base64'),
          algorithm: 'sha256',
          uid: uid,
          token: result.token.toString('hex')
        },
        next
      );
    },
    // delete session doc
    function(next) {
      kv.cache.delete(sessKey, next);
    },
    function(next) {
      var type = tokenType === 'sign' ?
                  'getSignToken' :
                  'getResetToken';
      util.srpResponseKeys(K.toBuffer(), type, next);
    },
    function(keys, next) {
      next(
        null,
        {
          bundle: util.srpSignTokenBundle(
            {
              kA: Buffer(user.kA, 'base64'),
              wrapKb: user.wrapKb ? Buffer(user.wrapKb, 'base64') : emptyKey,
              token: token,
              hmacKey: keys.respHMACkey,
              encKey: keys.respXORkey
            }
          ).toString('base64')
        }
      );
    }
    ], cb);
};

function getSignToken(uid, cb) {
  var token;
  async.waterfall([
    // create signToken
    util.getSignToken,
    function(tok, next) {
      token = tok;
      addSignToken(uid, tok, next);
    },
    function(next) {
      util.signCertKeys(token, next);
    }
  ], function(err, result) {
    return cb(err, { token: token, keys: result });
  });
}

function getResetToken(uid, len, cb) {
  var token;
  async.waterfall([
    // create resetToken
    util.getResetToken,
    function(tok, next) {
      token = tok;
      addResetToken(uid, token, next);
    },
    function(next) {
      util.resetKeys(token, len, next);
    }
  ], function(err, result) {
    return cb(err, { token: token, keys: result });
  });
}

// Takes an accountToken and creates a new resetToken
exports.getResetToken = function(accountToken, cb) {
  var accountKey = accountToken + '/accountToken';
  var uid, resetToken;

  async.waterfall([
    // Check that the accountToken exists
    // and get the associated user id
    function(cb) {
      kv.cache.get(accountKey, function(err, account) {
        if (err) return cb(err);
        if (!account) return cb(notFound('UknownAccountToken'));
        cb(null, account.value.uid);
      });
    },
    // get new resetToken
    function(id, cb) {
      uid = id;
      util.getResetToken(cb);
    },
    function(token, cb) {
      resetToken = token;
      addResetToken(uid, token, cb);
    },
    // delete account token from user's list
    function(cb) {
      updateUserData(uid, function(userDoc) {
          delete userDoc.value.accountTokens[accountToken];
          return userDoc;
      }, cb);
    },
    // delete accountToken record
    function(cb) {
      kv.cache.delete(accountToken + '/accountToken', cb);
    },
    function(cb) {
      cb(null, { resetToken: resetToken });
    }
  ], cb);
};

exports.resetAccount = function(resetToken, bundle, cb) {
  var cyphertext = Buffer(bundle, 'base64');
  var userId, user, data;

  console.log('cypher!!!', cyphertext.toString('hex'));

  async.waterfall([
    // Check that the resetToken exists
    // and get the associated user id
    function(next) {
      kv.cache.get(resetToken + '/resetToken', function(err, doc) {
        if (err) return next(err);
        if (!doc) return next(notFound('UknownResetToken'));
        userId = doc.value.uid;
        next(null);
      });
    },
    function(next) {
      getUser(userId, next);
    },
    function(u, next) {
      user = u;
      // get decryption key
      util.resetKeys(Buffer(resetToken, 'hex'), cyphertext.length, next);
    },
    function(keys, next) {
      // decrypt bundle
      var cleartext = bigint.fromBuffer(cyphertext)
        .xor(bigint.fromBuffer(keys.respXORkey))
        .toBuffer();

      console.log('ver!!!', cleartext.slice(64).toString('hex'));

      data = {
        kA: cleartext.slice(0, 32).toString('base64'),
        wrapKb: cleartext.slice(32, 64).toString('base64'),
        verifier: cleartext.slice(64).toString('hex')
      };
      console.log('data', data);
      next();
    },
    // delete all accountTokens, signTokens, and resetTokens
    function(next) {
      console.log('deleting!!');
      deleteAllTokens(userId, next);
    },
    // create user account
    function(next) {
      console.log('creating new!!');
      kv.store.set(userId + '/user', {
        email: user.email, // shouldn't be needed once we reintroduce principles
        params: user.params,
        salt: user.salt,
        verifier: data.verifier,
        kA: data.kA,
        wrapKb: data.wrapKb,
        resetTokens: {},
        signTokens: {}
      }, next);
    }
  ], cb);
};

function deleteAllTokens(userId, cb) {
  async.waterfall([
    getUser.bind(null, userId),
    function(user, cb) {
      // map each token into a function that deletes that token's record
      var funs = Object.keys(user.signTokens).map(function(token) {
          return function(cb) {
            kv.store.delete(token + '/signer', cb);
          };
        })
        .concat(
        Object.keys(user.resetTokens).map(function(token) {
          return function(cb) {
            kv.cache.delete(token + '/resetToken', cb);
          };
        }));
      // run token deletions in parallel
      async.parallel(funs, function(err) { cb(err); });
    }
  ], cb);
}

function addTokenFn(tokenType, fn) {
  return function (userId, tokenBuf, cb) {
    var token = tokenBuf.toString('hex');
    async.waterfall([
      // First, add the signToken to the user's list
      function(next) {
        updateUserData(userId, function(userDoc) {
          if (token in userDoc.value[tokenType]) {
            userDoc.value[tokenType][token] = true;
          }
          return userDoc;
        }, next);
      },
      fn.bind(null, token, userId),
    ], cb);
  };
}

var addSignToken = addTokenFn('signTokens',
      function(token, userId, cb) {
        kv.store.set(token + '/signer', {
          uid: userId,
          accessTime: Date.now()
        }, cb);
      });

var addResetToken = addTokenFn('resetTokens',
      function(token, userId, cb) {
        kv.cache.set(token + '/resetToken', {
          uid: userId,
          expirationTime: Date.now() + 60 * 60 * 24
        }, cb);
      });

function updateUserData(userId, update, cb) {
  retryLoop('cas mismatch', 5, function(cb) {
    getUserDoc(userId, function(err, doc) {
      try {
        doc = update(doc);
      } catch (e) {
        return cb(e);
      }
      kv.store.cas(userId + '/user', doc.value, doc.casid, cb);
    });
  }, cb);
}

// Helper function to retry execution in case of errors.
// 'fn' should be the function to execute, with its arguments bound
// except for the callback.
//
function retryLoop(errType, maxAttempts, fn, cb) {
  var numRetries = 0;
  var attempt = function() {
    fn(function(err) {
      if (!err) return cb(null);
      if (err !== errType) return cb(err);
      if (numRetries > maxAttempts) return cb('too many conflicts');
      numRetries++;
      process.nextTick(attempt);
    });
  };
  attempt();
}

// This method returns the userId currently associated with an email address.
function getId(email, cb) {
  kv.store.get(email + '/uid', function(err, result) {
    if (err) return cb(internalError(err));
    if (!result) return cb(notFound('UnknownUser'));
    cb(null, result.value);
  });
}
exports.getId = getId;

// get meta data associated with a user
function getUserDoc(userId, cb) {
  kv.store.get(userId + '/user', function(err, doc) {
    if (err) return cb(internalError(err));
    if (!doc) return cb(notFound('UnknownUser'));
    doc.id = userId;
    cb(null, doc);
  });
}

// get meta data associated with a user
function getUser(userId, cb) {
  getUserDoc(userId, function(err, doc) {
    if (err) return cb(err);
    cb(null, doc.value);
  });
}
exports.getUser = getUser;

function getHawkCredentials(tokenId, cb) {
  kv.cache.get(tokenId + '/hawk', function (err, x) {
    cb(err, x ? x.value : null);
  });
}
exports.getHawkCredentials = getHawkCredentials;

// This account principle associated with a singing token
// The principle is the userId combined with the IDP domain
// e.g. 1234@lcip.org
//
function getPrinciple(token, cb) {
  kv.store.get(token + '/signer', function(err, result) {
    if (err) return cb(internalError(err));
    if (!result) return cb(notFound('UnknownSignToken'));

    var principle = result.value.uid + '@' + config.get('domain');

    cb(null, principle);
  });
}
exports.getPrinciple = getPrinciple;
