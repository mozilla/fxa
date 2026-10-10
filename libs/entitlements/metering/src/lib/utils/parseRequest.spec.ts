/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { BadRequestException } from '@nestjs/common';
import { z } from 'zod';

import { parseRequest } from './parseRequest';

const schema = z.object({ slug: z.string().min(1) });

describe('parseRequest', () => {
  it('returns the parsed value for valid input', () => {
    expect(parseRequest(schema, { slug: 'tokens' })).toEqual({
      slug: 'tokens',
    });
  });

  it('throws BadRequestException for invalid input', () => {
    expect(() => parseRequest(schema, { slug: '' })).toThrow(
      BadRequestException
    );
  });

  it('reports the failing issue code and path', () => {
    expect.assertions(1);
    try {
      parseRequest(schema, {});
    } catch (err) {
      if (err instanceof BadRequestException) {
        expect(err.getResponse()).toEqual({
          statusCode: 400,
          error: 'Bad Request',
          message: [{ code: 'invalid_type', path: ['slug'] }],
        });
      }
    }
  });
});
