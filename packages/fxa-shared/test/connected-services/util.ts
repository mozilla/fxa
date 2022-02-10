/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { assert } from 'chai';

import {
  AttachedSession,
  Device,
  DeviceSessionToken,
  mergeDevicesAndSessionTokens,
  synthesizeClientName,
} from '../../connected-services';

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

    assert.lengthOf(result, 1);

    // Spot check a few properties
    assert.equal(
      result[0].uaBrowserVersion,
      deviceSessionToken['1234'].uaBrowserVersion
    );
    assert.equal(result[0].uaBrowser, deviceSessionToken['1234'].uaBrowser);
    assert.equal(result[0].uaOS, deviceSessionToken['1234'].uaOS);
    assert.equal(result[0].uaOSVersion, deviceSessionToken['1234'].uaOSVersion);
  });

  it('can synthesizeClientName', () => {
    const result = synthesizeClientName(attachedSession);
    assert.equal(result, 'Firefox 96, Linux 18.18');
  });
});
