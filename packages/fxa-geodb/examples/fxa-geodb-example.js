/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

(function() {
  'use strict';
  const geodb = require('../src/fxa-geodb');
  // New York timezone IP
  geodb('63.245.219.53')
    .then(function(city) {
      console.log(city); //eslint-disable-line
    }, function (err) {
      console.log('Err:', err.message); //eslint-disable-line
    });
})();
