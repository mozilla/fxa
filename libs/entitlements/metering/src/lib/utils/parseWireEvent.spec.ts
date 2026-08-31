/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { VError } from 'verror';

import { InvalidMeteringEventError } from '../metering.error';
import { MeteringWireEventFactory } from '../metering.factories';
import { parseWireEvent } from './parseWireEvent';

function encode(payload: unknown): Buffer {
  return Buffer.from(JSON.stringify(payload), 'utf8');
}

describe('parseWireEvent', () => {
  it('returns the parsed event for a valid payload', () => {
    const event = MeteringWireEventFactory();

    expect(parseWireEvent(encode(event))).toEqual(event);
  });

  it('throws InvalidMeteringEventError for malformed JSON', () => {
    expect(() => parseWireEvent(Buffer.from('{not json', 'utf8'))).toThrow(
      InvalidMeteringEventError
    );
  });

  it('throws InvalidMeteringEventError for a schema violation', () => {
    const event = MeteringWireEventFactory({ amount: -1 });

    expect(() => parseWireEvent(encode(event))).toThrow(
      InvalidMeteringEventError
    );
  });

  it('names the failing fields in the error info', () => {
    const event = MeteringWireEventFactory({ amount: -1 });

    expect.assertions(2);
    try {
      parseWireEvent(encode(event));
    } catch (err) {
      expect(err).toBeInstanceOf(InvalidMeteringEventError);
      if (err instanceof InvalidMeteringEventError) {
        expect(VError.info(err)).toEqual({ issuePaths: ['amount'] });
      }
    }
  });
});
