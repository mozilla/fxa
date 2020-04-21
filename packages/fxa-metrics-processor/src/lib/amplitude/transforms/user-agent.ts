/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { ParsedUserAgentProperties } from '../../../../../fxa-shared/metrics/user-agent';

export type BrowserProps = { ua_browser: string; ua_version: string };
export type OsProps = { os_name: string; os_version: string };
export type DeviceModel = { device_model: string };

export function mapBrowser(userAgent: ParsedUserAgentProperties | undefined): BrowserProps | {} {
  return mapUserAgentProperties(userAgent, 'ua', 'ua_browser', 'ua_version');
}

export function mapOs(userAgent: ParsedUserAgentProperties | undefined): OsProps | {} {
  return mapUserAgentProperties(userAgent, 'os', 'os_name', 'os_version');
}

function mapUserAgentProperties(
  userAgent: ParsedUserAgentProperties | undefined,
  key: 'ua' | 'os',
  familyProperty: 'ua_browser' | 'os_name',
  versionProperty: 'ua_version' | 'os_version'
): BrowserProps | OsProps | {} {
  if (userAgent) {
    const group = userAgent[key];
    const { family } = group;
    if (family && family !== 'Other') {
      return {
        [familyProperty]: family,
        [versionProperty]: group.toVersionString(),
      };
    }
  }
  return {};
}

export function mapDeviceModel(userAgent: ParsedUserAgentProperties): DeviceModel | {} {
  const { brand, family: deviceModel } = userAgent.device;
  if (brand && deviceModel && brand !== 'Generic') {
    return { device_model: deviceModel };
  }
  return {};
}
