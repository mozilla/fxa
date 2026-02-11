/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// stub out the BroadcastChannel object for testing.
// See https://developer.mozilla.org/docs/Web/API/Broadcast_Channel_API

import sinon from 'sinon';

function BroadcastChannelMock(name) {
  this._name = name;
}

BroadcastChannelMock.prototype = {
  postMessage: sinon.spy(),
};

export default BroadcastChannelMock;
