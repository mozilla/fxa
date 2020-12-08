/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { gql } from '@apollo/client';
import { RouteComponentProps } from '@reach/router';
import React, { useEffect, useState } from 'react';
import FlowContainer from '../FlowContainer';
import VerifiedSessionGuard from '../VerifiedSessionGuard';
import DataBlock from '../DataBlock';
import GetDataTrio from '../GetDataTrio';
import { useSession } from '../../models';
import { useAlertBar, useMutation } from '../../lib/hooks';
import { AlertBar } from '../AlertBar';

export const CHANGE_RECOVERY_CODES_MUTATION = gql`
  mutation changeRecoveryCodes($input: ChangeRecoveryCodesInput!) {
    changeRecoveryCodes(input: $input) {
      clientMutationId
      recoveryCodes
    }
  }
`;

export const Page2faReplaceRecoveryCodes = (_: RouteComponentProps) => {
  const goBack = () => window.history.back();

  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);
  const [changeRecoveryCodes] = useMutation(CHANGE_RECOVERY_CODES_MUTATION, {
    onCompleted: (x) => {
      setRecoveryCodes(x.changeRecoveryCodes.recoveryCodes);
    },
    onError: () => {
      alertBar.error('There was a problem replacing your recovery codes.');
    },
  });

  const alertBar = useAlertBar();
  const session = useSession();

  useEffect(() => {
    session.verified && changeRecoveryCodes({ variables: { input: {} } });
  }, [session, changeRecoveryCodes]);

  return (
    <FlowContainer title="Two Step Authentication">
      <VerifiedSessionGuard onDismiss={goBack} onError={goBack} />

      {alertBar.visible && (
        <AlertBar onDismiss={alertBar.hide} type={alertBar.type}>
          <p data-testid="update-display-name-error">{alertBar.content}</p>
        </AlertBar>
      )}

      <div className="my-2" data-testid="2fa-recovery-codes">
        New codes have been created. Save these one-time use codes in a safe
        place—you’ll need them to access your account if you don’t have your
        mobile device.
        <div className="mt-6 flex flex-col items-center h-40 justify-between">
          <DataBlock value={recoveryCodes}></DataBlock>
          <GetDataTrio value={recoveryCodes}></GetDataTrio>
        </div>
      </div>
      <div className="flex justify-center mt-6 mb-4 mx-auto max-w-64">
        <button
          type="button"
          className="cta-neutral mx-2 px-10"
          data-testid="close-modal"
          onClick={goBack}
        >
          Close
        </button>
      </div>
    </FlowContainer>
  );
};
