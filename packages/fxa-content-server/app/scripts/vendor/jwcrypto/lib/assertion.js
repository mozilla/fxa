define(function(require,module,exports){
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var utils = require("./utils"),
    version = require("./version");

var SERIALIZER = {};

SERIALIZER._LEGACY_serializeAssertionParamsInto = function(assertionParams, params) {
  // copy over only the parameters we care about into params
  params.iat = assertionParams.issuedAt ? assertionParams.issuedAt.valueOf() : undefined;
  params.exp = assertionParams.expiresAt ? assertionParams.expiresAt.valueOf() : undefined;
  params.iss = assertionParams.issuer;
  params.aud = assertionParams.audience;
};

SERIALIZER._20120815_serializeAssertionParamsInto = function(assertionParams, params) {
  this._LEGACY_serializeAssertionParamsInto(assertionParams, params);

  if (params.version) {
    if (params.version !== "2012.08.15") {
      throw new Error("cannot serialize an assertion in a different format than is prescribed by overlaying data structure, e.g. cert");
    }
  } else {
    params.version = "2012.08.15";
  }
};

var serializeAssertionParamsInto = function(assertionParams, params) {
  version.dispatchOnDataFormatVersion(SERIALIZER, 'serializeAssertionParamsInto', version.getDataFormatVersion(), assertionParams, params);
};

SERIALIZER._LEGACY_extractAssertionParamsFrom = function(params) {
  var assertionParams = {};
  assertionParams.issuedAt = utils.getDate(params.iat);
  assertionParams.expiresAt = utils.getDate(params.exp);
  assertionParams.issuer = params.iss;
  assertionParams.audience = params.aud;

  delete params.iat;
  delete params.exp;
  delete params.iss;
  delete params.aud;

  return assertionParams;
};

SERIALIZER._20120815_extractAssertionParamsFrom = function(params) {
  delete params.version;

  var returnValue = this._LEGACY_extractAssertionParamsFrom(params);
  return returnValue;
};


function extractAssertionParamsFrom(params) {
  return version.dispatchOnDataFormatVersion(SERIALIZER, 'extractAssertionParamsFrom', version.getDataFormatVersion(), params);
}


exports.sign = function(jwcrypto, payload, assertionParams, secretKey, cb) {
  var allParams = {};
  utils.copyInto(payload, allParams);
  serializeAssertionParamsInto(assertionParams, allParams);

  jwcrypto.sign(allParams, secretKey, cb);
};

exports.verify = function(jwcrypto, signedObject, publicKey, now, cb) {
  jwcrypto.verify(signedObject, publicKey, function(err, payload) {
    if (err) return cb(err);

    var assertionParams = extractAssertionParamsFrom(payload);

    // check iat
    if (assertionParams.issuedAt) {
      if (assertionParams.issuedAt.valueOf() > now.valueOf())
        return cb("issued later than verification date");
    }

    // check exp expiration
    if (assertionParams.expiresAt) {
      if (assertionParams.expiresAt.valueOf() < now.valueOf()) {
        return cb("expired");
      }
    }

    cb(null, payload, assertionParams);
  });
};

return exports;
});

