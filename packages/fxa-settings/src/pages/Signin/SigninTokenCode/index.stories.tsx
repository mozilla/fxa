/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import SigninTokenCode from '.';
import { Meta } from '@storybook/react';
import { withLocalization, withLocation } from 'fxa-react/lib/storybooks';
import { createOAuthNativeIntegration, Subject } from './mocks';
import { MOCK_CMS_INFO } from '../../mocks';
import { AppContext } from '../../../models';
import { mockAppContext } from '../../../models/mocks';

export default {
  title: 'Pages/Signin/SigninTokenCode',
  component: SigninTokenCode,
  decorators: [
    withLocalization,
    withLocation(),
    (Story) => (
      <AppContext.Provider value={mockAppContext()}>
        <Story />
      </AppContext.Provider>
    ),
  ],
} as Meta;

export const Default = () => <Subject />;

export const DefaultWithCms = () => (
  <Subject integration={createOAuthNativeIntegration(true, MOCK_CMS_INFO)} />
);

export const SplitLayoutWithCms = () => (
  <Subject
    integration={createOAuthNativeIntegration(true, {
      ...MOCK_CMS_INFO,
      SigninTokenCodePage: {
        ...MOCK_CMS_INFO.SigninTokenCodePage!,
        splitLayout: true,
      },
    })}
  />
);
