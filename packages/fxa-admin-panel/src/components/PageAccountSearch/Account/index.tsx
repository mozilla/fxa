/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { useMutation } from '@apollo/client';
import {
  Account as AccountType,
  SecurityEvents as SecurityEventsType,
  Totp as TotpType,
  RecoveryKeys as RecoveryKeysType,
  LinkedAccount as LinkedAccountType,
  AccountEvent as AccountEventType,
  BackupCodes as BackupCodesType,
  RecoveryPhone as RecoveryPhoneType,
} from 'fxa-admin-server/src/graphql';
import { AdminPanelFeature } from 'fxa-shared/guards';
import Guard from '../../Guard';
import Subscription from '../Subscription';
import { ConnectedServices } from '../ConnectedServices';
import { TableRowYHeader, TableYHeaders } from '../../TableYHeaders';
import { TableRowXHeader, TableXHeaders } from '../../TableXHeaders';
import EmailBounces from '../EmailBounces';
import { getFormattedDate } from '../../../lib/utils';
import DangerZone from '../DangerZone';
import ResultBoolean from '../../ResultBoolean';
import { HIDE_ROW } from '../../../../constants';
import { EDIT_LOCALE, UNLINK_ACCOUNT } from './index.gql';
import { Carts } from '../Cart';

export type AccountProps = AccountType & {
  onCleared: () => void;
  query: string;
};

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
    <TableRowXHeader>
      <>{providerId}</>
      <>{getFormattedDate(authAt)}</>
      <button
        className="p-1 text-red-700 border-2 rounded border-grey-100 bg-grey-10 hover:border-grey-10 hover:bg-grey-50 hover:text-red-700"
        type="button"
        onClick={handleUnlinkAccount}
      >
        Unlink
      </button>
    </TableRowXHeader>
  );
};

