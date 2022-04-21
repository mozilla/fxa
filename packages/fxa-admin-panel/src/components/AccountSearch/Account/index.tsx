/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import dateFormat from 'dateformat';
import { gql, useMutation } from '@apollo/client';
import {
  Account as AccountType,
  EmailBounce as EmailBounceType,
  Email as EmailType,
  SecurityEvents as SecurityEventsType,
  Totp as TotpType,
  RecoveryKeys as RecoveryKeysType,
  AttachedClient as AttachedClientType,
  Location,
  LinkedAccount as LinkedAccountType,
} from 'fxa-admin-server/src/graphql';

import { AdminPanelFeature } from 'fxa-shared/guards';
import Guard from '../../Guard';
import Subscription from '../Subscription';

export type AccountProps = AccountType & {
  onCleared: () => void;
  query: string;
};

type DangerZoneProps = {
  uid: string;
  email: EmailType;
  disabledAt: number | null;
  onCleared: Function;
};

export const DATE_FORMAT = 'yyyy-mm-dd @ HH:MM:ss Z';

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

export const UNLINK_ACCOUNT = gql`
  mutation unlinkAccount($uid: String!) {
    unlinkAccount(uid: $uid)
  }
`;

export const LinkedAccount = ({
  uid,
  authAt,
  providerId,
  onCleared,
}: {
  uid: string;
  authAt: number;
  providerId: string;
  onCleared: () => void;
}) => {
  const [unlinkAccount] = useMutation(UNLINK_ACCOUNT, {
    onCompleted: () => {
      window.alert('The linked account has been removed.');
    },
    onError: () => {
      window.alert('Error unlinking account');
    },
  });

  const handleUnlinkAccount = async () => {
    if (!window.confirm('Are you sure? This cannot be undone.')) {
      return;
    }
    await unlinkAccount({ variables: { uid } });

    onCleared();
  };

  return (
    <tr key={`${authAt}-${providerId}`}>
      <td>{providerId}</td>
      <td className="text-left pl-8">
        {dateFormat(new Date(authAt!), DATE_FORMAT)}
      </td>
      <td className="pl-4 align-middle">
        <button
          className="p-1 text-red-700 border-2 rounded border-grey-100 bg-grey-10 hover:border-2 hover:border-grey-10 hover:bg-grey-50 hover:text-red-700"
          type="button"
          onClick={handleUnlinkAccount}
        >
          Unlink
        </button>
      </td>
    </tr>
  );
};

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
    <>
      <Guard features={[AdminPanelFeature.ClearEmailBounces]}>
        <button
          data-testid="clear-button"
          className="bg-red-600 border-0 rounded-md text-base mt-3 mx-0 mb-6 px-4 py-3 text-white transition duration-200 hover:bg-red-700"
          onClick={handleClear}
        >
          Clear all bounces
        </button>
      </Guard>
    </>
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

  const [disableAccount] = useMutation(DISABLE_ACCOUNT, {
    onCompleted: () => {
      window.alert('The account has been disabled.');
      onCleared();
    },
    onError: () => {
      window.alert('Error disabling account');
    },
  });

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
      <Guard
        features={[
          AdminPanelFeature.UnVerifyAccounts,
          AdminPanelFeature.DisableAccounts,
        ]}
      >
        <h3 className="mt-0 my-0 mb-1 bg-red-600 font-medium h-8 pb-8 pl-1 pt-1 rounded-sm text-lg text-white">
          Danger Zone
        </h3>
        <p className="text-base leading-6 mb-4">
          Please run these commands with caution — some actions are
          irreversible.
        </p>
      </Guard>
      <Guard features={[AdminPanelFeature.UnVerifyAccounts]}>
        <h2 className="account-header">Email Verification</h2>
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
      </Guard>
      <Guard features={[AdminPanelFeature.DisableAccounts]}>
        <h2 className="account-header">Disable Login</h2>
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
      </Guard>
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
  attachedClients,
  subscriptions,
  onCleared,
  query,
  securityEvents,
  linkedAccounts,
}: AccountProps) => {
  const date = dateFormat(new Date(createdAt), DATE_FORMAT);
  const primaryEmail = emails!.find((email) => email.isPrimary)!;
  const secondaryEmails = emails!.filter((email) => !email.isPrimary);
  return (
    <section className="mt-8" data-testid="account-section">
      <ul>
        <li className="account-li flex justify-between">
          <h3 data-testid="email-label" className="account-header">
            <span
              className={
                query === primaryEmail.email ? 'bg-yellow-100' : undefined
              }
            >
              {primaryEmail.email}
            </span>
          </h3>
          <span
            data-testid="verified-status"
            className={
              primaryEmail.isVerified
                ? 'account-enabled-verified'
                : 'account-disabled-unverified'
            }
          >
            {primaryEmail.isVerified ? 'verified' : 'not verified'}
          </span>
        </li>
        <li className="account-li">
          <div data-testid="uid-label">
            uid: <span>{uid}</span>
          </div>
          <div className="text-right">
            created at: <span data-testid="createdat-label">{createdAt}</span>
            <br />
            {date}
            <br />
          </div>
        </li>

        <li className="account-li">
          <h3 className="account-header">Secondary Emails</h3>
        </li>
        {secondaryEmails.length > 0 ? (
          <li
            className="account-li account-border-info"
            data-testid="secondary-section"
          >
            <ul>
              {secondaryEmails.map((secondaryEmail) => (
                <li key={secondaryEmail.createdAt} className="account-li">
                  <span
                    data-testid="secondary-email"
                    className={
                      query === secondaryEmail.email
                        ? 'bg-yellow-100'
                        : undefined
                    }
                  >
                    {secondaryEmail.email}
                  </span>
                  <span
                    data-testid="secondary-verified"
                    className={`ml-3 text-base ${
                      secondaryEmail.isVerified
                        ? 'account-enabled-verified'
                        : 'account-disabled-unverified'
                    }`}
                  >
                    {secondaryEmail.isVerified ? 'verified' : 'not verified'}
                  </span>
                </li>
              ))}
            </ul>
          </li>
        ) : (
          <li className="account-li account-border-info">
            This account doesn't have any secondary emails.
          </li>
        )}

        <li className="account-li">
          <h3 className="account-header">Email bounces</h3>
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
            className="account-li account-border-info"
          >
            This account doesn't have any bounced emails.
          </li>
        )}

        <li className="account-li">
          <h3 className="account-header">
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
          <li className="account-li account-border-info">
            This account doesn't have TOTP enabled.
          </li>
        )}

        <li className="account-li">
          <h3 className="account-header">Recovery Key</h3>
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
          <li className="account-li account-border-info">
            This account doesn't have a recovery key enabled.
          </li>
        )}

        <Guard features={[AdminPanelFeature.ConnectedServices]}>
          <li className="account-li">
            <h3 className="account-header">Connected Services</h3>
          </li>
          {attachedClients && attachedClients.length > 0 ? (
            <>
              {attachedClients.map((attachedClient: AttachedClientType) => (
                <AttachedClients
                  key={`${attachedClient.name}-${
                    attachedClient.sessionTokenId ||
                    attachedClient.refreshTokenId ||
                    attachedClient.clientId ||
                    'unknown'
                  }-${attachedClient.createdTime}`}
                  {...attachedClient}
                />
              ))}
            </>
          ) : (
            <li className="account-li account-border-info">
              This account has nothing attached.
            </li>
          )}
        </Guard>

        {/* Temporary check for fake hard-coded value until we fetch actual subscriptions in FXA-4237 */}
        {subscriptions &&
          subscriptions[0].productName !== 'Cooking with Foxkeh' && (
            <>
              <li className="account-li">
                <h3 className="account-header">Subscriptions</h3>
              </li>
              {subscriptions && subscriptions.length > 0 ? (
                <>
                  {subscriptions.map((subscription) => (
                    <Subscription
                      key={subscription.subscriptionId}
                      {...subscription}
                    />
                  ))}
                </>
              ) : (
                <li className="account-li account-border-info">
                  This account doesn't have any subscriptions.
                </li>
              )}
            </>
          )}
      </ul>

      <hr className="border-grey-50 mb-4" />
      <h3 className="account-header">Account History</h3>
      <div className="account-li account-border-info">
        {securityEvents && securityEvents.length > 0 ? (
          <>
            <table className="pt-1" aria-label="simple table">
              <thead>
                <tr>
                  <th className="text-left">Event</th>
                  <th className="text-left">Timestamp</th>
                </tr>
              </thead>

              <tbody>
                {securityEvents.map((securityEvents: SecurityEventsType) => (
                  <tr key={securityEvents.createdAt}>
                    <td className="pr-4">{securityEvents.name}</td>
                    <td>
                      {dateFormat(
                        new Date(securityEvents.createdAt!),
                        DATE_FORMAT
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        ) : (
          <div data-testid="acccount-security-events">
            No account history to display.
          </div>
        )}
      </div>
      <h3 className="account-header">Linked Accounts</h3>
      <div className="account-border-info">
        {linkedAccounts && linkedAccounts.length > 0 ? (
          <>
            <table className="pt-1" aria-label="simple table">
              <thead>
                <tr>
                  <th className="text-left">Event</th>
                  <th className="text-left">Timestamp</th>
                </tr>
              </thead>

              <tbody>
                {linkedAccounts.map((linkedAccount: LinkedAccountType) => (
                  <LinkedAccount
                    {...{
                      uid,
                      providerId: linkedAccount.providerId,
                      authAt: linkedAccount.authAt,
                      onCleared: onCleared,
                    }}
                  />
                ))}
              </tbody>
            </table>
          </>
        ) : (
          <div data-testid="account-security-events">No linked accounts.</div>
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
  templateName,
  createdAt,
  bounceType,
  bounceSubType,
}: EmailBounceType) => {
  const date = dateFormat(new Date(createdAt), DATE_FORMAT);
  return (
    <li data-testid="bounce-group" className="account-li">
      <ul className="account-border-info">
        <li className="account-li">
          email: <span>{email}</span>
        </li>
        <li className="account-li">
          template: <span>{templateName}</span>
        </li>
        <li className="account-li">
          created at: <span>{createdAt}</span> ({date})
        </li>
        <li className="account-li">
          bounce type: <span>{bounceType}</span>
        </li>
        <li className="account-li">
          bounce subtype: <span>{bounceSubType}</span>
        </li>
      </ul>
    </li>
  );
};

const TotpEnabled = ({ verified, createdAt, enabled }: TotpType) => {
  const totpDate = dateFormat(new Date(createdAt), DATE_FORMAT);
  return (
    <li className="account-li">
      <ul className="account-border-info">
        <li className="account-li">
          TOTP Created At: <span data-testid="totp-created-at">{totpDate}</span>
        </li>
        <li className="account-li">
          TOTP Verified:{' '}
          <span
            data-testid="totp-verified"
            className={`ml-3 text-base ${
              verified
                ? 'account-enabled-verified'
                : 'account-disabled-unverified'
            }`}
          >
            {verified ? 'verified' : 'not verified'}
          </span>
        </li>
        <li className="account-li">
          TOTP Enabled:{' '}
          <span
            data-testid="totp-enabled"
            className={`ml-3 text-base ${
              enabled
                ? 'account-enabled-verified'
                : 'account-disabled-unverified'
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
    <li className="account-li">
      <ul className="account-border-info">
        <li className="account-li">
          Recovery Key Created At:{' '}
          <span data-testid="recovery-keys-created-at">
            {recoveryKeyCreatedDate}
          </span>
        </li>
        <li className="account-li">
          Recovery Key Verified At:{' '}
          <span
            data-testid="recovery-keys-verified"
            className={`ml-3 text-base ${
              verifiedAt
                ? 'account-enabled-verified'
                : 'account-disabled-unverified'
            }`}
          >
            {verifiedAt ? recoveryKeyVerifiedDate : 'not verified'}
          </span>
        </li>
        <li className="account-li">
          Recovery Key Enabled:{' '}
          <span
            data-testid="recovery-keys-enabled"
            className={`ml-3 text-base ${
              enabled
                ? 'account-enabled-verified'
                : 'account-disabled-unverified'
            }`}
          >
            {enabled ? 'enabled' : 'not-enabled'}
          </span>
        </li>
      </ul>
    </li>
  );
};

const AttachedClients = ({
  clientId,
  createdTime,
  createdTimeFormatted,
  deviceId,
  deviceType,
  lastAccessTime,
  lastAccessTimeFormatted,
  location,
  name,
  os,
  userAgent,
  sessionTokenId,
  refreshTokenId,
}: AttachedClientType) => {
  const testId = (id: string) => `attached-clients-${id}`;
  return (
    <li className="account-li">
      <ul className="account-border-info">
        <ResultListItem
          label="Client"
          value={format.client(name, clientId)}
          testId={testId('client')}
        />
        <ResultListItem
          label="Device Type"
          value={format.deviceType(deviceType, sessionTokenId, deviceId)}
          testId={testId('device-type')}
        />
        <ResultListItem
          label="User Agent"
          value={userAgent}
          testId={testId('user-agent')}
        />
        <ResultListItem
          label="Operating System"
          value={os}
          testId={testId('os')}
        />
        <ResultListItem
          label="Created At"
          value={format.time(createdTime, createdTimeFormatted)}
          testId={testId('created-at')}
        />
        <ResultListItem
          label="Last Used"
          value={format.time(lastAccessTime, lastAccessTimeFormatted)}
          testId={testId('last-accessed-at')}
        />
        <ResultListItem
          label="Location"
          value={format.location(location)}
          testId={testId('location')}
        />
        <ResultListItem
          label="Client ID"
          value={clientId || 'N/A'}
          testId={testId('client-id')}
        />
        <ResultListItem
          label="Device ID"
          value={deviceId || 'N/A'}
          testId={testId('device-id')}
        />
        <ResultListItem
          label="Session Token ID"
          value={sessionTokenId || 'N/A'}
          testId={testId('session-token-id')}
        />
        <ResultListItem
          label="Refresh Token ID"
          value={refreshTokenId || 'N/A'}
          testId={testId('refresh-token-id')}
        />
      </ul>
    </li>
  );
};

const ResultListItem = ({
  label,
  value,
  testId,
}: {
  label: string;
  value: any;
  testId: string;
}) => {
  return (
    <li className="account-li">
      {label}:{' '}
      <span data-testid={testId}>{value ? value : <i>Unknown</i>}</span>
    </li>
  );
};

type Nullable<T> = T | null;

const format = {
  location(location?: Nullable<Location>) {
    if (
      !location ||
      (!location.city &&
        !location.state &&
        !location.stateCode &&
        !location.country &&
        !location.countryCode)
    ) {
      return null;
    }

    return (
      <>
        {[
          location.city || <i>Unknown City</i>,
          location.state || location.stateCode || '',
          location.country || location.country || <i>Unknown Country</i>,
        ].join(', ')}
      </>
    );
  },
  time(raw?: Nullable<number>, formatted?: Nullable<string>) {
    if (!raw || raw < 1) return null;

    return (
      <>
        {dateFormat(new Date(raw), DATE_FORMAT)}
        {formatted ? <i> ({formatted})</i> : <></>}
      </>
    );
  },
  client(name?: Nullable<string>, clientId?: Nullable<string>) {
    return (
      <>
        {name} {clientId && <i>[{clientId}]</i>}
      </>
    );
  },
  deviceType(
    deviceType?: Nullable<string>,
    sessionId?: Nullable<string>,
    deviceId?: Nullable<string>
  ) {
    // This logic might be better at the api level, but it's probably better not to introduce a breaking change.
    return deviceType
      ? deviceType
      : sessionId || deviceId
      ? 'desktop'
      : 'unknown';
  },
};

export default Account;
