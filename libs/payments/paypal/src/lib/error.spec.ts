/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { faker } from '@faker-js/faker';
import { PayPalClientError } from './error';
import { NVPErrorFactory, NVPErrorResponseFactory } from './factories';
import { NVPErrorSeverity } from './types';

describe('PaypalClientError', () => {
  const raw = faker.word.words();

  it('handles multiple errors when one error is a warning', () => {
    const data = NVPErrorResponseFactory({
      L: [
        NVPErrorFactory(),
        NVPErrorFactory({
          SEVERITYCODE: NVPErrorSeverity.Warning,
        }),
      ],
    });
    const paypalClientError = new PayPalClientError(raw, data);
    expect(paypalClientError.errorCode?.toString()).toEqual(
      data.L?.at(0)?.ERRORCODE
    );
  });

  it('falls back to the first error if multiple errors are found', () => {
    const data = NVPErrorResponseFactory({
      L: [NVPErrorFactory(), NVPErrorFactory()],
    });
    const paypalClientError = new PayPalClientError(raw, data);
    expect(paypalClientError.errorCode?.toString()).toEqual(
      data.L?.at(0)?.ERRORCODE
    );
  });

  it('takes the first response code if no errors are returned', () => {
    const data = NVPErrorResponseFactory({
      L: [
        NVPErrorFactory({
          SEVERITYCODE: NVPErrorSeverity.Warning,
        }),
      ],
    });
    const paypalClientError = new PayPalClientError(raw, data);
    expect(paypalClientError.errorCode?.toString()).toEqual(
      data.L?.at(0)?.ERRORCODE
    );
  });
});
