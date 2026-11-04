/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import InlineRecoveryKeySetupCreate from '../../components/InlineRecoveryKeySetupCreate';
import RecoveryKeySetupDownload from '../../components/RecoveryKeySetupDownload';
import AppLayout from '../../components/AppLayout';
import { RecoveryKeyImage } from '../../components/images';
import { FtlMsg } from 'fxa-react/lib/utils';
import { Constants } from '../../lib/constants';
import { InlineRecoveryKeySetupProps } from './interfaces';
import RecoveryKeySetupHint from '../../components/RecoveryKeySetupHint';
import Banner from '../../components/Banner';
import { useFtlMsgResolver } from '../../models';
import { HeadingPrimary } from '../../components/HeadingPrimary';
import { useNavigateWithQuery } from '../../lib/hooks';

const viewName = 'inline-recovery-key-setup';

export const InlineRecoveryKeySetup = ({
  createRecoveryKeyHandler,
  updateRecoveryHintHandler,
  currentStep,
  email,
  formattedRecoveryKey,
  navigateForward,
  cmsInfo,
}: InlineRecoveryKeySetupProps) => {
  const ftlMsgResolver = useFtlMsgResolver();
  const navigateWithQuery = useNavigateWithQuery();
  const doLaterHandler = () => {
    localStorage.setItem(
      Constants.DISABLE_PROMO_ACCOUNT_RECOVERY_KEY_DO_IT_LATER,
      'true'
    );
    // Keeps all query params so that correct metrics are emitted
    navigateWithQuery('/pair');
    return <></>;
  };

  const pageTitles: Record<number, string> = {
    1: ftlMsgResolver.getMsg(
      'inline-recovery-key-setup-create-page-title',
      'Create an account recovery key'
    ),
    2: ftlMsgResolver.getMsg(
      'inline-recovery-key-setup-download-page-title',
      'Download your account recovery key'
    ),
    3: ftlMsgResolver.getMsg(
      'inline-recovery-key-setup-hint-page-title',
      'Add a recovery key hint'
    ),
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
              {...{ viewName, cmsInfo }}
              navigateForward={() => {
                navigateWithQuery('/pair');
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
                {...{ email, navigateForward, viewName, cmsInfo }}
              />
            </div>
          </>
        );
      default:
        return (
          <InlineRecoveryKeySetupCreate
            {...{ createRecoveryKeyHandler, doLaterHandler, cmsInfo }}
          />
        );
    }
  };

  return (
    <AppLayout
      title={pageTitles[currentStep] ?? pageTitles[1]}
      cmsInfo={cmsInfo}
    >
      {renderStepComponent()}
    </AppLayout>
  );
};

export default InlineRecoveryKeySetup;
