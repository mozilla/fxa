/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { useFtlMsgResolver } from '../../models';
import AppLayout from '../../components/AppLayout';
import { InlineTotpSetupProps } from './interfaces';
import FlowSetup2faPrompt from '../../components/Settings/FlowSetup2faPrompt';

export const InlineTotpSetup = ({
  currentStep,
  onContinue,
  serviceName,
  integration,
  signedInWithPasskey,
  enrolment,
}: InlineTotpSetupProps) => {
  const ftlMsgResolver = useFtlMsgResolver();

  const localizedPageTitle = ftlMsgResolver.getMsg(
    'inline-totp-setup-page-title',
    'Two-step authentication'
  );

  const localizedStepPageTitle =
    currentStep === 0
      ? ftlMsgResolver.getMsg(
          'inline-totp-setup-intro-page-title',
          'Set up two-step authentication'
        )
      : ftlMsgResolver.getMsg(
          'inline-totp-setup-enrol-page-title',
          'Connect your authenticator app'
        );

  const cmsInfo = integration?.getCmsInfo?.();

  return (
    <AppLayout
      title={localizedStepPageTitle}
      wrapInCard={false}
      cmsInfo={cmsInfo}
    >
      {currentStep === 0 && (
        <FlowSetup2faPrompt
          onContinue={onContinue}
          localizedPageTitle={localizedPageTitle}
          serviceName={serviceName}
          cmsInfo={cmsInfo}
          signedInWithPasskey={signedInWithPasskey}
        />
      )}
      {currentStep === 1 && enrolment}
    </AppLayout>
  );
};

export default InlineTotpSetup;
