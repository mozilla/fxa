/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';


define([
  'chai',
  'views/complete_sign_up',
  '../../mocks/window',
  '../../lib/helpers'
],
function (chai, View, WindowMock, TestHelpers) {
  /*global describe, beforeEach, afterEach, it*/
  var assert = chai.assert;
  var wrapAssertion = TestHelpers.wrapAssertion;

  describe('views/complete_sign_up', function () {
    var view, windowMock, client;

    beforeEach(function () {
      windowMock = new WindowMock();
      view = new View({
        window: windowMock
      });
      $('#container').html(view.el);
      return view.fxaClient._getClientAsync()
              .then(function (_client) {
                client = _client;
                // create spies that can be used to check
                // parameters that are passed to the Fxaclient
                TestHelpers.addFxaClientSpy(client);
              });
    });

    afterEach(function () {
      view.remove();
      view.destroy();
      view = windowMock = null;

      // return the client to its original state.
      TestHelpers.removeFxaClientSpy(client);
    });

    describe('constructor creates it', function () {
      it('is drawn', function () {
        windowMock.location.search = '?uid=uid&code=code';
        return view.render()
            .then(function () {
              assert.ok(view.$('#fxa-complete-sign-up-header').length);
            });
      });
    });

    describe('afterRender', function () {
      it('shows an error if uid is not available on the URL', function () {
        windowMock.location.search = '?code=code';

        return view.render()
            .then(function () {
              assert.isFalse(client.verifyCode.called);
              assert.ok(view.$('.error').text());
            });
      });

      it('throws an error if code is not available on the URL', function () {
        windowMock.location.search = '?uid=uid';

        return view.render()
            .then(function () {
              assert.isFalse(client.verifyCode.called);
              assert.ok(view.$('.error').text());
            });
      });

      it('attempts to complete verification if code and uid are available', function () {
        windowMock.location.search = '?code=code&uid=uid';

        return view.render()
            .then(function () {
              assert.isTrue(client.verifyCode.called);
            });

      });
    });
  });
});



