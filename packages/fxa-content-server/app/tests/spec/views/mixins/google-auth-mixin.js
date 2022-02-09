/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { assert } from 'chai';
import BaseView from 'views/base';
import Cocktail from 'cocktail';
import Relier from 'models/reliers/base';
import sinon from 'sinon';
import GoogleAuthMixin from 'views/mixins/google-auth-mixin';
import Notifier from 'lib/channels/notifier';
import WindowMock from '../../../mocks/window';
import Storage from 'lib/storage';
import User from 'models/user';

const View = BaseView.extend({
  template: () => '<div><div class="views"></div></div>',
});

Cocktail.mixin(View, GoogleAuthMixin);

function assertInputEl(el, name, value) {
  assert.isTrue(el.setAttribute.calledWith('type', 'hidden'));
  assert.isTrue(el.setAttribute.calledWith('name', name));
  assert.isTrue(el.setAttribute.calledWith('value', value));
}

describe('views/mixins/google-auth-mixin', function () {
  let relier;
  let view;
  let windowMock;
  let config;
  let user;
  let notifier;
  let mockForm;
  let mockInput;

  beforeEach(async () => {
    relier = new Relier();
    windowMock = new WindowMock();
    config = {
      googleAuthConfig: {
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

    view = new View({
      config,
      relier,
      notifier,
      window: windowMock,
      user,
    });

    await view.render();
  });

  it('beforeRender', () => {
    sinon.stub(view, 'completeSignIn');
    Storage.factory('localStorage', windowMock).set(
      'fxa_third_party_params',
      'some params'
    );

    view.beforeRender();
    assert.isTrue(view.completeSignIn.calledOnce);
  });

  it('clearStoredParams', () => {
    view.clearStoredParams();
    assert.isUndefined(windowMock.localStorage.get('fxa_third_party_params'));
  });

  it('googleSignIn', async () => {
    windowMock.location.search = '?orignal_oauth_params';

    view.googleSignIn();

    assert.isTrue(mockForm.setAttribute.calledWith('method', 'GET'));
    assert.isTrue(
      mockForm.setAttribute.calledWith(
        'action',
        config.googleAuthConfig.authorizationEndpoint
      )
    );

    assert.equal(mockInput.setAttribute.args.length, 21);

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
      encodeURIComponent(windowMock.location.search)
    );
    assertInputEl(mockInput, 'access_type', 'offline');
    assertInputEl(mockInput, 'prompt', 'consent');
    assertInputEl(mockInput, 'response_type', 'code');

    assert.equal(mockForm.appendChild.args.length, 7);
    assert.isTrue(mockForm.submit.calledOnce);
  });

  it('handleOauthResponse', () => {
    windowMock.location.search = '?state=state';
    sinon.stub(view, 'navigateAway');

    view.handleOauthResponse();
    assert.isTrue(view.navigateAway.calledOnceWith(`/oauth/state`));
  });

  it('completeSignIn', async () => {
    sinon.stub(user, 'verifyAccountThirdParty').callsFake(async () => {});
    sinon.stub(view, 'signIn').callsFake(() => {});
    sinon.stub(view, 'getSignedInAccount').callsFake(() => {});
    sinon.spy(view, 'clearStoredParams');
    Storage.factory('localStorage', windowMock).set('fxa_third_party_params', {
      code: '123',
    });

    await view.completeSignIn();

    assert.isTrue(
      user.verifyAccountThirdParty.calledOnceWith(undefined, relier, '123')
    );
    assert.isTrue(view.clearStoredParams.calledOnce);
    assert.isTrue(view.signIn.calledOnceWith(undefined));
  });
});
