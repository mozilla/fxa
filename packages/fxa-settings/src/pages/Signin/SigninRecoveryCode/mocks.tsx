/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { MozServices } from '../../../lib/types';
import {
  IntegrationType,
  OAuthNativeIntegration,
  RelierCmsInfo,
  WebIntegration,
} from '../../../models';

export const mockWebIntegration = {
  type: IntegrationType.Web,
  getService: () => MozServices.Default,
  isSync: () => false,
  wantsKeys: () => false,
  isFirefoxClientServiceRelay: () => false,
  isFirefoxClientServiceSmartWindow: () => false,
  isFirefoxClientServiceVpn: () => false,
  getCmsInfo: () => undefined,
  data: {
    validate: () => {},
  },
} as WebIntegration;

export const createMockOAuthNativeIntegration = (
  isSync = true,
  cmsInfo?: RelierCmsInfo
) =>
  ({
    type: IntegrationType.OAuthNative,
    getService: () => MozServices.FirefoxSync,
    isSync: () => isSync,
    wantsKeys: () => false,
    isFirefoxClientServiceRelay: () => !isSync,
    getCmsInfo: () => cmsInfo,
    data: {
      validate: () => {},
    },
  }) as OAuthNativeIntegration;

export * from '../../mocks';
