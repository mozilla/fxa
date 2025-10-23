/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { LocationProvider } from '@reach/router';
import { Meta } from '@storybook/react';
import { withLocalization } from 'fxa-react/lib/storybooks';
import { Account, AppContext } from 'fxa-settings/src/models';
import { UnitRowSecondaryEmail } from '.';
import { mockAppContext } from '../../../models/mocks';
import {
  MOCK_MANY_SEC_EMAILS_MANY_UNVERIFIED,
  MOCK_MANY_SEC_EMAILS_ONE_UNVERIFIED,
  MOCK_MANY_VERIFIED_SEC_EMAILS,
  MOCK_NO_SEC_EMAIL,
  MOCK_ONE_UNVERIFIED_SEC_EMAIL,
  MOCK_ONE_VERIFIED_SEC_EMAIL,
} from './mocks';

export default {
  title: 'Components/Settings/UnitRowSecondaryEmail',
  component: UnitRowSecondaryEmail,
  decorators: [withLocalization],
} as Meta;

const accountWithoutSecondaryEmails = {
  emails: MOCK_NO_SEC_EMAIL,
} as unknown as Account;

const accountWithOneUnverifiedSecondaryEmail = {
  emails: MOCK_ONE_UNVERIFIED_SEC_EMAIL,
} as unknown as Account;

const accountWithOneVerifiedSecondaryEmail = {
  emails: MOCK_ONE_VERIFIED_SEC_EMAIL,
} as unknown as Account;

const accountWithManyVerifiedSecondaryEmails = {
  emails: MOCK_MANY_VERIFIED_SEC_EMAILS,
} as unknown as Account;

const accountWithManySecondaryEmailsOneUnverified = {
  emails: MOCK_MANY_SEC_EMAILS_ONE_UNVERIFIED,
} as unknown as Account;

const accountWithManyUnverifiedSecondaryEmails = {
  emails: MOCK_MANY_SEC_EMAILS_MANY_UNVERIFIED,
} as unknown as Account;

const storyWithContext = (account: Partial<Account>) => {
  const context = { account: account as Account };

  const story = () => (
    <LocationProvider>
      <AppContext.Provider value={mockAppContext(context)}>
        <UnitRowSecondaryEmail />
      </AppContext.Provider>
    </LocationProvider>
  );
  return story;
};

export const NoSecondaryEmail = storyWithContext(accountWithoutSecondaryEmails);

export const OneUnverifiedSecondaryEmail = storyWithContext(
  accountWithOneUnverifiedSecondaryEmail
);

export const OneVerifiedSecondaryEmail = storyWithContext(
  accountWithOneVerifiedSecondaryEmail
);

export const ManyVerifiedSecondaryEmails = storyWithContext(
  accountWithManyVerifiedSecondaryEmails
);

export const ManySecondaryEmailsOneUnverified = storyWithContext(
  accountWithManySecondaryEmailsOneUnverified
);

export const ManySecondaryEmailsManyUnverified = storyWithContext(
  accountWithManyUnverifiedSecondaryEmails
);
