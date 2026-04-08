/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import sinon from 'sinon';

const sandbox = sinon.createSandbox();

const googleTranslate = require('@google-cloud/translate');
const googleTranslateV2Mock: any = sandbox.createStubInstance(
  googleTranslate.v2.Translate
);
sandbox.stub(googleTranslate.v2, 'Translate').returns(googleTranslateV2Mock);
const supportedLanguages = [
  'de',
  'de-ch',
  'en',
  'en-gd',
  'es',
  'es-us',
  'nl-be',
];

const {
  getLanguageTagFromPlanMetadata,
} = require('./plan-language-tags-guesser');

describe('getLanguageTagFromPlanMetadata', () => {
  const plan = {
    currency: 'usd',
    metadata: { 'product:detail:1': 'hello' },
    nickname: 'testo',
    product: { metadata: { 'product:detail:1': 'hello' } },
  };

  beforeEach(() => {
    googleTranslateV2Mock.detect.reset();
    googleTranslateV2Mock.detect.resolves([
      { confidence: 0.9, language: 'en' },
    ]);
  });

  it('returns undefined when there are no product details in the plan', async () => {
    const actual = await getLanguageTagFromPlanMetadata(
      { metadata: {} },
      supportedLanguages
    );
    expect(actual).toBeUndefined();
  });

  it('throws an error when the Google Translate result confidence is lower than the min', async () => {
    try {
      googleTranslateV2Mock.detect.reset();
      googleTranslateV2Mock.detect.resolves([
        { confidence: 0.3, language: 'en' },
      ]);
      await getLanguageTagFromPlanMetadata(plan, supportedLanguages);
      throw new Error('should have thrown');
    } catch (err: any) {
      expect(err.message).toBe(
        'Google Translate result confidence level too low'
      );
    }
  });

  it('returns undefined when the plan language is en and detail is indentical to the product', async () => {
    const actual = await getLanguageTagFromPlanMetadata(
      plan,
      supportedLanguages
    );
    expect(actual).toBeUndefined();
  });

  it('throws an error if it is an en lang tag with different details than the product', async () => {
    try {
      const p = {
        ...plan,
        product: {
          ...plan.product,
          metadata: { 'product:detail:1': 'goodbye' },
        },
      };
      await getLanguageTagFromPlanMetadata(p, supportedLanguages);
      throw new Error('should have thrown');
    } catch (err: any) {
      expect(err.message).toBe('Plan specific en metadata');
    }
  });

  it('returns the Google Translate detected language', async () => {
    googleTranslateV2Mock.detect.reset();
    googleTranslateV2Mock.detect.resolves([
      { confidence: 0.9, language: 'es' },
    ]);
    const actual = await getLanguageTagFromPlanMetadata(
      plan,
      supportedLanguages
    );
    expect(actual).toBe('es');
  });

  it('returns a language tag that is in the plan title ', async () => {
    const p = {
      ...plan,
      nickname: 'EN-GD is not the lang I thought it was?',
      product: {
        ...plan.product,
        metadata: { 'product:detail:1': 'goodbye' },
      },
    };
    const actual = await getLanguageTagFromPlanMetadata(p, supportedLanguages);
    expect(actual).toBe('en-GD');
  });

  it('returns a language tag with the subtag found in the plan title', async () => {
    googleTranslateV2Mock.detect.reset();
    googleTranslateV2Mock.detect.resolves([
      { confidence: 0.9, language: 'nl' },
    ]);
    const p = {
      ...plan,
      nickname: 'nl for BE letsgooo',
    };
    const actual = await getLanguageTagFromPlanMetadata(p, supportedLanguages);
    expect(actual).toBe('nl-BE');
  });

  it('returns a Swiss language tag based on the plan currency', async () => {
    googleTranslateV2Mock.detect.reset();
    googleTranslateV2Mock.detect.resolves([
      { confidence: 0.9, language: 'de' },
    ]);
    const p = {
      ...plan,
      currency: 'chf',
    };
    const actual = await getLanguageTagFromPlanMetadata(p, supportedLanguages);
    expect(actual).toBe('de-CH');
  });
});
