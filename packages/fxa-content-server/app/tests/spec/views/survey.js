/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import $ from 'jquery';
import { assert } from 'chai';
import sinon from 'sinon';
import View from 'views/survey';

var viewOptions = {
  surveyURL: 'https://www.surveygizmo.com/s3/5541940/pizza',
  viewName: 'survey',
};

describe('views/survey', function() {
  var view;
  const ael = sinon.spy(window, "addEventListener");
  const rel = sinon.spy(window, "removeEventListener");

  function createView() {
    return new View(viewOptions);
  }

  beforeEach(() => {
    view = createView();
    view.render();
    $('#container').html(view.el);
  });

  afterEach(() => {
    view.remove();
    view.destroy();
    $('#container').empty();
  });

  describe('render', function() {
    it('renders template', function() {
      assert.ok($('.survey-wrapped').length);
    });

    it('shows the iframe', function() {
      assert.lengthOf(view.$('iframe'), 1);
      assert.equal(view.$('iframe')[0].src, viewOptions.surveyURL);
    });

    it('sets the window message handler in SurveyView', function() {
      assert(ael.calledWith('message'));
    });

    it('removes the window message handler in SurveyView after called', function() {
      window.postMessage('survey complete');
      assert(rel.called);
    });
  });
});
