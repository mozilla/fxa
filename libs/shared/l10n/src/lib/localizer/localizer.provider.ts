/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Provider } from '@nestjs/common';
import { LocalizerServer } from './localizer.server';
import { LocalizerBindingsServer } from './localizer.server.bindings';

export const LocalizerServerFactory: Provider<LocalizerServer> = {
  provide: LocalizerServer,
  useFactory: async () => {
    const bindings = new LocalizerBindingsServer({
      translations: { basePath: './public/locales' },
    });
    const localizer = new LocalizerServer(bindings);
    await localizer.populateBundles();
    return localizer;
  },
};
