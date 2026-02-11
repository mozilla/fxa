/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { assert } from 'chai';
import BaseView from 'views/base';
import Cocktail from 'cocktail';
import Relier from 'models/reliers/base';
import sinon from 'sinon';
import ThirdPartyAuthMixin from 'views/mixins/third-party-auth-mixin';
import Notifier from 'lib/channels/notifier';
import Metrics from 'lib/metrics';
import GleanMetrics from '../../../../scripts/lib/glean';
import SentryMetrics from 'lib/sentry';
import WindowMock from '../../../mocks/window';
import Storage from 'lib/storage';
import User from 'models/user';

const View = BaseView.extend({
  template: () => '<div><div class="views"></div></div>',
});

Cocktail.mixin(View, ThirdPartyAuthMixin);

function assertInputEl(el, name, value) {
  assert.isTrue(el.setAttribute.calledWith('type', 'hidden'));
  assert.isTrue(el.setAttribute.calledWith('name', name));
  assert.isTrue(el.setAttribute.calledWith('value', value));
}

describe('views/mixins/third-party-auth-mixin', function () {
  let relier;
  let view;
  let windowMock;
  let config;
  let user;
  let notifier;
  let mockForm;
  let mockInput;
  let metrics;
  let sentryMetrics;

  beforeEach(async () => {
    relier = new Relier();
    windowMock = new WindowMock();
    config = {
      googleAuthConfig: {
        clientId: 'MOCK_CLIENT_ID',
        redirectUri: 'http://redirect.com',
        authorizationEndpoint: 'http://example.com',
      },
      appleAuthConfig: {
        clientId: 'MOCK_CLIENT_ID',
        redirectUri: 'http://redirect.com',
        authorizationEndpoint: 'http://example.com',
      },
    };

    mockForm = document.createElement('form');
    mockInput = document.createElement('input');
    sinon.stub(mockForm);
    sinon.stub(mockInput);
    sinon.stub(windowMock.document, 'createElement').callsFake((type) => {
      if (type === 'form') {
        return mockForm;
      }
      return mockInput;
    });
    notifier = new Notifier();
    user = new User();
    sentryMetrics = new SentryMetrics();
    metrics = new Metrics({ notifier, sentryMetrics });
    view = new View({
      config,
      relier,
      notifier,
      metrics,
      window: windowMock,
      user,
    });
    sinon.spy(notifier, 'trigger');
    sinon.stub(metrics, 'getFlowEventMetadata').callsFake(() => ({
      flowId: '123',
      flowBeginTime: '456',
      deviceId: '789',
    }));
    sinon.stub(GleanMetrics.thirdPartyAuth, 'appleDeeplink');
    sinon.stub(GleanMetrics.thirdPartyAuth, 'googleDeeplink');
    await view.render();
  });

  afterEach(() => {
    GleanMetrics.thirdPartyAuth.appleDeeplink.restore();
    GleanMetrics.thirdPartyAuth.googleDeeplink.restore();
  });

  describe('beforeRender', () => {
    beforeEach(() => {
      sinon.spy(view, 'logViewEvent');
      sinon.spy(view, 'logFlowEvent');
      sinon.stub(view, 'completeSignIn');
      sinon.stub(view, 'appleSignIn');
      sinon.stub(view, 'googleSignIn');
    });

    it('no deeplink', () => {
      view.beforeRender();
      assert.isTrue(view.logViewEvent.calledOnceWith('thirdPartyAuth'));
    });

    it('with third party auth set from `enter-email`', () => {
      view.viewName = 'enter-email';
      Storage.factory('localStorage', windowMock).set(
        'fxa_third_party_params',
        'some params'
      );
      view.beforeRender();
      assert.isTrue(view.completeSignIn.calledOnce);
      assert.isTrue(notifier.trigger.calledOnce);
      assert.isTrue(notifier.trigger.calledWith('flow.initialize'));
      assert.isFalse(view.logViewEvent.called);
    });

    it('with third party auth set from other', () => {
      Storage.factory('localStorage', windowMock).set(
        'fxa_third_party_params',
        'some params'
      );
      view.beforeRender();
      assert.isTrue(view.completeSignIn.notCalled);
    });

    it('google login deeplink', () => {
      windowMock.location.search = '?deeplink=googleLogin';
      view
        .beforeRender()
        .then(() => {
          assert.isTrue(view.googleSignIn.calledOnce);
          assert.isTrue(view.logFlowEvent.calledOnceWith('google.deeplink'));
          assert.isTrue(GleanMetrics.thirdPartyAuth.googleDeeplink.calledOnce);
        })
        .catch(() => assert.fail());
    });

    it('apple login deeplink', () => {
      windowMock.location.search = '?deeplink=appleLogin';
      view
        .beforeRender()
        .then(() => {
          assert.isTrue(view.appleSignIn.calledOnce);
          assert.isTrue(view.logFlowEvent.calledOnceWith('apple.deeplink'));
          assert.isTrue(GleanMetrics.thirdPartyAuth.appleDeeplink.calledOnce);
        })
        .catch(() => assert.fail());
    });
  });

  it('clearStoredParams', () => {
    view.clearStoredParams();
    assert.isUndefined(windowMock.localStorage.get('fxa_third_party_params'));
  });

  it('googleSignIn', () => {
    sinon.spy(view, 'logFlowEvent');

    windowMock.location.href = 'http://127.0.0.1:3030/?original_oauth_params';

    view.googleSignIn();

    assert.isTrue(view.logFlowEvent.calledWith('google.oauth-start'));

    assert.isTrue(metrics.getFlowEventMetadata.calledOnce);

    assert.isTrue(mockForm.setAttribute.calledWith('method', 'GET'));
    assert.isTrue(
      mockForm.setAttribute.calledWith(
        'action',
        config.googleAuthConfig.authorizationEndpoint
      )
    );

    assert.equal(mockInput.setAttribute.args.length, 27);

    assertInputEl(mockInput, 'client_id', config.googleAuthConfig.clientId);
    assertInputEl(mockInput, 'scope', 'openid email profile');
    assertInputEl(
      mockInput,
      'redirect_uri',
      config.googleAuthConfig.redirectUri
    );
    assertInputEl(
      mockInput,
      'state',
      encodeURIComponent(
        `${windowMock.location.origin}${windowMock.location.pathname}?flowId=123&flowBeginTime=456&deviceId=789`
      )
    );
    assertInputEl(mockInput, 'access_type', 'offline');
    assertInputEl(mockInput, 'prompt', 'consent');
    assertInputEl(mockInput, 'response_type', 'code');
    assertInputEl(mockInput, 'disallow_webview', true);
    assertInputEl(mockInput, 'ack_webview_shutdown', '2024-09-30');

    assert.equal(mockForm.appendChild.args.length, 9);
    assert.isTrue(mockForm.submit.calledOnce);
  });

  it('appleSignIn', () => {
    sinon.spy(view, 'logFlowEvent');

    windowMock.location.href = 'http://127.0.0.1:3030/?original_oauth_params';

    view.appleSignIn();

    assert.isTrue(view.logFlowEvent.calledWith('apple.oauth-start'));

    assert.isTrue(metrics.getFlowEventMetadata.calledOnce);

    assert.isTrue(mockForm.setAttribute.calledWith('method', 'GET'));
    assert.isTrue(
      mockForm.setAttribute.calledWith(
        'action',
        config.appleAuthConfig.authorizationEndpoint
      )
    );

    assert.equal(mockInput.setAttribute.args.length, 24);

    assertInputEl(mockInput, 'client_id', config.appleAuthConfig.clientId);
    assertInputEl(mockInput, 'scope', 'email');
    assertInputEl(
      mockInput,
      'redirect_uri',
      config.appleAuthConfig.redirectUri
    );
    assertInputEl(
      mockInput,
      'state',
      encodeURIComponent(
        `${windowMock.location.origin}${windowMock.location.pathname}?flowId=123&flowBeginTime=456&deviceId=789`
      )
    );
    assertInputEl(mockInput, 'access_type', 'offline');
    assertInputEl(mockInput, 'prompt', 'consent');
    assertInputEl(mockInput, 'response_type', 'code id_token');
    assertInputEl(mockInput, 'response_mode', 'form_post');

    assert.equal(mockForm.appendChild.args.length, 8);
    assert.isTrue(mockForm.submit.calledOnce);
  });

  describe('handleOauthResponse', () => {
    it('navigates away', () => {
      const redirectUrl = encodeURIComponent(
        `${windowMock.location.origin}/go/there`
      );
      windowMock.location.search = `?state=${redirectUrl}`;
      sinon.stub(view, 'navigateAway');

      view.handleOauthResponse();

      assert.isTrue(
        view.navigateAway.calledOnceWith(
          `${windowMock.location.origin}/go/there`
        )
      );
    });

    it('navigates home', () => {
      windowMock.location.search = '?state=quux';
      sinon.stub(view, 'navigateAway');

      view.handleOauthResponse();

      assert.isTrue(view.navigateAway.calledOnceWith('/'));
    });
  });

  it('completeSignIn', async () => {
    sinon.stub(user, 'verifyAccountThirdParty').callsFake(async () => {});
    sinon.stub(view, 'signIn').callsFake(() => {});
    sinon.stub(view, 'getSignedInAccount').callsFake(() => {});
    sinon.spy(view, 'clearStoredParams');
    sinon.spy(view, 'logFlowEvent');

    Storage.factory('localStorage', windowMock).set('fxa_third_party_params', {
      code: '123',
    });

    await view.completeSignIn();

    assert.isTrue(
      user.verifyAccountThirdParty.calledOnceWith(undefined, relier, '123')
    );
    assert.isTrue(view.clearStoredParams.calledOnce);
    assert.isTrue(view.signIn.calledOnceWith(undefined));
    assert.isTrue(view.logFlowEvent.calledWith('google.signin-complete'));
  });
});
