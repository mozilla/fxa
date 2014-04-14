/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';


define([
  'chai',
  'jquery',
  'views/base',
  'lib/translator',
  'stache!templates/test_template',
  '../../mocks/dom-event',
  '../../mocks/router',
  '../../mocks/window',
  '../../lib/helpers'
],
function (chai, jQuery, BaseView, Translator, Template, DOMEventMock,
          RouterMock, WindowMock, TestHelpers) {
  var requiresFocus = TestHelpers.requiresFocus;
  var wrapAssertion = TestHelpers.wrapAssertion;

  /*global describe, beforeEach, afterEach, it*/
  var assert = chai.assert;

  describe('views/base', function () {
    var view, router, windowMock;

    beforeEach(function () {
      translator = new Translator('en-US', ['en-US']);
      translator.set({
        'the error message': 'a translated error message',
        'the success message': 'a translated success message'
      });

      router = new RouterMock();
      windowMock = new WindowMock();

      var View = BaseView.extend({
        template: Template
      });

      view = new View({
        translator: translator,
        router: router,
        window: windowMock
      });

      return view.render()
          .then(function () {
            jQuery('body').append(view.el);
          });
    });

    afterEach(function () {
      if (view) {
        view.destroy();
        jQuery(view.el).remove();
        view = router = windowMock = null;
      }
    });

    describe('render', function () {
      it('renders the template without attaching it to the body', function () {
        // render is called in beforeEach
        assert.ok(jQuery('#focusMe').length);
      });

      it('updates the page title with the embedded h1 and h2 tags', function () {
        view.template = function () {
          return '<h1>Main title</h1><h2>Sub title</h2>';
        };
        return view.render()
            .then(function () {
              assert.equal(windowMock.document.title, 'Main title: Sub title');
            });
      });

      it('updates the page title with the embedded h1 tag if no h2 tag', function () {
        view.template = function () {
          return '<h1>Title only</h1>';
        };
        return view.render()
            .then(function () {
              assert.equal(windowMock.document.title, 'Title only');
            });
      });

      it('updates the page title with the startup page title if no h1 or h2 tag', function () {
        view.template = function () {
          return '<div>no titles anywhere</div>';
        };
        return view.render()
            .then(function () {
              assert.equal(windowMock.document.title, 'Firefox Accounts Unit Tests');
            });
      });
    });

    describe('afterVisible', function () {
      afterEach(function () {
        jQuery('html').removeClass('no-touch');
      });

      it('focuses descendent element containing `autofocus` if html has `no-touch` class', function () {
        requiresFocus(function () {
          jQuery('html').addClass('no-touch');

          var handlerCalled = false;
          jQuery('#focusMe').on('focus', function () {
            handlerCalled = true;
          });
          view.afterVisible();

          assert.isTrue(handlerCalled);
        });
      });

      it('does not focus descendent element containing `autofocus` if html does not have `no-touch` class', function () {
        requiresFocus(function () {
          var handlerCalled = false;
          jQuery('#focusMe').on('focus', function () {
            handlerCalled = true;
          });
          view.afterVisible();

          assert.isFalse(handlerCalled);
        });
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
        assert.isFalse(view.$('.success').is(':visible'));
      });

      it('removes HTML from error messages', function () {
        view.displayError('an error message<div>with html</div>');
        assert.equal(view.$('.error').html(), 'an error message&lt;div&gt;with html&lt;/div&gt;');
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
    });

    describe('displaySuccess', function () {
      it('translates and display an success in the .success element', function () {
        view.displaySuccess('the success message');
        assert.equal(view.$('.success').html(), 'a translated success message');
      });

      it('hides any previously displayed error messages', function () {
        view.displayError('the error message');
        view.displaySuccess('the success message');
        assert.isFalse(view.$('.error').is(':visible'));
      });
    });

    describe('navigate', function () {
      it('navigates to a page', function (done) {
        router.on('navigate', function (newPage) {
          wrapAssertion(function() {
            assert.equal(newPage, 'signin');
          }, done);
        });
        view.navigate('signin');
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
          wrapAssertion(function() {
            assert.isTrue(event.isDefaultPrevented());
          }, done);
        };

        var backboneHandler = BaseView.preventDefaultThen('eventHandler');
        backboneHandler.call(view, new DOMEventMock());
      });

      it('can take a function as the event handler', function (done) {
        function eventHandler(event) {
          wrapAssertion(function() {
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
  });
});

