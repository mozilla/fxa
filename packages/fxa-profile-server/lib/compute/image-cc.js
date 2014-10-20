/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const gm = require('gm');

const config = require('../config');
const img = require('../img');
const logger = require('../logging')('compute.image-cc');
const P = require('../promise');

const HEIGHT = String(config.get('img.resize.height'));
const WIDTH = String(config.get('img.resize.width'));
const CONTENT_TYPE_PNG = 'image/png';

logger.info('worker.config', { config: config.get('img') });

function processImage(src) {
  return new P(function(resolve, reject) {
    // gm uses GraphicsMagick
    // for resizing images, we want to DOWN-size any image that has it's
    // width or height higher than our maximum, while keeping the aspect
    // ratio. Any image that has a lower value should NOT be UP-sized,
    // as that would just make a pixelated mess.
    //
    // The '>' modifier does this.
    // See more: http://www.graphicsmagick.org/GraphicsMagick.html
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

function compute(msg, callback) {
  var id = msg.id;
  var src = Buffer(msg.payload);
  var start = Date.now();
  var s3Start = start;
  logger.debug('process.start', { bytes: src.length });
  processImage(src).then(function(out) {
    s3Start = Date.now();
    logger.info('time.ms.gm', s3Start - start);
    logger.debug('process.end', { bytes: out.length });
    return img.upload(id, out, CONTENT_TYPE_PNG);
  }).done(function() {
    logger.info('time.ms.s3', Date.now() - s3Start);
    callback({ id: id });
  }, function(err) {
    logger.error('compute', err);
    callback({ id: id, error: err.message });
  });
}
exports.compute = compute;

function response(res) {
  process.send(res);
}

process.on('message', function onMessage(msg) {
  logger.debug('onMessage', msg.id);
  compute(msg, response);
});
