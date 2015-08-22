/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'chai',
  'jquery',
  'sinon',
  'views/base',
  'lib/promise',
  'lib/translator',
  'lib/ephemeral-messages',
  'lib/metrics',
  'lib/auth-errors',
  'lib/fxa-client',
  'models/user',
  'stache!templates/test_template',
  '../../mocks/dom-event',
  '../../mocks/router',
  '../../mocks/window',
  '../../lib/helpers'
],
function (chai, $, sinon, BaseView, p, Translator, EphemeralMessages, Metrics,
          AuthErrors, FxaClient, User, Template, DOMEventMock, RouterMock,
          WindowMock, TestHelpers) {
  'use strict';

  var requiresFocus = TestHelpers.requiresFocus;
  var wrapAssertion = TestHelpers.wrapAssertion;

  var assert = chai.assert;

  describe('views/base', function () {
    var view;
    var router;
    var windowMock;
    var ephemeralMessages;
    var translator;
    var metrics;
    var fxaClient;
    var user;
    var screenName = 'screen';

    var View = BaseView.extend({
      template: Template
    });


    beforeEach(function () {
      translator = new Translator('en-US', ['en-US']);
      translator.set({
        'the error message': 'a translated error message',
        'the success message': 'a translated success message'
      });

      router = new RouterMock();
      windowMock = new WindowMock();
      ephemeralMessages = new EphemeralMessages();
      metrics = new Metrics();
      fxaClient = new FxaClient();
      user = new User();

      view = new View({
        translator: translator,
        router: router,
        window: windowMock,
        ephemeralMessages: ephemeralMessages,
        metrics: metrics,
        user: user,
        fxaClient: fxaClient,
        screenName: screenName
      });

      return view.render()
          .then(function () {
            $('#container').html(view.el);
          });
    });

    afterEach(function () {
      metrics.destroy();

      if (view) {
        view.destroy();
        $('#container').empty();
      }

      view = router = windowMock = metrics = null;
    });

    describe('render', function () {
      it('renders the template without attaching it to the body', function () {
        // render is called in beforeEach
        assert.ok($('#focusMe').length);
      });

      it('updates the page title with the embedded h1 and h2 tags', function () {
        view.template = function () {
          return '<header><h1>Main title</h1><h2>Sub title</h2></header>';
        };
        return view.render()
            .then(function () {
              $('#container').html(view.el);
              assert.equal(view.titleFromView(), 'Main title: Sub title');
            });
      });


      it('updates the page title with the embedded h2 tag and base title', function () {
        view.template = function () {
          return '<header><h2>Sub title</h2></header>';
        };
        return view.render()
            .then(function () {
              assert.equal(view.titleFromView('Base title'), 'Base title: Sub title');
            });
      });

      it('updates the page title with the embedded h1 tag if no h2 tag', function () {
        view.template = function () {
          return '<header><h1>Title only</h1></header><header><h2>Not in first header</h2></header>';
        };
        return view.render()
            .then(function () {
              assert.equal(view.titleFromView(), 'Title only');
            });
      });

      it('updates the page title with the startup page title if no h1 or h2 tag', function () {
        view.template = function () {
          return '<div>no titles anywhere</div>';
        };
        return view.render()
            .then(function () {
              assert.equal(view.titleFromView(), 'Firefox Accounts Unit Tests');
            });
      });

      it('shows one time success messages', function () {
        ephemeralMessages.set('success', 'success message');
        return view.render()
            .then(function () {
              assert.equal(view.$('.success').text(), 'success message');

              return view.render();
            })
            .then(function () {
              // it's a one time message, no success message this time.
              assert.equal(view.$('.success').text(), '');
            });
      });

      it('logError is called for ephemeral error', function () {
        var error = AuthErrors.toError('UNEXPECTED_ERROR');
        sinon.spy(view, 'logError');
        ephemeralMessages.set('error', error);
        view.showEphemeralMessages();
        assert.isTrue(view.logError.called);
        assert.isTrue(error.logged);
      });

      it('displayError does not log an already logged error', function () {
        var error = AuthErrors.toError('UNEXPECTED_ERROR');
        error.logged = true;
        sinon.stub(metrics, 'logError', function () { });
        view.displayError(error);
        assert.isFalse(metrics.logError.called);
      });

      it('shows one time error messages', function () {
        ephemeralMessages.set('error', 'error message');
        return view.render()
            .then(function () {
              assert.equal(view.$('.error').text(), 'error message');

              return view.render();
            })
            .then(function () {
              // it's a one time message, no error message this time.
              assert.equal(view.$('.error').text(), '');
            });
      });

      it('has one time use data', function () {
        var data = { foo: 'bar' };
        ephemeralMessages.set('data', data);

        assert.equal(view.ephemeralData().foo, 'bar');
        assert.isUndefined(view.ephemeralData().foo);
      });

      it('redirects if the user is not authorized', function () {
        sinon.stub(view, 'isUserAuthorized', function () {
          return p(false);
        });
        return view.render()
          .then(function (result) {
            assert.isFalse(result);
            assert.equal(router.page, 'signin');
          });
      });

      it('redirects if mustVerify flag is set and account is unverified', function () {
        view.mustVerify = true;
        var account = user.initAccount({
          email: 'a@a.com',
          sessionToken: 'abc123',
          uid: 'uid'
        });
        sinon.stub(fxaClient, 'sessionStatus', function () {
          return p(true);
        });
        sinon.stub(account, 'isVerified', function () {
          return p(false);
        });
        sinon.stub(view, 'getSignedInAccount', function () {
          return account;
        });
        return view.render()
          .then(function () {
            assert.equal(router.page, 'confirm');
          });
      });

      it('succeeds if mustVerify flag is set and account has verified since being stored', function () {
        view.mustVerify = true;
        var account = user.initAccount({
          email: 'a@a.com',
          sessionToken: 'abc123',
          uid: 'uid'
        });
        sinon.stub(fxaClient, 'sessionStatus', function () {
          return p(true);
        });
        sinon.stub(account, 'isVerified', function () {
          return p(true);
        });
        sinon.stub(view, 'getSignedInAccount', function () {
          return account;
        });
        sinon.stub(user, 'setAccount', function () {
          return account;
        });
        return view.render()
          .then(function (result) {
            assert.isTrue(user.setAccount.calledWith(account));
            assert.isTrue(result);
          });
      });

      it('succeeds if mustVerify flag is set and account is verified', function () {
        view.mustVerify = true;
        var account = user.initAccount({
          email: 'a@a.com',
          sessionToken: 'abc123',
          uid: 'uid',
          verified: true
        });
        sinon.stub(fxaClient, 'sessionStatus', function () {
          return p(true);
        });
        sinon.stub(view, 'getSignedInAccount', function () {
          return account;
        });
        return view.render()
          .then(function (result) {
            assert.isTrue(result);
          });
      });
    });

    describe('afterVisible', function () {
      afterEach(function () {
        $('html').removeClass('no-touch');
      });

      it('focuses descendent element containing `autofocus` if html has `no-touch` class', function (done) {
        requiresFocus(function () {
          $('html').addClass('no-touch');
          // wekbit fails unless focusing another element first.
          $('#otherElement').focus();

          var handlerCalled = false;
          $('#focusMe').on('focus', function () {
            handlerCalled = true;
          });

          // IE focuses the elements asynchronously.
          // Add a bit of delay to give the browser time to do its thing.
          setTimeout(function () {
            assert.isTrue(handlerCalled);
            done();
          }, 200);

          view.afterVisible();
        }, done);
      });

      it('does not focus descendent element containing `autofocus` if html does not have `no-touch` class', function (done) {
        requiresFocus(function () {
          var handlerCalled = false;
          $('#focusMe').on('focus', function () {
            handlerCalled = true;
          });

          // IE focuses the elements asynchronously.
          // Add a bit of delay to give the browser time to focus
          // the element, if it erroneously does so.
          setTimeout(function () {
            assert.isFalse(handlerCalled);
            done();
          }, 200);

          view.afterVisible();
        }, done);
      });
    });

    describe('displayError/isErrorVisible/hideError', function () {
      it('translates and display an error in the .error element', function () {
        var msg = view.displayError('the error message');
        var expected = 'a translated error message';
        assert.equal(view.$('.error').html(), expected);
        assert.equal(msg, expected);

        assert.isTrue(view.isErrorVisible());
        view.hideError();
        assert.isFalse(view.isErrorVisible());
      });

      it('hides any previously displayed success messages', function () {
        view.displaySuccess('the success message');
        view.displayError('the error message');
        assert.isTrue(view.isErrorVisible());
        assert.isFalse(view.isSuccessVisible());
      });

      it('removes HTML from error messages', function () {
        view.displayError('an error message<div>with html</div>');
        assert.equal(view.$('.error').html(), 'an error message&lt;div&gt;with html&lt;/div&gt;');
      });

      it('adds an entry into the event stream', function () {
        var err = AuthErrors.toError('INVALID_TOKEN', screenName);
        view.displayError(err);

        assert.isTrue(TestHelpers.isErrorLogged(metrics, err));
      });

      it('displays an `Unexpected Error` if error is unknown', function () {
        view.displayError({ errno: -10001 });
        assert.equal(view.$('.error').html(), AuthErrors.toMessage('UNEXPECTED_ERROR'));
      });

      it('displays an `Unexpected Error` if no error passed in', function () {
        view.displayError();
        assert.equal(view.$('.error').html(), AuthErrors.toMessage('UNEXPECTED_ERROR'));
      });

      it('does not log or display an error after window.beforeunload', function () {
        view.$('.error').html('');

        $(windowMock).trigger('beforeunload');
        view.displayError(AuthErrors.toError('UNEXPECTED_ERROR'));

        assert.equal(view.$('.error').html(), '');
      });
    });

    describe('displayErrorUnsafe', function () {
      it('allows HTML in error messages', function () {
        var msg = view.displayErrorUnsafe('an error message<div>with html</div>');
        var expected = 'an error message<div>with html</div>';
        assert.equal(view.$('.error').html(), expected);
        assert.equal(msg, expected);

        assert.isTrue(view.isErrorVisible());
        view.hideError();
        assert.isFalse(view.isErrorVisible());
      });

      it('adds an entry into the event stream', function () {
        var err = AuthErrors.toError('INVALID_TOKEN', screenName);

        view.displayError(err);

        assert.isTrue(TestHelpers.isErrorLogged(metrics, err));
      });

      it('displays an `Unexpected Error` if no error passed in', function () {
        view.displayError();
        assert.equal(view.$('.error').html(), AuthErrors.toMessage('UNEXPECTED_ERROR'));
      });
    });

    describe('displaySuccess', function () {
      it('translates and display an success in the .success element', function () {
        view.displaySuccess('the success message');
        assert.equal(view.$('.success').html(), 'a translated success message');
      });

      it('hides any previously displayed error messages', function () {
        view.displayError('the error message');
        view.displaySuccess('the success message');
        assert.isTrue(view.isSuccessVisible());
        assert.isFalse(view.isErrorVisible());
      });
    });

    describe('navigate', function () {
      it('navigates to a page', function (done) {
        router.on('navigate', function (newPage) {
          wrapAssertion(function () {
            assert.equal(newPage, 'signin');
          }, done);
        });
        view.navigate('signin');
      });

      it('logs an error if an error is passed in the options', function () {
        var err = AuthErrors.toError('SESSION_EXPIRED', screenName);
        view.navigate('signin', {
          error: err
        });

        assert.isTrue(TestHelpers.isErrorLogged(metrics, err));
      });

      it('sets ephemeral data from navigate', function () {
        view.navigate('signin', {
          data: 'foo'
        });

        assert.equal(view.ephemeralData(), 'foo');
      });
    });

    describe('focus', function () {
      it('focuses an element', function (done) {
        requiresFocus(function () {
          // wekbit fails unless focusing another element first.
          $('#otherElement').focus();

          view.$('#focusMe').one('focus', function () {
            done();
          });
          view.focus('#focusMe');
        }, done);
      });
    });

    describe('trackSubview/untrackSubview', function () {
      it('trackSubview tracks a subview, untrackSubview untracks the subview', function () {
        var subview = new BaseView();
        view.trackSubview(subview);
        assert.isTrue(view.isSubviewTracked(subview));

        view.untrackSubview(subview);
        assert.isFalse(view.isSubviewTracked(subview));
      });

      it('subview is automatically untracked when destroyed', function () {
        var subview = new BaseView();
        view.trackSubview(subview);

        subview.destroy();
        assert.isFalse(view.isSubviewTracked(subview));
      });
    });

    describe('BaseView.preventDefaultThen', function () {
      it('can take the name of a function as the name of the event handler', function (done) {
        view.eventHandler = function (event) {
          wrapAssertion(function () {
            assert.isTrue(event.isDefaultPrevented());
          }, done);
        };

        var backboneHandler = BaseView.preventDefaultThen('eventHandler');
        backboneHandler.call(view, new DOMEventMock());
      });

      it('can take a function as the event handler', function (done) {
        function eventHandler(event) {
          wrapAssertion(function () {
            assert.isTrue(event.isDefaultPrevented());
          }, done);
        }

        var backboneHandler = BaseView.preventDefaultThen(eventHandler);
        backboneHandler.call(view, new DOMEventMock());
      });

      it('can take no arguments at all', function () {
        var backboneHandler = BaseView.preventDefaultThen();

        var eventMock = new DOMEventMock();
        backboneHandler.call(view, eventMock);

        assert.isTrue(eventMock.isDefaultPrevented());
      });
    });

    describe('BaseView.cancelEventThen', function () {
      it('can take the name of a function as the name of the event handler', function (done) {
        view.eventHandler = function (event) {
          wrapAssertion(function () {
            assert.isTrue(event.isDefaultPrevented());
            assert.isTrue(event.isPropagationStopped());
          }, done);
        };

        var backboneHandler = BaseView.cancelEventThen('eventHandler');
        backboneHandler.call(view, new DOMEventMock());
      });

      it('can take a function as the event handler', function (done) {
        function eventHandler(event) {
          wrapAssertion(function () {
            assert.isTrue(event.isDefaultPrevented());
            assert.isTrue(event.isPropagationStopped());
          }, done);
        }

        var backboneHandler = BaseView.cancelEventThen(eventHandler);
        backboneHandler.call(view, new DOMEventMock());
      });

      it('can take no arguments at all', function () {
        var backboneHandler = BaseView.cancelEventThen();

        var eventMock = new DOMEventMock();
        backboneHandler.call(view, eventMock);

        assert.isTrue(eventMock.isDefaultPrevented());
        assert.isTrue(eventMock.isPropagationStopped());
      });
    });

    describe('logEvent', function () {
      it('logs an event to the event stream', function () {
        view.logEvent('event1');
        assert.isTrue(TestHelpers.isEventLogged(metrics, 'event1'));
      });
    });

    describe('logError', function () {
      it('logs an error to the event stream', function () {
        var err = AuthErrors.toError('INVALID_TOKEN', screenName);

        view.logError(err);
        assert.isTrue(TestHelpers.isErrorLogged(metrics, err));
      });

      it('does not log already logged errors', function () {
        view.metrics.events.clear();

        var err = AuthErrors.toError('INVALID_TOKEN');
        view.logError(err);
        view.logError(err);

        var events = view.metrics.getFilteredData().events;
        assert.equal(events.length, 1);
      });

      it('logs an `Unexpected Error` if no error object is passed in', function () {
        view.metrics.events.clear();
        view.logError();

        var err = AuthErrors.toError('UNEXPECTED_ERROR', screenName);
        assert.isTrue(TestHelpers.isErrorLogged(metrics, err));
      });

      it('can log a string as an error', function () {
        view.metrics.events.clear();
        view.logError('foo');
        var err = new Error('foo');
        err.context = view.getScreenName();

        assert.isTrue(TestHelpers.isErrorLogged(metrics, err));
      });

      it('prints a stack trace via console.trace to facilitate debugging if no error object is passed in', function () {
        view.metrics.events.clear();
        sinon.spy(view.window.console, 'trace');

        view.logError();

        assert.isTrue(view.window.console.trace.calledOnce);
        view.window.console.trace.restore();
      });
    });

    describe('canGoBack', function () {
      it('returns true if view created with `canGoBack: true` option', function () {
        var view = new View({ canGoBack: true });
        assert.isTrue(view.canGoBack());
      });

      it('returns false if view created with `canGoBack: false` option', function () {
        var view = new View({ canGoBack: false });
        assert.isFalse(view.canGoBack());
      });
    });

    describe('context call cache', function () {
      it('multiple calls to `getContext` only call `context` once', function () {
        view._context = null;

        sinon.spy(view, 'context');

        view.getContext();
        view.getContext();

        assert.equal(view.context.callCount, 1);
      });

      it('the context cache is cleared each time `render` is called', function () {
        sinon.spy(view, 'context');

        return view.render()
          .then(function () {
            return view.render();
          })
          .then(function () {
            return view.render();
          })
          .then(function () {
            assert.equal(view.context.callCount, 3);
          });
      });
    });
  });
});
