/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define(['./intern'], function(intern, FxAccountClient) {
  var map = intern.loader.map['*'];
  map['client/FxAccountClient'] = 'tests/addons/node-client';

  return intern;
});
