/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import UserAgent from './user-agent';
import { ENV_DEVELOPMENT } from './constants';

// All but the default export here is to make testing easier.

// This subsitutes a (curried) comparator when we know the result is false
// without doing the comparison.
const undefinedFn = () => undefined;

// Response for failing conditions
const failureRes = { passing: false, conditions: {} };

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
  if (isNaN(rate) || rate === 0) {
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
 *                     returns an object containing the pass/fail state and matching condition
 *                     value if the condition is satisfied
 */
export const createConditionCheckFn = (valSource) => (comparator) => (key) => (
  conds,
  fetchFn
) => {
  // This turned out a little janky.  But we want to return early with a pass if the
  // condition is not in the configs.
  const condVal = getConditionWithKey(conds, key);
  if (condVal === NONE) {
    return { passing: true };
  }
  const result = valSource(fetchFn)(comparator)(condVal);
  return {
    passing: result !== undefined,
    value: result,
    key: key,
  };
};

// Like the function above but creates an async function because (f) can be async.
export const createAsyncConditionCheckFn = (valSource) => (comparator) => (
  key
) => async (conds, fetchFn) => {
  const condVal = getConditionWithKey(conds, key);
  if (condVal === NONE) {
    return { passing: true };
  }
  const result = (await valSource(fetchFn)(comparator))(condVal);
  return {
    passing: result !== undefined,
    value: result,
    key: key,
  };
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
    return undefinedFn;
  }

  return checkFn(x);
};

// async version of the function above
export const asyncFetchAndApplySourceVal = (fetchFn) => async (checkFn) => {
  const x = await fetchFn();

  if (x === undefined) {
    return undefinedFn;
  }

  return checkFn(x);
};

// Comparator
export const checkLanguages = (browserLanguages) => (val) => {
  // Returns browserLanguages if _any_ of the languages from the condition matches a configured language in the browser.
  // The language tags in the conditions can be in two forms:
  //  - just the language, e.g. "en", or
  //  - language followed by extlang, script, region, etc. e.g. ("en-CA")
  // The first form will get a loose match of any tag for that language, while
  // the second will be an exact match.

  const separator = '-';

  const result = val.filter((lang) => {
    lang = lang.toLowerCase();

    return browserLanguages.some((browserLang) =>
      lang.includes(separator)
        ? lang === browserLang.toLowerCase()
        : browserLang.toLowerCase().startsWith(lang)
    );
  });

  if (result.length) {
    return browserLanguages;
  }
};

export const languagesCheck = createConditionCheckFn(fetchAndApplySourceVal)(
  checkLanguages
)('languages');

const createUaConditionCheckFn = createConditionCheckFn(fetchAndApplySourceVal);

// Comparator
export const checkUaDeviceTypes = (ua) => (vals) => {
  vals = Array.isArray(vals) ? vals : [vals];
  if (!(ua && ua.genericDeviceType)) {
    return;
  }
  const deviceType = ua.genericDeviceType().toLowerCase();
  // If one of any eligible device type matches, return
  // it, otherwise return undefined, which is a failure
  return vals.filter((v) => {
    return deviceType === v.toLowerCase();
  })[0];
};

// Comparator
export const checkUaOsNames = (ua) => (vals) => {
  vals = Array.isArray(vals) ? vals : [vals];
  if (!(ua && ua.os && ua.os.name)) {
    return;
  }
  const osName = ua.os.name.toLowerCase();
  // If one of any eligible OS value matches, return it,
  // otherwise return undefined, which is a failure
  return vals.filter((v) => {
    return osName === v.toLowerCase();
  })[0];
};

// Comparator
export const checkUaBrowsers = (ua) => (vals) => {
  vals = Array.isArray(vals) ? vals : [vals];
  if (!(ua && ua.browser && ua.browser.name)) {
    return;
  }
  const browserName = ua.browser.name.toLowerCase();
  // If one of any eligible browser value matches, return
  // it, otherwise return undefined, which is a failure
  return vals.filter((v) => {
    return browserName === v.toLowerCase();
  })[0];
};

// Ref: https://github.com/mozilla/fxa/blob/9b2d9d1/packages/fxa-content-server/app/scripts/lib/user-agent.js#L182
export const hasDesiredDeviceType = createUaConditionCheckFn(
  checkUaDeviceTypes
)('deviceType');
export const hasDesiredOs = createUaConditionCheckFn(checkUaOsNames)('os');
export const hasDesiredBrowser = createUaConditionCheckFn(checkUaBrowsers)(
  'browser'
);

// Comparator
export const checkRelierClientId = (relier) => (val) => {
  if (relier.get('clientId') === val) {
    return val;
  }
};

export const relierClientIdCheck = createConditionCheckFn(applySourceVal)(
  checkRelierClientId
)('relier');

// Comparator
export const checkSubscriptions = (acctSubs) => (desiredPlanIds) => {
  const subscribedPlanIds = new Set(acctSubs.map((s) => s.plan_id));
  if (desiredPlanIds.every((x) => subscribedPlanIds.has(x))) {
    return Array.from(subscribedPlanIds);
  }
};

