/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { v2 as CloudTranslate } from '@google-cloud/translate';
import { Stripe } from 'stripe';

/**
 * This lib attempts to detect the (human) language used in a Stripe plan's
 * metadata.
 *
 * The language will be determined with one or more of the following:
 *  - the language detected by Google Cloud Translation from the plan's product
 *    details metadata
 *  - the plan's title
 *  - the plan's currency
 *
 * There is no direct connection between a currency and a localised language,
 * but with the special case of Switzerland (the only one at the time of
 * writing), this is the sure way to detect for Swiss language tags.
 */

const MIN_CONFIDENCE = 0.51;
export const PLAN_EN_LANG_ERROR = 'Plan specific en metadata';
const { Translate } = CloudTranslate;
const translate = new Translate();
let locales: string[];

const initLocales = (x: string[]) => {
  locales = x;
};

const getMetadataProductDetails = (metadata: Stripe.Metadata) =>
  Object.entries(metadata)
    .reduce((acc: string[], [k, v]) => {
      if (k.startsWith('product:detail')) {
        acc.push(v);
      }
      return acc;
    }, [])
    .join(' ');

const searchTagsInLocales = (tags: string[]) => {
  for (const t of tags) {
    if (locales.includes(t.toLowerCase())) {
      return t;
    }
  }
  return;
};

const findLocaleInTitle = (lang: string, planTitle: string) => {
  if (!planTitle) {
    return lang;
  }

  const words = planTitle.split(' ');

  // the entire tag is in the title
  const potentialLanguageTags = words.filter((x) =>
    x.toLowerCase().startsWith(`${lang}-`)
  );
  const tagFromTitle = searchTagsInLocales(potentialLanguageTags);
  if (tagFromTitle) {
    return tagFromTitle;
  }

  // a sub tag is in the title
  const searchTerms = words
    .filter((x) => x.toLowerCase() !== lang)
    .map((t) => `${lang}-${t}`);
  const tagWithSubtagFromTitle = searchTagsInLocales(searchTerms);
  if (tagWithSubtagFromTitle) {
    return tagWithSubtagFromTitle;
  }

  // default to the detected lang
  return lang;
};

const mapCurrencyToLocale = (currency: string) => {
  const currencyToLocaleMap: { [key: string]: string } = { chf: 'CH' };
  if (currencyToLocaleMap[currency.toLowerCase()]) {
    return currencyToLocaleMap[currency.toLowerCase()];
  }
  return;
};

const formatLanguageTag = (tag: string) =>
  tag
    .split('-')
    .map((x, idx) => (idx === 0 ? x.toLowerCase() : x))
    .join('-');

// English is the default and should be already set at the product
// level.  But maybe this plan offers some different features or
// benefits, or, it's locale specific.
const handleEnglishPlan = (plan: Partial<Stripe.Plan>) => {
  const planDetails = getMetadataProductDetails(plan.metadata!);
  const productDetails = getMetadataProductDetails(
    (plan.product as Stripe.Product).metadata
  );

  // just a copy of the product's metadata apparently
  if (planDetails === productDetails) {
    return;
  }

  let lang = findLocaleInTitle('en', plan.nickname!);

  if (lang === 'en') {
    // the plan's en strings are different than the product's, so we save
    // this on the plan.
    //
    // this is not exactly an error, but script in which this is used is saving
    // locale specific strings to a _product_ configuration document; this is
    // an exception to that flow: we want to save these strings to the plan
    // configuration instead.
    throw new Error(PLAN_EN_LANG_ERROR);
  }

  // a localised en tag
  return formatLanguageTag(lang);
};

export const getLanguageTagFromPlanMetadata = async (
  plan: Stripe.Plan,
  locales: string[]
) => {
  initLocales(locales);
  const planDetails = getMetadataProductDetails(plan.metadata!);

  if (planDetails) {
    const detectionResult = await translate.detect(planDetails);

    if (detectionResult[0].confidence < MIN_CONFIDENCE) {
      throw new Error('Google Translate result confidence level too low');
    }

    if (detectionResult[0].language === 'en') {
      return handleEnglishPlan(plan);
    }

    let lang = findLocaleInTitle(detectionResult[0].language, plan.nickname!);

    // no subtag, extra step of checking currency
    if (!lang.includes('-')) {
      const subtagFromCurrency = mapCurrencyToLocale(plan.currency);
      if (subtagFromCurrency) {
        lang = `${lang}-${subtagFromCurrency}`;
      }
    }

    return formatLanguageTag(lang);
  }

  return;
};

export default { PLAN_EN_LANG_ERROR, getLanguageTagFromPlanMetadata };
