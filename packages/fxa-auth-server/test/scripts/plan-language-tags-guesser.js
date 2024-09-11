/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { assert } from 'chai';

import sinon from 'sinon';
const sandbox = sinon.createSandbox();

import googleTranslate from '@google-cloud/translate';
const googleTranslateV2Mock = sandbox.createStubInstance(
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

import { getLanguageTagFromPlanMetadata } from '../../scripts/stripe-products-and-plans-to-firestore-documents/plan-language-tags-guesser';

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
    assert.isUndefined(actual);
  });

  it('throws an error when the Google Translate result confidence is lower than the min', async () => {
    try {
      googleTranslateV2Mock.detect.reset();
      googleTranslateV2Mock.detect.resolves([
        { confidence: 0.3, language: 'en' },
      ]);
      await getLanguageTagFromPlanMetadata(plan, supportedLanguages);
      assert.fail('An error should have been thrown');
    } catch (err) {
      assert.equal(
        err.message,
        'Google Translate result confidence level too low'
      );
    }
  });

  it('returns undefined when the plan language is en and detail is indentical to the product', async () => {
    const actual = await getLanguageTagFromPlanMetadata(
      plan,
      supportedLanguages
    );
    assert.isUndefined(actual);
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
      assert.fail('An error should have been thrown');
    } catch (err) {
      assert.equal(err.message, 'Plan specific en metadata');
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
    assert.equal(actual, 'es');
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
    assert.equal(actual, 'en-GD');
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
    assert.equal(actual, 'nl-BE');
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
    assert.equal(actual, 'de-CH');
  });
});
