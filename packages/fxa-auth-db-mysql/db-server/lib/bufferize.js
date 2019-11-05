/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var HEX_STRING = /^(?:[a-fA-F0-9]{2})+$/;

function unbuffer(object) {
  var keys = Object.keys(object);
  for (var i = 0; i < keys.length; i++) {
    var x = object[keys[i]];
    if (Buffer.isBuffer(x)) {
      object[keys[i]] = x.toString('hex');
    }
  }
  return object;
}

function bufferize(object, onlyTheseKeys) {
  var keys = Object.keys(object);
  if (onlyTheseKeys) {
    keys = keys.filter(key => onlyTheseKeys.has(key));
  }
  for (var i = 0; i < keys.length; i++) {
    var key = keys[i];
    var value = object[key];
    // Don't convert things with no value, but we still want
    // to bufferize falsy things like the empty string.
    if (typeof value !== 'undefined' && value !== null) {
      if (typeof value !== 'string' || ! HEX_STRING.test(value)) {
        throw new Error('Invalid hex data for ' + key + ': "' + value + '"');
      }
      object[key] = Buffer.from(value, 'hex');
    }
  }
  return object;
}

function bufferizeRequest(keys, req, res, next) {
  try {
    if (req.body) {
      req.body = bufferize(req.body, keys);
    }
    if (req.params) {
      req.params = bufferize(req.params, keys);
    }
  } catch (err) {
    // Failure here means invalid hex data in a bufferized field.
    if (! err.statusCode) {
      err.statusCode = 400;
    }
    return next(err);
  }
  return next();
}

function hexToUtf8(value) {
  return Buffer.from(value, 'hex').toString('utf8');
}

module.exports = {
  unbuffer: unbuffer,
  bufferize: bufferize,
  bufferizeRequest: bufferizeRequest,
  hexToUtf8: hexToUtf8,
};
