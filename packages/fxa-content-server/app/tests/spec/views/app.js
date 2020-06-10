/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import $ from 'jquery';
import AppView from 'views/app';
import AuthErrors from 'lib/auth-errors';
import Backbone from 'backbone';
import chai from 'chai';
import Environment from 'lib/environment';
import KeyCodes from 'lib/key-codes';
import Notifier from 'lib/channels/notifier';
import SurveyTargeter from 'lib/survey-targeter';
import sinon from 'sinon';
import WindowMock from '../../mocks/window';
import NullStorage from '../../../scripts/lib/null-storage';

const sandbox = sinon.createSandbox();
const trueFn = sandbox.stub().returns(true);
const nullFn = sandbox.stub().returns(null);

var assert = chai.assert;

function getSurveyTargeter() {
  const config = {
    enabled: true,
    doNotBotherSpan: 12334567000,
  };
  const surveys = [
    {
      id: 'portugese-speaking-mobile-users-in-southern-hemisphere',
      conditions: { relier: null },
      view: 'settings',
      rate: 1,
      url: 'https://www.surveygizmo.com/s3/5541940/pizza',
    },
  ];

  return new SurveyTargeter({
    window: {
      localStorage: new NullStorage(),
      navigator: {
        userAgent:
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:76.0) Gecko/20100101 Firefox/76.0',
      },
    },
    relier: {
      get: nullFn,
    },
    user: {
      getSignedInAccount: trueFn,
    },
    config,
    surveys,
  });
}

