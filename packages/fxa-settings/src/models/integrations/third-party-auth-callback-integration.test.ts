/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { ModelDataStore, GenericData } from '../../lib/model-data';
import { ThirdPartyAuthCallbackIntegration } from './third-party-auth-callback-integration';
import { AUTH_PROVIDER } from 'fxa-auth-client/browser';

describe('models/integrations/third-party-auth-callback-integration', function () {
  let data: ModelDataStore;
  let model: ThirdPartyAuthCallbackIntegration;

  beforeEach(function () {
    data = new GenericData({});
    data.set('code', 'test-code');
    data.set('provider', 'apple');
    const state = encodeURIComponent('https://example.com?param=value');
    data.set('state', state);
    model = new ThirdPartyAuthCallbackIntegration(data);
  });

  it('exists', () => {
    expect(model).toBeDefined();
  });

  it('should return third party auth params', () => {
    const params = model.thirdPartyAuthParams();
    expect(params).toEqual({
      code: 'test-code',
      provider: AUTH_PROVIDER.APPLE,
    });
  });

  it('should return FxA params from state', () => {
    const fxaParams = model.getFxAParams();
    expect(fxaParams).toBe('?param=value');
  });
});
