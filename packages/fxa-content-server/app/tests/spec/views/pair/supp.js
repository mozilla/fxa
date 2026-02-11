/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { assert } from 'chai';
import View from 'views/pair/supp';

describe('views/pair/supp', () => {
  let view;

  beforeEach(() => {
    initView();
  });

  afterEach(function () {
    view.destroy();
  });

  function initView() {
    view = new View({
      viewName: 'pairSupp',
    });
  }

  describe('render', () => {
    it('renders', () => {
      return view.render().then(() => {
        assert.ok(view.$el.find('.spinner').length);
      });
    });
  });
});
