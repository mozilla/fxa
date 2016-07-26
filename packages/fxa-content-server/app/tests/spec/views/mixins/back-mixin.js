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
  var Notifier = require('lib/channels/notifier');
  var sinon = require('sinon');
  var TestTemplate = require('stache!templates/test_template');

  var assert = Chai.assert;

  var View = BaseView.extend({
    template: TestTemplate
  });
  Cocktail.mixin(View, BackMixin);

  describe('views/mixins/back-mixin', function () {
    var notifier;
    var view;

    beforeEach(function () {
      notifier = new Notifier();

      view = new View({
        notifier: notifier,
        screenName: 'back-screen'
      });

      return view.render();
    });

    describe('back', function () {
      it('triggers the `navigate-back` message on the notifier', function () {
        sinon.spy(notifier, 'trigger');

        view.back({ nextViewField: 'value' });

        assert.isTrue(
          notifier.trigger.calledWith('navigate-back', {
            nextViewData: {
              nextViewField: 'value'
            }
          }));
      });

      it('logs a `back` event on the view', () => {
        sinon.spy(view, 'logViewEvent');

        assert.isFalse(view.logViewEvent.called);

        view.back();

        assert.isTrue(view.logViewEvent.calledOnce);
        assert.isTrue(view.logViewEvent.calledWith('back'));
      });
    });

    describe('backOnEnter', function () {
      it('calls back if user presses ENTER key', function () {
        sinon.spy(view, 'back');

        view.backOnEnter({ which: KeyCodes.ENTER });
        assert.isTrue(view.back.called);
      });

      it('does not call back if user presses any key besides ENTER', function () {
        sinon.stub(view, 'canGoBack', function () {
          return true;
        });
        sinon.spy(view, 'back');

        view.backOnEnter({ which: KeyCodes.ENTER + 1});
        assert.isFalse(view.back.called);
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
