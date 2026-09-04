/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/*jshint -W116*/ // `if` without curlies in a single line is okay

var events = require('events');
var util = require('util');
var fs = require('fs');
var path = require('path');
var pngparse = require('pngparse');

var SIZES = require('../../../lib/img').SIZES;

function jsonParse(content) {
  try {
    return JSON.parse(content);
  } catch (e) {
    return { error: e };
  }
}

function isValidPng(image, cb) {
  // must parse ok, and be expected pixel dimensions
  pngparse.parseBuffer(image, function (err, data) {
    if (err) {
      return cb(err);
    }

    var expect = SIZES.default;

    if (data.width !== expect.w || data.height !== expect.h) {
      var msg = 'Invalid PNG size: (' + data.width + ',' + data.height + ')';
      return cb(new Error(msg));
    }

    return cb(null, data);
  });
}

function Avatar(options) {
  events.EventEmitter.call(this);
  options = options || {};

  this.verbose = options.verbose;

  if (!options.bearer) {
    throw new Error('option "bearer" is required');
  }
  this.bearer = options.bearer;

  if (!options.host) {
    throw new Error('option "host" is required');
  }

  this.host = options.host;

  this.image =
    options.image || fs.readFileSync(path.resolve(__dirname, 'cat.png'));
}
util.inherits(Avatar, events.EventEmitter);

Avatar.prototype.log = function avatarLog(/* format, values... */) {
  if (!this.verbose) {
    return;
  }

  var args = Array.prototype.slice.call(arguments);
  var timestamp = new Date().toISOString();
  args[0] = util.format('[%s] %s', timestamp, args[0]);

  process.stderr.write(util.format.apply(null, args.concat('\n')));
};

Avatar.prototype.upload = async function avatarUpload(options) {
  var transactionid = options.transactionid || 'no-transaction-id';
  this.log('start:upload      -> %s %s', transactionid, this.host);

  var startTime = Date.now();
  var res, body;
  try {
    res = await fetch('https://' + this.host + '/v1/avatar/upload', {
      method: 'POST',
      headers: {
        'Content-Type': 'image/png',
        Authorization: 'Bearer ' + this.bearer,
        'Content-Length': this.image.length,
      },
      body: this.image,
    });
    body = await res.text();
  } catch (err) {
    return this.emit('error', {
      transactionid: transactionid,
      elapsedTime: Date.now() - startTime,
      error: err,
    });
  }

  var result = {
    transactionid: transactionid,
    elapsedTime: Date.now() - startTime,
  };

  if (res.status !== 201) {
    result.error = new Error('Invalid response code: ' + res.status);
    return this.emit('error', result);
  }

  var contentType = res.headers.get('content-type') || '';
  if (contentType.indexOf('application/json') !== 0) {
    result.error = new Error('Invalid content-type: ' + contentType);
    return this.emit('error', result);
  }

  result.statusCode = res.status;
  result.body = jsonParse(body);
  result.bytes = this.image.length;

  return this.emit('complete:upload', result);
};

Avatar.prototype.download = async function avatarDownload(options) {
  var transactionid = options.transactionid || 'no-transaction-id';
  var startTime = Date.now();
  var self = this;

  this.log('start:download    -> %s', options.url);

  var res, body;
  try {
    res = await fetch(options.url);
    body = Buffer.from(await res.arrayBuffer());
  } catch (err) {
    return this.emit('error', {
      transactionid: transactionid,
      elapsedTime: Date.now() - startTime,
      imageid: options.imageid,
      error: err,
    });
  }

  var result = {
    transactionid: transactionid,
    elapsedTime: Date.now() - startTime,
    imageid: options.imageid,
  };

  if (res.status !== 200) {
    result.error = new Error('Invalid response code: ' + res.status);
    return this.emit('error', result);
  }

  var contentType = res.headers.get('content-type') || '';
  if (contentType.indexOf('image/png') !== 0) {
    result.error = new Error('Invalid content-type: ' + contentType);
    return this.emit('error', result);
  }

  isValidPng(body, function (err /*, data */) {
    if (err) {
      result.error = err;
      return self.emit('error', result);
    }

    result.statusCode = res.status;
    result.bytes = body.length;

    return self.emit('complete:download', result);
  });
};

Avatar.prototype.delete = async function avatarDelete(options) {
  var transactionid = options.transactionid || 'no-transaction-id';
  var startTime = Date.now();

  this.log('start:delete      -> %s', options.url);

  var res, body;
  try {
    res = await fetch(
      'https://' + this.host + '/v1/avatar/' + options.imageid,
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: 'Bearer ' + this.bearer,
        },
      }
    );
    body = await res.text();
  } catch (err) {
    return this.emit('error', {
      transactionid: transactionid,
      elapsedTime: Date.now() - startTime,
      error: err,
    });
  }

  var result = {
    transactionid: transactionid,
    elapsedTime: Date.now() - startTime,
  };

  if (res.status !== 200) {
    result.error = new Error('Invalid response code: ' + res.status);
    return this.emit('error', result);
  }

  var contentType = res.headers.get('content-type') || '';
  if (contentType.indexOf('application/json') !== 0) {
    result.error = new Error('Invalid content-type: ' + contentType);
    return this.emit('error', result);
  }

  result.statusCode = res.status;
  result.bytes = Buffer.byteLength(body);

  return this.emit('complete:delete', result);
};

module.exports = Avatar;
