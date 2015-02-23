/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

define([
  'cocktail',
  'chai',
  'sinon',
  'underscore',
  '../../../mocks/window',
  'views/mixins/back-mixin',
  'views/base',
  'stache!templates/test_template'
], function (Cocktail, Chai, sinon, _, WindowMock,
        BackMixin, BaseView, TestTemplate) {
  var assert = Chai.assert;
  var ENTER_BUTTON_CODE = 13;

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
    });

    describe('backOnEnter', function () {
      it('calls window.history.back if user presses ENTER key', function () {
        view.backOnEnter({ which: ENTER_BUTTON_CODE });
        assert.isTrue(windowMock.history.back.called);
      });

      it('does not call window.history.back if user presses any key besides ENTER', function () {
        sinon.spy(windowMock.history, 'back');
        sinon.stub(view, 'canGoBack', function () {
          return true;
        });

        view.backOnEnter({ which: ENTER_BUTTON_CODE + 1});
        assert.isFalse(windowMock.history.back.called);
      });
    });
  });
});

