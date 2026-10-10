/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { TypedConfigModule, dotenvLoader } from 'nest-typed-config';

import { RootConfig } from '.';

export const RootConfigModule = TypedConfigModule.forRoot({
  schema: RootConfig,
  load: dotenvLoader({
    separator: '__',
    keyTransformer: (key) =>
      key.toLowerCase().replace(/(?<!_)_([a-z])/g, (_, p1) => p1.toUpperCase()),
    envFilePath: ['.env.local', '.env'],
  }),
});
