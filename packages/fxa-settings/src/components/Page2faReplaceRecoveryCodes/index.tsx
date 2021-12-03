/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { RouteComponentProps, useNavigate } from '@reach/router';
import React, { useCallback, useEffect, useState } from 'react';
import FlowContainer from '../FlowContainer';
import VerifiedSessionGuard from '../VerifiedSessionGuard';
import DataBlock from '../DataBlock';
import { HomePath } from '../../constants';
import { useAccount, useAlertBar, useSession } from '../../models';
import { useLocalization, Localized } from '@fluent/react';
import LoadingSpinner from 'fxa-react/components/LoadingSpinner';
import { copyRecoveryCodes } from '../../lib/totp';

export const Page2faReplaceRecoveryCodes = (_: RouteComponentProps) => {
  const alertBar = useAlertBar();
  const navigate = useNavigate();
  const session = useSession();
  const account = useAccount();
  const goHome = () =>
    navigate(HomePath + '#two-step-authentication', { replace: true });
  const alertSuccessAndGoHome = () => {
    alertBar.success(
      l10n.getString(
        'tfa-replace-code-success-alert',
        null,
        'Account recovery codes updated.'
      )
    );
    navigate(HomePath + '#two-step-authentication', { replace: true });
  };
  const { l10n } = useLocalization();

  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);

  const replaceRecoveryCodes = useCallback(async () => {
    try {
      const { recoveryCodes } = await account.replaceRecoveryCodes();
      setRecoveryCodes(recoveryCodes);
    } catch (e) {
      alertBar.error(
        l10n.getString(
          'tfa-replace-code-error',
          null,
          'There was a problem replacing your recovery codes.'
        )
      );
    }
  }, [account, alertBar, l10n]);

  useEffect(() => {
    session.verified && recoveryCodes.length < 1 && replaceRecoveryCodes();
  }, [session, recoveryCodes, replaceRecoveryCodes]);

  return (
    <FlowContainer
      title={l10n.getString('tfa-title', null, 'Two-step authentication')}
    >
      <VerifiedSessionGuard onDismiss={goHome} onError={goHome} />
      <div className="my-2" data-testid="2fa-recovery-codes">
        <Localized id="tfa-replace-code-success">
          New codes have been created. Save these one-time use codes in a safe
          place — you’ll need them to access your account if you don’t have your
          mobile device.
        </Localized>
        <div className="mt-6 flex flex-col items-center h-auto justify-between">
          {recoveryCodes.length > 0 ? (
            <DataBlock
              value={recoveryCodes.map((x) => x)}
              separator=" "
              onCopy={copyRecoveryCodes}
            />
          ) : (
            <LoadingSpinner />
          )}
        </div>
      </div>
      <div className="flex justify-center mt-6 mb-4 mx-auto max-w-64">
        <Localized id="recovery-key-close-button">
          <button
            type="button"
            className="cta-neutral mx-2 px-10"
            data-testid="close-modal"
            onClick={alertSuccessAndGoHome}
          >
            Close
          </button>
        </Localized>
      </div>
    </FlowContainer>
  );
};
