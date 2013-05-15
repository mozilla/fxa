const uuid = require('uuid');
const async = require('async');
const Hapi = require('hapi');
const kvstore = require('./kvstore');
const config = require('./config');
const util = require('./util');

var internalError = Hapi.Error.internal;
var badRequest = Hapi.Error.badRequest;
var notFound = Hapi.Error.notFound;

var kv = kvstore.connect(config.get('kvstore'));

/* user account model
 *
 * user should have account id
 *
 * <email>/userid = <userId>
 *
 * <userId>/meta = {
 *  params: <user params>
 *  passwordVerifier: <password verifier>
 *  kA: <kA key>
 *  kBWrapped: <wrapped kB key>
 * }
 *
 * */

exports.create = function(data, cb) {
  // generate user id
  var userId = util.getUserId();
  var metaKey = userId + '/user';
  var kA;

  async.waterfall([
    // ensure that an account doesn't already exist for the email
    function(cb) {
      kv.get(data.email + '/uid', function (err, doc) {
        if (doc) return cb(badRequest('AccountExistsForEmail'));
        cb(null);
      });
    },
    // link email to userid
    function(cb) {
      kv.set(data.email + '/uid', userId, cb);
    },
    // get new class A key
    util.getKA,
    // create user account
    function(key, cb) {
      kA = key;
      kv.set(metaKey, {
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
      kv.set(sid + '/session', {
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
      kv.get(sessKey, function(err, session) {
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
      kv.set(token + '/accountToken', { uid: uid }, cb);
    },
    // delete session doc
    function(cb) {
      kv.delete(sessKey, cb);
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

// This method returns the userId currently associated with an email address.
exports.getId = function(email, cb) {
  kv.get(email + '/uid', function(err, result) {
    if (err) return cb(internalError(err));
    if (!result) return cb(notFound('UnknownUser'));
    cb(null, result.value);
  });
};

// get meta data associated with a user
exports.getUser = function(userId, cb) {
  kv.get(userId + '/user', function(err, doc) {
    if (err) return cb(internalError(err));
    if (!doc) return cb(notFound('UnknownUser'));
    cb(null, doc.value);
  });
};

