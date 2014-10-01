/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';


define([
  'chai',
  'sinon',
  'models/auth_brokers/redirect',
  '../../../mocks/window'
],
function (chai, sinon, RedirectAuthenticationBroker, WindowMock) {
  var assert = chai.assert;
  var REDIRECT_TO = 'https://redirect.here';

  describe('models/auth_brokers/redirect', function () {
    var broker;
    var windowMock;

    beforeEach(function () {
      windowMock = new WindowMock();

      broker = new RedirectAuthenticationBroker({
        window: windowMock
      });
    });

    describe('finishOAuthFlow', function () {
      describe('with no error', function () {
        it('prepares window to be closed', function () {
          return broker.finishOAuthFlow({
            redirect: REDIRECT_TO
          })
          .then(function () {
            assert.equal(windowMock.location.href, REDIRECT_TO);
          });
        });
      });

      describe('with an error', function () {
        it('appends an error query parameter', function () {
          return broker.finishOAuthFlow({
            redirect: REDIRECT_TO,
            error: 'error'
          })
          .then(function () {
            assert.include(windowMock.location.href, REDIRECT_TO);
            assert.include(windowMock.location.href, 'error=error');
          });
        });
      });
    });
  });
});