export const Account = ({
  uid,
  email,
  emails,
  createdAt,
  disabledAt,
  locale,
  lockedAt,
  emailBounces,
  totp: totps,
  recoveryKeys,
  attachedClients,
  subscriptions,
  carts,
  onCleared,
  query,
  securityEvents,
  linkedAccounts,
  accountEvents,
  verifierSetAt,
  clientSalt,
  backupCodes,
  recoveryPhone,
}: AccountProps) => {
  const createdAtDate = getFormattedDate(createdAt);
  const disabledAtDate = getFormattedDate(disabledAt);
  const lockedAtDate = getFormattedDate(lockedAt);
  const primaryEmail = emails!.find((email) => email.isPrimary)!;
  const secondaryEmails = emails!.filter((email) => !email.isPrimary);

  const [editLocale] = useMutation(EDIT_LOCALE, {});
  const handleEditLocale = async () => {
    try {
      const newLocale = window.prompt('Enter a new locale.');
      if (!newLocale) {
        return;
      }

      const res = await editLocale({
        variables: {
          uid,
          locale: newLocale,
        },
      });

      if (res.data?.editLocale) {
        onCleared();
      } else {
        window.alert(`Edit unsuccessful.`);
      }
    } catch (err) {
      window.alert(`An unexpected error was encountered. Edit unsuccessful.`);
    }
  };

  function highlight(val: string) {
    return query === val ? 'bg-yellow-100' : undefined;
  }

  return (
    <>
      <hr />
      <section data-testid="account-section">
        <TableYHeaders header="Account Details">
          <TableRowYHeader
            header="Sign-up Email"
            children={<span className={highlight(email)}>{email}</span>}
            testId="sign-up-email"
          />
          <TableRowYHeader
            header="uid"
            children={<span className={highlight(uid)}>{uid}</span>}
            testId="account-uid"
          />
          <TableRowYHeader
            header="Created At"
            children={`${createdAtDate} (${createdAt})`}
            testId="account-created-at"
          />
          <TableRowYHeader
            header="Password Set"
            children={verifierSetAt != null && verifierSetAt > 0 ? 'Yes' : 'No'}
            testId="account-password-set"
          />
          <TableRowYHeader
            header="Key Stretch Version"
            children={/quickStretchV2:/.test(clientSalt || '') ? 'v2' : 'v1'}
            testId="key-stretch-version"
          />
          <TableRowYHeader
            header="Locale"
            children={
              <>
                {locale}

                <Guard features={[AdminPanelFeature.EditLocale]}>
                  <button
                    className="bg-grey-10 border-2 border-grey-100 font-small leading-6 ml-2 rounded text-red-700 w-10 hover:border-2 hover:border-grey-10 hover:bg-grey-50"
                    type="button"
                    onClick={handleEditLocale}
                    data-testid="edit-account-locale"
                  >
                    Edit
                  </button>
                </Guard>
              </>
            }
            testId="account-locale"
          />
          <>
            {lockedAt != null && (
              <TableRowYHeader
                header="Locked At"
                className="bg-yellow-100"
                children={`${lockedAtDate} (${lockedAt})`}
                testId="account-locked-at"
              />
            )}
          </>
          <>
            {disabledAt != null && (
              <TableRowYHeader
                header="Disabled At"
                className="bg-yellow-100"
                children={`${disabledAtDate} (${disabledAt})`}
                testId="account-disabled-at"
              />
            )}
          </>
        </TableYHeaders>

        <TableXHeaders
          header="Primary Email"
          rowHeaders={['Email', 'Confirmed']}
        >
          <TableRowXHeader>
            <span
              data-testid="primary-email"
              className={highlight(primaryEmail.email)}
            >
              {primaryEmail.email}
            </span>

            <ResultBoolean
              isTruthy={primaryEmail.isVerified}
              testId="primary-verified"
            />
          </TableRowXHeader>
        </TableXHeaders>

        <h3 className="header-lg">Secondary Emails</h3>
        {secondaryEmails.length > 0 ? (
          <TableXHeaders
            rowHeaders={['Email', 'Confirmed']}
            testId="secondary-section"
          >
            {secondaryEmails.map((secondaryEmail) => (
              <TableRowXHeader key={secondaryEmail.createdAt}>
                <span
                  data-testid="secondary-email"
                  className={highlight(secondaryEmail.email)}
                >
                  {secondaryEmail.email}
                </span>
                <ResultBoolean
                  isTruthy={secondaryEmail.isVerified}
                  testId="secondary-verified"
                />
              </TableRowXHeader>
            ))}
          </TableXHeaders>
        ) : (
          <p className="result-none">
            This account doesn't have any secondary emails.
          </p>
        )}

        <EmailBounces {...{ emailBounces, uid, emails, onCleared }} />

        <h3 className="header-lg">
          2FA / TOTP (Time-Based One-Time Passwords)
        </h3>
        {totps && totps.length > 0 ? (
          <>
            <TableXHeaders rowHeaders={['Created At', 'Enabled', 'Confirmed']}>
              {totps.map((totp: TotpType) => (
                <TableRowXHeader key={totp.createdAt}>
                  <td data-testid="totp-created-at">
                    {getFormattedDate(totp.createdAt)}
                  </td>
                  <ResultBoolean
                    isTruthy={totp.enabled}
                    testId="totp-enabled"
                  />
                  <ResultBoolean
                    isTruthy={totp.verified}
                    testId="totp-verified"
                  />
                </TableRowXHeader>
              ))}
            </TableXHeaders>
            <h3 className="mb-2">2FA Recovery Methods</h3>
            {backupCodes && backupCodes.length > 0 ? (
              <TableXHeaders
                rowHeaders={['Method', 'Enabled', 'Codes remaining']}
              >
                {backupCodes.map((backupCode: BackupCodesType, index) => (
                  <TableRowXHeader key={`backupCodes-${index}`}>
                    <td>Backup codes</td>
                    <ResultBoolean
                      isTruthy={backupCode.hasBackupCodes}
                      testId="backup-codes-exists"
                    />
                    <td data-testid="backup-codes-count">{backupCode.count}</td>
                  </TableRowXHeader>
                ))}
              </TableXHeaders>
            ) : (
              <p className="result-none">
                No backup authentication codes available.
              </p>
            )}
            {recoveryPhone ? (
              recoveryPhone.map((recoveryPhone: RecoveryPhoneType, index) => (
                <TableXHeaders
                  rowHeaders={['Method', 'Enabled', 'Phone number']}
                >
                  <TableRowXHeader key={`recoveryPhone-${index}`}>
                    <td>Recovery phone</td>
                    <ResultBoolean
                      isTruthy={recoveryPhone.exists}
                      testId="recovery-phone-exists"
                    />
                    <td data-testid="recovery-phone-number">
                      {recoveryPhone.lastFourDigits
                        ? `(***) ***-${recoveryPhone.lastFourDigits}`
                        : 'None'}
                    </td>
                  </TableRowXHeader>
                </TableXHeaders>
              ))
            ) : (
              <p className="result-none">No recovery phone configured.</p>
            )}
          </>
        ) : (
          <p className="result-none">
            This account hasn't started 2FA / TOTP setup.
          </p>
        )}

        <h3 className="header-lg">Account Recovery Key</h3>
        {recoveryKeys && recoveryKeys.length > 0 ? (
          <>
            {recoveryKeys.map((recoveryKey: RecoveryKeysType) => (
              <TableYHeaders key={createdAt}>
                <TableRowYHeader
                  header="Created At"
                  children={getFormattedDate(recoveryKey.createdAt)}
                  testId="recovery-keys-created-at"
                />
                <TableRowYHeader
                  header="Enabled"
                  children={<ResultBoolean isTruthy={!!recoveryKey.enabled} />}
                  testId="recovery-keys-enabled"
                />
                <TableRowYHeader
                  header="Confirmed"
                  children={
                    <ResultBoolean isTruthy={!!recoveryKey.verifiedAt} />
                  }
                  testId="recovery-keys-verified"
                />
                <TableRowYHeader
                  header="Confirmed At"
                  children={
                    recoveryKey.verifiedAt
                      ? getFormattedDate(recoveryKey.verifiedAt)
                      : HIDE_ROW
                  }
                />
              </TableYHeaders>
            ))}
          </>
        ) : (
          <p className="result-none">
            This account doesn't have an account recovery key created.
          </p>
        )}

        <h3 className="header-lg">Subscriptions</h3>
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
          <p className="result-none">
            This account doesn't have any subscriptions.
          </p>
        )}

        <h3 className="header-lg">Carts</h3>
        <Carts carts={carts} />

        <Guard features={[AdminPanelFeature.ConnectedServices]}>
          <h3 className="header-lg">Connected Services</h3>
          <ConnectedServices services={attachedClients} />
        </Guard>

        <h3 className="header-lg">Account History</h3>
        {securityEvents && securityEvents.length > 0 ? (
          <TableXHeaders
            rowHeaders={['Event', 'Timestamp', 'IP', 'Additional Info']}
          >
            {securityEvents.map((securityEvent: SecurityEventsType) => {
              return (
                <TableRowXHeader key={securityEvent.uid}>
                  <>{securityEvent.name}</>
                  <>{getFormattedDate(securityEvent.createdAt)}</>
                  <>{securityEvent.ipAddr}</>
                  <>{securityEvent.additionalInfo}</>
                </TableRowXHeader>
              );
            })}
          </TableXHeaders>
        ) : (
          <p data-testid="account-security-events" className="result-none">
            This account doesn't have any account history.
          </p>
        )}

        <h3 className="header-lg">Email History</h3>
        {accountEvents && accountEvents.length > 0 ? (
          <TableXHeaders rowHeaders={['Event', 'Template', 'Timestamp']}>
            {accountEvents.map((accountEvent: AccountEventType) => (
              <TableRowXHeader key={accountEvent.createdAt}>
                <>{accountEvent.name}</>
                <>{accountEvent.template}</>
                <>{getFormattedDate(accountEvent.createdAt)}</>
              </TableRowXHeader>
            ))}
          </TableXHeaders>
        ) : (
          <p data-testid="account-events" className="result-none">
            This account doesn't have any email history.
          </p>
        )}

        <h3 className="header-lg">Linked Accounts</h3>
        {linkedAccounts && linkedAccounts.length > 0 ? (
          <TableXHeaders rowHeaders={['Event', 'Timestamp', 'Action']}>
            {linkedAccounts.map((linkedAccount: LinkedAccountType) => (
              <LinkedAccount
                key={linkedAccount.uid}
                {...{
                  uid,
                  providerId: linkedAccount.providerId,
                  authAt: linkedAccount.authAt,
                  onCleared: onCleared,
                }}
              />
            ))}
          </TableXHeaders>
        ) : (
          <p className="result-none">
            This account doesn't have any linked accounts.
          </p>
        )}
      </section>

      <DangerZone
        {...{
          uid,
          disabledAt: disabledAt!,
          email: primaryEmail, // only the primary for now
          onCleared: onCleared,
          unsubscribeToken: '<USER_TOKEN>',
        }}
      />
    </>
  );
};

export default Account;
