/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { BadRequestException } from '@nestjs/common';
import type { ZodType } from 'zod';

export function parseRequest<T>(schema: ZodType<T>, input: unknown): T {
  const parsed = schema.safeParse(input);
  if (!parsed.success) {
    throw new BadRequestException(
      parsed.error.issues.map(({ code, path }) => ({ code, path }))
    );
  }
  return parsed.data;
}
