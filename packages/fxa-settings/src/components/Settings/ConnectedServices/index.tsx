/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { ApolloError } from '@apollo/client';
import { Localized, useLocalization } from '@fluent/react';
import { LinkExternal } from 'fxa-react/components/LinkExternal';
import { useBooleanState } from 'fxa-react/lib/hooks';
import groupBy from 'lodash.groupby';
import { forwardRef, useCallback, useState } from 'react';
import { clearSignedInAccountUid } from '../../../lib/cache';
import { logViewEvent } from '../../../lib/metrics';
import { isMobileDevice } from '../../../lib/utilities';
import { AttachedClient, useAccount, useAlertBar } from '../../../models';
import { ButtonIconReload } from '../ButtonIcon';
import { ConnectAnotherDevicePromo } from '../ConnectAnotherDevicePromo';
import { Modal } from '../Modal';
import { VerifiedSessionGuard } from '../VerifiedSessionGuard';
import { Service } from './Service';
import GleanMetrics from '../../../lib/glean';

const UTM_PARAMS =
  '?utm_source=accounts.firefox.com&utm_medium=referral&utm_campaign=fxa-devices';
const DEVICES_SUPPORT_URL =
  'https://support.mozilla.org/kb/fxa-managing-devices' + UTM_PARAMS;

