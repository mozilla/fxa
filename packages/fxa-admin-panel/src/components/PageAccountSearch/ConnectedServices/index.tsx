/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { AttachedClient, Location } from 'fxa-admin-server/src/graphql';
import { TableRowYHeader, TableYHeaders } from '../../TableYHeaders';
import { getFormattedDate } from '../../../lib/utils';
import { HIDE_ROW } from '../../../../constants';

export const NUMBER_OF_SERVICES_TO_SHOW = 3;

export const ConnectedServices = ({
  services,
}: {
  services?: Nullable<AttachedClient[]>;
}) => {
  if (services && services.length > 0) {
    const connectedServicesTables = (
      <>
        {services.map((service) => (
          <ConnectedService
            key={`${service.name}-${service.createdTime}`}
            {...service}
          />
        ))}
      </>
    );

    if (services.length > NUMBER_OF_SERVICES_TO_SHOW) {
      return (
        <details>
          <summary className="hover:cursor-pointer text-violet-900 font-semibold mb-4">
            Toggle viewing {services.length} connected services
          </summary>
          {connectedServicesTables}
        </details>
      );
    }
    return connectedServicesTables;
  }

  return <p className="result-none">This account has no connected services.</p>;
};

const ConnectedService = ({
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
}: AttachedClient) => {
  const testId = (id: string) => `connected-service-${id}`;
  return (
    <TableYHeaders>
      <TableRowYHeader
        header="Client"
        children={format.client(name, clientId)}
        testId={testId('client')}
      />
      <TableRowYHeader
        header="Device Type"
        children={deviceType || HIDE_ROW}
        testId={testId('device-type')}
      />
      <TableRowYHeader
        header="User Agent"
        children={userAgent || HIDE_ROW}
        testId={testId('user-agent')}
      />
      <TableRowYHeader
        header="Operating System"
        children={os || HIDE_ROW}
        testId={testId('os')}
      />
      <TableRowYHeader
        header="Created At"
        children={format.time(createdTime, createdTimeFormatted) || HIDE_ROW}
        testId={testId('created-at')}
      />
      <TableRowYHeader
        header="Last Used"
        children={
          format.time(lastAccessTime, lastAccessTimeFormatted) || HIDE_ROW
        }
        testId={testId('last-accessed-at')}
      />
      <TableRowYHeader
        header="Location"
        children={format.location(location) || HIDE_ROW}
        testId={testId('location')}
      />
      <TableRowYHeader
        header="Client ID"
        children={clientId || HIDE_ROW}
        testId={testId('client-id')}
      />
      <TableRowYHeader
        header="Device ID"
        children={deviceId || HIDE_ROW}
        testId={testId('device-id')}
      />
      <TableRowYHeader
        header="Session Token ID"
        children={sessionTokenId || HIDE_ROW}
        testId={testId('session-token-id')}
      />
      <TableRowYHeader
        header="Refresh Token ID"
        children={refreshTokenId || HIDE_ROW}
        testId={testId('refresh-token-id')}
      />
    </TableYHeaders>
  );
};

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
        {getFormattedDate(raw)}
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
};
