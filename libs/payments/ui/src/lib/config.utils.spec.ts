/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import 'reflect-metadata';
import { Transform } from 'class-transformer';
import { IsBoolean, IsOptional } from 'class-validator';
import { parseBooleanEnv, validate } from './config.utils';

class FlagConfig {
  @IsOptional()
  @Transform(parseBooleanEnv)
  @IsBoolean()
  featureFlag?: boolean;
}

describe('parseBooleanEnv', () => {
  it.each([
    { raw: 'true', expected: true },
    { raw: 'false', expected: false },
    { raw: '', expected: false },
    { raw: '1', expected: false },
  ])('parses FEATURE_FLAG="$raw" as $expected', ({ raw, expected }) => {
    const config = validate({ FEATURE_FLAG: raw }, FlagConfig);

    expect(config.featureFlag).toBe(expected);
  });

  it('leaves the flag undefined when the env var is unset', () => {
    const config = validate({}, FlagConfig);

    expect(config.featureFlag).toBeUndefined();
  });
});
