/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { checkClientName, checkSampleRate, checkServiceName } from './config';

describe('tracing config', () => {
  it('checks for client name', () => {
    expect(() => checkClientName({ clientName: '' })).toThrow();
  });

  it('checks for service name', () => {
    expect(() => checkServiceName({ serviceName: '' })).toThrow();
  });

  it('checks sample rate', () => {
    expect(() => checkSampleRate({ sampleRate: -1 })).toThrow();
    expect(() => checkSampleRate({ sampleRate: 1.1 })).toThrow();
    expect(() => checkSampleRate({ sampleRate: Number.NaN })).toThrow();
  });
});
