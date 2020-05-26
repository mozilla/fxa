/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import $ from 'jquery';
import { assert } from 'chai';
import FormView from 'views/form';
import Cocktail from 'cocktail';
import CoppaMixin from 'views/mixins/coppa-mixin';
import FormPrefill from 'models/form-prefill';
import KeyCodes from 'lib/key-codes';
import { Model } from 'backbone';
import Notifier from 'lib/channels/notifier';
import sinon from 'sinon';
import WindowMock from '../../../mocks/window';

describe('views/mixins/coppa-mixin', () => {
  let formPrefill;
  let notifier;
  let relier;
  let view;
  let windowMock;

  const CoppaView = FormView.extend({
    template: (context) => context.coppaHTML,
  });

  Cocktail.mixin(CoppaView, CoppaMixin({ required: true }));

  beforeEach(() => {
    formPrefill = new FormPrefill();
    notifier = new Notifier();
    relier = new Model();
    windowMock = new WindowMock();

    view = new CoppaView({
      formPrefill,
      notifier,
      relier,
      viewName: 'signup',
      window: windowMock,
    });

    return view.render();
  });

  afterEach(() => {
    view.remove();
    view.destroy();

    view = null;
  });

  describe('render', () => {
    it('COPPA not rendered if disabled', () => {
      const coppaNotEnabledView = new CoppaView({
        formPrefill,
        isCoppaEnabled: false,
        notifier,
        relier,
        viewName: 'signup',
        window: windowMock,
      });

      return coppaNotEnabledView.render().then(() => {
        assert.lengthOf(coppaNotEnabledView.$('#age'), 0);
        coppaNotEnabledView.destroy();
      });
    });

    it('COPPA not rendered if disabled at relier', () => {
      const coppaNotEnabledView = new CoppaView({
        formPrefill,
        isCoppaEnabled: true,
        notifier,
        relier,
        viewName: 'signup',
        window: windowMock,
      });

      relier.set('isCoppaEnabled', false);

      return coppaNotEnabledView.render().then(() => {
        assert.lengthOf(coppaNotEnabledView.$('#age'), 0);
        coppaNotEnabledView.destroy();
      });
    });

    it('COPPA rendered if disabled in config, enabled by relier', () => {
      const coppaEnabledView = new CoppaView({
        formPrefill,
        isCoppaEnabled: false,
        notifier,
        relier,
        viewName: 'signup',
        window: windowMock,
      });

      relier.set('isCoppaEnabled', true);

      return coppaEnabledView.render().then(() => {
        assert.lengthOf(coppaEnabledView.$('#age'), 1);
      });
    });

    it('COPPA rendered by default', () => {
      formPrefill.set('age', 12);

      return view.render().then(() => {
        const $ageEl = view.$('#age');
        assert.lengthOf(view.$('#age'), 1);
        assert.equal($ageEl.val(), '12');
        assert.ok($ageEl.prop('required'));
      });
    });

    it('redirects to `cannot_create_account` if the user is too young', () => {
      view.tooYoung();

      sinon.stub(view, 'navigate').callsFake(() => {});
      return view.render().then(() => {
        assert.isTrue(view.navigate.calledOnce);
        assert.isTrue(view.navigate.calledWith('cannot_create_account'));
      });
    });
  });

  describe('onCoppaInput', () => {
    it('limits characters', () => {
      const age = view.$('#age');
      age.val('13123123123123');
      view.onCoppaInput();
      assert.equal(age.val(), '131');
    });
  });

  describe('onCoppaKeyDown', () => {
    it('accept digits', () => {
      const event = $.Event('keydown', { which: KeyCodes.NUM_1 });
      sinon.spy(event, 'preventDefault');
      view.onCoppaKeyDown(event);
      assert.isFalse(event.preventDefault.called);
    });

    it('accept ENTER', () => {
      const event = $.Event('keydown', { which: KeyCodes.ENTER });
      sinon.spy(event, 'preventDefault');
      view.onCoppaKeyDown(event);
      assert.isFalse(event.preventDefault.called);
    });

    it('does not allow non-digits', () => {
      const event = $.Event('keydown', { which: KeyCodes.NUM_PERIOD });
      sinon.spy(event, 'preventDefault');
      view.onCoppaKeyDown(event);
      assert.isTrue(event.preventDefault.called);
    });
  });

  describe('value is old enough', () => {
    beforeEach(() => {
      view.$('#age').val('13');
    });

    it('isUserOldEnough returns true', () => {
      assert.isTrue(view.isUserOldEnough());
    });

    it('coppaHasValue returns true', () => {
      assert.isTrue(view.coppaHasValue());
    });
  });

  describe('value is too young', () => {
    beforeEach(() => {
      view.$('#age').val('12');
    });

    it('isUserOldEnough returns false if COPPA is enabled', () => {
      sinon.stub(view, 'isCoppaEnabled').callsFake(() => true);
      assert.isFalse(view.isUserOldEnough());
    });

    it('isUserOldEnough returns true always if COPPA is disabled', () => {
      sinon.stub(view, 'isCoppaEnabled').callsFake(() => false);
      assert.isTrue(view.isUserOldEnough());
    });

    it('coppaHasValue returns true', () => {
      assert.isTrue(view.coppaHasValue());
    });
  });

  describe('value is empty', () => {
    beforeEach(() => {
      view.$('#age').val('');
    });

    it('isUserOldEnough returns false if COPPA is enabled', () => {
      sinon.stub(view, 'isCoppaEnabled').callsFake(() => true);
      assert.isFalse(view.isUserOldEnough());
    });

    it('isUserOldEnough returns true always if COPPA is disabled', () => {
      sinon.stub(view, 'isCoppaEnabled').callsFake(() => false);
      assert.isTrue(view.isUserOldEnough());
    });

    it('coppaHasValue returns false', () => {
      assert.isFalse(view.coppaHasValue());
    });
  });

  describe('destroy', () => {
    it('saves the form info to formPrefill', () => {
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
