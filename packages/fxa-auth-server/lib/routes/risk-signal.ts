/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { ResponseToolkit } from '@hapi/hapi';
import isA from 'joi';

import { AuthLogger, AuthRequest } from '../types';

export const RISK_BAND_HEADER = 'x-fxa-risk-band';
export const RISK_BANDS = ['clean', 'low', 'elevated', 'high'] as const;

export type RiskBand = (typeof RISK_BANDS)[number];

export const riskSignalRoutes = (log: AuthLogger) => [
  {
    method: 'GET',
    path: '/risk_signal_probe',
    options: {
      validate: {
        query: isA.object({
          band: isA
            .string()
            .valid(...RISK_BANDS)
            .default('clean'),
        }),
      },
    },
    handler: (request: AuthRequest, h: ResponseToolkit) => {
      log.begin('riskSignal.probe', request);
      const { band } = request.query as { band: RiskBand };
      return h.response({ band }).header(RISK_BAND_HEADER, band);
    },
  },
];

export default riskSignalRoutes;
