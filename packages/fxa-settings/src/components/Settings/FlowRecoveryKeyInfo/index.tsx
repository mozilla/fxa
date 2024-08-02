/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useEffect } from 'react';
import { FlowContainer } from '../FlowContainer';
import { ProgressBar } from '../ProgressBar';
import { SecurityShieldImage } from '../../images';
import { ShieldIconListItem, KeyIconListItem } from '../../IconListItem';
import { FtlMsg } from 'fxa-react/lib/utils';
import { logViewEvent } from '../../../lib/metrics';
import { RecoveryKeyAction } from '../PageRecoveryKeyCreate';
import { Link } from '@reach/router';
import { SETTINGS_PATH } from '../../../constants';

export type FlowRecoveryKeyInfoProps = {
  action?: RecoveryKeyAction;
  localizedBackButtonTitle: string;
  localizedPageTitle: string;
  navigateForward: () => void;
  navigateBackward: () => void;
  viewName: string;
};

export const FlowRecoveryKeyInfo = ({
  action = RecoveryKeyAction.Create,
  localizedBackButtonTitle,
  localizedPageTitle,
  navigateForward,
  navigateBackward,
  viewName,
}: FlowRecoveryKeyInfoProps) => {
  useEffect(() => {
    action === RecoveryKeyAction.Create
      ? logViewEvent(`flow.${viewName}`, 'create-key.info')
      : logViewEvent(`flow.${viewName}`, 'change-key.info');
  }, [action, viewName]);

  return (
    <FlowContainer
      {...{ localizedBackButtonTitle }}
      title={localizedPageTitle}
      onBackButtonClick={() => {
        action === RecoveryKeyAction.Create
          ? logViewEvent(`flow.${viewName}`, 'create-key.cancel')
          : logViewEvent(`flow.${viewName}`, 'change-key.cancel');
        navigateBackward();
      }}
    >
      <ProgressBar currentStep={1} numberOfSteps={4} />
      <SecurityShieldImage className="mx-auto my-6" />
      {action === RecoveryKeyAction.Create ? (
        <FtlMsg id="flow-recovery-key-info-header">
          <h2 className="font-bold text-xl mb-4">
            Create an account recovery key in case you forget your password
          </h2>
        </FtlMsg>
      ) : (
        <FtlMsg id="flow-recovery-key-info-header-change-key">
          <h2 className="font-bold text-xl mb-4">
            Change your account recovery key
          </h2>
        </FtlMsg>
      )}

      <ul>
        <ShieldIconListItem>
          <FtlMsg id="flow-recovery-key-info-shield-bullet-point-v2">
            <p className="text-sm">
              We encrypt browsing data –– passwords, bookmarks, and more. It’s
              great for privacy, but you may lose your data if you forget your
              password.
            </p>
          </FtlMsg>
        </ShieldIconListItem>
        <KeyIconListItem>
          <FtlMsg id="flow-recovery-key-info-key-bullet-point-v2">
            <p className="text-sm">
              That’s why creating an account recovery key is so important –– you
              can use it to restore your data.
            </p>
          </FtlMsg>
        </KeyIconListItem>
      </ul>

      <FtlMsg id="flow-recovery-key-info-cta-text-v3">
        <button
          className="cta-primary cta-xl mt-4"
          type="button"
          onClick={() => {
            action === RecoveryKeyAction.Create &&
              logViewEvent(`flow.${viewName}`, 'create-key.start');
            action === RecoveryKeyAction.Change &&
              logViewEvent(`flow.${viewName}`, 'change-key.start');
            navigateForward();
          }}
        >
          Get started
        </button>
      </FtlMsg>

      {action === RecoveryKeyAction.Change && (
        <FtlMsg id="flow-recovery-key-info-cancel-link">
          <Link
            className="link-blue text-sm mx-auto mt-4"
            to={SETTINGS_PATH}
            onClick={() =>
              logViewEvent(`flow.${viewName}`, 'change-key.cancel')
            }
          >
            Cancel
          </Link>
        </FtlMsg>
      )}
    </FlowContainer>
  );
};

export default FlowRecoveryKeyInfo;
