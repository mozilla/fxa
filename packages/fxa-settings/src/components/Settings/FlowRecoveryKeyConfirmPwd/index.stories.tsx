/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useState } from 'react';
import { FlowRecoveryKeyConfirmPwd } from '.';
import { Meta } from '@storybook/react';
import { useFtlMsgResolver } from '../../../models';
import { withLocalization } from '../../../../.storybook/decorators';

export default {
  title: 'Components/Settings/FlowRecoveryKeyConfirmPwd',
  component: FlowRecoveryKeyConfirmPwd,
  decorators: [withLocalization],
} as Meta;

const viewName = 'example-view-name';

export const Default = () => {
  const [formattedRecoveryKey, setFormattedRecoveryKey] = useState<string>('');
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
    <FlowRecoveryKeyConfirmPwd
      {...{
        localizedBackButtonTitle,
        localizedPageTitle,
        navigateBackward,
        navigateForward,
        setFormattedRecoveryKey,
        viewName,
      }}
    />
  );
};
