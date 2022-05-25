/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const config = require('../../config');
const joi = require('joi');
const fetch = require('node-fetch');
const Sentry = require('@sentry/node');
const { cdnFqdn, resultsCacheLimit } = config.get('legalDocLinks');
const acceptLanuageParser = require('accept-language-parser');
const DEFAULT_LOCALE = 'en';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // a day in milliseconds
const LANGUAGES_LIMIT = 3;

/**
 * A map for caching.  The key is a url and the value is an object with two properties:
 *  - checkedOn: timestamp (in ms) when the last check against the url was performed
 *  - result: boolean
 *
 * The size of this map will also be limited.  The current default is set to 65536.
 */
const cache = new Map();

const getFullPath = (pathWithoutLocale, language) =>
  // minimal handling of an errant '/'
  pathWithoutLocale.endsWith('/')
    ? `${pathWithoutLocale.substring(
        0,
        pathWithoutLocale.length - 1
      )}.${language}.pdf`
    : `${pathWithoutLocale}.${language}.pdf`;

/**
 * @param {obj} lang A language object from accept-language-parser
 */
const getLanguageTag = (lang) =>
  lang.region ? `${lang.code}-${lang.region}` : lang.code;

const isCacheExpired = (lastChecked) =>
  Math.round(Date.now() - lastChecked) > CACHE_DURATION;

/**
 * Keeping this simple: if the cache's full, delete half of the entries.
 * It mutates the map from the arguments directly.
 */
const checkAndShrinkCache = (cacheMap, limit) => {
  if (limit > 0 && cacheMap.size >= limit) {
    const half = Math.ceil(limit / 2);
    const keys = Array.from(cacheMap.keys()).slice(0, half);
    for (const k of keys) {
      cacheMap.delete(k);
    }
  }
};

const isValidDocUrl = async (url) => {
  // Check cache first
  const cachedVal = cache.get(url);
  if (cachedVal !== undefined) {
    if (isCacheExpired(cachedVal['checkedOn'])) {
      cache.delete(url);
    } else {
      return cachedVal['result'];
    }
  }

  try {
    const res = await fetch(url, { method: 'HEAD' });
    const entry = { checkedOn: Date.now(), result: res.status === 200 };
    cache.set(url, entry);
    return entry['result'];
  } catch {
    // NOOP
    // fetch API exceptions are not 3xx-5xx responses
  }

  return false;
};

module.exports = {
  method: 'get',
  path: '/legal-docs',
  validate: {
    query: joi.object({ url: joi.string().uri().required() }),
  },
  async process(req, res) {
    const docUrl = new URL(req.query.url);

    // Limit the redirect to just the CDN that's hosting the legal docs
    if (docUrl.hostname !== cdnFqdn) {
      return res.sendStatus(400).end();
    }

    // For backwards compatibility and future single-locale products(?)
    if (docUrl.pathname.endsWith('.pdf')) {
      return res.redirect(docUrl.href);
    }

    const reqLanguage = req.get('accept-language')
      ? req.get('accept-language')
      : DEFAULT_LOCALE;
    const parsed = acceptLanuageParser.parse(reqLanguage);

    if (!parsed.length) {
      return res.sendStatus(400).end();
    }

    checkAndShrinkCache(cache, resultsCacheLimit);

    const withTag = parsed.map((l) => ({ ...l, tag: getLanguageTag(l) }));

    // Since a request here potentially fans out to mulitple requests, limit that number
    const supported = withTag.slice(0, LANGUAGES_LIMIT);

    // Check for exact match on the language tag in order of priority
    const checkedTags = [];
    for (const l of supported) {
      const downloadUrl = new URL(
        getFullPath(docUrl.pathname, l.tag),
        docUrl.origin
      );

      if (await isValidDocUrl(downloadUrl.href)) {
        downloadUrl.search = docUrl.search;
        return res.redirect(downloadUrl.href);
      }

      checkedTags.push(l.tag);
    }

    // Fallback: for those with a region, try the language without the region.
    // We filter on the original list since the language with the region subtag
    // might not be on the list of supported language while the language
    // without the region is.
    const languageOnlyTags = withTag
      .filter((l) => !!l.region && !checkedTags.includes(l.code))
      .slice(0, LANGUAGES_LIMIT);

    for (const l of languageOnlyTags) {
      const downloadUrl = new URL(
        getFullPath(docUrl.pathname, l.code),
        docUrl.origin
      );

      if (await isValidDocUrl(downloadUrl.href)) {
        downloadUrl.search = docUrl.search;
        return res.redirect(downloadUrl.href);
      }
    }

    // Fallback: try default locale
    const defaultDocUrl = new URL(
      getFullPath(docUrl.pathname, DEFAULT_LOCALE),
      docUrl.origin
    );
    if (await isValidDocUrl(defaultDocUrl.href)) {
      defaultDocUrl.search = docUrl.search;
      return res.redirect(defaultDocUrl.href);
    }

    // :(
    Sentry.withScope((scope) => {
      scope.setContext('subscription.legalDocs', {
        url: docUrl.href,
        acceptLanguage: req.get('accept-language'),
      });
      Sentry.captureMessage(
        `Legal doc redirect failed.`,
        Sentry.Severity.Warning
      );
    });
    return res.sendStatus(404).end();
  },
};

// export purely for testing
module.exports._checkAndShrinkCache = checkAndShrinkCache;
