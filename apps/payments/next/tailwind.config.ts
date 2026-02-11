/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { createGlobPatternsForDependencies } from '@nx/react/tailwind';
import { join } from 'path';
import type { Config } from 'tailwindcss';

export default <Partial<Config>>{
  presets: [require('../../../libs/shared/assets/src/configs/tailwind.config')],
  content: [
    join(
      __dirname,
      '{src,pages,components,app}/**/*!(*.stories|*.spec).{ts,tsx,html}'
    ),
    ...createGlobPatternsForDependencies(__dirname),
  ],
  theme: {
    extend: {
      boxShadow: {
        inputError:
          '0 1px 2px rgba(0, 0, 0, 0.3), 0 3px 6px rgba(0, 0, 0, 0.02), 0 0 0 1px #df1b41',
        stripeBox:
          'rgba(0, 0, 0, 0.03) 0px 1px 1px 0px, rgba(0, 0, 0, 0.02) 0px 3px 6px 0px',
      },
      colors: {
        'alert-red': '#D70022',
      },
    },
  },
};
