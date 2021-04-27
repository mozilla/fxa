/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import dateFormat from 'dateformat';
import { gql, useMutation } from '@apollo/client';
import './index.scss';

type AccountProps = {
  uid: string;
  createdAt: number;
  emails: EmailProps[];
  emailBounces: EmailBounceProps[];
  totp: TotpProps[];
  recoveryKeys: RecoveryKeysProps[];
  sessionTokens: SessionTokensProps[];
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

type TotpProps = {
  verified: boolean;
  createdAt: number;
  enabled: boolean;
};

type RecoveryKeysProps = {
  createdAt: number;
  verifiedAt: number;
  enabled: boolean;
};

type SessionTokensProps = {
  tokenId: string;
  tokenData: string;
  uid: string;
  createdAt: number;
  uaBrowser: string;
  uaBrowserVersion: string;
  uaOS: string;
  uaOSVersion: string;
  uaDeviceType: string;
  lastAccessTime: number;
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

export const DangerZone = () => {
  const alertWindow = () => {
    window.alert('Implementation coming soon.');
    return;
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
        <button className="danger-zone-button" onClick={alertWindow}>
          Lock Account
        </button>
        <button className="danger-zone-button" onClick={alertWindow}>
          Unlock Account
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
  emailBounces,
  totp,
  recoveryKeys,
  sessionTokens,
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
            <br />
          </div>
        </li>
        <li></li>

        <li>
          <h3>Secondary Emails</h3>
        </li>
        {secondaryEmails.length > 0 ? (
          <li
            className="secondary-emails gradient-info-display"
            data-testid="secondary-section"
          >
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
        ) : (
          <li data-testid="" className="gradient-info-display">
            This account doesn't have any secondary emails.
          </li>
        )}
        <li></li>
        <br />

        <li>
          <h3>Email bounces</h3>
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
        <li></li>
        <br />

        <li>
          <h3>TOTP (Time-Based One-Time Passwords)</h3>
        </li>
        {totp.length > 0 ? (
          <>
            {totp.map((totpIndex: TotpProps) => (
              <TotpEnabled key={totpIndex.createdAt} {...totpIndex} />
            ))}
          </>
        ) : (
          <li data-testid="" className="gradient-info-display">
            This account doesn't have TOTP enabled.
          </li>
        )}
        <li></li>
        <br />

        <li>
          <h3>Recovery Key</h3>
        </li>
        {recoveryKeys.length > 0 ? (
          <>
            {recoveryKeys.map((recoveryKeysIndex: RecoveryKeysProps) => (
              <RecoveryKeys
                key={recoveryKeysIndex.createdAt}
                {...recoveryKeysIndex}
              />
            ))}
          </>
        ) : (
          <li data-testid="" className="gradient-info-display">
            This account doesn't have a recovery key enabled.
          </li>
        )}
        <li></li>
        <br />
        
        <li>
          <h3>Current Session</h3>
        </li>
        {sessionTokens.length > 0 ? (
          <>
            {sessionTokens.map((sessionTokensIndex: SessionTokensProps) => (
              <SessionTokens
                key={sessionTokensIndex.createdAt}
                {...sessionTokensIndex}
              />
            ))}
          </>
        ) : (
          <li data-testid="" className="gradient-info-display">
            This account is not currently signed in.
          </li>
        )}
        <li></li>
        <br />
        <hr />
        <DangerZone />
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
      <ul className="gradient-info-display">
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

const TotpEnabled = ({ verified, createdAt, enabled }: TotpProps) => {
  const totpDate = dateFormat(new Date(createdAt), DATE_FORMAT);
  return (
    <li data-testid="">
      <ul className="gradient-info-display">
        <li>
          TOTP Created At:{' '}
          <span data-testid="totp-created-at" className="result">
            {totpDate}
          </span>
        </li>
        <li>
          TOTP Verified:{' '}
          <span
            data-testid="totp-verified"
            className={`verification ${verified ? 'verified' : 'not-verified'}`}
          >
            {verified ? 'verified' : 'not verified'}
          </span>
        </li>
        <li>
          TOTP Enabled:{' '}
          <span
            data-testid="totp-enabled"
            className={`verification ${enabled ? 'enabled' : 'not-enabled'}`}
          >
            {enabled ? 'enabled' : 'not-enabled'}
          </span>
        </li>
      </ul>
    </li>
  );
};

const RecoveryKeys = ({
  verifiedAt,
  createdAt,
  enabled,
}: RecoveryKeysProps) => {
  const recoveryKeyCreatedDate = dateFormat(new Date(createdAt), DATE_FORMAT);
  const recoveryKeyVerifiedDate = dateFormat(new Date(verifiedAt), DATE_FORMAT);
  return (
    <li data-testid="">
      <ul className="gradient-info-display">
        <li>
          Recovery Key Created At:{' '}
          <span data-testid="recovery-keys-created-at" className="result">
            {recoveryKeyCreatedDate}
          </span>
        </li>
        <li>
          Recovery Key Verified At:{' '}
          <span
            data-testid="recovery-keys-verified"
            className={`verification ${
              verifiedAt ? 'verified' : 'not-verified'
            }`}
          >
            {verifiedAt ? recoveryKeyVerifiedDate : 'not verified'}
          </span>
        </li>
        <li>
          Recovery Key Enabled:{' '}
          <span
            data-testid="recovery-keys-enabled"
            className={`verification ${enabled ? 'enabled' : 'not-enabled'}`}
          >
            {enabled ? 'enabled' : 'not-enabled'}
          </span>
        </li>
      </ul>
    </li>
  );
};

const SessionTokens = ({
  tokenId,
  tokenData,
  uid,
  createdAt,
  uaBrowser,
  uaBrowserVersion,
  uaOS,
  uaOSVersion,
  uaDeviceType,
  lastAccessTime,
}: SessionTokensProps) => {
  const lastAccessDate = dateFormat(new Date(lastAccessTime), DATE_FORMAT);
  return (
    <li data-testid="">
      <ul className="gradient-info-display">
        <li>
          Date Accessed:{' '}
          <span data-testid="session-token-accessed-at" className="result">
            {lastAccessDate}
          </span>
        </li>
        <li>
          Browser:{' '}
          <span data-testid="session-token-browser" className="result">
            {uaBrowser} {uaBrowserVersion}
          </span>
        </li>
        <li>
          Operating System:{' '}
          <span data-testid="session-token-operating-system" className="result">
            {uaOS} {uaOSVersion}
          </span>
        </li>
        <li>
          Device:{' '}
          <span data-testid="session-token-device" className="result">
            {uaDeviceType}
          </span>
        </li>
      </ul>
    </li>
  );
};

export default Account;
