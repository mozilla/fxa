/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const config = require('../config');
const logger = require('../logging').getLogger('fxa.routes.upload');
const Promise = require('../promise');
const db = require('../db');

function unique() {
  return [
    Date.now(),
    process.pid,
    crypto.randomBytes(8).toString('hex')
  ].join('-');
}

function stream(readable) {
  var d = Promise.defer();

  var uploads = config.get('uploads.dir');
  var temp = path.join(uploads, unique());
  var hash = crypto.createHash('sha1');
  var dest = fs.createWriteStream(temp);

  logger.debug('uploading to %s', temp);

  readable.pipe(hash);
  readable.pipe(dest);
  readable.on('end', function() {
    var digest = hash.read().toString('hex') + '.png';

    dest = path.join(uploads, digest);

    logger.debug('upload digest, dest [%s, %s]', digest, dest);
    fs.rename(temp, dest, function(err) {
      if (err) {
        return d.reject(err);
      }
      d.resolve(digest);
    });
  });

  return d.promise;
}

module.exports = {
  auth: {
    strategy: 'userid'
  },
  payload: {
    allow: 'image/png', // other types later. this a POC
    output: 'stream',
    parse: false
  },
  handler: function avatarPost(req, reply) {
    // save image in uploads dir
    // generate hash to be used as url fragment
    // update db with url
    Promise.all([
      stream(req.payload),
      db.getOrCreateProfile(req.auth.credentials)
    ]).spread(function(hash, profile) {
      return db.setAvatar(profile.uid, hash);
    }).done(function() {
      reply({});
    }, reply);
  }
};
