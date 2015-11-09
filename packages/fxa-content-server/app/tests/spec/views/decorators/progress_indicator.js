/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */


define(function (require, exports, module) {
  'use strict';

  var $ = require('jquery');
  var BaseView = require('views/base');
  var chai = require('chai');
  var p = require('lib/promise');
  var ProgressIndicator = require('views/progress_indicator');
  var showProgressIndicator = require('views/decorators/progress_indicator');
  var sinon = require('sinon');

  var assert = chai.assert;

  describe('views/decorators/progress_indicator', function () {
    var view;
    var progressIndicator;

    var View = BaseView.extend({
      template: function () {
        return '<button type="submit">Button</button>';
      },
      longRunningAction: showProgressIndicator(function () {
        return p().then(function () {
          assert.isTrue(progressIndicator.start.called);
        });
      })
    });

    beforeEach(function () {
      // set up a progress indicator to use for testing.
      progressIndicator = new ProgressIndicator();
      sinon.spy(progressIndicator, 'start');
      sinon.spy(progressIndicator, 'done');

      view = new View();

      return view.render()
        .then(function () {
          // set up the initial progress indicator to use for testing.
          view.$('button[type="submit"]').data('progressIndicator', progressIndicator);
          $('#container').html(view.el);
        });
    });

    afterEach(function () {
      view.destroy();
    });

    describe('showProgressIndicator', function () {
      it('starts and stops the progress indicator', function () {
        return view.longRunningAction()
          .then(function () {
            assert.equal(progressIndicator.done.callCount, 1);
          });
      });

      it('can be shown multiple times in a row on the same button', function () {
        return view.longRunningAction()
          .then(function () {
            assert.equal(progressIndicator.done.callCount, 1);

            return view.longRunningAction();
          })
          .then(function () {
            assert.equal(progressIndicator.done.callCount, 2);
          });
      });

      it('works even if the view re-renders after a button is shown', function () {
        return view.longRunningAction()
          .then(function () {
            assert.equal(progressIndicator.done.callCount, 1);

            // a new progress indicator should be created
            // because of this action.
            return view.render();
          })
          .then(function () {
            return view.longRunningAction();
          })
          .then(function () {
            var progressIndicatorAfterReRender = view.$('button[type="submit"]').data('progressIndicator');
            assert.instanceOf(progressIndicatorAfterReRender, ProgressIndicator);
            assert.notEqual(progressIndicator, progressIndicatorAfterReRender);

            assert.equal(progressIndicator.done.callCount, 1);
          });
      });
    });
  });
});

