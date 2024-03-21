/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Test, TestingModule } from '@nestjs/testing';
import { LocalizerRscFactory } from './localizer.rsc.factory';
import { ILocalizerBindings } from './localizer.interfaces';
import supportedLanguages from '../supported-languages.json';
import { LocalizerRsc } from './localizer.rsc';

describe('LocalizerRscFactory', () => {
  let localizer: LocalizerRscFactory;
  const bindings: ILocalizerBindings = {
    opts: {
      translations: {
        basePath: '',
      },
    },
    fetchResource: async (filePath) => {
      const locale = filePath.split('/')[1];
      switch (locale) {
        case 'fr':
          return 'test-id = Test Fr';
        default:
          return 'test-id = Test';
      }
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: LocalizerRscFactory,
          useFactory: async () => new LocalizerRscFactory(bindings),
        },
      ],
    }).compile();

    localizer = module.get(LocalizerRscFactory);
    await localizer.init();
  });

  it('should be defined', () => {
    expect(localizer).toBeDefined();
    expect(localizer).toBeInstanceOf(LocalizerRscFactory);
  });

  describe('fetchFluentBundles', () => {
    it('should succeed', async () => {
      expect(localizer['bundles'].size).toBe(supportedLanguages.length);
      expect(localizer['document']).toBeDefined();
    });
  });

  describe('createLocalizerRsc', () => {
    it('should return instance of LocalizerRsc', async () => {
      const localizerRsc = await localizer.createLocalizerRsc('en');
      expect(localizerRsc).toBeInstanceOf(LocalizerRsc);
    });

    it('should error when document or bundles are not initialized', async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          {
            provide: LocalizerRscFactory,
            useFactory: async () => new LocalizerRscFactory(bindings),
          },
        ],
      }).compile();
      const emptyLocalizer = module.get(LocalizerRscFactory);

      expect.assertions(1);
      try {
        emptyLocalizer.createLocalizerRsc('en');
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });
});
