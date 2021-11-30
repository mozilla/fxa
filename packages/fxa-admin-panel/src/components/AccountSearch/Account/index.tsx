/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import dateFormat from 'dateformat';
import { gql, useMutation } from '@apollo/client';
import {
  Account as AccountType,
  EmailBounce as EmailBounceType,
  Email as EmailType,
  SecurityEvents as SecurityEventsType,
  Totp as TotpType,
  RecoveryKeys as RecoveryKeysType,
  SessionTokens as SessionTokensType,
} from 'fxa-admin-server/src/graphql';

import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';

export type AccountProps = AccountType & {
  onCleared: Function;
  query: string;
};

type DangerZoneProps = {
  uid: string;
  email: EmailType;
  disabledAt: number | null;
  onCleared: Function;
};

const DATE_FORMAT = 'yyyy-mm-dd @ HH:MM:ss Z';

const styleClasses = {
  enabledOrVerified: 'font-semibold text-green-900',
  notEnabledOrVerified: 'font-semibold text-red-600',
  borderInfoDisplay: 'border-l-2 border-grey-500 mb-8 pl-4',
  li: 'list-none pl-0',
  result: 'font-medium text-violet-900',
};

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
    <button
      data-testid="clear-button"
      className="bg-red-600 border-0 rounded-md text-base mt-3 mx-0 mb-6 px-4 py-3 text-white transition duration-200 hover:bg-red-700"
      onClick={handleClear}
    >
      Clear all bounces
    </button>
  );
};

// gql mutation to update emails table and unverify user's email
export const UNVERIFY_EMAIL = gql`
  mutation unverify($email: String!) {
    unverifyEmail(email: $email)
  }
`;

export const DangerZone = ({
  uid,
  email,
  disabledAt,
  onCleared,
}: DangerZoneProps) => {
  const [unverify, { loading: unverifyLoading }] = useMutation(UNVERIFY_EMAIL, {
    onCompleted: () => {
      window.alert("The user's email has been unverified.");
      onCleared();
    },
    onError: () => {
      window.alert('Error in unverifying email');
    },
  });

  const handleUnverify = () => {
    if (!window.confirm('Are you sure? This cannot be undone.')) {
      return;
    }
    unverify({ variables: { email: email.email } });
  };

  const [disableAccount, { loading: disableLoading }] = useMutation(
    DISABLE_ACCOUNT,
    {
      onCompleted: () => {
        window.alert('The account has been disabled.');
        onCleared();
      },
      onError: () => {
        window.alert('Error disabling account');
      },
    }
  );

  const handleDisable = () => {
    if (!window.confirm('Are you sure? This cannot be undone.')) {
      return;
    }
    disableAccount({ variables: { uid } });
  };

  // define loading messages
  const loadingMessage = 'Please wait a moment...';
  let unverifyMessage = '';

  if (unverifyLoading) unverifyMessage = loadingMessage;

  return (
    <>
      <h3 className="mt-0 my-0 mb-1 bg-red-600 font-medium h-8 pb-8 pl-1 pt-1 rounded-sm text-lg text-white">
        Danger Zone
      </h3>
      <p className="text-base leading-6 mb-4">
        Please run these commands with caution — some actions are irreversible.
      </p>
      <h2 className="text-lg">Email Verification</h2>
      <p className="text-base leading-6 border-l-2 border-red-600 mb-4 pl-4">
        Reset email verification. User needs to re-verify on next login.
        <br />
        <button
          className="bg-grey-10 border-2 border-grey-100 font-medium h-12 leading-6 mt-4 mr-4 rounded text-red-700 w-40 hover:border-2 hover:border-grey-10 hover:bg-grey-50 hover:text-red-700"
          type="button"
          onClick={handleUnverify}
        >
          Unverify Email
        </button>
        <br />
        {unverifyMessage}
      </p>
      <h2 className="text-lg">Disable Login</h2>
      <p className="text-base leading-6 border-l-2 border-red-600 mb-4 pl-4">
        Stops this account from logging in.
        <br />
        {disabledAt ? (
          <div>
            Disabled at: {dateFormat(new Date(disabledAt), DATE_FORMAT)}
          </div>
        ) : (
          <button
            className="bg-grey-10 border-2 border-grey-100 font-medium h-12 leading-6 mt-4 mr-4 rounded text-red-700 w-40 hover:border-2 hover:border-grey-10 hover:bg-grey-50 hover:text-red-700"
            type="button"
            onClick={handleDisable}
          >
            Disable
          </button>
        )}
      </p>
    </>
  );
};

