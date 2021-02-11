/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { gql, ApolloError } from '@apollo/client';
import groupBy from 'lodash.groupby';
import { LinkExternal } from 'fxa-react/components/LinkExternal';
import { logViewEvent } from '../../lib/metrics';
import { useBooleanState } from 'fxa-react/lib/hooks';
import { useAlertBar, useMutation } from '../../lib/hooks';
import { Modal } from '../Modal';
import { isMobileDevice } from '../../lib/utilities';
import {
  AttachedClient,
  useAccount,
  useLazyConnectedClients,
} from '../../models';
import { AlertBar } from '../AlertBar';
import { ButtonIconReload } from '../ButtonIcon';
import { ConnectAnotherDevicePromo } from '../ConnectAnotherDevicePromo';
import { Service } from './Service';
import { VerifiedSessionGuard } from '../VerifiedSessionGuard';
import { clearSignedInAccountUid } from '../../lib/cache';
import { Localized, useLocalization } from '@fluent/react';

const UTM_PARAMS =
  '?utm_source=accounts.firefox.com&utm_medium=referral&utm_campaign=fxa-devices';
const DEVICES_SUPPORT_URL =
  'https://support.mozilla.org/kb/fxa-managing-devices' + UTM_PARAMS;

interface DisconnectingState {
  reason: string | null;
  client: AttachedClient | null;
}

let DS: DisconnectingState = {
  reason: null,
  client: null,
};

export const ATTACHED_CLIENT_DISCONNECT_MUTATION = gql`
  mutation attachedClientDisconnect($input: AttachedClientDisconnectInput!) {
    attachedClientDisconnect(input: $input) {
      clientMutationId
    }
  }
`;

export function sortAndFilterConnectedClients(
  attachedClients: Array<AttachedClient>
) {
  const groupedByName = groupBy(attachedClients, 'name');

  // get a unique (by name) list and sort by time last accessed
  const sortedAndUniqueClients = Object.keys(groupedByName)
    .map((key) => {
      return groupedByName[key].sort(
        (a: AttachedClient, b: AttachedClient) =>
          a.lastAccessTime - b.lastAccessTime
      )[0];
    })
    .sort((a, b) => b.lastAccessTime - a.lastAccessTime);

  // move currently active client to the top
  sortedAndUniqueClients.forEach((client, i) => {
    if (client.isCurrentSession) {
      sortedAndUniqueClients.splice(i, 1);
      sortedAndUniqueClients.unshift(client);
    }
  });

  return sortedAndUniqueClients;
}

