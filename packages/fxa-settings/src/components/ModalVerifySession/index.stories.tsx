/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useCallback } from 'react';
import { storiesOf } from '@storybook/react';
import { useBooleanState } from 'fxa-react/lib/hooks';
import { ModalVerifySession } from '.';
import { Account, AppContext } from 'fxa-settings/src/models';
import { mockSession, MOCK_ACCOUNT } from 'fxa-settings/src/models/_mocks';
import { LocationProvider } from '@reach/router';
import { AuthUiErrors } from 'fxa-settings/src/lib/auth-errors/auth-errors';

const session = mockSession(false);
const account = MOCK_ACCOUNT as any;
account.sendVerificationCode = () => Promise.resolve(true);
account.verifySession = (code: string) => {
  if (code === '123456') {
    session.verified = true;
    return Promise.resolve(true);
  }
  return Promise.reject(AuthUiErrors.INVALID_EXPIRED_SIGNUP_CODE);
};

storiesOf('Components/ModalVerifySession', module).add(
  'valid code: 123456',
  () => (
    <LocationProvider>
      <AppContext.Provider value={{ account, session }}>
        <ModalToggle>
          {({ modalRevealed, hideModal }) =>
            modalRevealed && (
              <ModalVerifySession
                onCompleted={() => alert('success!')}
                onDismiss={hideModal}
                onError={() => {}}
              />
            )
          }
        </ModalToggle>
      </AppContext.Provider>
    </LocationProvider>
  )
);

type ModalToggleChildrenProps = {
  modalRevealed: boolean;
  hideModal: () => void;
  showModal: () => void;
};
type ModalToggleProps = {
  children: (props: ModalToggleChildrenProps) => React.ReactNode | null;
};
const ModalToggle = ({ children }: ModalToggleProps) => {
  const [modalRevealed, showModal, hideModal] = useBooleanState(true);
  const onClick = useCallback(
    (ev: React.MouseEvent) => {
      ev.preventDefault();
      showModal();
    },
    [showModal]
  );
  return (
    <div>
      <button {...{ onClick }}>Show modal</button>
      {children({ modalRevealed, showModal, hideModal })}
    </div>
  );
};
