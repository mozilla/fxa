/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useCallback } from 'react';
import { Meta } from '@storybook/react';
import { withLocalization } from 'fxa-react/lib/storybooks';
import { useBooleanState } from 'fxa-react/lib/hooks';
import { ModalVerifySession } from '.';
import { AppContext } from 'fxa-settings/src/models';
import { mockSession, MOCK_ACCOUNT } from 'fxa-settings/src/models/mocks';
import { LocationProvider } from '@reach/router';

export default {
  title: 'Components/Settings/ModalVerifySession',
  component: ModalVerifySession,
  decorators: [withLocalization],
} as Meta;

const session = mockSession(false);
const account = MOCK_ACCOUNT as any;

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
    <div className="flex flex-col max-w-64 mx-auto">
      <button className="cta-base-p cta-neutral" {...{ onClick }}>
        Show modal
      </button>

      {children({ modalRevealed, showModal, hideModal })}
    </div>
  );
};

export const DefaultWithValidCode123456 = () => (
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
);
