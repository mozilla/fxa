/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define(function (require, exports, module) {
  'use strict';

  var $ = require('jquery');
  var AppView = require('views/app');
  var AuthErrors = require('lib/auth-errors');
  var Backbone = require('backbone');
  var chai = require('chai');
  var Environment = require('lib/environment');
  var Notifier = require('lib/channels/notifier');
  var p = require('lib/promise');
  var sinon = require('sinon');
  var WindowMock = require('../../mocks/window');

  var assert = chai.assert;

  describe('views/app', function () {
    var environment;
    var notifier;
    var view;
    var windowMock;

    function createDeps() {
      notifier = new Notifier();
      windowMock = new WindowMock();
      environment = new Environment(windowMock);

      $('#container').empty().append('<a href="/signup">Sign up</a><div id="stage"></stage>');
      view = new AppView({
        el: $('#container'),
        environment: environment,
        notifier: notifier,
        createView: function (Constructor, options) {
          return new Constructor(options);
        },
        window: windowMock
      });
    }

    describe('onAnchorClick', function () {
      var event;

      beforeEach(function () {
        createDeps();

        event = $.Event('click');
        event.currentTarget = $('a[href="/signup"]');
        sinon.spy(view, 'navigate');
      });

      function testNoNavigation() {
        view.onAnchorClick(event);
        assert.isFalse(view.navigate.called);
      }

      function setUpIFrameLink() {
        sinon.stub(environment, 'isFramed', function () {
          return true;
        });
        event.currentTarget = $('<a href="/legal/xyz">Legal Pages</a>');
      }

      it('does nothing if the event\'s default is prevented', function () {
        sinon.stub(event, 'isDefaultPrevented', function () {
          return true;
        });

        testNoNavigation();
      });

      it('does nothing if the the alt key is depressed during click', function () {
        event.altKey = true;

        testNoNavigation();
      });

      it('does nothing if the the ctrl key is depressed during click', function () {
        event.ctrlKey = true;

        testNoNavigation();
      });

      it('does nothing if the the meta key is depressed during click', function () {
        event.metaKey = true;

        testNoNavigation();
      });

      it('does nothing if the the shift key is depressed during click', function () {
        event.shiftKey = true;

        testNoNavigation();
      });

      it('does not call navigate if inside an iframe', function () {
        setUpIFrameLink();

        testNoNavigation();
      });

      it('opens a new window if inside an iframe', function () {
        setUpIFrameLink();

        sinon.spy(windowMock, 'open');
        view.onAnchorClick(event);
        assert.isTrue(windowMock.open.called);
      });

      it('navigates otherwise', function () {
        view.onAnchorClick(event);

        assert.isTrue(view.navigate.calledWith('signup'));
      });
    });

    describe('setTitle', function () {
      it('sets the document title', function () {
        view.setTitle('Foo');
        assert.equal(windowMock.document.title, 'Foo');
      });
    });

    describe('showView', function () {
      describe('with a view that does not render', function () {
        var displayedView;
        var isDestroyed = false;
        var isLogged = false;

        var DoesNotRenderView = Backbone.View.extend({
          render: function () {
            return p(false);
          },

          destroy: function () {
            isDestroyed = true;
          },

          logView: function () {
            isLogged = true;
          }
        });

        before(function () {
          createDeps();

          return view.showView(DoesNotRenderView, {})
            .then(function (_displayedView) {
              displayedView = _displayedView;
            });
        });

        it('returns `null` for the rendered view', function () {
          assert.isNull(displayedView);
        });

        it('logs the view', function () {
          assert.isTrue(isLogged);
        });

        it('destroys the view', function () {
          assert.isTrue(isDestroyed);
        });
      });

      describe('with a view that renders', function () {
        var displayedView;

        var ViewThatRenders = Backbone.View.extend({
          afterVisible: sinon.spy(),
          destroy: sinon.spy(),
          logView: sinon.spy(),
          render: function () {
            this.$el.html('<div id="rendered-view"></div>');
            return p(true);
          },
          titleFromView: function () {
            return 'the title';
          }
        });

        before(function () {
          createDeps();

          sinon.spy(notifier, 'trigger');
          sinon.spy(view, 'setTitle');

          return view.showView(ViewThatRenders, {})
            .then(function (_displayedView) {
              displayedView = _displayedView;
            });
        });

        it('returns the displayed view', function () {
          assert.ok(displayedView);
        });

        it('adds the view to the DOM', function () {
          assert.equal($('#rendered-view').length, 1);
        });

        it('calls the returned views `afterVisible`', function () {
          assert.isTrue(displayedView.afterVisible.called);
        });

        it('logs the view', function () {
          assert.isTrue(displayedView.logView.called);
        });

        it('sets the title from the text the view returns', function () {
          assert.isTrue(view.setTitle.calledWith('the title'));
        });

        it('triggers a `view-shown` message with the view', function () {
          assert.isTrue(notifier.trigger.calledWith(
              'view-shown', displayedView));
        });
      });

      describe('with a second view that renders', function () {
        var firstDisplayedView;
        var secondDisplayedView;

        var FirstViewThatRenders = Backbone.View.extend({
          afterVisible: sinon.spy(),
          destroy: sinon.spy(),
          logView: sinon.spy(),
          render: sinon.spy(function () {
            return p(true);
          }),
          titleFromView: function () {
            return 'the title';
          }
        });

        var SecondViewThatRenders = Backbone.View.extend({
          afterVisible: sinon.spy(),
          destroy: sinon.spy(),
          logView: sinon.spy(),
          render: sinon.spy(function () {
            return p(true);
          }),
          titleFromView: function () {
            return 'the second title';
          }
        });

        before(function () {
          createDeps();

          sinon.spy(notifier, 'trigger');
          sinon.spy(view, 'setTitle');

          return view.showView(FirstViewThatRenders, {})
            .then(function (_firstDisplayedView) {
              firstDisplayedView = _firstDisplayedView;
              return view.showView(SecondViewThatRenders, {});
            })
            .then(function (_secondDisplayedView) {
              secondDisplayedView = _secondDisplayedView;
            });
        });

        it('returns both views', function () {
          assert.isTrue(firstDisplayedView !== secondDisplayedView);
        });

        it('renders each view', function () {
          assert.equal(firstDisplayedView.render.callCount, 1);
          assert.equal(secondDisplayedView.render.callCount, 1);
        });

        it('destroys the first view', function () {
          assert.isTrue(firstDisplayedView.destroy.called);
        });

        it('sets the title to the second view', function () {
          assert.isTrue(view.setTitle.calledWith('the second title'));
        });
      });

      describe('with the same view that is already visible', function () {
        var firstDisplayedView;
        var secondDisplayedView;

        var ViewThatRenders = Backbone.View.extend({
          afterVisible: sinon.spy(),
          destroy: sinon.spy(),
          logView: sinon.spy(),
          render: sinon.spy(function () {
            return p(true);
          }),
          titleFromView: function () {
            return 'the title';
          }
        });

        before(function () {
          createDeps();

          sinon.spy(notifier, 'trigger');
          sinon.spy(view, 'setTitle');

          return view.showView(ViewThatRenders, {})
            .then(function (_firstDisplayedView) {
              firstDisplayedView = _firstDisplayedView;
              return view.showView(ViewThatRenders, {});
            })
            .then(function (_secondDisplayedView) {
              secondDisplayedView = _secondDisplayedView;
            });
        });

        it('returns the same view both times', function () {
          assert.strictEqual(firstDisplayedView, secondDisplayedView);
        });

        it('only renders once', function () {
          assert.equal(firstDisplayedView.render.callCount, 1);
        });

        it('triggers the `navigate-from-child-view` message', function () {
          assert.isTrue(
            notifier.trigger.calledWith('navigate-from-child-view'));
        });

        it('sets the title', function () {
          assert.isTrue(view.setTitle.calledWith('the title'));
        });
      });

      describe('with a view that errors', function () {
        var renderError = AuthErrors.toError('UNEXPECTED_ERROR');

        var ViewThatErrors = Backbone.View.extend({
          afterVisible: sinon.spy(),
          destroy: sinon.spy(),
          logView: sinon.spy(),
          render: sinon.spy(function () {
            return p.reject(renderError);
          }),
          titleFromView: function () {
            return 'the title';
          }
        });

        before(function () {
          createDeps();

          sinon.spy(view, 'navigate');

          return view.showView(ViewThatErrors, {});
        });

        it('navigates to `unexpected_error` with the error', function () {
          assert.isTrue(
            view.navigate.calledWith('unexpected_error', {
              error: renderError
            }));
        });
      });
    });

    describe('showChildView', function () {
      var parentView;
      var childView;

      var ParentView = Backbone.View.extend({
        afterVisible: sinon.spy(),
        destroy: sinon.spy(),
        logView: sinon.spy(),
        render: sinon.spy(function () {
          return p(true);
        }),
        showChildView: sinon.spy(function (ChildView, options) {
          return new ChildView(options);
        }),
        titleFromView: function () {
          return 'the title';
        }
      });

      var ChildView = Backbone.View.extend({
        afterVisible: sinon.spy(),
        destroy: sinon.spy(),
        logView: sinon.spy(),
        render: sinon.spy(function () {
          return p(true);
        }),
        titleFromView: function (base) {
          return base + ', the second title';
        }
      });

      before(function () {
        createDeps();

        sinon.spy(notifier, 'trigger');
        sinon.spy(view, 'setTitle');
        sinon.spy(view, 'showView');
        notifier.on('view-shown', function (_parentView) {
          parentView = _parentView;
        });

        return view.showChildView(ChildView, ParentView, {})
          .then(function (_childView) {
            childView = _childView;
          });
      });

      it('creates the parent view', function () {
        assert.isTrue(view.showView.calledWith(ParentView));
      });

      it('tells the parent view to show the sub view', function () {
        assert.isTrue(parentView.showChildView.calledWith(ChildView));
      });

      it('logs the child view', function () {
        assert.isTrue(childView.logView.called);
      });

      it('sets the title', function () {
        assert.isTrue(view.setTitle.calledWith('the title, the second title'));
      });
    });
  });
});
