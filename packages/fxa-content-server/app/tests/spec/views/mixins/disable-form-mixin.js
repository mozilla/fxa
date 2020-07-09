/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import DisableFormMixin from 'views/mixins/disable-form-mixin';
import { assert } from 'chai';
import FormView from 'views/form';
import Cocktail from 'cocktail';
import Notifier from 'lib/channels/notifier';
import sinon from 'sinon';

const View = FormView.extend({
  template: () => `
    <div>
      <button type="submit" class="primary-button">button</button>
      <!-- open/close panel button is ignored -->
      <button class="primary-button">Open/Close Panel</button>
    </div>
  `,
});
Cocktail.mixin(View, DisableFormMixin);

describe('views/mixins/disable-form-mixin', () => {
  let notifier;
  let view;

  beforeEach(() => {
    notifier = new Notifier();

    view = new View({
      notifier,
      windowMock: window,
    });
  });

  describe('afterRender', () => {
    it('calls `onFormChange', () => {
      sinon.spy(view, 'onFormChange');

      view.afterRender();

      assert.isTrue(view.onFormChange.calledOnce);
    });
  });

  describe('onFormChange', () => {
    it('calls `enableForm` if form is valid', () => {
      sinon.spy(view, 'enableForm');
      sinon.stub(view, 'isValid').callsFake(() => true);

      view.onFormChange();
      assert.isTrue(view.enableForm.calledOnce);
    });

    it('calls `disableForm` if form is invalid', () => {
      sinon.spy(view, 'disableForm');
      sinon.stub(view, 'isValid').callsFake(() => false);

      view.onFormChange();
      assert.isTrue(view.disableForm.calledOnce);
    });
  });

  it('`disableForm` adds the `disabled` attribute to the submit button, `enableForm` removes it', () => {
    return view.render().then(() => {
      view.disableForm();
      assert.isTrue(view.$('button').prop('disabled'));
      view.enableForm();
      assert.isFalse(view.$('button').prop('disabled'));
    });
  });
});
