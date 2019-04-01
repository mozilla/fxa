/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const assert = require('chai').assert;
const App = require('models/oauth-app');
const sinon = require('sinon');

describe('models/oauth-app', function () {
  var app;

  beforeEach(function () {
    app = new App();
  });

  describe('destroy', function () {
    beforeEach(function () {
      sinon.spy(app, 'trigger');

      app.destroy();
    });

    it('triggers a `destroy` message', function () {
      assert.isTrue(app.trigger.calledWith('destroy'));
    });
  });
});
