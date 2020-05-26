/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const through = require('through');

function inject(server, options) {
  var s = through();
  s.setEncoding = function () {};
  server.inject(options).then((res) => {
    res.raw.res.outputData.slice(1).forEach(function (chunk) {
      s.write(chunk, 'utf8');
    });
    s.end();
  });
  return s;
}

module.exports = inject;
