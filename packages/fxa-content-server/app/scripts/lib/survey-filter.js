/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import UserAgent from './user-agent';

// All but the default export here is to make testing easier.

const falseFn = () => false;
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

export const getConditionWithKey = (conditions, key) => {
  // It is not something we need to check.
  if (!Object.keys(conditions).includes(key)) {
    return NONE;
  }

  return conditions[key];
};

export const createConditionCheckFn = (valSourceCheck) => (comparator) => (
  key
) => (conds, valSource) => {
  // This turned out a little janky.  But we want to return true early if the
  // condition is not in the configs.
  const condVal = getConditionWithKey(conds, key);
  if (condVal === NONE) {
    return true;
  }
  return valSourceCheck(valSource)(comparator)(condVal);
};

export const createAsyncConditionCheckFn = (valSourceCheck) => (comparator) => (
  key
) => async (conds, valSource) => {
  const condVal = getConditionWithKey(conds, key);
  if (condVal === NONE) {
    return true;
  }
  return (await valSourceCheck(valSource)(comparator))(condVal);
};

let ua;
export const checkConditionInUa = (window) => (checkUa) => {
  if (!window || !window.navigator || !window.navigator.userAgent) {
    return falseFn;
  }

  // @TODO since sinon cannot spy on ES modules, it's difficult to test that
  // the ua string parsing happens only once.  Consider passing a parser
  // function as dependency.

  if (!ua) {
    ua = new UserAgent(window.navigator.userAgent);
  }

  return checkUa(ua);
};

const createUaConditionCheckFn = createConditionCheckFn(checkConditionInUa);

export const checkUaDeviceType = (ua) => (val) => {
  return ua.genericDeviceType().toLowerCase() === val.toLowerCase();
};

export const checkUaOsName = (ua) => (val) =>
  ua.os.name.toLowerCase() === val.toLowerCase();

export const checkUaBrowser = (ua) => (val) =>
  ua.browser.name.toLowerCase() === val.toLowerCase();

// Ref: https://github.com/mozilla/fxa/blob/9b2d9d1/packages/fxa-content-server/app/scripts/lib/user-agent.js#L182
export const hasDesiredDeviceType = createUaConditionCheckFn(checkUaDeviceType)(
  'deviceType'
);
export const hasDesiredOs = createUaConditionCheckFn(checkUaOsName)('os');
export const hasDesiredBrowser = createUaConditionCheckFn(checkUaBrowser)(
  'browser'
);

export const userAgentChecks = (conds, win) =>
  hasDesiredBrowser(conds, win) &&
  hasDesiredDeviceType(conds, win) &&
  hasDesiredOs(conds, win);

const applyWithSourceVal = (sourceVal) => (fn) => fn(sourceVal);

export const checkRelierClientId = (relier) => (val) => {
  const clientId = relier.get('clientId');

  // client id can be null, which is also a valid value to check.
  if (clientId === null) {
    return val === null;
  }

  return relier.get('clientId') === val;
};

export const relierClientIdCheck = createConditionCheckFn(applyWithSourceVal)(
  checkRelierClientId
)('relier');

let account, subscriptions;
export const checkAccountSubscriptions = (user) => async (checkSubs) => {
  try {
    if (!user || !(account = account || user.getSignedInAccount())) {
      return falseFn;
    }

    subscriptions = subscriptions || (await account.getSubscriptions());

    if (!subscriptions) {
      return falseFn;
    }
  } catch {
    return falseFn;
  }

  return checkSubs(subscriptions);
};

export const checkSubscriptions = (acctSubs) => (desiredPlanIds) => {
  const subscribedPlanIds = new Set(acctSubs.map((s) => s.plan_id));
  return desiredPlanIds.every((x) => subscribedPlanIds.has(x));
};

export const subscriptionsCheck = createAsyncConditionCheckFn(
  checkAccountSubscriptions
)(checkSubscriptions)('subscriptions');

let devices;
export const checkAccountDevices = (user) => async (checkDevices) => {
  try {
    if (!user || !(account = account || user.getSignedInAccount())) {
      return falseFn;
    }

    devices = devices || (await account.fetchDeviceList());

    if (!devices) {
      return falseFn;
    }
  } catch {
    return falseFn;
  }

  return checkDevices(devices);
};

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
  checkAccountDevices
)(checkLocation)('location');

export const checkSignedInReliers = (devices) => (reliers) => {
  const clientIds = new Set(devices.map((d) => d.clientId));
  return reliers.every((x) => clientIds.has(x));
};

export const signedInReliersCheck = createAsyncConditionCheckFn(
  checkAccountDevices
)(checkSignedInReliers)('reliersList');

let profileImage;
export const checkAccountProfileImage = (user) => async (checkProfileImg) => {
  try {
    if (!user || !(account = account || user.getSignedInAccount())) {
      return falseFn;
    }
    profileImage = profileImage || (await account.fetchCurrentProfileImage());

    if (!profileImage) {
      return falseFn;
    }
  } catch {
    return falseFn;
  }

  return checkProfileImg(profileImage);
};

export const checkNonDefaultAvatar = (profileImage) => (val) =>
  val ? !profileImage.isDefault() : profileImage.isDefault();

export const nonDefaultAvatarCheck = createAsyncConditionCheckFn(
  checkAccountProfileImage
)(checkNonDefaultAvatar)('hasNonDefaultAvatar');

export const createSurveyFilter = (
  window,
  user,
  relier,
  previousParticipationTime,
  doNotBotherSpan
) => async (surveyConfig) =>
  !!(
    surveyConfig &&
    surveyConfig.conditions &&
    Object.keys(surveyConfig.conditions).length > 0 &&
    !participatedRecently(previousParticipationTime, doNotBotherSpan) &&
    // User agent related checks
    userAgentChecks(surveyConfig.conditions, window) &&
    // Relying party (relier) check
    relierClientIdCheck(surveyConfig.conditions, relier) &&
    // ASYNC AHEAD
    // Subscriptions check
    (await subscriptionsCheck(surveyConfig.conditions, user)) &&
    // Geo location related checks
    // The geo location is potentially available in the device/app info
    (await geoLocationCheck(surveyConfig.conditions, user)) &&
    // Other signed in reliers check
    (await signedInReliersCheck(surveyConfig.conditions, user)) &&
    // Non-default profile image check
    (await nonDefaultAvatarCheck(surveyConfig.conditions, user))
  );

export default createSurveyFilter;
