/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/* eslint jest/valid-expect: 0 */

import React from 'react';
import { render, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import waitUntil from 'async-wait-until';
import { Localized } from 'fluent-react';
import sinon from 'sinon';

import fetchMock from 'fetch-mock';
import AppLocalizationProvider from './AppLocalizationProvider';


describe('<AppLocalizationProvider/>', () => {
  const locales = ['en-US', 'es-ES'];
  const bundles = ['greetings', 'farewells'];
  function waitUntilTranslated() {
    return waitUntil(() => AppLocalizationProvider.prototype.render.callCount === 2);
  }

  beforeAll(() => {
    fetchMock.get('/locales/en-US/greetings.ftl', 'hello = Hello\n');
    fetchMock.get('/locales/en-US/farewells.ftl', 'goodbye = Goodbye\n');
    fetchMock.get('/locales/es-ES/greetings.ftl', 'hello = Hola\n');
    fetchMock.get('/locales/locales.json', JSON.stringify(locales));
    fetchMock.get('/bad-locales/locales.json', JSON.stringify(locales));
    fetchMock.get('*', {throws: new Error()});
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
      <AppLocalizationProvider bundles={bundles}
                               userLocales={['en-US']}>
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
      <AppLocalizationProvider bundles={bundles}
                               userLocales={['es-ES']}>
        <main data-testid="result">
          <Localized id='hello'>
            <div>untranslated</div>
          </Localized>
          <Localized id='goodbye'>
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
      <AppLocalizationProvider bundles={bundles}
                               userLocales={['de']}>
        <main data-testid="result">
          <Localized id='hello'>
            <div>untranslated</div>
          </Localized>
          <Localized id='goodbye'>
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
      <AppLocalizationProvider bundles={bundles}
                               userLocales={locales}>
        <Localized id='nonexistent'>
          <div data-testid="result">untranslated</div>
        </Localized>
      </AppLocalizationProvider>
    );
    await waitUntilTranslated();
    expect(getByTestId('result')).toHaveTextContent('untranslated');
  });

  it('throws when locales.json is not found', () => {
    const provider = new AppLocalizationProvider({
      bundles, baseDir: '/nonexist',
    });
    return expect(provider.componentDidMount()).rejects.toHaveProperty(
      'message', 'unable to fetch available locales'
    );
  });

  test('check code property', () => {
    const err = new Error();
    err.code = 404;

    return expect(Promise.reject(err)).rejects.toHaveProperty('code', 404);
  });
});
