/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import HasModalChildViewMixin from 'views/mixins/has-modal-child-view-mixin';
import { assert } from 'chai';
import BaseView from 'views/base';
import Cocktail from 'cocktail';
import sinon from 'sinon';

const HasModalChildView = BaseView.extend({
  template: () => '<div><div class="child-view"></div></div>',
});
Cocktail.mixin(HasModalChildView, HasModalChildViewMixin);

describe('views/mixins/has-modal-child-view-mixin', () => {
  let view;
  let childView;
  let createViewSpy;

  beforeEach(() => {
    childView = new BaseView();
    sinon.stub(childView, 'render').callsFake(() => Promise.resolve());
    createViewSpy = sinon.spy(() => childView);

    view = new HasModalChildView({
      createView: createViewSpy,
    });
  });

  it('showChildView renders and tracks the child view.', () => {
    sinon.spy(view, 'trackChildView');

    return view.showChildView(BaseView).then(() => {
      assert.isTrue(createViewSpy.calledOnceWith(BaseView));
      assert.isTrue(childView.render.calledOnce);
      assert.isTrue(view.trackChildView.calledOnceWith(childView));
    });
  });
});
