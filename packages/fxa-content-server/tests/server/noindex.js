/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// Ensure the headers to prevent indexing are only added to the appropriate requests

define([
  'intern!object',
  'intern/chai!assert',
  'intern/dojo/node!path',
  'intern/dojo/node!proxyquire',
  'intern/dojo/node!sinon'
], function (registerSuite, assert, path, proxyquire, sinon) {

  const noindex = proxyquire(
    path.join(process.cwd(), 'server', 'lib', 'noindex'),
    {
      // totally ignore the html-middleware
      './html-middleware': callback => callback
    }
  );

  var suite = {
    name: 'noindex',

    'it adds the X-Robots-Tag header' () {
      const res = {
        setHeader: sinon.spy()
      };
      const next = sinon.spy();

      noindex({}, res, next);

      assert.isTrue(res.setHeader.calledOnce);
      assert.isTrue(res.setHeader.calledWith('X-Robots-Tag', 'noindex,nofollow'));

      assert.isTrue(next.calledOnce);
    }
  };


  registerSuite(suite);
});
