/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { FtlMsg } from 'fxa-react/lib/utils';
import { RemoteMetadata } from '../../lib/types';

/**
 * How the device name is presented, when the pairing payload carries one:
 *
 * - `heading` — its own `<h2>` above the browser line, which names the OS.
 *   What the live `Pair/*` pages render.
 * - `inline` — folded into the browser line ("Firefox on Laurel's MacBook
 *   Pro"), with no heading. What the Pair2 mobile cards render.
 * - `hidden` — omitted entirely; the browser line names the OS.
 *
 * When the payload has no device name, all three render the OS line — see
 * `pairing-authority-integration`, which deliberately leaves `deviceName`
 * unset rather than substituting a generic type like "desktop".
 */
export type DeviceNameDisplay = 'heading' | 'inline' | 'hidden';

// Remote metadata is obtained from pairing channel
// Some of this data may align with the account.ts model but the keys are slightly different (e.g., `state` vs `region`)
type DeviceInfoBlockProps = {
  remoteMetadata: RemoteMetadata;
  /** Replaces the default wrapper classes, for callers that want to present
   * the block differently. */
  className?: string;
  deviceNameDisplay?: DeviceNameDisplay;
};

export const DeviceInfoBlock = ({
  remoteMetadata,
  className = 'mt-8 mb-4',
  deviceNameDisplay = 'heading',
}: DeviceInfoBlockProps) => {
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
    <div {...{ className }}>
      {deviceNameDisplay === 'heading' && deviceName && (
        <h2 className="mb-4 text-base">{deviceName}</h2>
      )}
      {deviceNameDisplay === 'inline' && deviceName ? (
        <FtlMsg
          id="device-info-browser-device"
          vars={{ browserName: deviceFamily, deviceName }}
        >
          {/* Device names are user-chosen and need not contain a break
              opportunity, so wrap rather than overflow the block. */}
          <p className="break-word text-xs">{`${deviceFamily} on ${deviceName}`}</p>
        </FtlMsg>
      ) : (
        <FtlMsg
          id="device-info-browser-os"
          vars={{ browserName: deviceFamily, genericOSName: deviceOS }}
        >
          <p className="text-xs">{`${deviceFamily} on ${deviceOS}`}</p>
        </FtlMsg>
      )}
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