describe('views/app', function () {
  var environment;
  var notifier;
  var view;
  var windowMock;

  function createDeps(additionalOptions) {
    notifier = new Notifier();
    windowMock = new WindowMock();
    environment = new Environment(windowMock);

    $('#container')
      .empty()
      .append('<a href="/signup">Sign up</a><div id="stage"></stage>');
    view = new AppView(
      Object.assign(
        {
          el: $('#container'),
          environment: environment,
          notifier: notifier,
          createView(Constructor, options) {
            return new Constructor(options);
          },
          window: windowMock,
        },
        additionalOptions
      )
    );
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

    it("does nothing if the event's default is prevented", function () {
      sinon.stub(event, 'isDefaultPrevented').callsFake(function () {
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
        render() {
          return Promise.resolve(false);
        },

        destroy() {
          isDestroyed = true;
        },

        logView() {
          isLogged = true;
        },
      });

      before(function () {
        createDeps();

        return view
          .showView(DoesNotRenderView, {})
          .then(function (_displayedView) {
            displayedView = _displayedView;
          });
      });

      it('returns `null` for the rendered view', function () {
        assert.isNull(displayedView);
      });

      it('does not log the view', function () {
        assert.isFalse(isLogged);
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
        render() {
          this.$el.html('<div id="rendered-view"></div>');
          return Promise.resolve(true);
        },
        titleFromView() {
          return 'the title';
        },
      });

      before(function () {
        createDeps();

        sinon.spy(notifier, 'trigger');
        sinon.spy(view, 'setTitle');

        return view
          .showView(ViewThatRenders, {})
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
        assert.isTrue(notifier.trigger.calledWith('view-shown', displayedView));
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
          return Promise.resolve(true);
        }),
        titleFromView() {
          return 'the title';
        },
      });

      var SecondViewThatRenders = Backbone.View.extend({
        afterVisible: sinon.spy(),
        destroy: sinon.spy(),
        logView: sinon.spy(),
        render: sinon.spy(function () {
          return Promise.resolve(true);
        }),
        titleFromView() {
          return 'the second title';
        },
      });

      before(function () {
        createDeps();

        sinon.spy(notifier, 'trigger');
        sinon.spy(view, 'setTitle');

        return view
          .showView(FirstViewThatRenders, {})
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
      var secondViewModel;

      var ViewThatRenders = Backbone.View.extend({
        afterVisible: sinon.spy(),
        destroy: sinon.spy(),
        logView: sinon.spy(),
        render: sinon.spy(function () {
          return Promise.resolve(true);
        }),
        titleFromView() {
          return 'the title';
        },
      });

      before(function () {
        secondViewModel = new Backbone.Model({
          key: 'value',
        });

        createDeps();

        sinon.spy(notifier, 'trigger');
        sinon.spy(view, 'setTitle');

        return view
          .showView(ViewThatRenders, {})
          .then(function (_firstDisplayedView) {
            firstDisplayedView = _firstDisplayedView;

            return view.showView(ViewThatRenders, {
              model: secondViewModel,
            });
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

      it("updates the view's model with data from the child", function () {
        assert.equal(secondDisplayedView.model.get('key'), 'value');
      });

      it('triggers the `navigate-from-child-view` message', function () {
        assert.isTrue(notifier.trigger.calledWith('navigate-from-child-view'));
      });

      it('sets the title', function () {
        assert.isTrue(view.setTitle.calledWith('the title'));
      });
    });

    describe('with a survey', function () {
      const ViewThatRenders = Backbone.View.extend({
        afterVisible: sinon.spy(),
        logView: sinon.spy(),
        render() {
          this.$el.html('<div id="rendered-view"></div>');
          return Promise.resolve(true);
        },
        titleFromView() {
          return 'the title';
        },
      });

      before(function () {
        createDeps({
          surveyTargeter: getSurveyTargeter(),
        });

        sinon.spy(notifier, 'trigger');
        sinon.spy(view, 'setTitle');

        return view.showView(ViewThatRenders, {
          viewName: 'settings',
        });
      });

      it('adds the survey to the DOM', function () {
        assert.equal($('.survey-wrapped').length, 1);
      });
    });

    describe('with a survey, for different view', function () {
      const ViewThatRenders = Backbone.View.extend({
        afterVisible: sinon.spy(),
        logView: sinon.spy(),
        render() {
          this.$el.html('<div id="rendered-view"></div>');
          return Promise.resolve(true);
        },
        titleFromView() {
          return 'the title';
        },
      });

      before(function () {
        createDeps({
          surveyTargeter: getSurveyTargeter(),
        });

        return view.showView(ViewThatRenders, {
          viewName: 'some-other-view',
        });
      });

      it('does not add the survey to the DOM', function () {
        assert.equal($('.survey-wrapped').length, 0);
      });
    });

    describe('with a survey, but no targeter', function () {
      let showSurveySpy;
      const ViewThatRenders = Backbone.View.extend({
        afterVisible: sinon.spy(),
        logView: sinon.spy(),
        render() {
          this.$el.html('<div id="rendered-view"></div>');
          return Promise.resolve(true);
        },
        titleFromView() {
          return 'the title';
        },
      });

      before(function () {
        createDeps();
        showSurveySpy = sinon.spy(view, '_showSurvey');
        return view.showView(ViewThatRenders, {
          viewName: 'some-other-view',
        });
      });

      it('does call showSurvey with correct arguments', function () {
        assert(showSurveySpy.called);
        assert.equal(typeof showSurveySpy.args[0][0].el, 'object');
        assert.equal(showSurveySpy.args[0][1].viewName, 'some-other-view');
      });

      it('does not add the survey to the DOM', function () {
        assert.equal($('.survey-wrapped').length, 0);
      });
    });
  });

  describe('with a view that errors', function () {
    var renderError = AuthErrors.toError('UNEXPECTED_ERROR');

    var ViewThatErrors = Backbone.View.extend({
      afterVisible: sinon.spy(),
      logView: sinon.spy(),
      render: sinon.spy(function () {
        return Promise.reject(renderError);
      }),
      titleFromView() {
        return 'the title';
      },
    });

    before(function () {
      createDeps();

      sinon.spy(view, 'fatalError');

      return view.showView(ViewThatErrors, {});
    });

    it('writes the error to the DOM', function () {
      assert.isTrue(view.fatalError.calledWith(renderError));
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
        return Promise.resolve(true);
      }),
      showChildView: sinon.spy(function (ChildView, options) {
        return new ChildView(options);
      }),
      titleFromView() {
        return 'the title';
      },
    });

    var ChildView = Backbone.View.extend({
      afterVisible: sinon.spy(),
      destroy: sinon.spy(),
      displayStatusMessages: sinon.spy(),
      logView: sinon.spy(),
      render: sinon.spy(function () {
        return Promise.resolve(true);
      }),
      titleFromView(base) {
        return base + ', the second title';
      },
    });

    before(function () {
      createDeps();

      sinon.spy(notifier, 'trigger');
      sinon.spy(view, 'setTitle');
      sinon.spy(view, 'showView');
      notifier.on('view-shown', function (_parentView) {
        parentView = _parentView;
      });

      return view
        .showChildView(ChildView, ParentView, {
          model: new Backbone.Model({ 'new-key': 'new-value' }),
        })
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

    it("updates the child's model", function () {
      assert.equal(childView.model.get('new-key'), 'new-value');
    });

    it("displays the child's status messages", function () {
      assert.isTrue(childView.displayStatusMessages.called);
    });

    it('sets the title', function () {
      assert.isTrue(view.setTitle.calledWith('the title, the second title'));
    });
  });

  describe('onKeyUp', function () {
    before(function () {
      createDeps();
      sinon.spy(view, 'navigate');
    });

    it('press escape from settings view', function () {
      view.onKeyUp({
        currentTarget: { className: 'settings' },
        which: KeyCodes.ESCAPE,
      });
      assert.isTrue(view.navigate.calledOnce);
      assert.isTrue(view.navigate.calledWith('settings'));
    });
  });
});
