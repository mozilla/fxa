import { LocalizerOpts } from '../models/LocalizerOpts';

export interface ILocalizerBindings {
  opts: LocalizerOpts;
  fetchResource(path: string): Promise<string>;
}
