/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const domain = require('domain');

const gm = require('gm');

const config = require('../config');
const img = require('../img');
const logger = require('../logging').getLogger('fxa.compute.image-cc');
const P = require('../promise');

const HEIGHT = String(config.get('img.resize.height'));
const WIDTH = String(config.get('img.resize.width'));

logger.info('Worker starting up %:2j', config.get('img'));

var d = domain.create();
d.on('error', function(err) {
  logger.critical('Uncaught', err);
  if (err.code === 'ENOENT') {
    logger.error('Is gm installed?');
  }
  process.exit(1);
});

function processImage(src) {
  logger.debug('Src %d bytes', src.length);
  return new P(function(resolve, reject) {
    gm(src)
      .resize(WIDTH, HEIGHT, '>')
      .noProfile()
      .toBuffer('png', function(err, buf) {
        if (err) {
          reject(err);
        } else {
          resolve(buf);
        }
      });
  });
}

function compute(id, src) {
  processImage(src).then(function(out) {
    logger.debug('Out %d bytes', out.length);
    return img.upload(id, out);
  }).done(function() {
    process.send({ id: id });
  }, function(err) {
    process.send({ id: id, error: err });
  });
}

process.on('message', function onMessage(msg) {
  logger.debug('onMessage', msg.id);
  d.run(function() {
    compute(msg.id, Buffer(msg.payload));
  });
});
