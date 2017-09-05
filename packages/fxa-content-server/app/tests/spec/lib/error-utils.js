/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define(function (require, exports, module) {
  'use strict';

  const $ = require('jquery');
  const AuthErrors = require('lib/auth-errors');
  const chai = require('chai');
  const domWriter = require('lib/dom-writer');
  const ErrorUtils = require('lib/error-utils');
  const FiveHundredTemplate = require('stache!templates/500');
  const FourHundredTemplate = require('stache!templates/400');
  const OAuthErrors = require('lib/oauth-errors');
  const sinon = require('sinon');
  const Translator = require('lib/translator');
  const WindowMock = require('../../mocks/window');

  var assert = chai.assert;

  describe('lib/error-utils', function () {
    var err;
    var metrics;
    var sentry;
    var sandbox;
    var translator;
    var windowMock;

    beforeEach(function () {
      sandbox = sinon.sandbox.create();

      sandbox.spy(domWriter, 'write');

      metrics = {
        flush: sinon.spy(),
        logError: sinon.spy()
      };

      sentry = {
        captureException: sinon.spy()
      };

      translator = new Translator({forceEnglish: true});

      windowMock = new WindowMock();
      sandbox.spy(windowMock.console, 'error');
    });

    afterEach(function () {
      sandbox.restore();
    });

    describe('getErrorPageTemplate', function () {
      var badRequestPageErrors = [
        AuthErrors.toInvalidParameterError('paramName'),
        AuthErrors.toMissingParameterError('paramName'),
        OAuthErrors.toInvalidParameterError('paramName'),
        OAuthErrors.toMissingParameterError('paramName'),
        OAuthErrors.toError('UNKNOWN_CLIENT')
      ];

      badRequestPageErrors.forEach(function (err) {
        it('400 template returned for ' + err.message, function () {
          var errorPageTemplate = ErrorUtils.getErrorPageTemplate(err);
          assert.strictEqual(errorPageTemplate, FourHundredTemplate);
        });
      });

      it('500 template returned by default', function () {
        var errorPageTemplate =
          ErrorUtils.getErrorPageTemplate(OAuthErrors.toError('INVALID_ASSERTION'));
        assert.strictEqual(errorPageTemplate, FiveHundredTemplate);
      });
    });

    describe('captureError', function () {
      var origMessage;

      beforeEach(function () {
        err = AuthErrors.toMissingParameterError('email');
        origMessage = err.message;
        return ErrorUtils.captureError(err, sentry, metrics, windowMock);
      });

      it('logs the error to both metrics', function () {
        assert.isTrue(sentry.captureException.calledWith(err));
        assert.isTrue(metrics.logError.calledWith(err));
      });

      it('writes an error message to the console', function () {
        assert.isTrue(windowMock.console.error.called);
      });

      it('interpolates errors before sending to Sentry', function () {
        assert.notEqual(origMessage, err.message);
        assert.equal(err.message, 'Missing parameter: email');
      });
    });

    describe('captureError gets error from getErrorMessage', function () {
      var origMessage;

      beforeEach(function () {
        sandbox.stub(ErrorUtils, 'getErrorMessage').callsFake(function () {
          throw new Error('Not able to interpolate');
        });

        err = AuthErrors.toMissingParameterError('email');
        origMessage = err.message;
      });

      it('doesn\'t change error message', function () {
        ErrorUtils.captureError(err, sentry, metrics, windowMock);

        assert.equal(origMessage, err.message);
        assert.isTrue(sentry.captureException.calledWith(err));
      });
    });

    describe('getErrorMessage', function () {

      describe('from a module that can interpolate', function () {
        var err;

        before(function () {
          err = AuthErrors.toMissingParameterError('email');
        });

        it('interpolates the message', function () {
          assert.equal(ErrorUtils.getErrorMessage(err), 'Missing parameter: email');
        });
      });

      describe('from a module that cannot interpolate', function () {
        var err;

        before(function () {
          err = new Error('uh oh');
        });

        it('does not interpolate the message', function () {
          assert.equal(ErrorUtils.getErrorMessage(err), 'uh oh');
        });
      });
    });

    describe('captureAndFlushError', function () {
      beforeEach(function () {
        err = AuthErrors.toError('UNEXPECTED_ERROR');
        return ErrorUtils.captureAndFlushError(
          err, sentry, metrics, windowMock);
      });

      it('logs the error to both metrics', function () {
        assert.isTrue(sentry.captureException.calledWith(err));
        assert.isTrue(metrics.logError.calledWith(err));
      });

      it('writes an error message to the console', function () {
        assert.isTrue(windowMock.console.error.called);
      });

      it('flushes metrics', function () {
        assert.isTrue(metrics.flush.called);
      });
    });

    describe('renderError', function () {
      describe('with a translator', function () {
        beforeEach(function () {
          $('#container').html('<div id="stage"></div>');
          err = AuthErrors.toInvalidParameterError('email');
          ErrorUtils.renderError(err, windowMock, translator);
        });

        it('renders an error message to the DOM', function () {
          assert.isTrue(domWriter.write.called);
          assert.include(
              $('#stage').text().toLowerCase(), 'invalid parameter: email');
        });
      });

      describe('without a translator', function () {
        beforeEach(function () {
          $('#container').html('<div id="stage"></div>');
          err = AuthErrors.toInvalidParameterError('email');
          ErrorUtils.renderError(err, windowMock);
        });

        it('renders an error message to the DOM', function () {
          assert.isTrue(domWriter.write.called);
          assert.include(
              $('#stage').text().toLowerCase(), 'invalid parameter: email');
        });
      });
    });

    describe('fatalError', function () {
      beforeEach(function () {
        $('#container').html('<div id="stage"></div>');
        err = AuthErrors.toInvalidParameterError('email');

        return ErrorUtils.fatalError(
          err, sentry, metrics, windowMock, translator);
      });

      it('logs the error to both metrics', function () {
        assert.isTrue(sentry.captureException.calledWith(err));
        assert.isTrue(metrics.logError.calledWith(err));
      });

      it('writes an error message to the console', function () {
        assert.isTrue(windowMock.console.error.called);
      });

      it('flushes metrics', function () {
        assert.isTrue(metrics.flush.called);
      });

      it('renders the error', function () {
        assert.isTrue(domWriter.write.called);
        assert.include(
            $('#stage').text().toLowerCase(), 'invalid parameter: email');
      });
    });
  });
});
