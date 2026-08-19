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

describe('<AppLocalizationProvider/>', () => {
  const locales = ['en-GB', 'en-US', 'es-ES'];
  const bundles = ['greetings', 'farewells'];
  const reportError = () => {};
  // Only the hashed paths carry the expected strings, so a test that renders
  // them proves the map was consulted.
  const l10nAssetMap = {
    'locales/en-US/greetings.ftl': 'locales/en-US/greetings.hashed.ftl',
    'locales/en-US/farewells.ftl': 'locales/en-US/farewells.hashed.ftl',
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
    fetchMock.get('/locales/en-US/greetings.hashed.ftl', 'hello = Hello\n');
    fetchMock.get('/locales/en-US/farewells.hashed.ftl', 'goodbye = Goodbye\n');
    fetchMock.get('/locales/es-ES/greetings.hashed.ftl', 'hello = Hola\n');
    fetchMock.get(
      '/locales/en-GB/greetings.hashed.ftl',
      'hello = Hello { $amount }'
    );
    fetchMock.get('/locales/en-US/greetings.ftl', 'hello = Unhashed hello\n');
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

  it('translate to en-US', async () => {
    const { getByTestId } = render(
      <AppLocalizationProvider
        bundles={bundles}
        userLocales={['en-US']}
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

    // Ensure we fall back to en-US if our locale is missing that string.
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

    // Ensure we fall back to en-US strings if we don't have translations for
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
    ['an array', () => setL10nAssetMapJson(['locales/en-US/greetings.ftl']), 1],
    [
      'an object with an empty string value',
      () =>
        setL10nAssetMapJson({
          ...l10nAssetMap,
          'locales/en-US/greetings.ftl': '',
        }),
      1,
    ],
    [
      'an object with a non string value',
      () =>
        setL10nAssetMapJson({
          ...l10nAssetMap,
          'locales/en-US/greetings.ftl': { path: 'greetings.hashed.ftl' },
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
          userLocales={['en-US']}
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
});
