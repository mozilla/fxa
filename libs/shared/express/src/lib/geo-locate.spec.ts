/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Request } from 'express';
import { Logger } from 'mozlog';
import { geolocate as geolocateFactory } from './geo-locate';

describe('geo-locate', () => {
  const request = { ip: '127.0.0.1' } as Request;
  let logger: { error: jest.Mock };
  let remoteAddress: jest.Mock;

  beforeEach(() => {
    logger = { error: jest.fn() };
    remoteAddress = jest.fn(() => ({ clientAddress: '203.0.113.0' }));
  });

  const build = (geodb: jest.Mock) =>
    geolocateFactory(geodb)(remoteAddress)(logger as unknown as Logger);

  it('has the correct interface', () => {
    const geolocate = build(jest.fn());
    expect(typeof geolocate).toBe('function');
    expect(geolocate).toHaveLength(1);
  });

  it('returns the geodb result for the client address', () => {
    const geodb = jest.fn(() => 'mock geodb result');

    expect(build(geodb)(request)).toBe('mock geodb result');
    expect(remoteAddress).toHaveBeenCalledWith(request);
    expect(geodb).toHaveBeenCalledWith('203.0.113.0');
    expect(logger.error).not.toHaveBeenCalled();
  });

  it('returns an empty object and logs when geodb throws', () => {
    const geodb = jest.fn(() => {
      throw 'ohno';
    });

    expect(build(geodb)(request)).toEqual({});
    expect(remoteAddress).toHaveBeenCalledTimes(1);
    expect(geodb).toHaveBeenCalledTimes(1);
    expect(logger.error).toHaveBeenCalledWith('geodb.error', 'ohno');
  });
});
