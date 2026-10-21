/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { AttachedSession } from './models/AttachedSession';
import { Device } from './models/Device';
import { DeviceSessionToken } from './models/DeviceSessionToken';
import { mergeDevicesAndSessionTokens, synthesizeClientName } from './util';

describe('connected-services/util', () => {
  const attachedSession: AttachedSession = {
    id: 'test',
    createdAt: Date.now(),
    lastAccessTime: Date.now(),
    location: {},
    uaBrowser: 'Firefox',
    uaOS: 'Linux',
    uaBrowserVersion: '96.0',
    uaOSVersion: '18.18',
    uaFormFactor: '',
  };

  const devices = [
    {
      id: 'test',
      uid: 'test',
      callbackIsExpired: false,
      sessionTokenId: '1234',
      refreshTokenId: '1234',
      lastAccessTime: Date.now().toString(),
      location: {},
      name: 'test',
      type: 'test',
      createdAt: Date.now(),
      pushCallback: 'http://test',
      pushPublicKey: 'http://test',
      pushAuthKey: '1234',
      pushEndpointExpired: false,
      availableCommands: {},
      uaBrowser: 'Firefox',
      uaOS: 'Linux',
      uaBrowserVersion: '96.0',
      uaOSVersion: '18.18',
      uaFormFactor: '',
      uaDeviceType: 'Desktop',
    } as Device,
  ];

  const deviceSessionToken = {
    '1234': {
      lastAccessTime: Date.now(),
      location: {},
      uaBrowser: 'Chrome',
      uaBrowserVersion: '22',
      uaDeviceType: 'Mobile',
      uaOS: 'Android',
      uaOSVersion: '10.1',
      id: '1234',
      callbackURL: '',
      callbackAuthKey: '',
      callbackPublicKey: '',
    },
  } as Record<string, DeviceSessionToken>;
  it('merges devices and sessions', () => {
    const result = mergeDevicesAndSessionTokens(
      devices,
      deviceSessionToken,
      true
    );

    expect(result).toHaveLength(1);

    // Spot check a few properties
    expect(result[0].uaBrowserVersion).toBe(
      deviceSessionToken['1234'].uaBrowserVersion
    );
    expect(result[0].uaBrowser).toBe(deviceSessionToken['1234'].uaBrowser);
    expect(result[0].uaOS).toBe(deviceSessionToken['1234'].uaOS);
    expect(result[0].uaOSVersion).toBe(deviceSessionToken['1234'].uaOSVersion);
  });

  it('can synthesizeClientName', () => {
    const result = synthesizeClientName(attachedSession);
    expect(result).toBe('Firefox 96, Linux 18.18');
  });
});
