/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define(function (require, exports, module) {
  'use strict';

  var chai = require('chai');
  var sinon = require('sinon');
  var View = require('views/support/create_secure_password');
  var WindowMock = require('../../../mocks/window');

  var assert = chai.assert;

  describe('views/support/create_secure_password', function () {
    var view;
    var windowMock;

    beforeEach(function () {
      windowMock = new WindowMock();
      windowMock.location.pathname = '/support/create_secure_password';

      view = new View({
        window: windowMock
      });
    });

    afterEach(function () {
      view.remove();
      view.destroy();
    });

    it('back button is displayed if there is a page to go back to', function () {
      sinon.stub(view, 'canGoBack', function () {
        return true;
      });

      return view.render()
        .then(function () {
          assert.equal(view.$('#back').length, 1);
        });
    });

    it('sets a cookie that lets the server correctly handle page refreshes', function () {
      return view.render()
        .then(function () {
          assert.isTrue(/canGoBack=1; path=\/support\/create_secure_password/.test(windowMock.document.cookie));
        });
    });

    it('back button is not displayed if there is no page to go back to', function () {
      sinon.stub(view, 'canGoBack', function () {
        return false;
      });

      return view.render()
        .then(function () {
          assert.equal(view.$('#back').length, 0);
        });
    });
  });
});