export const ConnectedServices = () => {
  const alertBar = useAlertBar();
  const { attachedClients } = useAccount();
  const sortedAndUniqueClients = sortAndFilterConnectedClients([
    ...attachedClients,
  ]);
  const [
    getConnectedClients,
    { connectedClientsLoading },
  ] = useLazyConnectedClients((error) => {
    alertBar.error(
      l10n.getString(
        'cs-cannot-refresh',
        null,
        'Sorry, there was a problem refreshing the list of connected services.'
      )
    );
  });
  const showMobilePromo = !sortedAndUniqueClients.filter(isMobileDevice).length;
  const { l10n } = useLocalization();

  // The Confirm Disconnect modal is shown when a user clicks 'Sign Out' on a sync service.
  // It asks the user to confirm they want to disconnect, and answer a survey question explaining
  // why they are disconnecting.
  const [
    confirmDisconnectModalRevealed,
    revealConfirmDisconnectModal,
    hideConfirmDisconnectModal,
  ] = useBooleanState();

  // After the user confirms they want to disconnect from sync in Confirm Disconnect modal,
  // if their reason was a lost/stolen device, or a suspicious device, then we show them
  // an informative modal with some advice on next steps to take.
  const [
    adviceModalRevealed,
    revealAdviceModal,
    hideAdviceModal,
  ] = useBooleanState();

  const clearDisconnectingState = (
    errorMessage?: string,
    error?: ApolloError
  ) => {
    hideConfirmDisconnectModal();
    DS.client = null;
    DS.reason = null;
    if (errorMessage) {
      alertBar.error(errorMessage, error);
    }
  };

  const onConfirmDisconnect = (evt?: MouseEvent) => {
    if (evt) {
      const t = evt.target as Element;
      const modalEl = t.closest('#modal');
      const selected = modalEl!.querySelector(
        'input[type="radio"]:checked'
      ) as HTMLInputElement;
      if (selected) {
        DS.reason = selected.value;
      }
    }

    if (!DS.client) {
      return clearDisconnectingState(
        l10n.getString(
          'cs-cannot-disconnect',
          null,
          'Client not found, unable to disconnect'
        )
      );
    }

    logViewEvent('settings.clients.disconnect', `submit.${DS.reason!}`);

    deleteConnectedService({
      variables: {
        input: {
          clientId: DS.client.clientId,
          deviceId: DS.client.deviceId,
          sessionTokenId: DS.client.sessionTokenId,
          refreshTokenId: DS.client.refreshTokenId,
        },
      },
    });
  };

  const onSignOutClick = (client: AttachedClient) => {
    DS.client = client;
    // If it's a sync client, we show the disconnect survey modal.
    // Only sync clients have a deviceId.
    if (client.deviceId) {
      revealConfirmDisconnectModal();
    } else {
      onConfirmDisconnect();
    }
  };

  const onCloseAdviceModal = () => {
    clearDisconnectingState();
    hideAdviceModal();
  };

  const [deleteConnectedService] = useMutation(
    ATTACHED_CLIENT_DISCONNECT_MUTATION,
    {
      onCompleted: () => {
        // TODO: Add `timing.clients.disconnect` flow timing event as seen in
        // old-settings? #6903
        if (DS.client!.isCurrentSession) {
          clearSignedInAccountUid();
          window.location.assign(`${window.location.origin}/signin`);
        } else if (DS.reason === 'suspicious' || DS.reason === 'lost') {
          // Wait to clear disconnecting state till the advice modal has been shown
          hideConfirmDisconnectModal();
          revealAdviceModal();
        } else {
          const name = DS.client!.name;
          alertBar.success(
            l10n.getString(
              'cs-logged-out',
              { service: name },
              `Logged out of ${name}.`
            )
          );
          clearDisconnectingState();
        }
      },
      onError: (error: ApolloError) =>
        clearDisconnectingState(undefined, error),
      ignoreResults: true,
      update: (cache) =>
        cache.modify({
          id: cache.identify({ __typename: 'Account' }),
          fields: {
            attachedClients(existingClients: AttachedClient[]) {
              const updatedList = [...existingClients];
              return updatedList.filter(
                // TODO: should this also go into the AttachedClient model?
                (client) =>
                  client.lastAccessTime !== DS.client!.lastAccessTime &&
                  client.name !== DS.client!.name
              );
            },
          },
        }),
    }
  );

  return (
    <section className="mt-11" data-testid="settings-connected-services">
      <h2 className="font-header font-bold ltr:ml-4 rtl:mr-4 mb-4 relative">
        <span id="connected-services" className="nav-anchor"></span>
        <Localized id="cs-heading">Connected Services</Localized>
      </h2>
      <div className="bg-white tablet:rounded-xl shadow px-4 tablet:px-6 pt-7 pb-8">
        <div className="flex justify-between mb-4">
          <Localized id="cs-description">
            <p>Everything you are using and signed into.</p>
          </Localized>
          <Localized id="cs-refresh-button" attrs={{ title: true }}>
            <ButtonIconReload
              title="Refresh connected services"
              classNames="hidden mobileLandscape:inline-block"
              testId="connected-services-refresh"
              disabled={connectedClientsLoading}
              onClick={getConnectedClients}
            />
          </Localized>
        </div>

        {!!sortedAndUniqueClients.length &&
          sortedAndUniqueClients.map((client, i) => (
            <Service
              {...{
                key: `${client.lastAccessTime}:${client.name}`,
                name: client.name,
                deviceType: client.deviceType,
                location: client.location,
                lastAccessTimeFormatted: client.lastAccessTimeFormatted,
                isCurrentSession: client.isCurrentSession,
                clientId: client.clientId,
                handleSignOut: () => {
                  onSignOutClick(client);
                },
              }}
            />
          ))}

        <div className="mt-5 text-center mobileLandscape:text-left mobileLandscape:rtl:text-right">
          <Localized id="cs-missing-device-help">
            <LinkExternal
              href={DEVICES_SUPPORT_URL}
              className="link-blue text-sm"
              data-testid="missing-items-link"
            >
              Missing or duplicate items?
            </LinkExternal>
          </Localized>
        </div>

        {showMobilePromo && (
          <>
            <hr className="unit-row-hr mt-5 mx-0" />
            <div className="mt-5">
              <ConnectAnotherDevicePromo />
            </div>
          </>
        )}

        {alertBar.visible && alertBar.content && (
          <AlertBar onDismiss={alertBar.hide} type={alertBar.type}>
            <p
              data-testid={`connected-services-alert-bar-message-${alertBar.type}`}
            >
              {alertBar.content}
            </p>
          </AlertBar>
        )}
        {confirmDisconnectModalRevealed && (
          <VerifiedSessionGuard
            onDismiss={hideConfirmDisconnectModal}
            onError={(error) => clearDisconnectingState(undefined, error)}
          >
            <Modal
              onDismiss={hideConfirmDisconnectModal}
              onConfirm={onConfirmDisconnect}
              confirmBtnClassName="cta-primary"
              confirmText="Sign Out"
              headerId="connected-services-sign-out-header"
              descId="connected-services-sign-out-description"
            >
              <Localized id="cs-disconnect-sync-heading">
                <h2
                  id="connected-services-sign-out-header"
                  className="font-bold text-xl text-center mb-2"
                  data-testid="connected-services-modal-header"
                >
                  Disconnect from Sync
                </h2>
              </Localized>

              <Localized
                id="cs-disconnect-sync-content"
                vars={{ device: DS.client!.name }}
              >
                <p
                  id="connected-devices-sign-out-description"
                  className="my-4 text-center"
                >
                  Your browsing data will remain on your device (
                  {DS.client!.name}
                  ), but it will no longer sync with your account.
                </p>
              </Localized>

              <Localized id="cs-disconnect-sync-reason">
                <p className="my-4 text-center">
                  What's the main reason for disconnecting this device?
                </p>
              </Localized>

              <ul className="my-4 ltr:text-left rtl:text-right">
                <Localized id="cs-disconnect-sync-opt-prefix">
                  The device is:
                </Localized>
                <li>
                  <label>
                    <input
                      type="radio"
                      className="ltr:mr-2 rtl:ml-2 -mt-1 align-middle"
                      value="suspicious"
                      name="reason"
                    />
                    <Localized id="cs-disconnect-sync-opt-suspicious">
                      Suspicious
                    </Localized>
                  </label>
                </li>
                <li>
                  <label>
                    <input
                      type="radio"
                      className="ltr:mr-2 rtl:ml-2 -mt-1 align-middle"
                      value="lost"
                      name="reason"
                    />
                    <Localized id="cs-disconnect-sync-opt-lost">
                      Lost or Stolen
                    </Localized>
                  </label>
                </li>
                <li>
                  <label>
                    <input
                      type="radio"
                      className="ltr:mr-2 rtl:ml-2 -mt-1 align-middle"
                      value="old"
                      name="reason"
                    />
                    <Localized id="cs-disconnect-sync-opt-old">
                      Old or Replaced
                    </Localized>
                  </label>
                </li>
                <li>
                  <label>
                    <input
                      type="radio"
                      className="ltr:mr-2 rtl:ml-2 -mt-1 align-middle"
                      value="duplicate"
                      name="reason"
                    />
                    <Localized id="cs-disconnect-sync-opt-duplicate">
                      Duplicate
                    </Localized>
                  </label>
                </li>
                <li>
                  <label>
                    <input
                      type="radio"
                      className="ltr:mr-2 rtl:ml-2 -mt-1 align-middle"
                      value="no"
                      name="reason"
                    />
                    <Localized id="cs-disconnect-sync-opt-not-say">
                      Rather not say
                    </Localized>
                  </label>
                </li>
              </ul>
            </Modal>
          </VerifiedSessionGuard>
        )}

        {adviceModalRevealed && (
          <Modal
            onDismiss={onCloseAdviceModal}
            onConfirm={onCloseAdviceModal}
            confirmBtnClassName="cta-primary"
            hasCancelButton={false}
            confirmText={l10n.getString(
              'cs-disconnect-sync-advice-confirm',
              null,
              'Okay, got it'
            )}
            headerId="connected-services-advice-modal-header"
            descId="connected-services-advice-modal-description"
          >
            {DS.reason === 'lost' ? (
              <>
                <Localized id="cs-disconnect-lost-advice-heading">
                  <h2
                    id="connected-services-advice-modal-header"
                    className="font-bold text-xl text-center mb-2"
                    data-testid="connected-services-lost-device-modal-header"
                  >
                    Lost or stolen device disconnected
                  </h2>
                </Localized>
                <Localized id="cs-disconnect-lost-advice-content">
                  <p
                    id="connected-services-advice-modal-description"
                    data-testid="lost-device-desc"
                    className="my-4 text-center"
                  >
                    Since your device was lost or stolen, to keep your
                    information safe, you should change your Firefox account
                    password in your account settings. You should also look for
                    information from your device manufacturer about erasing your
                    data remotely.
                  </p>
                </Localized>
              </>
            ) : (
              <>
                <Localized id="cs-disconnect-suspicious-advice-heading">
                  <h2
                    id="connected-services-advice-modal-header"
                    className="font-bold text-xl text-center mb-2"
                    data-testid="connected-services-suspicious-device-modal-header"
                  >
                    Suspicious device disconnected
                  </h2>
                </Localized>
                <Localized id="cs-disconnect-suspicious-advice-content">
                  <p
                    id="connected-services-advice-modal-description"
                    data-testid="suspicious-device-desc"
                    className="my-4 text-center"
                  >
                    If the disconnected device is indeed suspicious, to keep
                    your information safe, you should change your Firefox
                    account password in your account settings. You should also
                    change any other passwords you saved in Firefox by typing
                    about:logins into the address bar.
                  </p>
                </Localized>
              </>
            )}
          </Modal>
        )}
      </div>
    </section>
  );
};

export default ConnectedServices;
