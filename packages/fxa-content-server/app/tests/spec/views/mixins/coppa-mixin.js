/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define(function (require, exports, module) {
  'use strict';

  const $ = require('jquery');
  const { assert } = require('chai');
  const FormView = require('views/form');
  const Cocktail = require('cocktail');
  const CoppaMixin = require('views/mixins/coppa-mixin');
  const FormPrefill = require('models/form-prefill');
  const KeyCodes = require('lib/key-codes');
  const Notifier = require('lib/channels/notifier');
  const sinon = require('sinon');
  const WindowMock = require('../../../mocks/window');

  describe('views/mixins/coppa-mixin', function () {
    let formPrefill;
    let notifier;
    let view;
    let windowMock;

    const CoppaView = FormView.extend({
      template: (context) => context.coppaHTML
    });

    Cocktail.mixin(
      CoppaView,
      CoppaMixin({ required: true })
    );

    beforeEach(function () {
      formPrefill = new FormPrefill();
      notifier = new Notifier();
      windowMock = new WindowMock();

      view = new CoppaView({
        formPrefill,
        notifier,
        viewName: 'signup',
        window: windowMock
      });

      return view.render();
    });

    afterEach(function () {
      view.remove();
      view.destroy();

      view = null;
    });

    describe('render', function () {
      it('renders the COPPA row', function () {
        formPrefill.set('age', 12);

        return view.render()
          .then(function () {
            const $ageEl = view.$('#age');
            assert.equal($ageEl.val(), '12');
            assert.ok($ageEl.prop('required'));
          });
      });

      it('redirects to `cannot_create_account` if the user is too young', () => {
        view.tooYoung();

        sinon.stub(view, 'navigate').callsFake(() => {});
        return view.render()
          .then(() => {
            assert.isTrue(view.navigate.calledOnce);
            assert.isTrue(view.navigate.calledWith('cannot_create_account'));
          });
      });
    });

    describe('onCoppaInput', function () {
      it('limits characters', function () {
        const age = view.$('#age');
        age.val('13123123123123');
        view.onCoppaInput();
        assert.equal(age.val(), '131');
      });
    });

    describe('onCoppaKeyDown', function () {
      it('accept digits', function () {
        const event = $.Event('keydown', { which: KeyCodes.NUM_1 });
        sinon.spy(event, 'preventDefault');
        view.onCoppaKeyDown(event);
        assert.isFalse(event.preventDefault.called);
      });

      it('accept ENTER', function () {
        const event = $.Event('keydown', { which: KeyCodes.ENTER });
        sinon.spy(event, 'preventDefault');
        view.onCoppaKeyDown(event);
        assert.isFalse(event.preventDefault.called);
      });

      it('does not allow non-digits', function () {
        const event = $.Event('keydown', {which: KeyCodes.NUM_PERIOD});
        sinon.spy(event, 'preventDefault');
        view.onCoppaKeyDown(event);
        assert.isTrue(event.preventDefault.called);
      });
    });

    describe('value is old enough', function () {
      beforeEach(function () {
        view.$('#age').val('13');
      });

      it('isUserOldEnough returns true', function () {
        assert.isTrue(view.isUserOldEnough());
      });

      it('coppaHasValue returns true', function () {
        assert.isTrue(view.coppaHasValue());
      });
    });

    describe('value is too young', function () {
      beforeEach(function () {
        view.$('#age').val('12');
      });

      it('isUserOldEnough returns false', function () {
        assert.isFalse(view.isUserOldEnough());
      });

      it('coppaHasValue returns true', function () {
        assert.isTrue(view.coppaHasValue());
      });
    });

    describe('value is empty', function () {
      beforeEach(function () {
        view.$('#age').val('');
      });

      it('isUserOldEnough returns false', function () {
        assert.isFalse(view.isUserOldEnough());
      });

      it('coppaHasValue returns false', function () {
        assert.isFalse(view.coppaHasValue());
      });
    });

    describe('destroy', function () {
      it('saves the form info to formPrefill', function () {
        view.$('#age').val('13');
        view.destroy();
        assert.equal(formPrefill.get('age'), '13');
      });
    });

    describe('tooYoung', () => {
      it('triggers the `signup.tooyoung` notification, sets a cookie, navigates', () => {
        sinon.spy(notifier, 'trigger');
        sinon.stub(view, 'navigate').callsFake(() => {});

        view.tooYoung();

        assert.isTrue(notifier.trigger.calledOnce);
        assert.isTrue(notifier.trigger.calledWith('signup.tooyoung'));

        assert.equal(windowMock.document.cookie, 'tooyoung=1;');

        assert.isTrue(view.navigate.calledOnce);
        assert.isTrue(view.navigate.calledWith('cannot_create_account'));
      });
    });
  });
});
