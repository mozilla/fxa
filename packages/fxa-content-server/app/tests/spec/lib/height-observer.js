/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define(function (require, exports, module) {
  'use strict';

  var chai = require('chai');
  var HeightObserver = require('lib/height-observer');
  var sinon = require('sinon');
  var WindowMock = require('../../mocks/window');

  var assert = chai.assert;

  describe('lib/height-observer', function () {
    var heightObserver;
    var windowMock;
    var containerEl = document.body.querySelector('#container');
    var targetEl;
    var delayMS = 10;

    beforeEach(function () {
      containerEl.innerHTML = '<div id="target">content to ensure set height</div>';
      targetEl = document.body.querySelector('#target');

      windowMock = new WindowMock();
      heightObserver = new HeightObserver({
        delayMS: delayMS,
        target: targetEl,
        window: windowMock
      });
    });

    afterEach(function () {
      heightObserver.stop();
    });

    describe('start', function () {
      it('hooks up the MutationObserver', function () {
        heightObserver.start();

        assert.isTrue(
          heightObserver._observer.observe.calledWith(targetEl));
      });

      it('can only be started once', function () {
        heightObserver.start();
        assert.throws(function () {
          heightObserver.start();
        });
      });
    });

    describe('notifications', function () {

      it('triggers the `change` event if the height has changed', function (done) {
        var isNotificationExpected = false;
        var onChange = sinon.spy(function () {
          assert.isTrue(isNotificationExpected);
          done();
        });

        heightObserver.start();

        // set the initial height
        heightObserver._onMutation();

        heightObserver.on('change', onChange);

        // no height changes because the content has not changed.
        heightObserver._onMutation();
        heightObserver._onMutation();
        heightObserver._onMutation();

        // height change, should trigger the notification
        targetEl.innerHTML = targetEl.innerHTML + '<br /> line2';
        isNotificationExpected = true;
        heightObserver._onMutation();
      });

      it('`change` event only triggered once for closely spaced events', function (done) {
        var onChange = sinon.spy();

        heightObserver.on('change', onChange);

        // triggers the first event.
        heightObserver.start();

        // without a debounce, these all trigger notifications
        targetEl.innerHTML = targetEl.innerHTML + '<br /> line2';

        // use _observer.mockNotify instead of _onMutation because
        // _onMutation is not debounced.
        heightObserver._observer.mockNotify();

        targetEl.innerHTML = targetEl.innerHTML + '<br /> line3';
        heightObserver._observer.mockNotify();

        targetEl.innerHTML = targetEl.innerHTML + '<br /> line4';
        heightObserver._observer.mockNotify();

        targetEl.innerHTML = targetEl.innerHTML + '<br /> line5';
        heightObserver._observer.mockNotify();

        // after a slight delay, this should trigger a new event.
        setTimeout(function () {
          targetEl.innerHTML = targetEl.innerHTML + '<br /> line5';
          heightObserver._observer.mockNotify();
        }, delayMS);

        setTimeout(function () {
          done(assert.equal(onChange.callCount, 2));
        }, 2 * delayMS);
      });

      it('does not report a `change` if the element\'s clientHeight is not a number', function () {
        var onChange = sinon.spy();

        // An element's clientHeight can be misreported on some versions of
        // Fennec - see https://bugzilla.mozilla.org/show_bug.cgi?id=1071620
        // don't make any update unless the clientHeight is actually a number.
        var elementMockWithNoClientHeight = {};

        heightObserver = new HeightObserver({
          delayMS: delayMS,
          target: elementMockWithNoClientHeight,
          window: windowMock
        });
        heightObserver.on('change', onChange);

        targetEl.parentNode.removeChild(targetEl);
        heightObserver.start();

        assert.isFalse(onChange.called);
      });
    });

    describe('stop', function () {
      it('disconnect the MutationObserver', function () {
        heightObserver.start();

        // save a local reference because it's deleted off of the object.
        var mutationObserver = heightObserver._observer;
        heightObserver.stop();

        assert.isTrue(
          mutationObserver.disconnect.called);
      });
    });
  });
});
