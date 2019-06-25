/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { assert } from 'chai';
import View from 'views/sign_in_reported';

describe('views/sign_in_reported', function() {
  let view;

  beforeEach(function() {
    view = new View({});

    return view.render();
  });

  afterEach(function() {
    view.remove();
    view.destroy();
  });

  describe('render', () => {
    it('renders correctly', () => {
      assert.lengthOf(view.$('#fxa-sign-in-reported-header'), 1);
    });
  });
});
