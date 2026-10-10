/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { ResponseToolkit } from '@hapi/hapi';
import { Schema } from 'joi';

import { AuthLogger, AuthRequest } from '../types';
import { RISK_BAND_HEADER, riskSignalRoutes } from './risk-signal';

const log = () => ({ begin: jest.fn() }) as unknown as AuthLogger;

/** Minimal stand-in for hapi's response toolkit; records headers set on the response. */
const toolkit = () => {
  const headers: Record<string, string> = {};
  const response = {
    header: jest.fn((key: string, value: string) => {
      headers[key] = value;
      return response;
    }),
  };
  return {
    headers,
    h: { response: jest.fn(() => response) } as unknown as ResponseToolkit,
  };
};

const route = () => riskSignalRoutes(log())[0];
const querySchema = () => (route().options.validate as { query: Schema }).query;

describe('riskSignalRoutes', () => {
  // The WAF rule matches this exact path; renaming it here breaks the rule.
  it('registers GET /risk_signal_probe', () => {
    const routes = riskSignalRoutes(log());
    expect(routes).toHaveLength(1);
    expect(routes[0].method).toBe('GET');
    expect(routes[0].path).toBe('/risk_signal_probe');
  });

  it('sets the risk band header to the band named in the query', () => {
    const t = toolkit();
    (route().handler as any)(
      { query: { band: 'high' } } as unknown as AuthRequest,
      t.h
    );
    expect(t.headers).toEqual({ [RISK_BAND_HEADER]: 'high' });
  });

  it('defaults the band to clean when the query omits it', () => {
    expect(querySchema().validate({}).value).toEqual({ band: 'clean' });
  });

  // Only known bands may reach the WAF.
  it('rejects a band outside the known set', () => {
    expect(querySchema().validate({ band: 'critical' }).error?.message).toBe(
      '"band" must be one of [clean, low, elevated, high]'
    );
  });
});
