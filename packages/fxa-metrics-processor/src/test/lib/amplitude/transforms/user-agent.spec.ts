/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { assert } from 'chai';
import 'mocha';

import { mapBrowser, mapOs, mapDeviceModel } from '../../../../lib/amplitude/transforms/user-agent';

const mockParsedUserAgent = {
  ua: {
    family: 'WaterCat',
    major: '66',
    minor: '12',
    patch: '0',
    toVersionString: () => '66.12.0',
  },
  os: {
    family: 'OS2',
    major: '10',
    minor: '135',
    patch: '3',
    patchMinor: 'q',
    toVersionString: () => '10.135.3q',
  },
  device: {
    family: 'iQod',
    brand: 'Kiwi',
    model: 'fanciest',
  },
};

describe('browser properties mapper', () => {
  it('should be empty when browser family is missing', () => {
    const browserProps = mapBrowser({
      ...mockParsedUserAgent,
      ua: { ...mockParsedUserAgent.ua, family: null },
    });
    assert.deepEqual(browserProps, {});
  });

  it('should be empty when browser family is "Other"', () => {
    const browserProps = mapBrowser({
      ...mockParsedUserAgent,
      ua: { ...mockParsedUserAgent.ua, family: 'Other' },
    });
    assert.deepEqual(browserProps, {});
  });

  it('should map the browser and its version correctly', () => {
    const browserProps = mapBrowser(mockParsedUserAgent);
    assert.deepEqual(browserProps, {
      ua_browser: 'WaterCat',
      ua_version: '66.12.0',
    });
  });
});

describe('OS properties mapper', () => {
  it('should be empty when OS family is missing', () => {
    const osProps = mapOs({
      ...mockParsedUserAgent,
      os: { ...mockParsedUserAgent.os, family: null },
    });
    assert.deepEqual(osProps, {});
  });

  it('should be empty when the OS family is "Other"', () => {
    const osProps = mapOs({
      ...mockParsedUserAgent,
      os: { ...mockParsedUserAgent.os, family: 'Other' },
    });
    assert.deepEqual(osProps, {});
  });

  it('should map the browser and its version correctly', () => {
    const osProps = mapOs(mockParsedUserAgent);
    assert.deepEqual(osProps, {
      os_name: 'OS2',
      os_version: '10.135.3q',
    });
  });
});

describe('device model mapper', () => {
  it('should be empty when device family is missing', () => {
    const device = mapDeviceModel({
      ...mockParsedUserAgent,
      device: { ...mockParsedUserAgent.device, family: null },
    });
    assert.deepEqual(device, {});
  });

  it('should be empty when device brand is missing', () => {
    const device = mapDeviceModel({
      ...mockParsedUserAgent,
      device: { ...mockParsedUserAgent.device, brand: null },
    });
    assert.deepEqual(device, {});
  });

  it('should be empty when device brand is "Generic"', () => {
    const device = mapDeviceModel({
      ...mockParsedUserAgent,
      device: { ...mockParsedUserAgent.device, brand: 'Generic' },
    });
    assert.deepEqual(device, {});
  });

  it('should map device model correctly', () => {
    const device = mapDeviceModel(mockParsedUserAgent);
    assert.deepEqual(device, { device_model: 'iQod' });
  });
});
