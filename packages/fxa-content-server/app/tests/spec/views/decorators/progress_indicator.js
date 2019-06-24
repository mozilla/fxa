/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { assert } from 'chai';
import BaseView from 'views/base';
import ProgressIndicator from 'views/progress_indicator';
import showProgressIndicator from 'views/decorators/progress_indicator';
import sinon from 'sinon';

describe('views/decorators/progress_indicator', () => {
  let view;
  let progressIndicator;

  const View = BaseView.extend({
    template() {
      return '<button type="submit">Button</button>';
    },
    longRunningAction: showProgressIndicator(() => {
      return Promise.resolve().then(() => {
        assert.isTrue(progressIndicator.start.called);
      });
    }),
  });

  beforeEach(() => {
    // set up a progress indicator to use for testing.
    progressIndicator = new ProgressIndicator();
    sinon.spy(progressIndicator, 'start');
    sinon.spy(progressIndicator, 'done');

    view = new View();

    return view.render().then(() => {
      // set up the initial progress indicator to use for testing.
      view
        .$('button[type="submit"]')
        .data('progressIndicator', progressIndicator);
    });
  });

  afterEach(() => {
    view.destroy();
  });

  describe('showProgressIndicator', () => {
    describe('with no artificial delay', () => {
      it('starts and stops the progress indicator', () => {
        const startTime = Date.now();
        return view.longRunningAction().then(() => {
          assert.equal(progressIndicator.done.callCount, 1);
          assert.ok(Date.now() - startTime < 30);
        });
      });
    });

    describe('with an artificial delay', () => {
      it('starts and stops the progress indicator', () => {
        const startTime = Date.now();
        view.$('button').data('minProgressIndicatorMs', 30);
        return view.longRunningAction().then(() => {
          assert.equal(progressIndicator.done.callCount, 1);
          assert.ok(Date.now() - startTime >= 30);
        });
      });
    });

    it('can be shown multiple times in a row on the same button', () => {
      return view
        .longRunningAction()
        .then(() => {
          assert.equal(progressIndicator.done.callCount, 1);

          return view.longRunningAction();
        })
        .then(() => {
          assert.equal(progressIndicator.done.callCount, 2);
        });
    });

    it('works even if the view re-renders after a button is shown', () => {
      return view
        .longRunningAction()
        .then(() => {
          assert.equal(progressIndicator.done.callCount, 1);

          // a new progress indicator should be created
          // because of this action.
          return view.render();
        })
        .then(() => {
          return view.longRunningAction();
        })
        .then(() => {
          var progressIndicatorAfterReRender = view
            .$('button[type="submit"]')
            .data('progressIndicator');
          assert.instanceOf(progressIndicatorAfterReRender, ProgressIndicator);
          assert.notEqual(progressIndicator, progressIndicatorAfterReRender);

          assert.equal(progressIndicator.done.callCount, 1);
        });
    });
  });
});
