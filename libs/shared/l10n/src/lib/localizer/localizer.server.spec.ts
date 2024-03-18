import { Test, TestingModule } from '@nestjs/testing';
import { LocalizerServer } from './localizer.server';
import { ILocalizerBindings } from './localizer.interfaces';
import supportedLanguages from '../supported-languages.json';

describe('LocalizerServer', () => {
  let localizer: LocalizerServer;
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
          provide: LocalizerServer,
          useFactory: async () => new LocalizerServer(bindings),
        },
      ],
    }).compile();

    localizer = module.get(LocalizerServer);
    await localizer.populateBundles();
  });

  it('should be defined', () => {
    expect(localizer).toBeDefined();
    expect(localizer).toBeInstanceOf(LocalizerServer);
  });

  it('testing', async () => {
    const bundle = localizer.getBundle('fr');
    expect(bundle.locales).toEqual(['fr']);
    expect(bundle.getMessage('test-id')?.value).toBe('Test Fr');
  });

  describe('populateBundles', () => {
    it('should succeed', async () => {
      expect(localizer['bundles'].size).toBe(supportedLanguages.length);
    });
  });

  describe('getBundle', () => {
    it('should return bundle for locale', () => {
      const bundle = localizer.getBundle('fr');
      expect(bundle.locales).toEqual(['fr']);
      expect(bundle.getMessage('test-id')?.value).toBe('Test Fr');
    });

    it('should return empty bundle for missing locale', () => {
      const bundle = localizer.getBundle('nope');
      expect(bundle.locales).toEqual(['nope']);
      expect(bundle._messages.size).toBe(0);
    });
  });
});
