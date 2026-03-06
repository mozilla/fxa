/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { useState } from 'react';
import { Email } from 'fxa-admin-server/src/types';
import { AdminPanelFeature } from '@fxa/shared/guards';
import Guard from '../../Guard';
import { getFormattedDate } from '../../../lib/utils';
import { ReactElement } from 'react';
import { adminApi } from '../../../lib/api';

type DangerZoneProps = {
  uid: string;
  email: Email;
  disabledAt: number | null;
  onCleared: Function;
  has2FA?: boolean | null;
  hasRecoveryPhone?: boolean | null;
};

const DangerZoneAction = ({
  header,
  description,
  buttonHandler,
  buttonTestId,
  buttonText,
  unverifyMessage,
  hideButton = false,
  hiddenButtonContent,
}: {
  header: string;
  description: string | ReactElement;
  buttonHandler: () => void;
  buttonTestId?: string;
  buttonText: string;
  unverifyMessage?: string;
  hideButton?: boolean;
  hiddenButtonContent?: string;
}) => (
  <>
    <h4 className="header-lg">{header}</h4>
    <div className="border-l-2 border-red-600 mb-4 pl-4">
      <p>{description}</p>
      {hideButton && hiddenButtonContent ? (
        <p className="mt-2">{hiddenButtonContent}</p>
      ) : (
        <button
          className="bg-grey-10 border-2 border-grey-100 font-medium h-12 mt-4 rounded text-red-700 w-40 hover:border-2 hover:border-grey-10 hover:bg-grey-50 hover:text-red-700"
          onClick={buttonHandler}
          data-testid={buttonTestId}
        >
          {buttonText}
        </button>
      )}
      {unverifyMessage && <p className="mt-4">{unverifyMessage}</p>}
    </div>
  </>
);