// TODO: move into Account?
export function sortAndFilterConnectedClients(
  attachedClients: Array<AttachedClient>
) {
  const groupedByName = groupBy(attachedClients, 'name');

  // get a unique (by name) list and sort by time last accessed
  const sortedAndUniqueClients = Object.keys(groupedByName)
    .map((key) => {
      return groupedByName[key].sort(
        (a: AttachedClient, b: AttachedClient) =>
          b.lastAccessTime - a.lastAccessTime
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

  return { groupedByName, sortedAndUniqueClients };
}

export const ConnectedServices = forwardRef<HTMLDivElement>((_, ref) => {
  const alertBar = useAlertBar();
  const account = useAccount();
  const attachedClients = account.attachedClients;
  const { groupedByName, sortedAndUniqueClients } =
    sortAndFilterConnectedClients([...attachedClients]);

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
  const [adviceModalRevealed, revealAdviceModal, hideAdviceModal] =
    useBooleanState();

  const [selectedClient, setSelectedClient] = useState<AttachedClient | null>(
    null
  );
  const [reason, setReason] = useState<string>('');

  const clearDisconnectingState = useCallback(
    (errorMessage?: string, error?: ApolloError) => {
      hideConfirmDisconnectModal();
      setSelectedClient(null);
      setReason('');
      if (errorMessage) {
        alertBar.error(errorMessage, error);
      }
    },
    [hideConfirmDisconnectModal, setSelectedClient, setReason, alertBar]
  );

  const disconnectClient = useCallback(
    async (client: AttachedClient) => {
      try {
        const reasonValue = reason ? reason : 'no-reason';
        logViewEvent('settings.clients.disconnect', `submit.${reasonValue}`);
        GleanMetrics.accountPref.deviceSignout({
          event: { reason: reasonValue },
        });

        // disconnect all clients/sessions with this name since only unique names
        // are displayed to the user. This is batched into one network request
        // via BatchHttpLink
        const clientsWithMatchingName = groupedByName[client.name || 'unknown'];
        const hasMultipleSessions = clientsWithMatchingName.length > 1;
        if (hasMultipleSessions) {
          await Promise.all(
            clientsWithMatchingName.map(
              async (c) => await account.disconnectClient(c)
            )
          );
        } else {
          await account.disconnectClient(client);
        }

        // TODO: Add `timing.clients.disconnect` flow timing event as seen in
        // old-settings? #6903
        if (
          client.isCurrentSession ||
          (hasMultipleSessions &&
            clientsWithMatchingName.find((c) => c.isCurrentSession))
        ) {
          clearSignedInAccountUid();
          window.location.assign(`${window.location.origin}/signin`);
        } else if (reason === 'suspicious' || reason === 'lost') {
          // Wait to clear disconnecting state till the advice modal has been shown
          hideConfirmDisconnectModal();
          revealAdviceModal();
        } else {
          const name = client.name || 'unknown';
          alertBar.success(
            l10n.getString(
              'cs-logged-out-2',
              { service: name },
              `Logged out of ${name}`
            )
          );
          clearDisconnectingState();
        }
      } catch (error) {
        clearDisconnectingState(undefined, error);
      }
    },
    [
      account,
      hideConfirmDisconnectModal,
      groupedByName,
      revealAdviceModal,
      alertBar,
      l10n,
      clearDisconnectingState,
      reason,
    ]
  );

  const onConfirmDisconnect = useCallback(() => {
    if (!selectedClient) {
      return clearDisconnectingState(
        l10n.getString(
          'cs-cannot-disconnect',
          null,
          'Client not found, unable to disconnect'
        )
      );
    }
    disconnectClient(selectedClient);
  }, [selectedClient, clearDisconnectingState, l10n, disconnectClient]);

  const onSignOutClick = useCallback(
    (c: AttachedClient) => {
      setSelectedClient(c);

      // If it's a sync client, we show the disconnect survey modal.
      // Only sync clients have a deviceId.
      if (c.deviceId) {
        revealConfirmDisconnectModal();
      } else {
        disconnectClient(c);
      }
    },
    [setSelectedClient, revealConfirmDisconnectModal, disconnectClient]
  );

  const onCloseAdviceModal = useCallback(() => {
    clearDisconnectingState();
    hideAdviceModal();
  }, [clearDisconnectingState, hideAdviceModal]);

  return (
    <section
      data-testid="settings-connected-services"
      id="connected-services-section"
      {...{ ref }}
    >
      <h2 className="font-header font-bold mobileLandscape:ms-6 ms-4 mb-4 relative">
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
              disabled={account.loading}
              onClick={() => account.refresh('clients')}
            />
          </Localized>
        </div>

        {!!sortedAndUniqueClients.length &&
          sortedAndUniqueClients.map((client, i) => (
            <Service
              key={`${client.lastAccessTime}:${client.name || 'unknown'}`}
              {...{
                name: client.name || 'unknown',
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

        <div className="mt-5 text-center mobileLandscape:text-start">
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
        {confirmDisconnectModalRevealed && (
          <VerifiedSessionGuard
            onDismiss={() => clearDisconnectingState()}
            onError={(error) => clearDisconnectingState(undefined, error)}
          >
            <Modal
              onDismiss={hideConfirmDisconnectModal}
              onConfirm={onConfirmDisconnect}
              confirmBtnClassName="cta-primary cta-base-p"
              confirmText={l10n.getString(
                'cs-sign-out-button',
                null,
                'Sign out'
              )}
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
                id="cs-disconnect-sync-content-3"
                vars={{ device: selectedClient?.name || 'unknown' }}
                elems={{ span: <span className="break-word"></span> }}
              >
                <p
                  id="connected-devices-sign-out-description"
                  className="my-4 text-center"
                >
                  Your browsing data will remain on{' '}
                  <span className="break-word">
                    {selectedClient?.name || 'unknown'}
                  </span>
                  , but it will no longer sync with your account.
                </p>
              </Localized>

              <Localized
                id="cs-disconnect-sync-reason-3"
                vars={{ device: selectedClient?.name || 'unknown' }}
                elems={{ span: <span className="break-word"></span> }}
              >
                <p className="my-4 text-center">
                  What's the main reason for disconnecting{' '}
                  <span className="break-word">
                    {selectedClient?.name || 'unknown'}
                  </span>
                  ?
                </p>
              </Localized>
              <form
                onChange={(event) => {
                  setReason((event.target as HTMLInputElement).value);
                }}
              >
                <ul className="my-4 text-start">
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
                        Lost or stolen
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
                        Old or replaced
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
              </form>
            </Modal>
          </VerifiedSessionGuard>
        )}

        {adviceModalRevealed && (
          <Modal
            onDismiss={onCloseAdviceModal}
            onConfirm={onCloseAdviceModal}
            confirmBtnClassName="cta-primary cta-base-p"
            hasCancelButton={false}
            confirmText={l10n.getString(
              'cs-disconnect-advice-confirm',
              null,
              'Okay, got it'
            )}
            headerId="connected-services-advice-modal-header"
            descId="connected-services-advice-modal-description"
          >
            {reason === 'lost' ? (
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
                <Localized id="cs-disconnect-lost-advice-content-3">
                  <p
                    id="connected-services-advice-modal-description"
                    data-testid="lost-device-desc"
                    className="my-4 text-center"
                  >
                    Since your device was lost or stolen, to keep your
                    information safe, you should change your Mozilla account
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
                <Localized id="cs-disconnect-suspicious-advice-content-2">
                  <p
                    id="connected-services-advice-modal-description"
                    data-testid="suspicious-device-desc"
                    className="my-4 text-center"
                  >
                    If the disconnected device is indeed suspicious, to keep
                    your information safe, you should change your Mozilla
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
});

export default ConnectedServices;
