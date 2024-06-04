/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useState } from 'react';
import ConfirmWithLink, { ConfirmWithLinkProps } from '.';
import { ResendStatus } from '../../lib/types';
import { MOCK_ACCOUNT } from '../../models/mocks';
import AppLayout from '../AppLayout';

export const MOCK_STRINGS = {
  headingFtlId: 'mock-confirmation-heading',
  headingText: 'Confirm something',
  instructionFtlId: 'mock-confirmation-instruction',
  instructionText: `Open the mock link sent to ${MOCK_ACCOUNT.primaryEmail.email}`,
};

export const MOCK_GOBACK_CB = () => {
  alert('Navigating back!');
};

export const SubjectWithEmailResendSuccess = () => {
  const [mockResendStatus, setMockResendStatus] = useState<ResendStatus>(
    ResendStatus.none
  );

  const MOCK_EMAIL_RESEND_SUCCESS = () => {
    Promise.resolve(true);
    setMockResendStatus(ResendStatus.sent);
  };

  return (
    <AppLayout>
      <ConfirmWithLink
        email={MOCK_ACCOUNT.primaryEmail.email}
        confirmWithLinkPageStrings={MOCK_STRINGS}
        resendEmailHandler={MOCK_EMAIL_RESEND_SUCCESS}
        resendStatus={mockResendStatus}
      />
    </AppLayout>
  );
};

export const SubjectWithEmailResendError = () => {
  const [mockResendStatus, setMockResendStatus] = useState<ResendStatus>(
    ResendStatus.none
  );
  const [mockErrorMessage, setMockErrorMessage] = useState('');

  const MOCK_EMAIL_RESEND_FAIL = () => {
    Promise.resolve(false);
    setMockResendStatus(ResendStatus.error);
    setMockErrorMessage('Uh oh something went wrong');
  };

  return (
    <AppLayout>
      <ConfirmWithLink
        email={MOCK_ACCOUNT.primaryEmail.email}
        confirmWithLinkPageStrings={MOCK_STRINGS}
        resendEmailHandler={MOCK_EMAIL_RESEND_FAIL}
        resendStatus={mockResendStatus}
        errorMessage={mockErrorMessage}
      />
    </AppLayout>
  );
};

export const SubjectCanGoBack = ({
  navigateBackHandler,
}: Partial<ConfirmWithLinkProps>) => {
  const [mockResendStatus, setMockResendStatus] = useState<ResendStatus>(
    ResendStatus.none
  );

  const MOCK_RESEND_HANDLER_SUCCESS = () => {
    Promise.resolve(true);
    setMockResendStatus(ResendStatus.sent);
  };

  return (
    <AppLayout>
      <ConfirmWithLink
        email={MOCK_ACCOUNT.primaryEmail.email}
        confirmWithLinkPageStrings={MOCK_STRINGS}
        resendEmailHandler={MOCK_RESEND_HANDLER_SUCCESS}
        resendStatus={mockResendStatus}
        {...{ navigateBackHandler }}
      />
    </AppLayout>
  );
};