export const DangerZone = ({
  uid,
  email,
  disabledAt,
  onCleared,
  has2FA,
  hasRecoveryPhone,
}: DangerZoneProps) => {
  const [unverifyLoading, setUnverifyLoading] = useState(false);

  const handleUnverify = async () => {
    if (!window.confirm('Are you sure? This cannot be undone.')) {
      return;
    }
    setUnverifyLoading(true);
    try {
      await adminApi.unverifyEmail(email.email);
      window.alert("The user's email has been unconfirmed.");
      onCleared();
    } catch {
      window.alert('Error in unconfirming email');
    } finally {
      setUnverifyLoading(false);
    }
  };

  const handleUnsubscribeFromMailingLists = async () => {
    if (!window.confirm('Are you sure? This cannot be undone.')) {
      return;
    }
    try {
      const success = await adminApi.unsubscribeFromMailingLists(uid);
      if (success) {
        window.alert(
          "The user's email has been unsubscribed from mozilla mailing lists."
        );
      } else {
        window.alert('Unsubscribing was not successful.');
      }
    } catch {
      window.alert('Unexpected error encountered!');
    }
  };

  const handleDisable = async () => {
    if (!window.confirm('Are you sure?')) {
      return;
    }
    try {
      await adminApi.disableAccount(uid);
      adminApi.recordSecurityEvent(uid, 'account.disable').catch(() => {});
      window.alert('The account has been disabled.');
      onCleared();
    } catch {
      window.alert('Error disabling account');
    }
  };

  const handleEnable = async () => {
    if (!window.confirm('Are you sure?')) {
      return;
    }
    try {
      await adminApi.enableAccount(uid);
      adminApi.recordSecurityEvent(uid, 'account.enable').catch(() => {});
      window.alert('The account has been enabled.');
      onCleared();
    } catch {
      window.alert('Error enabling account');
    }
  };

  const handleRemove2FA = async () => {
    if (!window.confirm('Are you sure?')) {
      return;
    }
    try {
      await adminApi.remove2FA(uid);
      adminApi
        .recordSecurityEvent(uid, 'account.two_factor_removed')
        .catch(() => {});
      window.alert('2FA was removed from the account.');
      onCleared();
    } catch {
      window.alert('Error removing 2FA.');
    }
  };

  const handleDeleteRecoveryPhone = async () => {
    if (!window.confirm('Are you sure? This cannot be undone.')) {
      return;
    }
    try {
      await adminApi.deleteRecoveryPhone(uid);
      window.alert('Recovery phone has been deleted.');
      onCleared();
    } catch {
      window.alert('Error deleting recovery phone.');
    }
  };

  // define loading messages
  const loadingMessage = 'Please wait a moment...';
  let unverifyMessage = '';

  if (unverifyLoading) unverifyMessage = loadingMessage;

  return (
    <section className="mt-8" data-testid="danger-zone-section">
      <Guard
        features={[
          AdminPanelFeature.UnverifyEmail,
          AdminPanelFeature.DisableAccount,
          AdminPanelFeature.EnableAccount,
          AdminPanelFeature.UnsubscribeFromMailingLists,
          AdminPanelFeature.Remove2FA,
          AdminPanelFeature.DeleteRecoveryPhone,
        ]}
      >
        <h3 className="mt-0 mb-1 bg-red-600 font-medium h-8 pb-8 pl-2 pt-1 rounded-sm text-lg text-white">
          Danger Zone
        </h3>
        <p className="my-4">
          Please run these commands with caution — some actions are
          irreversible.
        </p>
      </Guard>
      <Guard features={[AdminPanelFeature.UnverifyEmail]}>
        <DangerZoneAction
          header="Email Confirmation"
          description="Reset email confirmation. User needs to re-confirm on next login."
          buttonHandler={handleUnverify}
          buttonText="Unconfirm Email"
          buttonTestId="unverify-email"
          {...{ unverifyMessage }}
        />
      </Guard>
      <Guard features={[AdminPanelFeature.DisableAccount]}>
        <DangerZoneAction
          header="Disable Login"
          description="Stops this account from logging in."
          buttonText="Disable"
          hideButton={!!disabledAt}
          hiddenButtonContent={`This account was disabled at: ${getFormattedDate(
            disabledAt
          )}`}
          buttonHandler={handleDisable}
          buttonTestId="disable-account"
        />
      </Guard>
      {disabledAt && (
        <Guard features={[AdminPanelFeature.EnableAccount]}>
          <DangerZoneAction
            header="Enable Login"
            description="Allows this account to log in."
            buttonHandler={handleEnable}
            buttonText="Enable"
            buttonTestId="enable-account"
          />
        </Guard>
      )}
      {has2FA && (
        <Guard features={[AdminPanelFeature.Remove2FA]}>
          <DangerZoneAction
            header="Remove 2FA"
            description="Delete the account's 2FA."
            buttonHandler={handleRemove2FA}
            buttonText="Remove 2FA"
            buttonTestId="remove-2fa"
          />
        </Guard>
      )}
      {has2FA && hasRecoveryPhone && (
        <Guard features={[AdminPanelFeature.DeleteRecoveryPhone]}>
          <DangerZoneAction
            header="Delete Recovery Phone"
            description="Delete the account's recovery phone number."
            buttonHandler={handleDeleteRecoveryPhone}
            buttonText="Delete"
            buttonTestId="delete-recovery-phone"
          />
        </Guard>
      )}
      <Guard features={[AdminPanelFeature.UnsubscribeFromMailingLists]}>
        <DangerZoneAction
          header="Unsubscribe From Mailing Lists"
          description={
            <>
              Unsubscribe user from <b>all</b> Mozilla mailing lists.
            </>
          }
          buttonHandler={handleUnsubscribeFromMailingLists}
          buttonText="Unsubscribe"
          buttonTestId="unsubscribe-from-mailing-lists"
        />
      </Guard>
    </section>
  );
};

export default DangerZone;
