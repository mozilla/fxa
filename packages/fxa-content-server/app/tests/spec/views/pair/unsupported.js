/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { assert } from 'chai';
import View from 'views/pair/unsupported';
import sinon from 'sinon';
import GleanMetrics from '../../../../scripts/lib/glean';

describe('views/pair/unsupported', () => {
  let view;

  beforeEach(() => {
    initView();
  });

  afterEach(function () {
    view.destroy();
  });

  function initView() {
    view = new View({
      viewName: 'pairUnsupported',
    });
  }

  describe('render', () => {
    it('renders', () => {
      return view.render().then(() => {
        assert.ok(
          view.$el.find('#pair-unsupported-header').text(),
          'Pair using an app'
        );
        assert.ok(view.$el.find('.bg-image-pair-fail').length);
      });
    });

    describe('glean metrics', () => {
      let viewEventStub;
      beforeEach(() => {
        viewEventStub = sinon.stub(
          GleanMetrics.cadMobilePairUseAppView,
          'view'
        );
      });
      afterEach(() => {
        viewEventStub.restore();
      });

      it('logs a view Glean metrics event', () => {
        view.logView();
        sinon.assert.calledOnce(viewEventStub);
      });
    });
  });
});
