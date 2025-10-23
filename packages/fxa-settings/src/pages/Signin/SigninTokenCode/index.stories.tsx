/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Meta } from '@storybook/react';
import { withLocalization } from 'fxa-react/lib/storybooks';
import SigninTokenCode from '.';
import { MOCK_CMS_INFO } from '../../mocks';
import { createOAuthNativeIntegration, Subject } from './mocks';

export default {
  title: 'Pages/Signin/SigninTokenCode',
  component: SigninTokenCode,
  decorators: [withLocalization],
} as Meta;

export const Default = () => <Subject />;

export const DefaultWithCms = () => (
  <Subject integration={createOAuthNativeIntegration(true, MOCK_CMS_INFO)} />
);

export const OAuthDesktopServiceRelay = () => (
  <Subject integration={createOAuthNativeIntegration(false)} />
);
