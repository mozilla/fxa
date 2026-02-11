/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// stub out the fxa-client object for testing.

import FxaClientWrapper from 'lib/fxa-client';

function FxaClientWrapperMock() {}

Object.keys(FxaClientWrapper.prototype).forEach(function (method) {
  FxaClientWrapperMock.prototype[method] = function () {
    return Promise.reject(
      new Error('method "' + method + '" should be stubbed')
    );
  };
});

export default FxaClientWrapperMock;
