/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import $ from 'jquery';
import { assert } from 'chai';
import AuthErrors from 'lib/auth-errors';
import BaseView from 'views/base';
import Cocktail from 'cocktail';
import ResendMixin from 'views/mixins/resend-mixin';
import sinon from 'sinon';
import TestTemplate from 'templates/confirm.mustache';

const View = BaseView.extend({
  resend: () => Promise.resolve(),
  template: TestTemplate,
});

describe('views/mixins/resend-mixin', () => {
  let view;

  describe('Default successMessage', () => {
    const DefaultSuccessMessageView = View.extend({});
    Cocktail.mixin(DefaultSuccessMessageView, ResendMixin());

    beforeEach(() => {
      view = new DefaultSuccessMessageView();

      return view.render().then(() => {
        $('#container').html(view.el);
      });
    });

    afterEach(() => {
      view.destroy(true);
      view = null;
    });

    it('hooks up to `click` on #resend', () => {
      sinon.spy(view, '_resend');

      view.$('section').click();
      assert.equal(view._resend.callCount, 0);

      view.$('#resend').click();
      assert.equal(view._resend.callCount, 1);
    });

    it('debounces resend calls - submit on first four attempts', () => {
      sinon.spy(view, 'logViewEvent');
      sinon.spy(view, 'displaySuccess');
      sinon.spy(view, 'resend');

      return view
        ._resend()
        .then(() => {
          assert.equal(view.logViewEvent.callCount, 1);
          assert.isTrue(view.logViewEvent.calledWith('resend'));
          assert.isFalse(view.logViewEvent.calledWith('too_many_attempts'));
          assert.equal(view.resend.callCount, 1);
          assert.equal(view.displaySuccess.callCount, 1);
          assert.isTrue(
            view.displaySuccess.calledWith(
              'Email resent. Add accounts@firefox.com to your contacts to ensure a smooth delivery.'
            )
          );
          assert.lengthOf(view.$('#resend:visible'), 1);

          return view._resend();
        })
        .then(() => {
          assert.equal(view.logViewEvent.callCount, 2);
          assert.isFalse(view.logViewEvent.calledWith('too_many_attempts'));
          assert.equal(view.resend.callCount, 2);
          assert.equal(view.displaySuccess.callCount, 2);
          assert.lengthOf(view.$('#resend:visible'), 1);

          return view._resend();
        })
        .then(() => {
          assert.equal(view.logViewEvent.callCount, 3);
          assert.isFalse(view.logViewEvent.calledWith('too_many_attempts'));
          assert.equal(view.resend.callCount, 3);
          assert.equal(view.displaySuccess.callCount, 3);
          assert.lengthOf(view.$('#resend:visible'), 1);

          return view._resend();
        })
        .then(() => {
          assert.equal(view.logViewEvent.callCount, 5);
          assert.isTrue(view.logViewEvent.calledWith('too_many_attempts'));
          assert.equal(view.resend.callCount, 4);
          assert.equal(view.displaySuccess.callCount, 4);
          assert.lengthOf(view.$('#resend:visible'), 0);
        });
    });

    it('_resend displays returned errors', () => {
      const err = AuthErrors.toError('UNEXPECTED_ERROR');
      sinon.stub(view, 'resend').callsFake(() => Promise.reject(err));
      sinon.spy(view, 'displayError');

      return view._resend().then(() => {
        assert.isTrue(view.displayError.calledOnce);
        assert.isTrue(view.displayError.calledWith(err));
      });
    });
  });

  describe('successMessage: false View', () => {
    const NoSuccessMessageView = View.extend({});
    Cocktail.mixin(
      NoSuccessMessageView,
      ResendMixin({ successMessage: false })
    );

    it('does not display a success message', () => {
      view = new NoSuccessMessageView();
      sinon.spy(view, 'displaySuccess');

      return view
        .render()
        .then(view._resend())
        .then(() => {
          assert.isFalse(view.displaySuccess.called);
        });
    });
  });
});
