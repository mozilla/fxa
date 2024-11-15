/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { RouteComponentProps } from '@reach/router';
import InlineRecoveryKeySetupCreate from '../../components/InlineRecoveryKeySetupCreate';
import RecoveryKeySetupDownload from '../../components/RecoveryKeySetupDownload';
import AppLayout from '../../components/AppLayout';
import { RecoveryKeyImage } from '../../components/images';
import { FtlMsg, hardNavigate } from 'fxa-react/lib/utils';
import { Constants } from '../../lib/constants';
import { InlineRecoveryKeySetupProps } from './interfaces';
import RecoveryKeySetupHint from '../../components/RecoveryKeySetupHint';
import Banner from '../../components/Banner';
import { useFtlMsgResolver } from '../../models';
import { HeadingPrimary } from '../../components/HeadingPrimary';

const viewName = 'inline-recovery-key-setup';

export const InlineRecoveryKeySetup = ({
  createRecoveryKeyHandler,
  updateRecoveryHintHandler,
  currentStep,
  email,
  formattedRecoveryKey,
  navigateForward,
}: InlineRecoveryKeySetupProps & RouteComponentProps) => {
  const ftlMsgResolver = useFtlMsgResolver();
  const doLaterHandler = () => {
    localStorage.setItem(
      Constants.DISABLE_PROMO_ACCOUNT_RECOVERY_KEY_DO_IT_LATER,
      'true'
    );
    // We do a hard navigate because this page is still in the content server, this
    // also keeps all query params so that correct metrics are emitted
    // but does not show the signed into FF success message
    hardNavigate('/pair', {}, true);
    return <></>;
  };

  const renderStepComponent = () => {
    switch (currentStep) {
      case 3:
        return (
          <>
            <FtlMsg id="inline-recovery-key-setup-hint-header">
              <HeadingPrimary>Security recommendation</HeadingPrimary>
            </FtlMsg>
            <RecoveryKeySetupHint
              {...{ viewName }}
              navigateForward={() => {
                hardNavigate('/pair', {}, true);
              }}
              updateRecoveryKeyHint={updateRecoveryHintHandler}
            />
          </>
        );
      case 2:
        return (
          <>
            <Banner
              type="success"
              content={{
                localizedHeading: ftlMsgResolver.getMsg(
                  'inline-recovery-key-setup-recovery-created',
                  'Account recovery key created'
                ),
              }}
            />
            <FtlMsg id="inline-recovery-key-setup-download-header">
              <HeadingPrimary>Secure your account</HeadingPrimary>
            </FtlMsg>
            <RecoveryKeyImage />

            <h2 className="font-bold text-xl mb-5">
              <FtlMsg id="inline-recovery-key-setup-download-subheader">
                Download and store it now
              </FtlMsg>
            </h2>
            <p className="mb-5 text-sm">
              <FtlMsg id="inline-recovery-key-setup-download-info">
                Store this key somewhere you’ll remember — you won’t be able to
                get back to this page later.
              </FtlMsg>
            </p>
            <div className="w-full flex flex-col gap-4">
              <RecoveryKeySetupDownload
                recoveryKeyValue={formattedRecoveryKey}
                {...{ email, navigateForward, viewName }}
              />
            </div>
          </>
        );
      default:
        return (
          <InlineRecoveryKeySetupCreate
            {...{ createRecoveryKeyHandler, doLaterHandler }}
          />
        );
    }
  };

  return <AppLayout>{renderStepComponent()}</AppLayout>;
};

export default InlineRecoveryKeySetup;
