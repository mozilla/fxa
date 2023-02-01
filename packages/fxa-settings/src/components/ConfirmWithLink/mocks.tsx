/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import ConfirmWithLink, { ConfirmWithLinkProps } from '.';
import { MOCK_ACCOUNT } from '../../models/mocks';

export const MOCK_GOBACK_CB = () => {
  console.log('Navigating back!');
};
export const MOCK_RESEND_CB = () => {
  console.log('Resending link!');
};
const MOCK_STRINGS = {
  headingFtlId: 'mock-confirmation-heading',
  headingText: 'Confirm something',
  instructionFtlId: 'mock-confirmation-instruction',
  instructionText: `Open the mock link sent to ${MOCK_ACCOUNT.primaryEmail.email}`,
};

export const DefaultSubject = () => {
  return (
    <ConfirmWithLink
      email={MOCK_ACCOUNT.primaryEmail.email}
      confirmWithLinkPageStrings={MOCK_STRINGS}
      resendEmailCallback={MOCK_RESEND_CB}
    />
  );
};

export const SubjectCanGoBack = () => {
  return (
    <ConfirmWithLink
      email={MOCK_ACCOUNT.primaryEmail.email}
      confirmWithLinkPageStrings={MOCK_STRINGS}
      resendEmailCallback={MOCK_RESEND_CB}
      goBackCallback={MOCK_GOBACK_CB}
    />
  );
};

export const SubjectWithWebmail = () => {
  return (
    <ConfirmWithLink
      email={MOCK_ACCOUNT.primaryEmail.email}
      confirmWithLinkPageStrings={MOCK_STRINGS}
      resendEmailCallback={MOCK_RESEND_CB}
      withWebmailLink
    />
  );
};

export const SubjectWithoutCallbacks = ({
  resendEmailCallback,
  goBackCallback,
  withWebmailLink,
}: Omit<ConfirmWithLinkProps, 'email' | 'confirmWithLinkPageStrings'>) => {
  return (
    <ConfirmWithLink
      email={MOCK_ACCOUNT.primaryEmail.email}
      confirmWithLinkPageStrings={MOCK_STRINGS}
      {...{ resendEmailCallback, goBackCallback, withWebmailLink }}
    />
  );
};
