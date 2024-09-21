/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import set from 'set-value';
import { plainToInstance, ClassConstructor } from 'class-transformer';
import { validateSync } from 'class-validator';

const SEPARATOR = '__';

/**
 * Validate the config record against a config class with validation constraints
 *
 * More information: https://docs.nestjs.com/techniques/configuration#custom-validate-function
 *
 * @param config - any config record, typically process.env
 * @param configClass - class-validator class with validation decorators
 * @returns validated and formatted config object, typed according to input configClass
 */
export function validate<T extends object>(
  config: Record<string, unknown>,
  configClass: ClassConstructor<T>
) {
  const dotEnv = transform(config);

  const validatedConfig = plainToInstance(configClass, dotEnv, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(errors.toString());
  }
  return validatedConfig;
}

/**
 * Transform record with string keys, into a nested object using SEPARATOR
 * e.g.
 * {
 *   NODE_ENV=20
 *   AUTH__SECRET_KEY=verysecret
 * }
 *
 * transforms into
 *
 * {
 *   nodeEnv: '20',
 *   auth: {
 *     secretKey: 'verysecret',
 *   }
 * }
 *
 */
function transform(config: Record<string, unknown>) {
  const keyTransformer = (key: string) =>
    key.toLowerCase().replace(/(?<!_)_([a-z])/g, (_, p1) => p1.toUpperCase());

  config = Object.entries(config).reduce<Record<string, any>>(
    (acc, [key, value]) => {
      acc[keyTransformer(key)] = value;
      return acc;
    },
    {}
  );

  const temp = {};
  Object.entries(config).forEach(([key, value]) => {
    set(temp, key.split(SEPARATOR), value);
  });
  config = temp;

  return config;
}
