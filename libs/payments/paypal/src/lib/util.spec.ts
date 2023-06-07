/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { nvpToObject, objectToNVP } from './util';

describe('util', () => {
  it('objectToNVP', () => {
    const obj = {
      NAME: 'Robert Moore',
      COMPANY: 'R. H. Moore & Associates',
      L: [
        {
          EXAMPLE: 'val',
        },
      ],
    };
    const result = objectToNVP(obj);
    // See https://developer.paypal.com/api/nvp-soap/NVPAPIOverview/#link-specifycredentialswithcurl
    expect(result).toEqual(
      'COMPANY=R.+H.+Moore+%26+Associates&L_EXAMPLE0=val&NAME=Robert+Moore'
    );
  });

  it('nvpToObject', () => {
    const EXAMPLE_NVP =
      'TIMESTAMP=2011%2d11%2d15T20%3a27%3a02Z&CORRELATIONID=5be53331d9700&ACK=Failure&VERSION=78%2e0&BUILD=000000&L_ERRORCODE0=15005&L_SHORTMESSAGE0=Processor%20Decline&L_LONGMESSAGE0=This%20transaction%20cannot%20be%20processed%2e&L_SEVERITYCODE0=Error&L_ERRORPARAMID0=ProcessorResponse&L_ERRORPARAMVALUE0=0051&AMT=10%2e40&CURRENCYCODE=USD&AVSCODE=X&CVV2MATCH=M';

    const result = nvpToObject(EXAMPLE_NVP);
    expect(result).toMatchObject({
      ACK: 'Failure',
      AMT: '10.40',
      AVSCODE: 'X',
      BUILD: '000000',
      CORRELATIONID: '5be53331d9700',
      CURRENCYCODE: 'USD',
      CVV2MATCH: 'M',
      L: [
        {
          ERRORCODE: '15005',
          ERRORPARAMID: 'ProcessorResponse',
          ERRORPARAMVALUE: '0051',
          LONGMESSAGE: 'This transaction cannot be processed.',
          SEVERITYCODE: 'Error',
          SHORTMESSAGE: 'Processor Decline',
        },
      ],
      TIMESTAMP: '2011-11-15T20:27:02Z',
      VERSION: '78.0',
    });
  });
});
