/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define(function (require, exports, module) {
  'use strict';

  var BackMixin = require('views/mixins/back-mixin');
  var BaseView = require('views/base');
  var Chai = require('chai');
  var Cocktail = require('cocktail');
  var KeyCodes = require('lib/key-codes');
  var sinon = require('sinon');
  var TestTemplate = require('stache!templates/test_template');
  var WindowMock = require('../../../mocks/window');

  var assert = Chai.assert;

  var View = BaseView.extend({
    template: TestTemplate
  });
  Cocktail.mixin(View, BackMixin);

  describe('views/mixins/back-mixin', function () {
    var view;
    var windowMock;

    beforeEach(function () {
      windowMock = new WindowMock();

      view = new View({
        window: windowMock
      });

      return view.render();
    });

    describe('back', function () {
      it('calls window.history.back', function () {
        view.back();
        assert.isTrue(windowMock.history.back.called);
      });

      it('calls event.preventDefault() if event is passed in', function () {
        var event = {
          preventDefault: sinon.spy()
        };

        view.back(event);
        assert.isTrue(event.preventDefault.called);
      });
    });

    describe('backOnEnter', function () {
      it('calls window.history.back if user presses ENTER key', function () {
        view.backOnEnter({ which: KeyCodes.ENTER });
        assert.isTrue(windowMock.history.back.called);
      });

      it('does not call window.history.back if user presses any key besides ENTER', function () {
        sinon.spy(windowMock.history, 'back');
        sinon.stub(view, 'canGoBack', function () {
          return true;
        });

        view.backOnEnter({ which: KeyCodes.ENTER + 1});
        assert.isFalse(windowMock.history.back.called);
      });
    });

    describe('canGoBack', function () {
      it('returns `true` if view created with `canGoBack: true` option', function () {
        view = new View({ canGoBack: true });
        assert.isTrue(view.canGoBack());
      });

      it('returns `false` if view created with `canGoBack: false` option', function () {
        view = new View({ canGoBack: false });
        assert.isFalse(view.canGoBack());
      });
    });
  });
});
