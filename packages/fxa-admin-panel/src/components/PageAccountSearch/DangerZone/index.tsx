/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { useMutation } from '@apollo/client';
import { Email } from 'fxa-admin-server/src/graphql';
import { RECORD_ADMIN_SECURITY_EVENT } from '../Account/index.gql';
import { AdminPanelFeature } from 'fxa-shared/guards';
import Guard from '../../Guard';
import { getFormattedDate } from '../../../lib/utils';
import { ReactElement } from 'react';
import {
  DISABLE_ACCOUNT,
  ENABLE_ACCOUNT,
  SEND_PASSWORD_RESET_EMAIL,
  UNSUBSCRIBE_FROM_MAILING_LISTS,
  UNVERIFY_EMAIL,
} from './index.gql';

type DangerZoneProps = {
  uid: string;
  email: Email;
  disabledAt: number | null;
  onCleared: Function;
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
}: DangerZoneProps) => {
  const [unverify, { loading: unverifyLoading }] = useMutation(UNVERIFY_EMAIL, {
    onCompleted: () => {
      window.alert("The user's email has been unconfirmed.");
      onCleared();
    },
    onError: () => {
      window.alert('Error in unconfirming email');
    },
  });

  const handleUnverify = () => {
    if (!window.confirm('Are you sure? This cannot be undone.')) {
      return;
    }
    unverify({ variables: { email: email.email } });
  };

  const [unsubscribeFromMailingLists] = useMutation(
    UNSUBSCRIBE_FROM_MAILING_LISTS,
    {
      onCompleted: (data) => {
        if (data.unsubscribeFromMailingLists) {
          window.alert(
            "The user's email has been unsubscribed from mozilla mailing lists."
          );
        } else {
          window.alert('Unsubscribing was not successful.');
        }
      },
      onError: () => {
        window.alert('Unexpected error encountered!');
      },
    }
  );
  const handleUnsubscribeFromMailingLists = () => {
    if (!window.confirm('Are you sure? This cannot be undone.')) {
      return;
    }
    unsubscribeFromMailingLists({ variables: { uid } });
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

  const [enableAccount] = useMutation(ENABLE_ACCOUNT, {
    onCompleted: () => {
      window.alert('The account has been enabled.');
      onCleared();
    },
    onError: () => {
      window.alert('Error enabling account');
    },
  });

  const [sendPasswordResetEmail] = useMutation(SEND_PASSWORD_RESET_EMAIL, {
    onCompleted: () => {
      window.alert(`Password reset email sent to ${email.email}`);
      onCleared();
    },
    onError: () => {
      window.alert('Error sending password reset email.');
    },
  });

  const [recordAdminSecurityEvent] = useMutation(RECORD_ADMIN_SECURITY_EVENT);

  const handleDisable = () => {
    if (!window.confirm('Are you sure?')) {
      return;
    }
    disableAccount({ variables: { uid } });
    recordAdminSecurityEvent({ variables: { uid, name: 'account.disable' } });
  };

  const handleEnable = () => {
    if (!window.confirm('Are you sure?')) {
      return;
    }
    enableAccount({ variables: { uid } });
    recordAdminSecurityEvent({ variables: { uid, name: 'account.enable' } });
  };

  const handleSendPasswordReset = () => {
    if (!window.confirm('Are you sure?')) {
      return;
    }
    sendPasswordResetEmail({ variables: { email: email.email } });
  };

  // define loading messages
  const loadingMessage = 'Please wait a moment...';
  let unverifyMessage = '';

  if (unverifyLoading) unverifyMessage = loadingMessage;

  return (
    <section className="mt-8">
      <Guard
        features={[
          AdminPanelFeature.UnverifyEmail,
          AdminPanelFeature.DisableAccount,
          AdminPanelFeature.EnableAccount,
          AdminPanelFeature.UnsubscribeFromMailingLists,
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
        />
      </Guard>
      {disabledAt && (
        <Guard features={[AdminPanelFeature.EnableAccount]}>
          <DangerZoneAction
            header="Enable Login"
            description="Allows this account to log in."
            buttonHandler={handleEnable}
            buttonText="Enable"
          />
        </Guard>
      )}
      <Guard features={[AdminPanelFeature.SendPasswordResetEmail]}>
        <DangerZoneAction
          header="Send Password Reset Email"
          description="Send the user a password reset email to all verified emails. For
          Sync users this will also reset their encryption key so make sure
          they have a backup of Sync data."
          buttonHandler={handleSendPasswordReset}
          buttonText="Password Reset"
          buttonTestId="password-reset-button"
        />
      </Guard>
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
