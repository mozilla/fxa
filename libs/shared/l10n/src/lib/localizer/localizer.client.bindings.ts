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
