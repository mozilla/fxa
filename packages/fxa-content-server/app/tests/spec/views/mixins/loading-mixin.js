/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import $ from 'jquery';
import BaseView from 'views/base';
import Chai from 'chai';
import Cocktail from 'cocktail';
import LoadingMixin from 'views/mixins/loading-mixin';
import Template from 'templates/test_template.mustache';
import WindowMock from '../../../mocks/window';

var assert = Chai.assert;

var View = BaseView.extend({
  template: Template,
});

Cocktail.mixin(View, LoadingMixin);

describe('views/mixins/loading-mixin', function() {
  var windowMock;

  beforeEach(function() {
    $('#container').html('<div id="stage"></div>');

    windowMock = new WindowMock();

    void new View({
      viewName: 'loading-view',
      window: windowMock,
    });
  });

  it('renders the loading template into the #stage element before the view is rendered', function() {
    assert.equal($('#stage .loading').length, 1);
  });
});
