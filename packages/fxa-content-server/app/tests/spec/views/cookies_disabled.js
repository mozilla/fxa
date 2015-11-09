/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define(function (require, exports, module) {
  'use strict';

  var $ = require('jquery');
  var chai = require('chai');
  var sinon = require('sinon');
  var Storage = require('lib/storage');
  var View = require('views/cookies_disabled');
  var WindowMock = require('../../mocks/window');

  var assert = chai.assert;

  describe('views/cookies_disabled', function () {
    var view, windowMock, serverConfig;

    var origGetJSON = $.getJSON;

    beforeEach(function () {
      // Going deep into the internals, which isn't great. Monkey patch
      // $.getJSON so that we do not have to actually make a request to
      // the backend and can control the return value.

      $.getJSON = function () {
        var deferred = jQuery.Deferred();
        deferred.resolve(serverConfig);
        return deferred.promise();
      };

      windowMock = new WindowMock();
      view = new View({
        Storage: Storage,
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

    describe('backIfLocalStorageEnabled', function () {
      it('goes back in history if localStorage is enabled and there is a page to go back to', function () {
        view.backIfLocalStorageEnabled();
        assert.isTrue(view.window.history.back.called);
        assert.equal(view.$('.error').text(), '');
      });

      it('shows an error message if localStorage is still disabled', function () {
        var sandbox = sinon.sandbox.create();
        sandbox.stub(Storage, 'isLocalStorageEnabled', function () {
          return false;
        });
        view.backIfLocalStorageEnabled();
        assert.isUndefined(view.window.history.back.called);
        assert.ok(view.$('.error').text());
        sandbox.restore();
      });
    });
  });
});

