/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { assert } from 'chai';
import Backbone from 'backbone';
import Cocktail from 'cocktail';
import SearchParamMixin from 'lib/search-param-mixin';
import TestHelpers from '../../lib/helpers';
import WindowMock from '../../mocks/window';

describe('lib/search-param', () => {
  let windowMock;
  let view;

  const View = Backbone.View.extend({
    initialize (options) {
      this.window = options.window;
    }
  });

  Cocktail.mixin(
    View,
    SearchParamMixin
  );

  beforeEach(() => {
    windowMock = new WindowMock();
    view = new View({ window: windowMock });
  });

  describe('getSearchParam', () => {
    it('returns the value of a search parameter, if available', () => {
      windowMock.location.search = TestHelpers.toSearchString({
        searchParam: 'value'
      });
      assert.equal(view.getSearchParam('searchParam'), 'value');
      assert.isUndefined(view.getSearchParam('notAvailable'));
    });
  });

  describe('getSearchParams', () => {
    it('returns an object with all search parameters', () => {
      const searchParams = {
        searchParam1: 'value1',
        searchParam2: 'value2'
      };
      windowMock.location.search = TestHelpers.toSearchString(searchParams);
      assert.deepEqual(view.getSearchParams(), searchParams);
    });
  });
});

