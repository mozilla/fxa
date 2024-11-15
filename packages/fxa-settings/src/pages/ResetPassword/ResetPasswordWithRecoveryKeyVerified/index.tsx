/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { lazy, Suspense, useEffect } from 'react';
import { FtlMsg } from 'fxa-react/lib/utils';
import { logViewEvent, usePageViewEvent } from '../../../lib/metrics';
import { REACT_ENTRYPOINT } from '../../../constants';
import AppLayout from '../../../components/AppLayout';
import { useFtlMsgResolver } from '../../../models';
import GleanMetrics from '../../../lib/glean';
import { RecoveryKeyImage } from '../../../components/images';
import DataBlock from '../../../components/DataBlock';
import LoadingSpinner from 'fxa-react/components/LoadingSpinner';
import RecoveryKeySetupHint from '../../../components/RecoveryKeySetupHint';
import { getLocalizedErrorMessage } from '../../../lib/error-utils';
import { AuthError } from '../../../lib/oauth';
import Banner from '../../../components/Banner';

export const viewName = 'reset-password-with-recovery-key-verified';

// TODO: FXA-6805
// This page does not currently perform a check to verify that the password has indeed been reset.
// It is possible to directly hit this route when no password reset has been initiated/completed,
// even when the user is not signed in.

const ResetPasswordWithRecoveryKeyVerified = ({
  email,
  newRecoveryKey,
  showHint,
  oAuthError,
  navigateToHint,
  updateRecoveryKeyHint,
  navigateNext,
}: {
  email: string;
  newRecoveryKey: string;
  showHint: boolean;
  oAuthError: AuthError | undefined;
  navigateToHint: () => void;
  updateRecoveryKeyHint: (hint: string) => Promise<void>;
  navigateNext: (eventFn: () => void) => Promise<void>;
}) => {
  const ftlMsgResolver = useFtlMsgResolver();
  const localizedPageTitle = ftlMsgResolver.getMsg(
    'reset-password-with-recovery-key-verified-page-title',
    'Password reset successful'
  );
  const ButtonDownloadRecoveryKeyPDF = lazy(
    () => import('../../../components/ButtonDownloadRecoveryKeyPDF')
  );
  const spinner = (
    <LoadingSpinner className="bg-grey-20 flex items-center flex-col justify-center select-none" />
  );

  usePageViewEvent(viewName, REACT_ENTRYPOINT);
  useEffect(() => {
    GleanMetrics.passwordReset.recoveryKeyResetSuccessView();
    // key was auto-generated
    logViewEvent(`flow.${viewName}`, 'generate-new-key', REACT_ENTRYPOINT);
  }, []);

  if (oAuthError) {
    return (
      <AppLayout title={localizedPageTitle}>
        <Banner
          type="error"
          content={{
            localizedHeading: getLocalizedErrorMessage(
              ftlMsgResolver,
              oAuthError
            ),
          }}
        />
      </AppLayout>
    );
  }

  if (showHint) {
    return (
      <AppLayout title={localizedPageTitle}>
        <div className="w-full flex flex-col gap-4">
          <RecoveryKeySetupHint
            {...{
              updateRecoveryKeyHint,
              navigateForward: () =>
                navigateNext(() => {
                  logViewEvent(
                    `flow.${viewName}`,
                    'continue-to-account',
                    REACT_ENTRYPOINT
                  );
                }),
              viewName,
            }}
          />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title={localizedPageTitle}>
      <div className="w-full flex flex-col">
        <Banner
          type="success"
          content={{
            localizedHeading: ftlMsgResolver.getMsg(
              'reset-password-complete-new-password-saved',
              'New password saved!'
            ),
          }}
        />
        <RecoveryKeyImage />
        <FtlMsg id="reset-password-complete-recovery-key-created">
          <h2 className="font-bold text-xl">
            New account recovery key created. Download and store it now.
          </h2>
        </FtlMsg>
        <FtlMsg id="reset-password-complete-recovery-key-download-info">
          <p className="text-sm my-4">
            This key is essential for data recovery if you forget your password.{' '}
            <b>
              Download and store it securely now, as you won’t be able to access
              this page again later.
            </b>
          </p>
        </FtlMsg>
        <DataBlock
          value={newRecoveryKey}
          onAction={() =>
            logViewEvent(`flow.${viewName}`, `recovery-key.copy-option`)
          }
          isInline
          {...{ email }}
          gleanDataAttrs={{
            copy: {
              id: 'account_pref_recovery_key_copy',
            },
          }}
        />
        <Suspense fallback={spinner}>
          <ButtonDownloadRecoveryKeyPDF
            {...{
              navigateForward: navigateToHint,
              recoveryKeyValue: newRecoveryKey,
              viewName,
              email,
            }}
          />
        </Suspense>
        <FtlMsg id="flow-recovery-key-download-next-link-v2">
          <button
            className="text-sm link-blue text-center mx-auto mt-6"
            onClick={() => {
              logViewEvent(`flow.${viewName}`, 'recovery-key.skip-download');
              navigateToHint();
            }}
          >
            Continue without downloading
          </button>
        </FtlMsg>
      </div>
    </AppLayout>
  );
};

export default ResetPasswordWithRecoveryKeyVerified;
