/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import _ from 'underscore';
import $ from 'jquery';
import { assert } from 'chai';
import View from 'views/survey';

describe('views/survey', function() {
  var view;

  function createView() {
    var viewOptions = _.extend({
      surveyURL: 'https://www.surveygizmo.com/s3/5541940/pizza',
      viewName: 'survey',
    });
    return new View(viewOptions);
  }

  function renderAndAttach() {
    view = createView();
    view.render();
    $('#container').html(view.el);
  }

  function cleanup() {
    view.remove();
    view.destroy();
    $('#container').empty();
  }

  describe('render', function() {
    it('renders template', function() {
      renderAndAttach();
      assert.ok($('.survey-wrapped').length);
      cleanup();
    });

    it('shows the iframe', function() {
      renderAndAttach();
      assert.lengthOf(view.$('iframe'), 1);
      cleanup();
    });
  });
});
