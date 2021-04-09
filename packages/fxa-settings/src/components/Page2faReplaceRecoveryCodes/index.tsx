/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { gql } from '@apollo/client';
import { RouteComponentProps, useNavigate } from '@reach/router';
import React, { useEffect, useState } from 'react';
import FlowContainer from '../FlowContainer';
import VerifiedSessionGuard from '../VerifiedSessionGuard';
import DataBlock from '../DataBlock';
import { HomePath } from '../../constants';
import { useSession } from '../../models';
import { alertTextExternal } from '../../lib/cache';
import { useAlertBar } from '../../lib/hooks';
import { AlertBar } from '../AlertBar';
import { useLocalization, Localized } from '@fluent/react';
import LoadingSpinner from 'fxa-react/components/LoadingSpinner';
import { useAuthClient } from '../../lib/auth';

export const CHANGE_RECOVERY_CODES_MUTATION = gql`
  mutation changeRecoveryCodes($input: ChangeRecoveryCodesInput!) {
    changeRecoveryCodes(input: $input) {
      clientMutationId
      recoveryCodes
    }
  }
`;

export const Page2faReplaceRecoveryCodes = (_: RouteComponentProps) => {
  const alertBar = useAlertBar();
  const navigate = useNavigate();
  const session = useSession();
  const goHome = () =>
    navigate(HomePath + '#two-step-authentication', { replace: true });
  const alertSuccessAndGoHome = () => {
    alertTextExternal(
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

  const changeRecoveryCodes = useAuthClient(
    (auth, sessionToken) => () => auth.replaceRecoveryCodes(sessionToken),
    {
      onSuccess: ({ recoveryCodes }) => {
        setRecoveryCodes(recoveryCodes);
      },
      onError: () => {
        alertBar.error(
          l10n.getString(
            'tfa-replace-code-error',
            null,
            'There was a problem replacing your recovery codes.'
          )
        );
      },
    }
  );

  useEffect(() => {
    session.verified && changeRecoveryCodes.execute();
  }, [session, changeRecoveryCodes]);

  return (
    <FlowContainer title="Two Step Authentication">
      <VerifiedSessionGuard onDismiss={goHome} onError={goHome} />

      {alertBar.visible && (
        <AlertBar onDismiss={alertBar.hide} type={alertBar.type}>
          <p data-testid="update-display-name-error">{alertBar.content}</p>
        </AlertBar>
      )}

      <div className="my-2" data-testid="2fa-recovery-codes">
        <Localized id="tfa-replace-code-success">
          New codes have been created. Save these one-time use codes in a safe
          place — you’ll need them to access your account if you don’t have your
          mobile device.
        </Localized>
        <div className="mt-6 flex flex-col items-center h-auto justify-between">
          {recoveryCodes.length > 0 ? (
            <DataBlock value={recoveryCodes} />
          ) : (
            <LoadingSpinner />
          )}
        </div>
      </div>
      <div className="flex justify-center mt-6 mb-4 mx-auto max-w-64">
        <button
          type="button"
          className="cta-neutral mx-2 px-10"
          data-testid="close-modal"
          onClick={alertSuccessAndGoHome}
        >
          Close
        </button>
      </div>
    </FlowContainer>
  );
};
