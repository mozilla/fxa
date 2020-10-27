/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useState } from 'react';
import groupBy from 'lodash.groupby';
import { LinkExternal } from 'fxa-react/components/LinkExternal';
import { useAlertBar } from '../../lib/hooks';
import { isMobileDevice } from '../../lib/utilities';
import { AttachedClient, useAccount, useLazyAccount } from '../../models';
import { AlertBar } from '../AlertBar';
import { ButtonIconReload } from '../ButtonIcon';
import { ConnectAnotherDevicePromo } from '../ConnectAnotherDevicePromo';
import { Service } from './Service';

const UTM_PARAMS =
  '?utm_source=accounts.firefox.com&utm_medium=referral&utm_campaign=fxa-devices';
const DEVICES_SUPPORT_URL =
  'https://support.mozilla.org/kb/fxa-managing-devices' + UTM_PARAMS;

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
  const [errorText, setErrorText] = useState<string>();
  const [getAccount, { accountLoading }] = useLazyAccount((error) => {
    setErrorText('Sorry, there was a problem refreshing the recovery key.');
    alertBar.show();
  });

  const showMobilePromo = !sortedAndUniqueClients.filter(isMobileDevice).length;

  return (
    <section
      className="mt-11"
      id="connected-services"
      data-testid="settings-connected-services"
    >
      <h2 className="font-header font-bold ltr:ml-4 rtl:mr-4 mb-4">
        Connected Services
      </h2>
      <div className="bg-white tablet:rounded-xl shadow px-4 tablet:px-6 pt-7 pb-8">
        <div className="flex justify-between mb-4">
          <p>Everything you are using and signed into.</p>
          <ButtonIconReload
            title="Refresh connected services"
            classNames="hidden mobileLandscape:inline-block"
            testId="connected-services-refresh"
            disabled={accountLoading}
            onClick={getAccount}
          />
        </div>

        {!!sortedAndUniqueClients.length &&
          sortedAndUniqueClients.map((client, i) => (
            <Service
              {...{
                key: client.clientId,
                name: client.name,
                deviceType: client.deviceType,
                location: client.location,
                lastAccessTimeFormatted: client.lastAccessTimeFormatted,
                canSignOut: true,
              }}
            />
          ))}

        <div className="mt-5 text-center mobileLandscape:text-left mobileLandscape:rtl:text-right">
          <LinkExternal
            href={DEVICES_SUPPORT_URL}
            className="link-blue text-sm"
            data-testid="missing-items-link"
          >
            Missing or duplicate items?
          </LinkExternal>
        </div>

        {showMobilePromo && (
          <>
            <hr className="unit-row-hr mt-5 mx-0" />
            <div className="mt-5">
              <ConnectAnotherDevicePromo />
            </div>
          </>
        )}

        {alertBar.visible && (
          <AlertBar
            onDismiss={alertBar.hide}
            type={errorText ? 'error' : 'success'}
          >
            {errorText ? (
              <p data-testid="delete-recovery-key-error">
                Error text TBD. {errorText}
              </p>
            ) : (
              <p data-testid="delete-recovery-key-success">
                Account recovery key removed
              </p>
            )}
          </AlertBar>
        )}
      </div>
    </section>
  );
};

export default ConnectedServices;
