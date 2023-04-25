/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { FlowContainer } from '../FlowContainer';
import { ProgressBar } from '../ProgressBar';
import { SecurityShieldImage } from '../../images';
import { ShieldIconListItem, KeyIconListItem } from '../../IconListItem';
import { FtlMsg } from 'fxa-react/lib/utils';
import { logViewEvent } from '../../../lib/metrics';

export type FlowRecoveryKeyInfoProps = {
  localizedBackButtonTitle: string;
  localizedPageTitle: string;
  navigateForward: () => void;
  navigateBackward: () => void;
  viewName: string;
};

export const backwardNavigationEventName = 'info.navigate-forward';
export const forwardNavigationEventName = 'info.navigate-backward';

export const FlowRecoveryKeyInfo = ({
  localizedBackButtonTitle,
  localizedPageTitle,
  navigateForward,
  navigateBackward,
  viewName,
}: FlowRecoveryKeyInfoProps) => {
  return (
    <FlowContainer
      {...{ localizedBackButtonTitle }}
      title={localizedPageTitle}
      onBackButtonClick={() => {
        logViewEvent(`flow.${viewName}`, backwardNavigationEventName);
        navigateBackward();
      }}
    >
      <ProgressBar currentStep={1} numberOfSteps={4} />
      <SecurityShieldImage className="mx-auto my-6" />
      <FtlMsg id="flow-recovery-key-info-header">
        <h2 className="font-bold text-xl mb-4">
          Create an account recovery key in case you forget your password
        </h2>
      </FtlMsg>
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
      <FtlMsg id="flow-recovery-key-info-cta-text-v2">
        <button
          className="cta-primary cta-xl mt-4"
          type="button"
          onClick={() => {
            logViewEvent(`flow.${viewName}`, forwardNavigationEventName);
            navigateForward();
          }}
        >
          Start creating your account recovery key
        </button>
      </FtlMsg>
    </FlowContainer>
  );
};

export default FlowRecoveryKeyInfo;
