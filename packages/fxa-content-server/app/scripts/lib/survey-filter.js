/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import UserAgent from './user-agent';

// All but the default export here is to make testing easier.

// This subsitutes a (curried) comparator when we know the result is false
// without doing the comparison.
const falseFn = () => false;

// When a condition is not found in a survey's configurations.
export const NONE = Symbol();

export const participatedRecently = (
  previousParticipationTime,
  doNotBotherSpan
) => {
  if (
    previousParticipationTime === null ||
    previousParticipationTime === undefined
  ) {
    return false;
  }
  return Date.now() - previousParticipationTime < doNotBotherSpan;
};

export const withinRate = (rate) => {
  if (rate === 0) {
    return false;
  }

  const r = Math.random();
  return r <= rate;
};

export const getConditionWithKey = (conditions, key) => {
  // It is not something we need to check.
  if (!Object.keys(conditions).includes(key)) {
    return NONE;
  }

  return conditions[key];
};

/**
 * Create a function that takes a survey's configured conditions and a function (f) that fetches
 * the value to be compared to a condition specified by the 'key' param.
 *
 * @param {function} valSource a function that takes a function (a) and a comparator and apply the
 *                             return value of (a) as the first argument to the comparator
 * @param {function} comparator a function that compares two values and returns a boolean
 * @param {string} key the configuration key where the condition value can be found
 * @returns {function} a function that takes conditions and (f) (see description above) and
 *                     returns a boolean
 */
export const createConditionCheckFn = (valSource) => (comparator) => (key) => (
  conds,
  fetchFn
) => {
  // This turned out a little janky.  But we want to return true early if the
  // condition is not in the configs.
  const condVal = getConditionWithKey(conds, key);
  if (condVal === NONE) {
    return true;
  }
  return valSource(fetchFn)(comparator)(condVal);
};

// Like the function above but creates an async function because (f) can be async.
export const createAsyncConditionCheckFn = (valSource) => (comparator) => (
  key
) => async (conds, fetchFn) => {
  const condVal = getConditionWithKey(conds, key);
  if (condVal === NONE) {
    return true;
  }
  return (await valSource(fetchFn)(comparator))(condVal);
};

export const createFetchLanguagesFn = (window) => {
  return () => {
    if (!window || !window.navigator || !window.navigator.languages) {
      return;
    }

    return window.navigator.languages;
  };
};

/**
 * Creates a function that construct a UserAgent object when the given window
 * object has a userAgent string and caches the UserAgent instance.
 */
export const createFetchUaFn = (window) => {
  let ua;

  return () => {
    if (!window || !window.navigator || !window.navigator.userAgent) {
      return;
    }

    ua = ua || new UserAgent(window.navigator.userAgent);

    return ua;
  };
};

/**
 * Creates a function that gets the signed in account from the given user model
 * and caches it.
 */
export const createFetchAccountFn = (user) => {
  let account;

  return () => {
    if (!user || !(account = account || user.getSignedInAccount())) {
      return;
    }

    return account;
  };
};

/**
 * Creates a function that get a property from a a model object and caches it.
 *
 * @param {string} getPropFnName name of the function to call to get the property
 * @param {function} fetchFn a function to fetch the object
 * @returns {function} an async function that returns the property or null
 */
export const createAsyncGetModelPropertyFn = (getPropFnName) => (fetchFn) => {
  let prop;
  return async () => {
    try {
      const m = await fetchFn();

      if (m === undefined) {
        return;
      }

      prop = prop || (await m[getPropFnName]());

      return prop;
    } catch {
      return;
    }
  };
};

/**
 * Creates a function that returns a list of plan ids for which the user has
 * subscriptions.
 */
export const createFetchSubscriptionsFn = createAsyncGetModelPropertyFn(
  'getSubscriptions'
);

/**
 * Creates a function that returns a list of devices and apps that user is
 * currently signed into.
 */
export const createFetchDeviceListFn = createAsyncGetModelPropertyFn(
  'fetchDeviceList'
);

/**
 * Creates a function that fetches the user's profile image (data model not
 * image data).
 */
export const createFetchProfileImageFn = createAsyncGetModelPropertyFn(
  'fetchCurrentProfileImage'
);

/**
 *  In the case of the relier, it's just a value; we do not need to fetch and
 *  cache it.  This function takes a value and function and apply the value to
 *  the function.  For our purpose, it applies the value as the first argument
 *  to a comparator.
 */
const applySourceVal = (sourceVal) => (checkFn) => checkFn(sourceVal);

/**
 * Fetches a value and then apply it as the first argument to comparator.
 *
 * @param {function} fetchFn function to get the value
 * @param {function} checkFn comparator
 * @returns {function} comparator with the first argument applied
 */
export const fetchAndApplySourceVal = (fetchFn) => (checkFn) => {
  const x = fetchFn();

  if (x === undefined) {
    return falseFn;
  }

  return checkFn(x);
};

// async version of the function above
export const asyncFetchAndApplySourceVal = (fetchFn) => async (checkFn) => {
  const x = await fetchFn();

  if (x === undefined) {
    return falseFn;
  }

  return checkFn(x);
};

export checkBrowsers = (browsers) => (val) => {
  // True if _any_ of the browsers from the condition matches user's the browser.
  return browsers.some(checkUaBrowser);
}

