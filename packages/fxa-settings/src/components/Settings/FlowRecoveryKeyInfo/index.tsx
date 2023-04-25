/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { FlowContainer } from '../FlowContainer';
import { ProgressBar } from '../ProgressBar';
import { SecurityShieldImage } from '../../images';
import { ShieldIconListItem, KeyIconListItem } from '../../IconListItem';
import { FtlMsg } from 'fxa-react/lib/utils';
import { useFtlMsgResolver } from '../../../models';
import { logViewEvent, usePageViewEvent } from '../../../lib/metrics';

export type FlowRecoveryKeyInfoProps = {
  navigateForward: () => void;
  navigateBackward: () => void;
  localizedPageTitle: string;
};

export const viewName = 'settings.account-recovery.info';
export const backwardNavigationEventName = 'navigate-forward';
export const forwardNavigationEventName = 'navigate-backward';

export const FlowRecoveryKeyInfo = ({
  navigateForward,
  navigateBackward,
  localizedPageTitle,
}: FlowRecoveryKeyInfoProps) => {
  /*
   * TODO:
   * logging a page view event for each step of the flow may be excessive --
   * resolve what metrics are needed and adjust accordingly in FXA-7249
   */
  usePageViewEvent(viewName);
  const ftlMsgResolver = useFtlMsgResolver();

  const localizedBackButtonTitle = ftlMsgResolver.getMsg(
    'flow-recovery-key-info-back-button-title',
    'Back to settings'
  );

  return (
    <FlowContainer
      title={localizedPageTitle}
      localizedBackButtonTitle={localizedBackButtonTitle}
      onBackButtonClick={() => {
        logViewEvent(viewName, backwardNavigationEventName);
        navigateBackward();
      }}
    >
      <div className="w-full flex flex-col">
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
                great for privacy, but it means we can’t recover your data if
                you forget your password.
              </p>
            </FtlMsg>
          </ShieldIconListItem>
          <KeyIconListItem>
            <FtlMsg id="flow-recovery-key-info-key-bullet-point">
              <p className="text-sm">
                That’s why creating an account recovery key is so important ––
                you can use your key to get your data back.
              </p>
            </FtlMsg>
          </KeyIconListItem>
        </ul>
        <FtlMsg id="flow-recovery-key-info-cta-text">
          <button
            className="cta-primary cta-xl"
            type="button"
            onClick={() => {
              logViewEvent(viewName, forwardNavigationEventName);
              navigateForward();
            }}
          >
            Start creating your recovery key
          </button>
        </FtlMsg>
      </div>
    </FlowContainer>
  );
};

export default FlowRecoveryKeyInfo;
