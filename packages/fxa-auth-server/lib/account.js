const uuid = require('uuid');
const async = require('async');
const Hapi = require('hapi');
const config = require('./config');
const kv = require('./kv');
const util = require('./util');

var internalError = Hapi.Error.internal;
var badRequest = Hapi.Error.badRequest;
var notFound = Hapi.Error.notFound;


/* user account model
 *
 * <email>/uid = <userId>
 *
 * <userId>/user = {
 *  params: <user params>
 *  verifier: <password verifier>
 *  kA: <kA key>
 *  kB: <wrapped kB key>
 * }
 *
 * <sessionId>/session = {
 *  uid: <userId>
 * }
 *
 * <accountToken>/account = {
 *  uid: <userId>
 * }
 *
 * */

exports.create = function(data, cb) {
  // generate user id
  var userId = util.getUserId();
  var userKey = userId + '/user';

  async.waterfall([
    // ensure that an account doesn't already exist for the email
    function(cb) {
      kv.store.get(data.email + '/uid', function (err, doc) {
        if (doc) return cb(badRequest('AccountExistsForEmail'));
        cb(null);
      });
    },
    // link email to userid
    function(cb) {
      kv.store.set(data.email + '/uid', userId, cb);
    },
    // get new class A key
    util.getKA,
    // create user account
    function(key, cb) {
      kv.store.set(userKey, {
        params: data.params,
        verifier: data.verifier,
        kA: key,
        kB: data.kB
      }, cb);
    }
  ], cb);
};

// Initialize the SRP process
exports.startLogin = function(email, cb) {
  async.waterfall([
    // get uid
    exports.getId.bind(null, email),
    // create a temporary session document
    function (uid, cb) {
      // get sessionID
      var sid = util.getSessionId();

      // eventually will store SRP state
      // and expiration time
      kv.store.set(sid + '/session', {
        uid: uid
      }, function (err) {
        // return sessionID
        cb(err, { sessionId: sid });
      });
    }
  ], cb);
};

// Finish the SRP process and return account info
exports.finishLogin = function(sessionId, verifier, cb) {
  var sessKey = sessionId + '/session';
  var uid, user, accountToken;

  async.waterfall([
    // get session doc
    function(cb) {
      kv.store.get(sessKey, function(err, session) {
        if (err) return cb(err);
        if (!session) return cb(notFound('UnknownSession'));
        cb(null, session.value);
      });
    },
    // get user info
    function(session, cb) {
      uid = session.uid;
      exports.getUser(session.uid, cb);
    },

    // check password
    function(result, cb) {
      user = result;
      if (user.verifier !== verifier) {
        return cb(badRequest('IncorrectPassword'));
      }
      cb(null);
    },

    // create accountToken
    util.getAccountToken,

    // create temporary account token doc
    function(token, cb) {
      accountToken = token;
      kv.store.set(token + '/accountToken', { uid: uid }, cb);
    },
    // delete session doc
    function(cb) {
      kv.store.delete(sessKey, cb);
    },
    // return info
    function(cb) {
      cb({
        accountToken: accountToken,
        kA: user.kA,
        kB: user.kB,
      });
    }
  ], cb);
};

// Takes an accountToken and creates a new signToken
exports.getSignToken = function(accountToken, cb) {
  var accountKey = accountToken + '/accountToken';
  var uid, signToken;

  async.waterfall([
    // Check that the accountToken exists
    // and get the associated user id
    function(cb) {
      kv.get(accountKey, function(err, account) {
        if (err) return cb(err);
        if (!account) return cb(notFound('UknownAccountToken'));
        cb(null, account.value.uid);
      });
    },
    // get new signToken
    function(id, cb) {
      uid = id;
      util.getSignToken(cb);
    },
    function(token, cb) {
      signToken = token;
      kv.set(token + '/signer', {
        uid: uid,
        accessTime: Date.now()
      }, cb);
    },
    // delete accountToken
    function(cb) {
      kv.delete(accountToken + '/accountToken', cb);
    },
    function(cb) {
      cb(null, { signToken: signToken });
    }
  ], cb);
};

// This method returns the userId currently associated with an email address.
exports.getId = function(email, cb) {
  kv.store.get(email + '/uid', function(err, result) {
    if (err) return cb(internalError(err));
    if (!result) return cb(notFound('UnknownUser'));
    cb(null, result.value);
  });
};

// get meta data associated with a user
exports.getUser = function(userId, cb) {
  kv.store.get(userId + '/user', function(err, doc) {
    if (err) return cb(internalError(err));
    if (!doc) return cb(notFound('UnknownUser'));
    cb(null, doc.value);
  });
};

// This account principle associated with a singing token
// The principle is the userId combined with the IDP domain
// e.g. 1234@lcip.org
//
exports.getPrinciple = function(token, cb) {
  kv.get(token + '/signer', function(err, result) {
    if (err) return cb(internalError(err));
    if (!result) return cb(notFound('UnknownSignToken'));

    var principle = result.value.uid + '@' + config.get('domain');

    cb(null, principle);
  });
};
