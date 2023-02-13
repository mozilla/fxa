/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { FtlMsg } from 'fxa-react/lib/utils';
import React from 'react';
import { RemoteMetadata } from '../../lib/types';

// Remote metadata is obtained from pairing channel
// Some of this data may align with the account.ts model but the keys are slightly different (e.g., `state` vs `region`)
type DeviceInfoBlockProps = { remoteMetadata: RemoteMetadata };

export const DeviceInfoBlock = ({ remoteMetadata }: DeviceInfoBlockProps) => {
  const {
    deviceName,
    deviceFamily,
    deviceOS,
    ipAddress,
    city,
    region,
    country,
  } = remoteMetadata;
  const LocalizedLocation = () => {
    if (city && region && country) {
      return (
        <FtlMsg
          id="device-info-block-location-city-region-country"
          vars={{ city, region, country }}
        >{`${city}, ${region}, ${country} (estimated)`}</FtlMsg>
      );
    }
    if (region && country) {
      return (
        <FtlMsg
          id="device-info-block-location-region-country"
          vars={{ region, country }}
        >{`${region}, ${country} (estimated)`}</FtlMsg>
      );
    }
    if (city && country) {
      return (
        <FtlMsg
          id="device-info-block-location-city-country"
          vars={{ city, country }}
        >{`${city}, ${country} (estimated)`}</FtlMsg>
      );
    }
    if (country) {
      return (
        <FtlMsg
          id="device-info-block-location-country"
          vars={{ country }}
        >{`${country} (estimated)`}</FtlMsg>
      );
    }
    return (
      <FtlMsg id="device-info-block-location-unknown">Location unknown</FtlMsg>
    );
  };

  return (
    <div className="mt-8 mb-4">
      {deviceName && <h2 className="mb-4 text-base">{deviceName}</h2>}
      <FtlMsg id="device-info-browser-os" vars={{ deviceFamily, deviceOS }}>
        <p className="text-xs">{`${deviceFamily} on ${deviceOS}`}</p>
      </FtlMsg>
      <p className="text-xs">
        <LocalizedLocation />
      </p>
      <FtlMsg id="device-info-ip-address" vars={{ ipAddress }}>
        <p className="text-xs">{`IP address: ${ipAddress}`}</p>
      </FtlMsg>
    </div>
  );
};

export default DeviceInfoBlock;
