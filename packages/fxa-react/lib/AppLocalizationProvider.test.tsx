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

describe('<AppLocalizationProvider/>', () => {
  const locales = ['en-GB', 'en-US', 'es-ES'];
  const bundles = ['greetings', 'farewells'];
  const reportError = () => {};
  function waitUntilTranslated() {
    return waitUntil(() => {
      // @ts-ignore
      return AppLocalizationProvider.prototype.render.callCount === 2;
    });
  }

  beforeAll(() => {
    fetchMock.get(
      '/static-asset-manifest.json',
      `
      {
        "/locales/en-US/greetings.ftl": "/locales/en-US/greetings.ftl",
        "/locales/en-US/farewells.ftl": "/locales/en-US/farewells.ftl",
        "/locales/es-ES/greetings.ftl": "/locales/es-ES/greetings.ftl",
        "/locales/en-GB/greetings.ftl": "/locales/en-GB/greetings.ftl",
      }
      `
    );
    fetchMock.get('/locales/en-US/greetings.ftl', 'hello = Hello\n');
    fetchMock.get('/locales/en-US/farewells.ftl', 'goodbye = Goodbye\n');
    fetchMock.get('/locales/es-ES/greetings.ftl', 'hello = Hola\n');
    fetchMock.get('/locales/en-GB/greetings.ftl', 'hello = Hello { $amount }');
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
