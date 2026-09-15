/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { render, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import waitUntil from 'async-wait-until';
import sinon from 'sinon';

import { Localized } from '@fluent/react';

import fetchMock from 'fetch-mock';
import AppLocalizationProvider, {
  L10N_ASSET_MAP_META,
} from './AppLocalizationProvider';

// `it` negotiates to exactly ['it', 'en'], which keeps the set of requested
// bundle paths small enough to assert on precisely.
const HASHED_BASE_DIR = '/hashed';
const HASHED_LOCALES = ['it'];
// Keys must match the path `fetchMessages` builds, which has no leading slash.
// `farewells` is deliberately absent, and `notfound` maps to a path that 404s.
const HASHED_ASSET_MAP = {
  'locales/it/greetings.ftl': 'locales/it/greetings.1a2b3c.ftl',
  'locales/en/greetings.ftl': 'locales/en/greetings.4d5e6f.ftl',
  'locales/it/notfound.ftl': 'locales/it/notfound.7a8b9c.ftl',
  'locales/en/notfound.ftl': 'locales/en/notfound.7a8b9c.ftl',
};

describe('<AppLocalizationProvider/>', () => {
  const locales = ['en-GB', 'en-CA', 'es-ES'];
  const bundles = ['greetings', 'farewells'];
  const reportError = () => {};
  // Only the hashed paths carry the expected strings, so a test that renders
  // them proves the map was consulted.
  const l10nAssetMap = {
    'locales/en-CA/greetings.ftl': 'locales/en-CA/greetings.hashed.ftl',
    'locales/en-CA/farewells.ftl': 'locales/en-CA/farewells.hashed.ftl',
    'locales/es-ES/greetings.ftl': 'locales/es-ES/greetings.hashed.ftl',
    'locales/en-GB/greetings.ftl': 'locales/en-GB/greetings.hashed.ftl',
  };

  let warnSpy: jest.SpyInstance;

  function waitUntilTranslated() {
    return waitUntil(() => {
      // @ts-ignore
      return AppLocalizationProvider.prototype.render.callCount === 2;
    });
  }

  function setL10nAssetMap(content: string) {
    let meta = document.head.querySelector(
      `meta[name="${L10N_ASSET_MAP_META}"]`
    );
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', L10N_ASSET_MAP_META);
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', content);
  }

  function setL10nAssetMapJson(map: unknown) {
    setL10nAssetMap(encodeURIComponent(JSON.stringify(map)));
  }

  function removeL10nAssetMap() {
    document.head
      .querySelector(`meta[name="${L10N_ASSET_MAP_META}"]`)
      ?.remove();
  }

  beforeAll(() => {
    fetchMock.get('/locales/en-CA/greetings.hashed.ftl', 'hello = Hello\n');
    fetchMock.get('/locales/en-CA/farewells.hashed.ftl', 'goodbye = Goodbye\n');
    fetchMock.get('/locales/es-ES/greetings.hashed.ftl', 'hello = Hola\n');
    fetchMock.get(
      '/locales/en-GB/greetings.hashed.ftl',
      'hello = Hello { $amount }'
    );
    fetchMock.get('/locales/en-CA/greetings.ftl', 'hello = Unhashed hello\n');

    // Bundles for the reportBundleError tests, served under their own baseDir
    // so they do not collide with the fixtures above.
    fetchMock.get(
      `${HASHED_BASE_DIR}/locales/it/greetings.1a2b3c.ftl`,
      'hello = Ciao\n'
    );
    fetchMock.get(
      `${HASHED_BASE_DIR}/locales/en/greetings.4d5e6f.ftl`,
      'hello = Hello\n'
    );
    // Unhashed paths for the bundle the map does not cover.
    fetchMock.get(
      `${HASHED_BASE_DIR}/locales/it/farewells.ftl`,
      'hello = Ciao ciao\n'
    );
    fetchMock.get(
      `${HASHED_BASE_DIR}/locales/en/farewells.ftl`,
      'hello = Bye\n'
    );
    fetchMock.get(`${HASHED_BASE_DIR}/locales/it/notfound.7a8b9c.ftl`, 404);
    fetchMock.get(`${HASHED_BASE_DIR}/locales/en/notfound.7a8b9c.ftl`, 404);

    fetchMock.get('*', { throws: new Error() });
  });

  afterAll(() => {
    fetchMock.restore();
  });

  beforeEach(() => {
    setL10nAssetMap(encodeURIComponent(JSON.stringify(l10nAssetMap)));
    warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    sinon.spy(AppLocalizationProvider.prototype, 'render');
  });

  afterEach(() => {
    removeL10nAssetMap();
    warnSpy.mockRestore();
    // @ts-ignore
    AppLocalizationProvider.prototype.render.restore();
    cleanup();
  });

  it('translate to en-CA', async () => {
    const { getByTestId } = render(
      <AppLocalizationProvider
        bundles={bundles}
        userLocales={['en-CA']}
        reportError={reportError}
      >
        <main data-testid="result">
          <Localized id="hello">
            <div>untranslated</div>
          </Localized>
          <Localized id="goodbye">
            <div>untranslated</div>
          </Localized>
        </main>
      </AppLocalizationProvider>
    );
    await waitUntilTranslated();

    expect(getByTestId('result')).toHaveTextContent('HelloGoodbye');
  });

  it('translate to es-ES', async () => {
    const { getByTestId } = render(
      <AppLocalizationProvider
        bundles={bundles}
        userLocales={['es-ES']}
        reportError={reportError}
      >
        <main data-testid="result">
          <Localized id="hello">
            <div>untranslated</div>
          </Localized>
          <Localized id="goodbye">
            <div>untranslated</div>
          </Localized>
        </main>
      </AppLocalizationProvider>
    );
    await waitUntilTranslated();

    // Ensure we leave the string untranslated if our locale is missing it.
    expect(getByTestId('result')).toHaveTextContent('Holauntranslated');
  });

  it('translate to de', async () => {
    const { getByTestId } = render(
      <AppLocalizationProvider
        bundles={bundles}
        userLocales={['de']}
        reportError={reportError}
      >
        <main data-testid="result">
          <Localized id="hello">
            <div>untranslated</div>
          </Localized>
          <Localized id="goodbye">
            <div>untranslated</div>
          </Localized>
        </main>
      </AppLocalizationProvider>
    );
    await waitUntilTranslated();

    // Ensure we leave strings untranslated if we don't have translations for
    // any of the userLocales.
    expect(getByTestId('result')).toHaveTextContent('untranslated');
  });

  it('fallback to text content', async () => {
    const { getByTestId } = render(
      <AppLocalizationProvider
        bundles={bundles}
        userLocales={locales}
        reportError={reportError}
      >
        <Localized id="nonexistent">
          <div data-testid="result">untranslated</div>
        </Localized>
      </AppLocalizationProvider>
    );
    await waitUntilTranslated();
    expect(getByTestId('result')).toHaveTextContent('untranslated');
  });

  // An absent map is normal for consumers that do not hash their l10n files.
  // A map that is present but unusable is a build problem, so it warns.
  it.each([
    ['absent', () => removeL10nAssetMap(), 0],
    ['empty', () => setL10nAssetMap(encodeURIComponent('{}')), 1],
    ['not JSON', () => setL10nAssetMap('not-json'), 1],
    ['not URI encoded', () => setL10nAssetMap('%'), 1],
    ['an array', () => setL10nAssetMapJson(['locales/en-CA/greetings.ftl']), 1],
    [
      'an object with an empty string value',
      () =>
        setL10nAssetMapJson({
          ...l10nAssetMap,
          'locales/en-CA/greetings.ftl': '',
        }),
      1,
    ],
    [
      'an object with a non string value',
      () =>
        setL10nAssetMapJson({
          ...l10nAssetMap,
          'locales/en-CA/greetings.ftl': { path: 'greetings.hashed.ftl' },
        }),
      1,
    ],
  ])(
    'falls back to unhashed paths when the map is %s',
    async (_case, setUpMap, expectedWarnings) => {
      setUpMap();
      const { getByTestId } = render(
        <AppLocalizationProvider
          bundles={bundles}
          userLocales={['en-CA']}
          reportError={reportError}
        >
          <main data-testid="result">
            <Localized id="hello">
              <div>untranslated</div>
            </Localized>
          </main>
        </AppLocalizationProvider>
      );
      await waitUntilTranslated();

      expect(getByTestId('result')).toHaveTextContent('Unhashed hello');
      expect(warnSpy).toHaveBeenCalledTimes(expectedWarnings);
    }
  );

  test('check code property', () => {
    const err = new Error();
    // @ts-ignore
    err.code = 404;

    return expect(Promise.reject(err)).rejects.toHaveProperty('code', 404);
  });

  it('translate to en-NZ currency', async () => {
    const { getByTestId } = render(
      <AppLocalizationProvider
        bundles={bundles}
        userLocales={['en-NZ']}
        reportError={reportError}
      >
        <main data-testid="result">
          <Localized id="hello" vars={{ amount: '$US123.00' }}>
            <div>untranslated</div>
          </Localized>
        </main>
      </AppLocalizationProvider>
    );
    await waitUntilTranslated();

    expect(getByTestId('result')).toHaveTextContent('Hello ⁨$US123.00⁩');
  });

  describe('reportBundleError', () => {
    beforeEach(() => {
      setL10nAssetMapJson(HASHED_ASSET_MAP);
    });

    function renderWithManifest(
      bundlesToLoad: Array<string>,
      reportBundleError: jest.Mock
    ) {
      return render(
        <AppLocalizationProvider
          baseDir={HASHED_BASE_DIR}
          bundles={bundlesToLoad}
          userLocales={HASHED_LOCALES}
          reportBundleError={reportBundleError}
        >
          <main data-testid="result">
            <Localized id="hello">
              <div>untranslated</div>
            </Localized>
          </main>
        </AppLocalizationProvider>
      );
    }

    it('resolves the hashed path from the manifest and reports nothing', async () => {
      const reportBundleError = jest.fn();
      const { getByTestId } = renderWithManifest(
        ['greetings'],
        reportBundleError
      );
      await waitUntilTranslated();

      expect(getByTestId('result')).toHaveTextContent('Ciao');
      expect(reportBundleError).not.toHaveBeenCalled();
    });

    it('falls back to the unhashed path for a bundle with no entry in the manifest', async () => {
      const reportBundleError = jest.fn();
      const { getByTestId } = renderWithManifest(
        ['farewells'],
        reportBundleError
      );
      await waitUntilTranslated();

      expect(
        reportBundleError.mock.calls.map(([error, locale]) => [
          error.message,
          locale,
        ])
      ).toEqual([
        [
          'No static asset mapping for l10n bundle: locales/it/farewells.ftl',
          'it',
        ],
        [
          'No static asset mapping for l10n bundle: locales/en/farewells.ftl',
          'en',
        ],
      ]);
      expect(getByTestId('result')).toHaveTextContent('Ciao ciao');
    });

    it('reports a bundle whose hashed path does not resolve, once per locale', async () => {
      const reportBundleError = jest.fn();
      renderWithManifest(['notfound'], reportBundleError);
      await waitUntilTranslated();

      expect(
        reportBundleError.mock.calls.map(([error, locale]) => [
          error.message,
          locale,
        ])
      ).toEqual([
        [
          `Fetching l10n bundle returned 404: ${HASHED_BASE_DIR}/locales/it/notfound.7a8b9c.ftl`,
          'it',
        ],
        [
          `Fetching l10n bundle returned 404: ${HASHED_BASE_DIR}/locales/en/notfound.7a8b9c.ftl`,
          'en',
        ],
      ]);
    });

    it('reports an unusable manifest', async () => {
      const reportBundleError = jest.fn();
      setL10nAssetMap('not-json');
      renderWithManifest(['greetings'], reportBundleError);
      await waitUntilTranslated();

      // A manifest failure is not scoped to one locale, so it carries none.
      expect(reportBundleError.mock.calls[0]).toEqual([
        expect.objectContaining({
          message: expect.stringContaining(
            `<meta name="${L10N_ASSET_MAP_META}"> is present but unusable`
          ),
        }),
      ]);
      // Without mappings the unhashed paths are requested and fail too, so an
      // unusable manifest costs one report plus one per negotiated locale.
      expect(reportBundleError).toHaveBeenCalledTimes(3);
    });
  });
});
