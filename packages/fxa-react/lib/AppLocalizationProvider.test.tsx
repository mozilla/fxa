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
import AppLocalizationProvider from './AppLocalizationProvider';

// `it` negotiates to exactly ['it', 'en'], which keeps the set of requested
// bundle paths small enough to assert on precisely.
const HASHED_BASE_DIR = '/hashed';
const HASHED_LOCALES = ['it'];

describe('<AppLocalizationProvider/>', () => {
  const locales = ['en-GB', 'en-CA', 'es-ES'];
  const bundles = ['greetings', 'farewells'];
  const reportError = () => {};
  function waitUntilTranslated() {
    return waitUntil(() => {
      // @ts-ignore
      return AppLocalizationProvider.prototype.render.callCount === 2;
    });
  }

  beforeAll(() => {
    // Keys must match the path `fetchMessages` builds, which has no leading
    // slash. `farewells` is absent for every locale but en-CA, so those
    // lookups miss and Fluent falls back.
    fetchMock.get(
      '/static-asset-manifest.json',
      JSON.stringify({
        'locales/en-CA/greetings.ftl': 'locales/en-CA/greetings.ftl',
        'locales/en-CA/farewells.ftl': 'locales/en-CA/farewells.ftl',
        'locales/es-ES/greetings.ftl': 'locales/es-ES/greetings.ftl',
        'locales/en-GB/greetings.ftl': 'locales/en-GB/greetings.ftl',
      })
    );
    fetchMock.get('/locales/en-CA/greetings.ftl', 'hello = Hello\n');
    fetchMock.get('/locales/en-CA/farewells.ftl', 'goodbye = Goodbye\n');
    fetchMock.get('/locales/es-ES/greetings.ftl', 'hello = Hola\n');
    fetchMock.get('/locales/en-GB/greetings.ftl', 'hello = Hello { $amount }');

    // A separate manifest, served under its own baseDir so it does not
    // collide with the default manifest fixture above. `farewells` is
    // deliberately absent from it, and `notfound` maps to a path that 404s.
    fetchMock.get(
      `${HASHED_BASE_DIR}/static-asset-manifest.json`,
      JSON.stringify({
        'locales/it/greetings.ftl': 'locales/it/greetings.1a2b3c.ftl',
        'locales/en/greetings.ftl': 'locales/en/greetings.4d5e6f.ftl',
        'locales/it/notfound.ftl': 'locales/it/notfound.7a8b9c.ftl',
        'locales/en/notfound.ftl': 'locales/en/notfound.7a8b9c.ftl',
      })
    );
    fetchMock.get(
      `${HASHED_BASE_DIR}/locales/it/greetings.1a2b3c.ftl`,
      'hello = Ciao\n'
    );
    fetchMock.get(
      `${HASHED_BASE_DIR}/locales/en/greetings.4d5e6f.ftl`,
      'hello = Hello\n'
    );
    fetchMock.get(`${HASHED_BASE_DIR}/locales/it/notfound.7a8b9c.ftl`, 404);
    fetchMock.get(`${HASHED_BASE_DIR}/locales/en/notfound.7a8b9c.ftl`, 404);

    fetchMock.get('*', { throws: new Error() });
  });

  afterAll(() => {
    fetchMock.restore();
  });

  beforeEach(() => {
    sinon.spy(AppLocalizationProvider.prototype, 'render');
  });

  afterEach(() => {
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
    function renderWithManifest(
      bundlesToLoad: Array<string>,
      reportBundleError: jest.Mock,
      baseDir = HASHED_BASE_DIR
    ) {
      return render(
        <AppLocalizationProvider
          baseDir={baseDir}
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

    it('reports a bundle with no entry in the manifest, once per locale', async () => {
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
      expect(getByTestId('result')).toHaveTextContent('untranslated');
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

    it('reports an unreachable manifest', async () => {
      const reportBundleError = jest.fn();
      renderWithManifest(['greetings'], reportBundleError, '/no-manifest');
      await waitUntilTranslated();

      // A manifest failure is not scoped to one locale, so it carries none.
      expect(reportBundleError.mock.calls[0]).toEqual([
        expect.objectContaining({
          message: expect.stringContaining(
            'Fetching l10n static asset manifest failed: /no-manifest/static-asset-manifest.json'
          ),
        }),
      ]);
      // Without mappings the unhashed paths are requested and fail too, so a
      // manifest outage costs one report plus one per negotiated locale.
      expect(reportBundleError).toHaveBeenCalledTimes(3);
    });
  });
});
