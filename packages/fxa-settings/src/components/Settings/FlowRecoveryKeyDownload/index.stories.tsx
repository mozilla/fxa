/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import FlowRecoveryKeyDownload from '.';
import { Meta } from '@storybook/react';
import { useFtlMsgResolver } from '../../../models';
import { withLocalization } from 'fxa-react/lib/storybooks';
import { MOCK_RECOVERY_KEY_VALUE } from './mocks';
import { MOCK_EMAIL } from '../../../pages/mocks';

export default {
  title: 'Components/Settings/FlowRecoveryKeyDownload',
  component: FlowRecoveryKeyDownload,
  decorators: [withLocalization],
} as Meta;

const viewName = 'example-view-name';

export const Default = () => {
  const ftlMsgResolver = useFtlMsgResolver();
  const localizedBackButtonTitle = ftlMsgResolver.getMsg(
    'recovery-key-create-back-button',
    'Back to settings'
  );
  const localizedPageTitle = ftlMsgResolver.getMsg(
    'recovery-key-create-page-title',
    'Account Recovery Key'
  );

  const navigateBackward = () => {
    alert('navigating to previous page');
  };

  const navigateForward = () => {
    alert('navigating to next view within wizard');
  };

  return (
    <FlowRecoveryKeyDownload
      {...{
        localizedBackButtonTitle,
        localizedPageTitle,
        navigateBackward,
        navigateForward,
        viewName,
        email: MOCK_EMAIL,
      }}
      email={MOCK_EMAIL}
      recoveryKeyValue={MOCK_RECOVERY_KEY_VALUE}
    />
  );
};
