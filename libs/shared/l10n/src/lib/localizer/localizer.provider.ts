/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import 'server-only';
import { Provider } from '@nestjs/common';
import { LocalizerBindingsServer } from './localizer.server.bindings';
import { LocalizerRscFactory } from './localizer.rsc.factory';

export const LocalizerRscFactoryProvider: Provider<LocalizerRscFactory> = {
  provide: LocalizerRscFactory,
  useFactory: async () => {
    const bindings = new LocalizerBindingsServer({
      translations: { basePath: './public/locales' },
    });
    const localizer = new LocalizerRscFactory(bindings);
    await localizer.init();
    return localizer;
  },
};
