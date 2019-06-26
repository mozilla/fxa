/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// the nested require needs an explanation. If both require_config and
// test_start are requested at the same time, on Linux esp, timing issues
// cause test_start to be served parsed before require_config. This leads
// to URLs being resolved relative to the tests subdirectory instead of
// the scripts subdirectory. To avoid this, ensure require_config is loaded
// before anything else.
require(['../scripts/require_config'], function() {
  'use strict';
  require(['../tests/test_start'], function() {
    // don't need to do anything.
  });
});
