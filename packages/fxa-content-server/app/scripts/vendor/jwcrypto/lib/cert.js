define(function(require,module,exports){
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var jwcrypto = require("./jwcrypto"),
    assertion = require("./assertion"),
    utils = require("./utils"),
    delay = utils.delay,
    version = require("./version");

var SERIALIZER = {};

SERIALIZER._LEGACY_serializeCertParamsInto = function(certParams, params) {
  params['public-key'] = certParams.publicKey.toSimpleObject();
  params.principal = certParams.principal;
};

SERIALIZER._20120815_serializeCertParamsInto = function(certParams, params) {
  params.publicKey = certParams.publicKey.toSimpleObject();
  params.principal = certParams.principal;

  params.version = "2012.08.15";
};

var serializeCertParamsInto = function(certParams, params) {
  version.dispatchOnDataFormatVersion(SERIALIZER, 'serializeCertParamsInto', version.getDataFormatVersion(), certParams, params);
};

SERIALIZER._LEGACY_extractCertParamsFrom = function(params) {
  var certParams = {};


  certParams.publicKey = jwcrypto.loadPublicKey(JSON.stringify(params['public-key']));
  delete params['public-key'];
  certParams.principal = params.principal;
  delete params.principal;

  return certParams;
};

SERIALIZER._20120815_extractCertParamsFrom = function(params) {
  delete params.version;

  var certParams = {};

  certParams.publicKey = jwcrypto.loadPublicKey(JSON.stringify(params.publicKey));
  delete params.publicKey;
  certParams.principal = params.principal;
  delete params.principal;

  return certParams;
};


function extractCertParamsFrom(params, originalComponents) {
  return version.dispatchOnDataFormatVersion(SERIALIZER, 'extractCertParamsFrom', originalComponents.payload.version, params);
}

exports.sign = function(certParams, assertionParams, additionalPayload,
                        secretKey, cb) {
  var payload = {};
  utils.copyInto(additionalPayload || {}, payload);

  serializeCertParamsInto(certParams, payload);

  assertion.sign(payload, assertionParams, secretKey, cb);
};

var verify = function(signedObject, publicKey, now, cb) {
  assertion.verify(signedObject, publicKey, now, function(err, payload, assertionParams) {
    if (err)
      return cb(err);

    // compatible with old format
    var originalComponents = jwcrypto.extractComponents(signedObject);
    var certParams = extractCertParamsFrom(payload, originalComponents);

    // make the key appear under both public-key and publicKey
    cb(err, payload, assertionParams, certParams);
  });
};

exports.verify = verify;

exports.bundle = function(certs, signedAssertion) {
  if (!certs || certs.length === 0) {
    throw "certificates must be a non-empty array";
  }
  return [].concat(certs, signedAssertion).join('~');
};

exports.unbundle = function(b) {
  var arr = b.split('~');
  var obj = {};
  obj.signedAssertion = arr.pop();
  obj.certs = arr;
  return obj;
};

// verify just a chain of certs
var verifyChain = function(certs, now, getRoot, cb) {
  if (!certs.length)
    return delay(cb)("certs must be an array of at least one cert");

  var rootIssuer;
  try {
    // the root
    rootIssuer = jwcrypto.extractComponents(certs[0]).payload.iss;
  } catch (x) {
    // can't extract components
    return delay(cb)("malformed signature");
  }

  // iterate through the certs
  function verifyCert(i, pk, certParamsArray, cb) {
    // do a normal verify on that cert
    verify(certs[i], pk, now, function(err, payload, assertionParams, certParams) {
      if (err) return cb(err);

      i += 1;
      certParamsArray.push({payload: payload,
                            assertionParams: assertionParams,
                            certParams: certParams});

      if (i >= certs.length)
        cb(null, certParamsArray, certParams.publicKey);
      else
        delay(verifyCert)(i, certParams.publicKey, certParamsArray, cb);
    });
  }

  // get the root public key
  getRoot(rootIssuer, function(err, rootPK) {
    if (err) return delay(cb)(err);

    verifyCert(0, rootPK, [], function(err, certParamsArray /* , lastPK */) {
      if (err) return cb(err);

      // we're done
      cb(null, certParamsArray);
    });
  });
};

exports.verifyChain = verifyChain;

// msg is an error message returned by .verify, entity is either 'assertion' or
// 'certificate'
function improveVerifyErrorMessage(err, entity) {
  // allow through the malformed signature
  if (err === "issued later than verification date" ||
      err === "expired") {
    err = entity + " " + err;
  } else if (err !== 'malformed signature') {
    err = "bad signature in chain";
  }
  return err;
}

exports.verifyBundle = function(bundle, now, getRoot, cb) {
  // unbundle
  if (typeof(bundle) !== 'string' && !(bundle instanceof String)) {
    return delay(cb)("malformed backed assertion");
  }

  var parsedBundle = exports.unbundle(bundle);
  var signedAssertion = parsedBundle.signedAssertion;
  var certs = parsedBundle.certs;

  // no certs? not okay
  if (certs.length === 0) {
    return delay(cb)("no certificates provided");
  }

  // verify the chain
  verifyChain(certs, now, getRoot, function(err, certParamsArray) {
    // ergonomic error messages
    if (err) return cb(improveVerifyErrorMessage(err, 'certificate'));

    // what was the last PK in the successful chain?
    var lastPK = certParamsArray[certParamsArray.length - 1].certParams.publicKey;

    // now verify the assertion
    assertion.verify(signedAssertion, lastPK, now, function(err, payload, assertionParams) {
      // ergonomic error messages
      if (err) return cb(improveVerifyErrorMessage(err, 'assertion'));

      // we're good!
      cb(null, certParamsArray, payload, assertionParams);
    });
  });
};
return exports;
});