// Comparator
export const checkLanguages = (browserLanguages) => (val) => {
  // True if _any_ of the languages from the condition matches a configured language in the browser.
  // The language tags in the conditions can be in two forms:
  //  - just the language, e.g. "en", or
  //  - language followed by extlang, script, region, etc. e.g. ("en-CA")
  // The first form will get a loose match of any tag for that language, while
  // the second will be an exact match.

  const separator = '-';

  return val.some((lang) => {
    lang = lang.toLowerCase();

    return browserLanguages.some((browserLang) =>
      lang.includes(separator)
        ? lang === browserLang.toLowerCase()
        : browserLang.toLowerCase().startsWith(lang)
    );
  });
};

export const languagesCheck = createConditionCheckFn(fetchAndApplySourceVal)(
  checkLanguages
)('languages');

const createUaConditionCheckFn = createConditionCheckFn(fetchAndApplySourceVal);

// Comparator
export const checkUaDeviceTypes = (ua) => (val) => {
  return !!(
    ua &&
    ua.genericDeviceType &&
    val.some((v) => ua.genericDeviceType().toLowerCase() === v.toLowerCase())
  );
};

// Comparator
export const checkUaOsNames = (ua) => (val) =>
  !!(
    ua &&
    ua.os &&
    ua.os.name &&
    val.some((v) => ua.os.name.toLowerCase() === v.toLowerCase())
  );

// Comparator
export const checkUaBrowsers = (ua) => (val) =>
  !!(
    ua &&
    ua.browser &&
    ua.browser.name &&
    val.some((v) => ua.browser.name.toLowerCase() === v.toLowerCase())
  );

// Ref: https://github.com/mozilla/fxa/blob/9b2d9d1/packages/fxa-content-server/app/scripts/lib/user-agent.js#L182
export const hasDesiredDeviceType = createUaConditionCheckFn(checkUaDeviceTypes)(
  'deviceType'
);
export const hasDesiredOs = createUaConditionCheckFn(checkUaOsNames)('os');
export const hasDesiredBrowser = createUaConditionCheckFn(checkUaBrowsers)(
  'browser'
);

export const userAgentChecks = (conds, fetchUa) =>
  hasDesiredBrowser(conds, fetchUa) &&
  hasDesiredDeviceType(conds, fetchUa) &&
  hasDesiredOs(conds, fetchUa);

// Comparator
export const checkRelierClientId = (relier) => (val) =>
  relier.get('clientId') === val;

export const relierClientIdCheck = createConditionCheckFn(applySourceVal)(
  checkRelierClientId
)('relier');

// Comparator
export const checkSubscriptions = (acctSubs) => (desiredPlanIds) => {
  const subscribedPlanIds = new Set(acctSubs.map((s) => s.plan_id));
  return desiredPlanIds.every((x) => subscribedPlanIds.has(x));
};

export const subscriptionsCheck = createAsyncConditionCheckFn(
  asyncFetchAndApplySourceVal
)(checkSubscriptions)('subscriptions');

// Comparator
export const checkLocation = (devices) => (desiredLocation) => {
  const currentSession = devices.find((d) => d.isCurrentSession);
  return !!(
    currentSession &&
    currentSession.location &&
    Object.keys(desiredLocation).every(
      (k) =>
        currentSession.location[k] &&
        currentSession.location[k].toLowerCase() ===
          desiredLocation[k].toLowerCase()
    )
  );
};

export const geoLocationCheck = createAsyncConditionCheckFn(
  asyncFetchAndApplySourceVal
)(checkLocation)('location');

// Comparator
export const checkSignedInReliers = (devices) => (reliers) => {
  const clientIds = new Set(devices.map((d) => d.clientId));
  return reliers.every((x) => clientIds.has(x));
};

export const signedInReliersCheck = createAsyncConditionCheckFn(
  asyncFetchAndApplySourceVal
)(checkSignedInReliers)('reliersList');

// Comparator
export const checkNonDefaultAvatar = (profileImage) => (val) =>
  val ? !profileImage.isDefault() : profileImage.isDefault();

export const nonDefaultAvatarCheck = createAsyncConditionCheckFn(
  asyncFetchAndApplySourceVal
)(checkNonDefaultAvatar)('hasNonDefaultAvatar');

export const createSurveyFilter = (
  window,
  user,
  relier,
  previousParticipationTime,
  doNotBotherSpan
) => {
  const fetchUa = createFetchUaFn(window);
  const fetchLangs = createFetchLanguagesFn(window);
  const fetchAccount = createFetchAccountFn(user);
  const fetchSubscriptions = createFetchSubscriptionsFn(fetchAccount);
  const fetchDeviceList = createFetchDeviceListFn(fetchAccount);
  const fetchProfileImage = createFetchProfileImageFn(fetchAccount);

  return async (surveyConfig) =>
    !!(
      surveyConfig &&
      surveyConfig.rate &&
      withinRate(surveyConfig.rate) &&
      surveyConfig.conditions &&
      Object.keys(surveyConfig.conditions).length > 0 &&
      !participatedRecently(previousParticipationTime, doNotBotherSpan) &&
      languagesCheck(surveyConfig.conditions, fetchLangs) &&
      // User agent related checks
      userAgentChecks(surveyConfig.conditions, fetchUa) &&
      // Relying party (relier) check
      relierClientIdCheck(surveyConfig.conditions, relier) &&
      // ASYNC AHEAD
      // Subscriptions check
      (await subscriptionsCheck(surveyConfig.conditions, fetchSubscriptions)) &&
      // Geo location related checks
      // The geo location is potentially available in the device/app info
      (await geoLocationCheck(surveyConfig.conditions, fetchDeviceList)) &&
      // Other signed in reliers check
      (await signedInReliersCheck(surveyConfig.conditions, fetchDeviceList)) &&
      // Non-default profile image check
      (await nonDefaultAvatarCheck(surveyConfig.conditions, fetchProfileImage))
    );
};

export default createSurveyFilter;