export const subscriptionsCheck = createAsyncConditionCheckFn(
  asyncFetchAndApplySourceVal
)(checkSubscriptions)('subscriptions');

// Comparator
export const checkLocation = (devices) => (desiredLocation) => {
  const currentSession = devices.find((d) => d.isCurrentSession);
  if (
    currentSession &&
    currentSession.location &&
    Object.keys(desiredLocation).every(
      (k) =>
        currentSession.location[k] &&
        currentSession.location[k].toLowerCase() ===
          desiredLocation[k].toLowerCase()
    )
  ) {
    const locationParts = Object.values(desiredLocation);
    return locationParts.join(locationParts.length > 1 ? ', ' : '');
  }
};

export const geoLocationCheck = createAsyncConditionCheckFn(
  asyncFetchAndApplySourceVal
)(checkLocation)('location');

// Comparator
export const checkSignedInReliers = (devices) => (reliers) => {
  const clientIds = new Set(devices.map((d) => d.clientId));
  if (reliers.every((x) => clientIds.has(x))) {
    return Array.from(clientIds);
  }
};

export const signedInReliersCheck = createAsyncConditionCheckFn(
  asyncFetchAndApplySourceVal
)(checkSignedInReliers)('reliersList');

// Comparator
export const checkNonDefaultAvatar = (profileImage) => (val) => {
  if (val === !profileImage.isDefault()) {
    return val;
  }
};

export const nonDefaultAvatarCheck = createAsyncConditionCheckFn(
  asyncFetchAndApplySourceVal
)(checkNonDefaultAvatar)('hasNonDefaultAvatar');

export function surveyGizmoSafe(value) {
  const type = typeof value;

  if (['string', 'number', 'boolean'].includes(type)) {
    return value.toString();
  }

  if (Array.isArray(value)) {
    return value
      .filter((v) => !!v)
      .map((v) => v.toString())
      .join(',');
  }

  throw new Error('this value cannot be passed to survey gizmo');
}

export const createSurveyFilter = (
  window,
  user,
  relier,
  previousParticipationTime,
  doNotBotherSpan,
  env
) => {
  const fetchUa = createFetchUaFn(window);
  const fetchLangs = createFetchLanguagesFn(window);
  const fetchAccount = createFetchAccountFn(user);
  const fetchSubscriptions = createFetchSubscriptionsFn(fetchAccount);
  const fetchDeviceList = createFetchDeviceListFn(fetchAccount);
  const fetchProfileImage = createFetchProfileImageFn(fetchAccount);

  return async (surveyConfig) => {
    if (
      !(
        surveyConfig &&
        surveyConfig.conditions &&
        (env === ENV_DEVELOPMENT || withinRate(surveyConfig.rate)) &&
        Object.keys(surveyConfig.conditions).length > 0 &&
        (env === ENV_DEVELOPMENT ||
          !participatedRecently(previousParticipationTime, doNotBotherSpan))
      )
    ) {
      return failureRes;
    }

    const conditionChecks = [
      // Language/locale check
      languagesCheck.bind(null, surveyConfig.conditions, fetchLangs),
      // User agent related checks
      hasDesiredBrowser.bind(null, surveyConfig.conditions, fetchUa),
      hasDesiredDeviceType.bind(null, surveyConfig.conditions, fetchUa),
      hasDesiredOs.bind(null, surveyConfig.conditions, fetchUa),
      // Relying party (relier) check
      relierClientIdCheck.bind(null, surveyConfig.conditions, relier),
      // ASYNC AHEAD
      // Subscriptions check
      subscriptionsCheck.bind(
        null,
        surveyConfig.conditions,
        fetchSubscriptions
      ),
      // Geo location related checks
      // The geo location is potentially available in the device/app info
      geoLocationCheck.bind(null, surveyConfig.conditions, fetchDeviceList),
      // Other signed in reliers check
      signedInReliersCheck.bind(null, surveyConfig.conditions, fetchDeviceList),
      // Non-default profile image check
      nonDefaultAvatarCheck.bind(
        null,
        surveyConfig.conditions,
        fetchProfileImage
      ),
    ];

    // This little fella will execute regular and async checks in the order
    // specified above. If the result of a check is failing it will short circuit
    // everything and consequently return the failure response. However if the
    // check is passing, and if a key + value exists, add them to output conditions
    const satisfiedConditions = {};
    try {
      for (const check of conditionChecks) {
        const result = await check();
        if (!result.passing) {
          throw 'checkFailure';
        }
        if (result.key && result.value != null) {
          satisfiedConditions[result.key] = surveyGizmoSafe(result.value);
        }
      }
    } catch (error) {
      if (error === 'checkFailure') {
        return failureRes;
      }
      throw error;
    }

    return { passing: true, conditions: satisfiedConditions };
  };
};

export default createSurveyFilter;
