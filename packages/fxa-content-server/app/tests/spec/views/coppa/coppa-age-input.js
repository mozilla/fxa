/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define(function (require, exports, module) {
  'use strict';

  const $ = require('jquery');
  const { assert } = require('chai');
  const AuthErrors = require('lib/auth-errors');
  const FormPrefill = require('models/form-prefill');
  const Metrics = require('lib/metrics');
  const Notifier = require('lib/channels/notifier');
  const sinon = require('sinon');
  const TestHelpers = require('../../../lib/helpers');
  const View = require('views/coppa/coppa-age-input');
  const KeyCodes = require('lib/key-codes');

  describe('views/coppa/coppa-age-input', function () {
    var formPrefill;
    var metrics;
    var notifier;
    var view;

    function createView() {
      view = new View({
        formPrefill,
        metrics,
        notifier,
        viewName: 'signup'
      });
    }

    beforeEach(function () {
      formPrefill = new FormPrefill();
      notifier = new Notifier();
      metrics = new Metrics({ notifier });
      createView();

      return view.render()
        .then(function () {
          $('#container').html(view.el);
        });
    });

    afterEach(function () {
      view.remove();
      view.destroy();

      view = null;
    });

    describe('render', function () {
      it('works', function () {
        createView();

        formPrefill.set('age', 12);

        return view.render()
          .then(function () {
            assert.equal(view.$('#age').val(), '12');
          });
      });
    });

    describe('onInput', function () {
      it('limits characters', function () {
        var age = $('#age');
        age.val('13123123123123');
        view.onInput();
        assert.equal(age.val(), '131');
      });
    });

    describe('onKeyDown', function () {
      it('accept digits', function () {
        var event = jQuery.Event('keydown', { which: KeyCodes.NUM_1 });
        sinon.spy(event, 'preventDefault');
        view.onKeyDown(event);
        assert.isFalse(event.preventDefault.called);
      });

      it('does not allow non-digits', function () {
        var event = jQuery.Event('keydown', {which: KeyCodes.NUM_PERIOD});
        sinon.spy(event, 'preventDefault');
        view.onKeyDown(event);
        assert.isTrue(event.preventDefault.called);
      });

      function testEnterKeyTriggersSubmit(element, done) {
        view.on('submit', function () {
          done();
        });

        // submit using the enter key
        var e = jQuery.Event('keydown', { which: 13 });
        $(element).trigger(e);
      }

      it('submits on enter', function (done) {
        testEnterKeyTriggersSubmit('#age', done);
      });
    });

    describe('isValid', function () {
      it('returns true if age is valid', function () {
        view.$('#age').val('14');
        assert.isTrue(view.isValid());
      });

      it('returns false if age is not valid ', function () {
        assert.isFalse(view.isValid());
        view.showValidationErrorsEnd();

        var yearError = AuthErrors.toError('AGE_REQUIRED');
        yearError.context = view.getViewName();
        assert.isTrue(TestHelpers.isErrorLogged(metrics, yearError));
      });
    });

    describe('showValidationErrorsEnd', function () {
      it('shows an error if no age is set', function () {
        sinon.spy(view, 'showValidationError');

        view.showValidationErrorsEnd();
        assert.isTrue(view.showValidationError.called);
      });

      it('does not show an error if age is set', function () {
        sinon.spy(view, 'showValidationError');
        view.$('#age').val('14');

        view.showValidationErrorsEnd();
        assert.isFalse(view.showValidationError.called);
      });
    });

    describe('value is old enough', function () {
      beforeEach(function () {
        view.$('#age').val('13');
      });

      it('isUserOldEnough returns true', function () {
        assert.isTrue(view.isUserOldEnough());
      });

      it('hasValue returns true', function () {
        assert.isTrue(view.hasValue());
      });
    });

    describe('value is too young', function () {
      beforeEach(function () {
        view.$('#age').val('12');
      });

      it('isUserOldEnough returns false', function () {
        assert.isFalse(view.isUserOldEnough());
      });

      it('hasValue returns true', function () {
        assert.isTrue(view.hasValue());
      });
    });

    describe('value is empty', function () {
      beforeEach(function () {
        view.$('#age').val('');
      });

      it('isUserOldEnough returns false', function () {
        assert.isFalse(view.isUserOldEnough());
      });

      it('hasValue returns false', function () {
        assert.isFalse(view.hasValue());
      });
    });

    describe('destroy', function () {
      it('saves the form info to formPrefill', function () {
        view.$('#age').val('13');
        view.destroy();
        assert.equal(formPrefill.get('age'), '13');
      });
    });
  });
});
