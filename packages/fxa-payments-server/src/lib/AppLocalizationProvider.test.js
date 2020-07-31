/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/* eslint jest/valid-expect: 0 */

import IntlPolyfill from 'intl';
Intl.NumberFormat = IntlPolyfill.NumberFormat;

import React from 'react';
import { render, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import waitUntil from 'async-wait-until';
import { Localized } from '@fluent/react';
import sinon from 'sinon';

import fetchMock from 'fetch-mock';
import AppLocalizationProvider from './AppLocalizationProvider';
import { getLocalizedCurrency } from './formats';

describe('<AppLocalizationProvider/>', () => {
  const locales = ['en-GB', 'en-US', 'es-ES'];
  const bundles = ['greetings', 'farewells'];
  function waitUntilTranslated() {
    return waitUntil(
      () => AppLocalizationProvider.prototype.render.callCount === 2
    );
  }

  beforeAll(() => {
    fetchMock.get('/locales/en-US/greetings.ftl', 'hello = Hello\n');
    fetchMock.get('/locales/en-US/farewells.ftl', 'goodbye = Goodbye\n');
    fetchMock.get('/locales/es-ES/greetings.ftl', 'hello = Hola\n');
    fetchMock.get('/locales/en-GB/greetings.ftl', 'hello = Hello { $amount }')
    fetchMock.get('*', { throws: new Error() });
  });

  afterAll(() => {
    fetchMock.restore();
  });

  beforeEach(() => {
    sinon.spy(AppLocalizationProvider.prototype, 'render');
  });

  afterEach(() => {
    AppLocalizationProvider.prototype.render.restore();
    cleanup();
  });

  it('translate to en-US', async () => {
    const { getByTestId } = render(
      <AppLocalizationProvider bundles={bundles} userLocales={['en-US']}>
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
      <AppLocalizationProvider bundles={bundles} userLocales={['es-ES']}>
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
    expect(getByTestId('result')).toHaveTextContent('HolaGoodbye');
  });

  it('translate to de', async () => {
    const { getByTestId } = render(
      <AppLocalizationProvider bundles={bundles} userLocales={['de']}>
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
    expect(getByTestId('result')).toHaveTextContent('HelloGoodbye');
  });

  it('fallback to text content', async () => {
    const { getByTestId } = render(
      <AppLocalizationProvider bundles={bundles} userLocales={locales}>
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
    err.code = 404;

    return expect(Promise.reject(err)).rejects.toHaveProperty('code', 404);
  });

  it('translate to en-NZ currency', async () => {
    const { getByTestId } = render(
      <AppLocalizationProvider bundles={bundles} userLocales={['en-NZ']}>
        <main data-testid="result">
          <Localized id="hello" vars={{ amount: getLocalizedCurrency(123, 'USD') }}>
            <div>untranslated</div>
          </Localized>
        </main>
      </AppLocalizationProvider>
    );
    await waitUntilTranslated();

    expect(getByTestId('result')).toHaveTextContent('Hello ⁨US$1.23');
  });
});
