/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';


define([
  'chai',
  'sinon',
  'views/tos',
  'lib/promise',
  '../../mocks/window'
],
function (chai, sinon, View, p, WindowMock) {
  var assert = chai.assert;

  describe('views/tos', function () {
    var view;
    var xhrMock;
    var windowMock;

    beforeEach(function () {
      xhrMock = {
        ajax: function () {
          return p('<span id="fxa-tos-header"></span>');
        }
      };

      windowMock = new WindowMock();
      windowMock.location.pathname = '/legal/terms';

      view = new View({
        xhr: xhrMock,
        window: windowMock
      });
    });

    afterEach(function () {
      view.remove();
      view.destroy();
    });

    it('Back button is displayed if there is a page to go back to', function () {
      sinon.stub(view, 'canGoBack', function () {
        return true;
      });

      return view.render()
        .then(function () {
          assert.equal(view.$('#fxa-tos-back').length, 1);
        });
    });

    it('sets a cookie that lets the server correctly handle page refreshes', function () {
      return view.render()
        .then(function () {
          assert.isTrue(/canGoBack=1; path=\/legal\/terms/.test(windowMock.document.cookie));
        });
    });

    it('Back button is not displayed if there is no page to go back to', function () {
      sinon.stub(view, 'canGoBack', function () {
        return false;
      });

      return view.render()
        .then(function () {
          assert.equal(view.$('#fxa-tos-back').length, 0);
        });
    });

    it('fetches translated text from the backend', function () {
      sinon.spy(xhrMock, 'ajax');

      return view.render()
        .then(function () {
          assert.isTrue(xhrMock.ajax.called);
          assert.ok(view.$('#fxa-tos-header').length);
        });
    });

    it('shows an error if fetch fails', function () {
      sinon.stub(xhrMock, 'ajax', function () {
        return p.reject(new Error('could not fetch resource'));
      });

      return view.render()
        .then(function () {
          assert.isTrue(xhrMock.ajax.called);
          assert.isTrue(view.isErrorVisible());
        });
    });
  });
});


