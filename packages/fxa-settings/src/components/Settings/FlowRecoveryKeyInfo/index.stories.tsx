/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import FlowRecoveryKeyInfo from '.';
import { Meta } from '@storybook/react';
import { useFtlMsgResolver } from '../../../models';
import { withLocalization } from 'fxa-react/lib/storybooks';
import { RecoveryKeyAction } from '../PageRecoveryKeyCreate';

export default {
  title: 'Components/Settings/FlowRecoveryKeyInfo',
  component: FlowRecoveryKeyInfo,
  decorators: [withLocalization],
} as Meta;

const navigateBackward = () => {
  alert('navigating to previous page');
};

const navigateForward = () => {
  alert('navigating to next view within wizard');
};

const viewName = 'viewname';

export const CreateKey = () => {
  const ftlMsgResolver = useFtlMsgResolver();

  const localizedBackButtonTitle = ftlMsgResolver.getMsg(
    'recovery-key-create-back-button',
    'Back to settings'
  );
  const localizedPageTitle = ftlMsgResolver.getMsg(
    'recovery-key-create-page-title',
    'Account Recovery Key'
  );

  return (
    <FlowRecoveryKeyInfo
      {...{
        localizedBackButtonTitle,
        localizedPageTitle,
        navigateBackward,
        navigateForward,
        viewName,
      }}
    />
  );
};

export const ChangeKey = () => {
  const ftlMsgResolver = useFtlMsgResolver();

  const localizedBackButtonTitle = ftlMsgResolver.getMsg(
    'recovery-key-create-back-button',
    'Back to settings'
  );
  const localizedPageTitle = ftlMsgResolver.getMsg(
    'recovery-key-create-page-title',
    'Account Recovery Key'
  );

  return (
    <FlowRecoveryKeyInfo
      action={RecoveryKeyAction.Change}
      {...{
        localizedBackButtonTitle,
        localizedPageTitle,
        navigateBackward,
        navigateForward,
        viewName,
      }}
    />
  );
};
