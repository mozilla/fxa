/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * A placeholder behavior, does nothing.
 */

var NullBehavior = function () {
  var behavior = function (/*view*/) {
    // do nothing
  };
  behavior.type = 'null';

  return behavior;
};

export default NullBehavior;