export const Account = ({
  uid,
  emails,
  createdAt,
  disabledAt,
  emailBounces,
  totp,
  recoveryKeys,
  sessionTokens,
  onCleared,
  query,
  securityEvents,
}: AccountProps) => {
  const date = dateFormat(new Date(createdAt), DATE_FORMAT);
  const primaryEmail = emails!.find((email) => email.isPrimary)!;
  const secondaryEmails = emails!.filter((email) => !email.isPrimary);

  return (
    <section className="mt-8" data-testid="account-section">
      <ul>
        <li className={`${styleClasses.li} flex justify-between`}>
          <h3 data-testid="email-label" className="mt-0 my-0 mb-1 text-lg">
            <span
              className={`${
                query === primaryEmail.email ? 'bg-yellow-100' : undefined
              }`}
            >
              {primaryEmail.email}
            </span>
          </h3>
          <span
            data-testid="verified-status"
            className={`${
              primaryEmail.isVerified
                ? styleClasses.enabledOrVerified
                : styleClasses.notEnabledOrVerified
            }`}
          >
            {primaryEmail.isVerified ? 'verified' : 'not verified'}
          </span>
        </li>
        <li className={styleClasses.li}>
          <div data-testid="uid-label">
            uid: <span className={styleClasses.result}>{uid}</span>
          </div>
          <div className="text-right">
            created at:{' '}
            <span className={styleClasses.result} data-testid="createdat-label">
              {createdAt}
            </span>
            <br />
            {date}
            <br />
          </div>
        </li>

        <li className={styleClasses.li}>
          <h3 className="mt-0 my-0 mb-1 text-lg">Secondary Emails</h3>
        </li>
        {secondaryEmails.length > 0 ? (
          <li
            className={`{styleClasses.borderInfoDisplay} ${styleClasses.li} mb-5`}
            data-testid="secondary-section"
          >
            <ul>
              {secondaryEmails.map((secondaryEmail) => (
                <li key={secondaryEmail.createdAt} className={styleClasses.li}>
                  <span
                    data-testid="secondary-email"
                    className={`${
                      query === secondaryEmail.email
                        ? 'bg-yellow-100'
                        : undefined
                    }`}
                  >
                    {secondaryEmail.email}
                  </span>
                  <span
                    data-testid="secondary-verified"
                    className={`ml-3 text-base ${
                      secondaryEmail.isVerified
                        ? styleClasses.enabledOrVerified
                        : styleClasses.notEnabledOrVerified
                    }`}
                  >
                    {secondaryEmail.isVerified ? 'verified' : 'not verified'}
                  </span>
                </li>
              ))}
            </ul>
          </li>
        ) : (
          <li
            className={`${styleClasses.borderInfoDisplay} ${styleClasses.li}`}
          >
            This account doesn't have any secondary emails.
          </li>
        )}

        <li className={styleClasses.li}>
          <h3 className="mt-0 my-0 mb-1 text-lg">Email bounces</h3>
        </li>
        {emailBounces && emailBounces.length > 0 ? (
          <>
            <ClearButton
              {...{
                emails: emails!.map((emails) => emails.email),
                onCleared,
              }}
            />
            {emailBounces.map((emailBounce: EmailBounceType) => (
              <EmailBounce key={emailBounce.createdAt} {...emailBounce} />
            ))}
          </>
        ) : (
          <li
            data-testid="no-bounces-message"
            className={`${styleClasses.borderInfoDisplay} ${styleClasses.li}`}
          >
            This account doesn't have any bounced emails.
          </li>
        )}

        <li className={styleClasses.li}>
          <h3 className="mt-0 my-0 mb-1 text-lg">
            TOTP (Time-Based One-Time Passwords)
          </h3>
        </li>
        {totp && totp.length > 0 ? (
          <>
            {totp.map((totpIndex: TotpType) => (
              <TotpEnabled key={totpIndex.createdAt} {...totpIndex} />
            ))}
          </>
        ) : (
          <li
            className={`${styleClasses.borderInfoDisplay} ${styleClasses.li}`}
          >
            This account doesn't have TOTP enabled.
          </li>
        )}

        <li className={styleClasses.li}>
          <h3 className="mt-0 my-0 mb-1 text-lg">Recovery Key</h3>
        </li>
        {recoveryKeys && recoveryKeys.length > 0 ? (
          <>
            {recoveryKeys.map((recoveryKeysIndex: RecoveryKeysType) => (
              <RecoveryKeys
                key={recoveryKeysIndex.createdAt}
                {...recoveryKeysIndex}
              />
            ))}
          </>
        ) : (
          <li
            className={`${styleClasses.borderInfoDisplay} ${styleClasses.li}`}
          >
            This account doesn't have a recovery key enabled.
          </li>
        )}

        <li className={styleClasses.li}>
          <h3 className="mt-0 my-0 mb-1 text-lg">Current Session</h3>
        </li>
        {sessionTokens && sessionTokens.length > 0 ? (
          <>
            {sessionTokens.map((sessionTokensIndex: SessionTokensType) => (
              <SessionTokens
                key={sessionTokensIndex.createdAt}
                {...sessionTokensIndex}
              />
            ))}
          </>
        ) : (
          <li
            className={`${styleClasses.borderInfoDisplay} ${styleClasses.li}`}
          >
            This account is not currently signed in.
          </li>
        )}
      </ul>
      <hr className="border-grey-50 mb-4" />
      <h3 className="mt-0 my-0 mb-1 text-lg">Account History</h3>
      <div className={styleClasses.borderInfoDisplay}>
        {securityEvents && securityEvents.length > 0 ? (
          <>
            <TableContainer component={Paper}>
              <Table className="pt-1" aria-label="simple table">
                <TableHead>
                  <TableRow>
                    <TableCell>Event</TableCell>
                    <TableCell>Timestamp</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {securityEvents.map((securityEvents: SecurityEventsType) => (
                    <TableRow key={securityEvents.createdAt}>
                      <TableCell>{securityEvents.name}</TableCell>
                      <TableCell>
                        {dateFormat(
                          new Date(securityEvents.createdAt!),
                          DATE_FORMAT
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        ) : (
          <div
            data-testid="acccount-security-events"
            className="security-events"
          >
            No account history to display.
          </div>
        )}
      </div>
      <hr className="border-grey-50 mb-4" />
      <DangerZone
        {...{
          uid,
          disabledAt: disabledAt!,
          email: primaryEmail, // only the primary for now
          onCleared: onCleared,
        }}
      />
    </section>
  );
};

const EmailBounce = ({
  email,
  createdAt,
  bounceType,
  bounceSubType,
}: EmailBounceType) => {
  const date = dateFormat(new Date(createdAt), DATE_FORMAT);
  return (
    <li data-testid="bounce-group" className={styleClasses.li}>
      <ul className={styleClasses.borderInfoDisplay}>
        <li className={styleClasses.li}>
          email: <span className={styleClasses.result}>{email}</span>
        </li>
        <li className={styleClasses.li}>
          created at: <span className={styleClasses.result}>{createdAt}</span> (
          {date})
        </li>
        <li className={styleClasses.li}>
          bounce type: <span className={styleClasses.result}>{bounceType}</span>
        </li>
        <li className={styleClasses.li}>
          bounce subtype:{' '}
          <span className={styleClasses.result}>{bounceSubType}</span>
        </li>
      </ul>
    </li>
  );
};

const TotpEnabled = ({ verified, createdAt, enabled }: TotpType) => {
  const totpDate = dateFormat(new Date(createdAt), DATE_FORMAT);
  return (
    <li className={styleClasses.li}>
      <ul className={styleClasses.borderInfoDisplay}>
        <li className={styleClasses.li}>
          TOTP Created At:{' '}
          <span data-testid="totp-created-at" className={styleClasses.result}>
            {totpDate}
          </span>
        </li>
        <li className={styleClasses.li}>
          TOTP Verified:{' '}
          <span
            data-testid="totp-verified"
            className={`ml-3 text-base ${
              verified
                ? styleClasses.enabledOrVerified
                : styleClasses.notEnabledOrVerified
            }`}
          >
            {verified ? 'verified' : 'not verified'}
          </span>
        </li>
        <li className={styleClasses.li}>
          TOTP Enabled:{' '}
          <span
            data-testid="totp-enabled"
            className={`ml-3 text-base ${
              enabled
                ? styleClasses.enabledOrVerified
                : styleClasses.notEnabledOrVerified
            }`}
          >
            {enabled ? 'enabled' : 'not-enabled'}
          </span>
        </li>
      </ul>
    </li>
  );
};

const RecoveryKeys = ({ verifiedAt, createdAt, enabled }: RecoveryKeysType) => {
  const recoveryKeyCreatedDate = dateFormat(new Date(createdAt!), DATE_FORMAT);
  const recoveryKeyVerifiedDate = dateFormat(
    new Date(verifiedAt!),
    DATE_FORMAT
  );
  return (
    <li className={styleClasses.li}>
      <ul className={styleClasses.borderInfoDisplay}>
        <li className={styleClasses.li}>
          Recovery Key Created At:{' '}
          <span
            data-testid="recovery-keys-created-at"
            className={styleClasses.result}
          >
            {recoveryKeyCreatedDate}
          </span>
        </li>
        <li className={styleClasses.li}>
          Recovery Key Verified At:{' '}
          <span
            data-testid="recovery-keys-verified"
            className={`ml-3 text-base ${
              verifiedAt
                ? styleClasses.enabledOrVerified
                : styleClasses.notEnabledOrVerified
            }`}
          >
            {verifiedAt ? recoveryKeyVerifiedDate : 'not verified'}
          </span>
        </li>
        <li className={styleClasses.li}>
          Recovery Key Enabled:{' '}
          <span
            data-testid="recovery-keys-enabled"
            className={`ml-3 text-base ${
              enabled
                ? styleClasses.enabledOrVerified
                : styleClasses.notEnabledOrVerified
            }`}
          >
            {enabled ? 'enabled' : 'not-enabled'}
          </span>
        </li>
      </ul>
    </li>
  );
};

const SessionTokens = ({
  createdAt,
  uaBrowser,
  uaBrowserVersion,
  uaOS,
  uaOSVersion,
  uaDeviceType,
  lastAccessTime,
}: SessionTokensType) => {
  return (
    <li className={styleClasses.li}>
      <ul className={styleClasses.borderInfoDisplay}>
        <li className={styleClasses.li}>
          Created At:{' '}
          <span
            data-testid="session-token-created-at"
            className={styleClasses.result}
          >
            {dateFormat(new Date(createdAt!), DATE_FORMAT)}
          </span>
        </li>
        <li className={styleClasses.li}>
          Last Used:{' '}
          <span
            data-testid="session-token-accessed-at"
            className={styleClasses.result}
          >
            {dateFormat(new Date(lastAccessTime!), DATE_FORMAT)}
          </span>
        </li>
        <li className={styleClasses.li}>
          Browser:{' '}
          <span
            data-testid="session-token-browser"
            className={styleClasses.result}
          >
            {uaBrowser} {uaBrowserVersion}
          </span>
        </li>
        <li className={styleClasses.li}>
          Operating System:{' '}
          <span
            data-testid="session-token-operating-system"
            className={styleClasses.result}
          >
            {uaOS} {uaOSVersion}
          </span>
        </li>
        <li className={styleClasses.li}>
          Device:{' '}
          <span
            data-testid="session-token-device"
            className={styleClasses.result}
          >
            {uaDeviceType}
          </span>
        </li>
      </ul>
    </li>
  );
};

export default Account;
