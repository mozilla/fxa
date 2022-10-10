/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { expect } from 'chai';
import {
  checkClientName,
  checkSampleRate,
  checkServiceName,
} from '../../tracing/config';

describe('tracing config', () => {
  it('checks for client name', () => {
    expect(() => checkClientName({ clientName: '' })).throws();
  });
  it('checks for service name', () => {
    expect(() => checkServiceName({ serviceName: '' })).throws();
  });
  it('checks sample rate', () => {
    expect(() => checkSampleRate({ sampleRate: -1 })).throws();
    expect(() => checkSampleRate({ sampleRate: 1.1 })).throws();
    expect(() => checkSampleRate({ sampleRate: Number.NaN })).throws();
  });
});
