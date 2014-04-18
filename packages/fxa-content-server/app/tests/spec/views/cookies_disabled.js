/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';


define([
  'jquery',
  'chai',
  'p-promise',
  'views/cookies_disabled',
  '../../mocks/window'
],
function ($, chai, p, View, WindowMock) {
  /*global describe, beforeEach, afterEach, it*/
  var assert = chai.assert;

  describe('views/cookies_disabled', function () {
    var view, windowMock, serverConfig;

    var origGetJSON = $.getJSON;

    beforeEach(function () {
      // Going deep into the internals, which isn't great. Monkey patch
      // $.getJSON so that we do not have to actually make a request to
      // the backend and can control the return value.
      $.getJSON = function (url, done) {
        done(serverConfig);
      };

      windowMock = new WindowMock();
      view = new View({
        window: windowMock
      });
      return view.render()
          .then(function () {
            $('#container').html(view.el);
          });
    });

    afterEach(function () {
      view.remove();
      view.destroy();

      $.getJSON = origGetJSON;
    });

    describe('constructor creates it', function () {
      it('is drawn', function () {
        assert.ok(view.$('#fxa-cookies-disabled-header').length);
      });
    });

    describe('backIfCookiesEnabled', function () {
      it('goes back in history if localStorage is enabled', function () {
        serverConfig = {
          localStorageEnabled: true
        };

        return view.backIfCookiesEnabled()
          .then(function () {
            assert.isTrue(view.window.history.back.called);
            assert.equal(view.$('.error').text(), '');
          });
      });

      it('shows an error message if localStorage is still disabled', function () {
        serverConfig = {
          localStorageEnabled: false
        };

        return view.backIfCookiesEnabled()
          .then(function () {
            assert.isUndefined(view.window.history.back.called);
            assert.ok(view.$('.error').text());
          });
      });
    });
  });
});


