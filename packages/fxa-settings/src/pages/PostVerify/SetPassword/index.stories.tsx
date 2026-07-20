/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { withLocalization } from 'fxa-react/lib/storybooks';
import SetPassword from '.';
import { Meta } from '@storybook/react';
import { SetPasswordProps } from './interfaces';
import { createMockIntegration, Subject } from './mocks';
import { createMockIntegrationWithCms, MOCK_CMS_INFO } from '../../mocks';

export default {
  title: 'Pages/PostVerify/SetPassword',
  component: SetPassword,
  decorators: [withLocalization],
} as Meta;

const storyWithProps = ({
  ...props // overrides
}: Partial<SetPasswordProps> = {}) => {
  const story = () => <Subject {...props} />;
  return story;
};

export const Default = storyWithProps();

export const ThirdPartyAuthDefault = storyWithProps({
  passwordCreationReason: 'third_party_auth',
});

export const OtpDefault = storyWithProps({
  passwordCreationReason: 'otp',
});

export const PasskeyDefault = storyWithProps({
  passwordCreationReason: 'passkey',
});

export const WithCms = storyWithProps({
  integration: createMockIntegrationWithCms(),
});

export const OtpWithCms = storyWithProps({
  passwordCreationReason: 'otp',
  integration: createMockIntegrationWithCms(),
});

export const ThirdPartyAuthWithCms = storyWithProps({
  passwordCreationReason: 'third_party_auth',
  integration: createMockIntegrationWithCms(),
});

export const PasskeyWithCms = storyWithProps({
  passwordCreationReason: 'third_party_auth',
  integration: createMockIntegrationWithCms(),
});

const cmsIntegrationWithLegalTerms = createMockIntegration(
  {
    ...MOCK_CMS_INFO,
    PostVerifySetPasswordPage: {
      ...MOCK_CMS_INFO.SignupSetPasswordPage,
      headline: 'VPN Headline (from cms)',
      description: 'VPN description (from cms)',
    },
  },
  {
    legalTerms: {
      label: 'Customized:',
      termsOfServiceLink: 'https://www.mozilla.org/customized/terms/',
      privacyNoticeLink: 'https://www.mozilla.org/customized/privacy/',
      fontSize: 'default',
    },
  }
);

export const WithCmsAndLegalTerms = storyWithProps({
  integration: cmsIntegrationWithLegalTerms,
});

export const OtpWithCmsAndLegalTerms = storyWithProps({
  passwordCreationReason: 'otp',
  integration: cmsIntegrationWithLegalTerms,
});

export const ThirdPartyWithAndCmsAndLegalTerms = storyWithProps({
  passwordCreationReason: 'third_party_auth',
  integration: cmsIntegrationWithLegalTerms,
});

export const PasskeyWithCmsAndLegalTerms = storyWithProps({
  passwordCreationReason: 'passkey',
  integration: cmsIntegrationWithLegalTerms,
});
