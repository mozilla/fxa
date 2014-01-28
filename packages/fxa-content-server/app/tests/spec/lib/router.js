/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';


define([
  'mocha',
  'chai',
  'underscore',
  'backbone',
  'router',
  '../../mocks/window'
],
function (mocha, chai, _, Backbone, Router, WindowMock) {
  /*global describe, beforeEach, afterEach, it*/
  var assert = chai.assert;

  describe('lib/router', function () {
    var router, windowMock, origNavigate, navigateUrl, navigateOptions;

    beforeEach(function () {
      navigateUrl = navigateOptions = null;

      windowMock = new WindowMock();
      router = new Router({
        window: windowMock
      });

      origNavigate = Backbone.Router.prototype.navigate;
      Backbone.Router.prototype.navigate = function (url, options) {
        navigateUrl = url;
        navigateOptions = options;
      };
    });

    afterEach(function () {
      windowMock = router = navigateUrl = navigateOptions = null;
      Backbone.Router.prototype.navigate = origNavigate;
    });

    describe('navigate', function () {
      it('Tells the router to havigate to a page', function () {
        windowMock.location.search = '';
        router.navigate('signin');
        assert.equal(navigateUrl, 'signin');
        assert.deepEqual(navigateOptions, { trigger: true });
      });

      it('preserves window search parameters across screen transition',
        function () {
        windowMock.location.search = '?context=fx_desktop_v1';
        router.navigate('forgot');
        assert.equal(navigateUrl, 'forgot?context=fx_desktop_v1');
        assert.deepEqual(navigateOptions, { trigger: true });
      });
    });
  });
});


