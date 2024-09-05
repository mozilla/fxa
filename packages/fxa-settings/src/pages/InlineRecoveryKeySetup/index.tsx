/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { RouteComponentProps } from '@reach/router';
import InlineRecoveryKeySetupCreate from '../../components/InlineRecoveryKeySetupCreate';
import RecoveryKeySetupDownload from '../../components/RecoveryKeySetupDownload';
import AppLayout from '../../components/AppLayout';
import {
  CircleCheckOutlineImage,
  RecoveryKeyImage,
} from '../../components/images';
import { FtlMsg } from 'fxa-react/lib/utils';
import Banner, { BannerType } from '../../components/Banner';

export const InlineRecoveryKeySetup = ({
  createRecoveryKeyHandler,
  currentStep,
}: {
  createRecoveryKeyHandler: () => Promise<void>;
  currentStep: number;
} & RouteComponentProps) => {
  // nice to have with FXA-10079:
  // if user refreshes on step 1 and we no longer have PW from previous step,
  // just take them to CAD with success messaging.
  // If on step 2 or 3, just take them to Settings with success message

  const renderStepComponent = () => {
    switch (currentStep) {
      case 3:
        // TODO with FXA-10079, can possibly share with component in Settings?
        // return <InlineRecoveryKeySetupHint />;
        return <>TODO</>;
      case 2:
        // possible TODO with FXA-10079, move this to its own component?
        return (
          <>
            <Banner type={BannerType.success} additionalClassNames="mt-0">
              <p className="flex justify-center text-base">
                <CircleCheckOutlineImage className="me-3" />
                <span>
                  <FtlMsg id="inline-recovery-key-setup-recovery-created">
                    Account recovery key created
                  </FtlMsg>
                </span>
              </p>
            </Banner>
            <h1 className="text-grey-400 mb-3 mt-5">
              <FtlMsg id="inline-recovery-key-setup-download-header">
                Secure your account
              </FtlMsg>
            </h1>
            <RecoveryKeyImage className="my-6 mx-auto" />

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
                // TODO with FXA-10079
                recoveryKeyValue="my KEYYYYYYYY (todo)"
                email={'todo@gmail.com'}
                navigateForward={() => Promise.resolve()}
                viewName="doweevenwantthis?todo"
              />
            </div>
          </>
        );
      default:
        return (
          <InlineRecoveryKeySetupCreate
            {...{ createRecoveryKeyHandler }}
            // TODO with FXA-10079
            doLaterHandler={() => Promise.resolve()}
          />
        );
    }
  };

  return <AppLayout cardClass="card-base">{renderStepComponent()}</AppLayout>;
};

export default InlineRecoveryKeySetup;
