/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { AdminPanelFeature } from 'fxa-shared/guards';
import Guard from '../../Guard';
import { useMutation } from '@apollo/client';
import { RECORD_ADMIN_SECURITY_EVENT } from '../Account/index.gql';
import {
  EmailBounce as EmailBounceType,
  Email as EmailType,
} from 'fxa-admin-server/src/graphql';
import { TableRowYHeader, TableYHeaders } from '../../TableYHeaders';
import getEmailBounceDescription from './getBounceDescription';
import { getFormattedDate } from '../../../lib/utils';
import { HIDE_ROW } from '../../../../constants';
import { CLEAR_BOUNCES_BY_EMAIL } from './index.gql';

const ClearButton = ({
  emails,
  onCleared,
  uid,
}: {
  emails: string[];
  onCleared: Function;
  uid: string;
}) => {
  const [clearBounces] = useMutation(CLEAR_BOUNCES_BY_EMAIL);
  const [recordAdminSecurityEvent] = useMutation(RECORD_ADMIN_SECURITY_EVENT);

  const handleClear = () => {
    if (!window.confirm('Are you sure? This cannot be undone.')) {
      return;
    }

    // This could be improved to clear bounces for individual email
    // addresses, but for now it seems satisfactory to clear all bounces
    // for all emails, since they own all of the addresses
    emails.forEach((email) => clearBounces({ variables: { email } }));
    recordAdminSecurityEvent({
      variables: { uid: uid, name: 'emails.clearBounces' },
    });
    onCleared();
  };

  return (
    <>
      <Guard features={[AdminPanelFeature.ClearEmailBounces]}>
        <button
          data-testid="clear-button"
          className="bg-red-600 border-0 rounded-md text-base mx-0 mb-6 px-4 py-3 text-white transition duration-200 hover:bg-red-700"
          onClick={handleClear}
        >
          Clear all bounces
        </button>
      </Guard>
    </>
  );
};

const EmailBounce = ({
  email,
  templateName,
  createdAt,
  bounceType,
  bounceSubType,
  diagnosticCode,
}: EmailBounceType) => {
  const date = getFormattedDate(createdAt);
  const bounceDescription = getEmailBounceDescription(
    bounceType,
    bounceSubType
  );
  return (
    <TableYHeaders testId="bounce-group">
      <TableRowYHeader
        header="email"
        children={email}
        testId={'bounce-email'}
      />
      <TableRowYHeader
        header="template"
        children={templateName}
        testId={'bounce-template'}
      />
      <TableRowYHeader
        header="created at"
        children={`${createdAt} (${date})`}
        testId={'bounce-createdAt'}
      />
      <TableRowYHeader
        header="bounce type"
        children={bounceType}
        testId={'bounce-type'}
      />
      <TableRowYHeader
        header="bounce subtype"
        children={bounceSubType}
        testId={'bounce-subtype'}
      />
      <TableRowYHeader
        header="bounce description"
        children={bounceDescription}
        testId={'bounce-description'}
      />
      <TableRowYHeader
        header="diagnostic code"
        children={diagnosticCode?.length ? diagnosticCode : HIDE_ROW}
        testId={'bounce-diagnostic-code'}
      />
    </TableYHeaders>
  );
};

export const EmailBounces = ({
  emailBounces,
  uid,
  emails,
  onCleared,
}: {
  emailBounces?: Nullable<EmailBounceType[]>;
  uid: string;
  emails?: Nullable<EmailType[]>;
  onCleared: Function;
}) => (
  <>
    <h3 className="header-lg">Email Bounces</h3>
    {emailBounces && emailBounces.length > 0 ? (
      <>
        <ClearButton
          {...{
            uid,
            emails: emails!.map((emails) => emails.email),
            onCleared,
          }}
        />
        {emailBounces.map((emailBounce: EmailBounceType) => (
          <EmailBounce key={emailBounce.createdAt} {...emailBounce} />
        ))}
      </>
    ) : (
      <p data-testid="no-bounces-message" className="result-none">
        This account doesn't have any bounced emails.
      </p>
    )}
  </>
);

export default EmailBounces;
