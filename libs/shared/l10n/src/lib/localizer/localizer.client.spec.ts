/**
 * @jest-environment jsdom
 */
import { LocalizerClient } from './localizer.client';
import { ILocalizerBindings } from './localizer.interfaces';

describe('LocalizerClient', () => {
  let localizer: LocalizerClient;
  const supportedLocales = ['en', 'fr'];
  const bindings: ILocalizerBindings = {
    opts: {
      translations: {
        basePath: '',
      },
    },
    fetchResource: async (filePath) => {
      const locale = filePath.split('/')[1];
      switch (locale) {
        case supportedLocales[0]:
          return 'test-id = Test';
        case supportedLocales[1]:
          return 'test-id = Test Fr';
        default:
          throw new Error('Could not find locale');
      }
    },
  };

  beforeEach(async () => {
    localizer = new LocalizerClient(bindings);
  });

  it('should be defined', () => {
    expect(localizer).toBeDefined();
    expect(localizer).toBeInstanceOf(LocalizerClient);
  });

  describe('setupReactLocalization', () => {
    it('should successfully create instance of ReactLocalization', async () => {
      const acceptLanguage = 'en,fr';
      const { l10n, selectedLocale } = await localizer.setupReactLocalization(
        acceptLanguage
      );

      expect(selectedLocale).toBe('en');
      // Check that bundles exist for supported locales
      for (const bundle of l10n['bundles']) {
        expect(supportedLocales).toContainEqual(bundle.locales[0]);
      }
    });

    it('reports error for invalid id', async () => {
      const reportError = jest.fn();
      const { l10n } = await localizer.setupReactLocalization(
        'en',
        reportError
      );
      l10n.getString('invalid_id');
      expect(reportError).toHaveBeenCalled();
    });
  });
});
