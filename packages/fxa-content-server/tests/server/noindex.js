/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
// Ensure the headers to prevent indexing are only added to the appropriate requests
const { registerSuite } = intern.getInterface('object');
const assert = intern.getPlugin('chai').assert;
const path = require('path');
const proxyquire = require('proxyquire');
const sinon = require('sinon');

const noindex = proxyquire(
  path.join(process.cwd(), 'server', 'lib', 'noindex'),
  {
    // totally ignore the html-middleware
    './html-middleware': (callback) => callback,
  }
);

var suite = {
  'it adds the X-Robots-Tag header'() {
    const res = {
      setHeader: sinon.spy(),
    };
    const next = sinon.spy();

    noindex({}, res, next);

    assert.isTrue(res.setHeader.calledOnce);
    assert.isTrue(res.setHeader.calledWith('X-Robots-Tag', 'noindex,nofollow'));

    assert.isTrue(next.calledOnce);
  },
};

registerSuite('noindex', suite);
