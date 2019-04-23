/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * A behavior that halts the view flow.
 */

var HaltBehavior = function () {
  var behavior = function (view) {
    // return a promise that never resolves to halt promise based flows.
    return new Promise(() => {});
  };

  // used by form.afterSubmit to keep a form disabled.
  behavior.halt = true;
  behavior.type = 'halt';

  return behavior;
};

export default HaltBehavior;
