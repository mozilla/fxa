/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// stub out the router object for testing.

function CanvasMock() {
  // nothing to do here.
}

CanvasMock.prototype = {
  getContext() {
    this._context = {
      translate() {},
      rotate() {},
      drawImage() {
        this._args = arguments;
      },
    };

    return this._context;
  },
  toDataURL() {
    this._args = arguments;
    return 'data:image/jpeg';
  },
  toBlob(cb) {
    this._args = arguments;
    setTimeout(function () {
      cb({ type: 'image/jpeg' });
    }, 0);
  },
};

export default CanvasMock;
