/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Meta } from '@storybook/react';
import { withLocalization } from 'fxa-react/lib/storybooks';
import { MOCK_CMS_INFO } from '../../mocks';
import { createMockIntegration, Subject } from './mocks';

export default {
  title: 'Pages/Signup/SignupConfirmedSync',
  component: Subject,
  decorators: [withLocalization],
} as Meta;

export const Desktop = () => <Subject />;

export const DesktopWithCms = () => (
  <Subject integration={createMockIntegration({ cmsInfo: MOCK_CMS_INFO })} />
);

export const FromThirdPartyAuthSetPassword = () => (
  <Subject origin="post-verify-set-password" />
);

export const DesktopWithoutPaymentMethodsSync = () => (
  <Subject offeredSyncEngines={['bookmarks']} />
);

export const MobileNotCurrentlyUsed = () => (
  <Subject integration={createMockIntegration({ isDesktopSync: false })} />
);
