/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useEffect } from 'react';
import { FtlMsg } from 'fxa-react/lib/utils';
import FlowContainer from '../FlowContainer';
import ProgressBar from '../ProgressBar';
import { GleanClickEventType2FA } from '../../../lib/types';
import DataBlock from '../../DataBlock';
import GleanMetrics from '../../../lib/glean';
import { UAParser } from 'ua-parser-js';

type FlowSetup2faBackupCodeDownloadProps = {
  currentStep?: number;
  numberOfSteps?: number;
  hideBackButton?: boolean;
  localizedFlowTitle: string;
  onBackButtonClick?: () => void;
  showProgressBar?: boolean;
  recoveryCodes: string[];
  email: string;
  onContinue: () => void;
  reason?: GleanClickEventType2FA;
};

export const FlowSetup2faBackupCodeDownload = ({
  currentStep,
  numberOfSteps,
  hideBackButton = false,
  localizedFlowTitle,
  onBackButtonClick,
  showProgressBar = true,
  recoveryCodes,
  email,
  onContinue,
  reason = GleanClickEventType2FA.setup,
}: FlowSetup2faBackupCodeDownloadProps) => {
  const [isMobile, setIsMobile] = React.useState(false);
  useEffect(() => {
    // undefined means desktop
    setIsMobile(new UAParser().getDevice().type !== undefined);
  }, []);

  useEffect(() => {
    GleanMetrics.accountPref.twoStepAuthCodesView({
      event: { reason },
    });
  }, [reason]);

  return (
    <FlowContainer
      title={localizedFlowTitle}
      {...{ hideBackButton, onBackButtonClick }}
    >
      {showProgressBar && currentStep != null && numberOfSteps != null && (
        <ProgressBar {...{ currentStep, numberOfSteps }} />
      )}
      <FtlMsg id="flow-setup-2fa-backup-code-dl-heading">
        <h2 className="font-bold text-xl my-2">
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
            value={recoveryCodes}
            contentType="Backup authentication codes"
            email={email}
            isMobile={isMobile}
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
          type="submit"
          className="cta-primary cta-xl mt-3"
          onClick={onContinue}
          data-glean-id="two_step_auth_codes_submit"
        >
          Continue
        </button>
      </FtlMsg>
    </FlowContainer>
  );
};
