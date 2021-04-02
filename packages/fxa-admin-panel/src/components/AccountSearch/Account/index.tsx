/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useState } from 'react';
import dateFormat from 'dateformat';
import { gql, useMutation } from '@apollo/client';
import './index.scss';

import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';

type AccountProps = {
  uid: string;
  createdAt: number;
  disabledAt: number | null;
  emails: EmailProps[];
  emailBounces: EmailBounceProps[];
  onCleared: Function;
  query: string;
  securityEvents: SecurityEventsProps[];
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

type SecurityEventsProps = {
  uid: string;
  nameId: number;
  verified: boolean;
  ipAddrHmac: string;
  createdAt: number;
  tokenVerificationId: string;
  name: string;
};

const DATE_FORMAT = 'yyyy-mm-dd @ HH:MM:ss Z';

export const CLEAR_BOUNCES_BY_EMAIL = gql`
  mutation clearBouncesByEmail($email: String!) {
    clearEmailBounce(email: $email)
  }
`;

export const DISABLE_ACCOUNT = gql`
  mutation disableAccount($uid: String!) {
    disableAccount(uid: $uid)
  }
`;

export const ENABLE_ACCOUNT = gql`
  mutation disableAccount($uid: String!) {
    enableAccount(uid: $uid)
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

export const DangerZone = ({
  uid,
  disabledAt,
}: {
  uid: string;
  disabledAt: number | null;
}) => {
  const alertWindow = () => {
    window.alert('Implementation Coming Soon');
  };

  const handleLock = () => {
    if (!disabledAt) {
      if (window.confirm('Are you sure you want to lock this account?')) {
        executeDisableAccount();
      }
    } else {
      if (window.confirm('You are about to unlock this account.')) {
        executeDisableAccount();
      }
    }
    return;
  };

  const [disableAccount] = useMutation(DISABLE_ACCOUNT, {
    onCompleted: () => setAccountStatus('Unlock Account'),
  });

  const [enableAccount] = useMutation(ENABLE_ACCOUNT, {
    onCompleted: () => setAccountStatus('Lock Account'),
  });
  const [accountStatus, setAccountStatus] = useState<string>(
    disabledAt ? 'Unlock Account' : 'Lock Account'
  );

  const executeDisableAccount = () => {
    if (disabledAt) {
      enableAccount({ variables: { uid } });
    } else {
      disableAccount({ variables: { uid } });
    }
  };

  return (
    <li>
      <h3 className="danger-zone-title">Danger Zone</h3>
      <p>
        Please run these commands with caution — some actions are irreversible.
      </p>
      <br />
      <h2>Permanently Delete Account</h2>
      <p className="danger-zone-info">
        Once you delete an account, there is no going back. Please be certain.
        <br />
        <button className="danger-zone-button" onClick={alertWindow}>
          Delete Account
        </button>
      </p>
      <h2>Lock or Unlock Account</h2>
      <p className="danger-zone-info">
        Locking this account will disable the user from logging in. Unlocking
        will toggle this state.
        <br />
        <button className="danger-zone-button" onClick={handleLock}>
          {accountStatus}
        </button>
      </p>
      <h2>Force Password Change</h2>
      <p className="danger-zone-info">
        Force a password change the next time this account logs in.
        <br />
        <button className="danger-zone-button" onClick={alertWindow}>
          Force Change
        </button>
      </p>
    </li>
  );
};

export const Account = ({
  uid,
  emails,
  createdAt,
  disabledAt,
  emailBounces,
  onCleared,
  query,
  securityEvents,
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
          <h4>Email Bounces</h4>
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
        <hr />
        <li>
          <h4>Account History</h4>
          <p className="account-history-info">
            {securityEvents.length > 0 ? (
              <>
                <TableContainer component={Paper}>
                  <Table
                    className="account-history-table"
                    aria-label="simple table"
                  >
                    <TableHead>
                      <TableRow>
                        <TableCell>Event</TableCell>
                        <TableCell>Timestamp</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {securityEvents.map(
                        (securityEvents: SecurityEventsProps) => (
                          <TableRow>
                            <TableCell>{securityEvents.name}</TableCell>
                            <TableCell>
                              {dateFormat(
                                new Date(securityEvents.createdAt),
                                DATE_FORMAT
                              )}
                            </TableCell>
                          </TableRow>
                        )
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </>
            ) : (
              <li
                data-testid="acccount-security-events"
                className="security-events"
              >
                No account history to display.
              </li>
            )}
          </p>
        </li>
        <hr />
        <DangerZone uid={uid} disabledAt={disabledAt} />
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
