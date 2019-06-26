/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { assert } from 'chai';
import BaseView from 'views/base';
import Cocktail from 'cocktail';
import PulseGraphicMixin from 'views/mixins/pulse-graphic-mixin';

const View = BaseView.extend({
  template: () => '<div class="graphic"></div>',
});

Cocktail.mixin(View, PulseGraphicMixin);

describe('views/mixins/pulse-graphic-mixin', () => {
  let view;

  beforeEach(() => {
    view = new View({});
    return view.render();
  });

  afterEach(() => {
    view.remove();
    view.destroy();
  });

  it('adds the `pulse` class to `.graphic`', () => {
    assert.isTrue(view.$('.graphic').hasClass('pulse'));
  });
});
