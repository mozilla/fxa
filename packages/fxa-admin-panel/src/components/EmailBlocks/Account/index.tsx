/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import dateFormat from 'dateformat';
import { gql } from 'apollo-boost';
import { useMutation } from 'react-apollo';
import './index.scss';

type AccountProps = {
  uid: string;
  createdAt: number;
  emails: EmailProps[];
  emailBounces: EmailBounceProps[];
  onCleared: Function;
  query: string;
};

type EmailBounceProps = {
  email: string;
  createdAt: number;
  bounceType: string;
  bounceSubType: string;
};

type EmailProps = {
  email: string;
  isVerified: boolean;
  isPrimary: boolean;
  createdAt: number;
};

const DATE_FORMAT = 'yyyy-mm-dd @ HH:MM:ss Z';

export const CLEAR_BOUNCES_BY_EMAIL = gql`
  mutation clearBouncesByEmail($email: String!) {
    clearEmailBounce(email: $email)
  }
`;

export const ClearButton = ({
  emails,
  onCleared,
}: {
  emails: string[];
  onCleared: Function;
}) => {
  const [clearBounces] = useMutation(CLEAR_BOUNCES_BY_EMAIL);

  const handleClear = () => {
    if (!window.confirm('Are you sure? This cannot be undone.')) {
      return;
    }

    // This could be improved to clear bounces for individual email
    // addresses, but for now it seems satisfactory to clear all bounces
    // for all emails, since they own all of the addresses
    emails.forEach((email) => clearBounces({ variables: { email } }));
    onCleared();
  };

  return (
    <button data-testid="clear-button" className="delete" onClick={handleClear}>
      Clear all bounces
    </button>
  );
};

export const Account = ({
  uid,
  emails,
  createdAt,
  emailBounces,
  onCleared,
  query,
}: AccountProps) => {
  const date = dateFormat(new Date(createdAt), DATE_FORMAT);
  const primaryEmail = emails.find((email) => email.isPrimary)!;
  const secondaryEmails = emails.filter((email) => !email.isPrimary)!;

  return (
    <section className="account" data-testid="account-section">
      <ul>
        <li className="flex justify-space-between">
          <h3 data-testid="email-label">
            <span
              className={`${query === primaryEmail.email ? 'highlight' : ''}`}
            >
              {primaryEmail.email}
            </span>
          </h3>
          <span
            data-testid="verified-status"
            className={`${
              primaryEmail.isVerified ? 'verified' : 'not-verified'
            }`}
          >
            {primaryEmail.isVerified ? 'verified' : 'not verified'}
          </span>
        </li>
        <li className="flex justify-space-between">
          <div data-testid="uid-label">
            uid: <span className="result">{uid}</span>
          </div>
          <div className="created-at">
            created at:{' '}
            <span className="result" data-testid="createdat-label">
              {createdAt}
            </span>
            <br />
            {date}
          </div>
        </li>
        {secondaryEmails.length > 0 && (
          <li className="secondary-emails" data-testid="secondary-section">
            secondary emails:
            <ul>
              {secondaryEmails.map((secondaryEmail) => (
                <li key={secondaryEmail.createdAt}>
                  <span
                    data-testid="secondary-email"
                    className={`${
                      query === secondaryEmail.email ? 'highlight' : ''
                    }`}
                  >
                    {secondaryEmail.email}
                  </span>
                  <span
                    data-testid="secondary-verified"
                    className={`verification ${
                      secondaryEmail.isVerified ? 'verified' : 'not-verified'
                    }`}
                  >
                    {secondaryEmail.isVerified ? 'verified' : 'not verified'}
                  </span>
                </li>
              ))}
            </ul>
          </li>
        )}
        <li></li>
        <li>
          <h4>Email bounces</h4>
        </li>

        {emailBounces.length > 0 ? (
          <>
            <ClearButton
              {...{
                emails: emails.map((emails) => emails.email),
                onCleared,
              }}
            />
            {emailBounces.map((emailBounce: EmailBounceProps) => (
              <EmailBounce key={emailBounce.createdAt} {...emailBounce} />
            ))}
          </>
        ) : (
          <li data-testid="no-bounces-message" className="email-bounce">
            This account doesn't have any bounced emails.
          </li>
        )}
      </ul>
    </section>
  );
};

const EmailBounce = ({
  email,
  createdAt,
  bounceType,
  bounceSubType,
}: EmailBounceProps) => {
  const date = dateFormat(new Date(createdAt), DATE_FORMAT);
  return (
    <li data-testid="bounce-group">
      <ul className="email-bounce">
        <li>
          email: <span className="result">{email}</span>
        </li>
        <li>
          created at: <span className="result">{createdAt}</span> ({date})
        </li>
        <li>
          bounce type: <span className="result">{bounceType}</span>
        </li>
        <li>
          bounce subtype: <span className="result">{bounceSubType}</span>
        </li>
      </ul>
    </li>
  );
};

export default Account;
