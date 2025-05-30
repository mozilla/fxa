/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useEffect } from 'react';
import { FtlMsg } from 'fxa-react/lib/utils';
import { useAccount } from '../../../models';
import FlowContainer from '../FlowContainer';
import ProgressBar from '../ProgressBar';
import { GleanClickEventType2FA } from '../../../lib/types';
import DataBlock from '../../DataBlock';
import GleanMetrics from '../../../lib/glean';

type FlowSetup2faBackupCodeDownloadProps = {
  currentStep?: number;
  hideBackButton?: boolean;
  localizedFlowTitle: string;
  numberOfSteps?: number;
  onBackButtonClick?: () => void;
  showProgressBar?: boolean;
  totpInfo: {
    recoveryCodes: string[];
  };
  onContinue: () => void;
  reason?: GleanClickEventType2FA;
};

export const FlowSetup2faBackupCodeDownLoad = ({
  currentStep,
  hideBackButton = false,
  localizedFlowTitle,
  numberOfSteps,
  onBackButtonClick,
  showProgressBar = true,
  totpInfo,
  onContinue,
  reason = GleanClickEventType2FA.setup,
}: FlowSetup2faBackupCodeDownloadProps) => {
  const account = useAccount();

  useEffect(() => {
    GleanMetrics.accountPref.twoStepAuthCodesView({
      event: { reason: GleanClickEventType2FA.setup },
    });
  }, []);

  return (
    <FlowContainer
      title={localizedFlowTitle}
      {...{ hideBackButton, onBackButtonClick }}
    >
      {showProgressBar && currentStep && numberOfSteps && (
        <ProgressBar {...{ currentStep, numberOfSteps }} />
      )}
      <FtlMsg id="flow-setup-2fa-backup-code-dl-heading">
        <h2 className="font-bold text-[24px] my-2">
          Save backup authentication codes
        </h2>
      </FtlMsg>

      <div className="my-2" data-testid="2fa-recovery-codes">
        <FtlMsg id="flow-setup-2fa-backup-code-dl-save-these-codes">
          Keep these in a place you’ll remember. If you don’t have access to
          your authenticator app you’ll need to enter one to sign in.
        </FtlMsg>
        <div className="mt-6 flex flex-col items-center justify-between">
          <DataBlock
            value={totpInfo.recoveryCodes}
            contentType="Backup authentication codes"
            email={account.primaryEmail.email}
            gleanDataAttrs={{
              download: {
                id: 'two_step_auth_codes_download',
                type: reason,
              },
              copy: {
                id: 'two_step_auth_codes_copy',
                type: reason,
              },
              print: {
                id: 'two_step_auth_codes_print',
                type: reason,
              },
            }}
          />
        </div>
      </div>
      <FtlMsg id="flow-setup-2fa-backup-code-dl-button-continue">
        <button
          data-testid="ack-recovery-code"
          type="submit"
          className="cta-primary cta-base-p mt-3"
          onClick={onContinue}
          data-glean-id="two_step_auth_codes_submit"
          data-glean-type={GleanClickEventType2FA.setup}
        >
          Continue
        </button>
      </FtlMsg>
    </FlowContainer>
  );
};
