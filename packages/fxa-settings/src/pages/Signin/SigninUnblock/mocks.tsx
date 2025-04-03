/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Redirect } from '@reach/router';
import { GenericData } from '../../../lib/model-data';
import { MozServices } from '../../../lib/types';
import {
  IntegrationType,
  WebIntegration,
  WebIntegrationData,
} from '../../../models';
import { MOCK_EMAIL, MOCK_AUTH_PW, MOCK_UID } from '../../mocks';

export { CREDENTIAL_STATUS_MUTATION, BEGIN_SIGNIN_MUTATION } from '../gql';

export const MOCK_SIGNIN_UNBLOCK_LOCATION_STATE = {
  email: MOCK_EMAIL,
  hasLinkedAccount: false,
  hasPassword: true,
  authPW: MOCK_AUTH_PW,
};

export function createMockWebIntegration(
  data?: Pick<WebIntegrationData, 'redirectTo'>
) {
  const { redirectTo } = data || {};
  return {
    type: IntegrationType.Web,
    data: new WebIntegrationData(
      new GenericData({
        service: MozServices.Default,
        uid: MOCK_UID,
        redirectTo,
      })
    ),
    getService: () => MozServices.Default,
    getClientId: () => undefined,
    isSync: () => false,
    wantsKeys: () => false,
    wantsTwoStepAuthentication: () => false,
    isDesktopSync: () => false,
    isDesktopRelay: () => false,
  };

  // TBD: Would this better for our tests? Are we hitting problems due to integration state being unexpected?
  //
  // const integration = new WebIntegration(
  //   new GenericData({
  //     service: MozServices.Default,
  //     uid: MOCK_UID,
  //     redirectTo: redirectTo,
  //   })
  // );

  // expect(integration.type).toEqual(IntegrationType.Web);
  // expect(integration.getService()).toEqual(MozServices.Default);
  // expect(integration.getClientId()).toEqual(undefined);
  // expect(integration.getClientId()).toEqual(undefined);
  // expect(integration.isSync()).toBeFalsy();
  // expect(integration.wantsKeys()).toBeFalsy();
  // expect(integration.wantsTwoStepAuthentication()).toBeFalsy();
  // expect(integration.isDesktopSync()).toBeFalsy();
  // expect(integration.isDesktopRelay()).toBeFalsy();
  // expect(integration.data.redirectTo).toEqual(redirectTo);

  // return integration;
}

export function createMockSigninWebSyncIntegration() {
  return {
    type: IntegrationType.SyncDesktopV3,
    isSync: () => true,
    getService: () => MozServices.FirefoxSync,
    getClientId: () => undefined,
    wantsKeys: () => true,
    wantsTwoStepAuthentication: () => false,
    data: new WebIntegrationData(new GenericData({})),
    isDesktopSync: () => true,
    isDesktopRelay: () => false,
    wantsLogin: () => false,
  };
}
