/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useCallback } from 'react';
import { storiesOf } from '@storybook/react';
import { useBooleanState } from 'fxa-react/lib/hooks';
import {
  ModalVerifySession,
  SEND_SESSION_VERIFICATION_CODE_MUTATION,
  VERIFY_SESSION_MUTATION,
} from '.';
import { MockedCache } from '../../models/_mocks';
import { GraphQLError } from 'graphql';

const mocks = [
  {
    request: {
      query: SEND_SESSION_VERIFICATION_CODE_MUTATION,
      variables: { input: {} },
    },
    result: {
      data: {
        sendSessionVerificationCode: {
          clientMutationId: null,
        },
      },
    },
  },
  {
    request: {
      query: VERIFY_SESSION_MUTATION,
      variables: { input: { code: '1234' } },
    },
    result: {
      data: {
        verifySession: {
          clientMutationId: null,
        },
      },
    },
  },
  {
    request: {
      query: VERIFY_SESSION_MUTATION,
      variables: { input: { code: '4444' } },
    },
    result: {
      errors: [new GraphQLError('invalid code')],
    },
  },
];

storiesOf('Components|ModalVerifySession', module).add(
  'valid code: 1234, invalid code: 4444',
  () => (
    <MockedCache {...{ mocks }} verified={false}>
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
    </MockedCache>
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
