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
import { HomePath } from '../../../constants';

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
          <FtlMsg id="flow-recovery-key-info-shield-bullet-point">
            <p className="text-sm">
              We encrypt browsing data –– passwords, bookmarks, and more. It’s
              great for privacy, but it means we can’t recover your data if you
              forget your password.
            </p>
          </FtlMsg>
        </ShieldIconListItem>
        <KeyIconListItem>
          <FtlMsg id="flow-recovery-key-info-key-bullet-point">
            <p className="text-sm">
              That’s why creating an account recovery key is so important –– you
              can use your key to get your data back.
            </p>
          </FtlMsg>
        </KeyIconListItem>
      </ul>
      {action === RecoveryKeyAction.Create && (
        <FtlMsg id="flow-recovery-key-info-cta-text-v2">
          <button
            className="cta-primary cta-xl mt-4"
            type="button"
            onClick={() => {
              logViewEvent(`flow.${viewName}`, 'create-key.start');
              navigateForward();
            }}
          >
            Start creating your account recovery key
          </button>
        </FtlMsg>
      )}
      {action === RecoveryKeyAction.Change && (
        <FtlMsg id="flow-recovery-key-info-cta-text-change-key">
          <button
            className="cta-primary cta-xl mt-4"
            type="button"
            onClick={() => {
              logViewEvent(`flow.${viewName}`, 'change-key.start');
              navigateForward();
            }}
          >
            Change account recovery key
          </button>
        </FtlMsg>
      )}

      {action === RecoveryKeyAction.Change && (
        <FtlMsg id="flow-recovery-key-info-cancel-link">
          {/* TODO: Remove feature flag param in FXA-7419 */}
          <Link
            className="link-blue text-sm mx-auto mt-4"
            to={HomePath}
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
