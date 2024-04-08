/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import type { LocalizerOpts } from './localizer.models';
import { ILocalizerBindings } from './localizer.interfaces';

export class LocalizerBindingsClient implements ILocalizerBindings {
  readonly opts: LocalizerOpts;
  constructor(opts?: LocalizerOpts) {
    this.opts = Object.assign(
      {
        translations: {
          basePath: './locales',
        },
      },
      opts
    );
  }

  async fetchResource(path: string): Promise<string> {
    const response = await fetch(path);
    const messages = await response.text();

    return messages;
  }
}
