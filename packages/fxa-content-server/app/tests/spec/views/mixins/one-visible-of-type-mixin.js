/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { assert } from 'chai';
import BaseView from 'views/base';
import Cocktail from 'cocktail';
import OneVisibleOfTypeMixin from 'views/mixins/one-visible-of-type-mixin';
import sinon from 'sinon';

class View extends BaseView {
  hide() {}
  show() {}
}

Cocktail.mixin(
  View,
  OneVisibleOfTypeMixin({
    hideMethod: 'hide',
    showMethod: 'show',
    viewType: 'tooltip',
  })
);

describe('views/mixins/one-visible-of-type-mixin', () => {
  it('trigger function will hide old ones', () => {
    const firstVisible = new View();
    const secondVisible = new View();

    sinon.spy(firstVisible, 'hide');
    sinon.spy(secondVisible, 'hide');

    firstVisible.show();
    secondVisible.show();

    assert.isTrue(firstVisible.hide.calledOnce);
    assert.isFalse(secondVisible.hide.called);

    firstVisible.show();

    assert.isTrue(firstVisible.hide.calledOnce);
    assert.isTrue(secondVisible.hide.calledOnce);
  });
});
