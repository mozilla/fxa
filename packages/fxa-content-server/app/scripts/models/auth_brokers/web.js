/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Auth broker to handle users who browse directly to the site.
 */

import _ from 'underscore';
import BaseBroker from '../auth_brokers/base';
import { CONTENT_SERVER_CONTEXT } from '../../lib/constants';
import NavigateBehavior from '../../views/behaviors/navigate';
import SettingsIfSignedInBehavior from '../../views/behaviors/settings';
const t = msg => msg;

const proto = BaseBroker.prototype;

const redirectToSettingsBehavior = new NavigateBehavior('settings', {
  success: t('Account verified successfully'),
});

const redirectToSettingsAfterResetBehavior = new NavigateBehavior('settings', {
  success: t('Password reset successfully'),
});

export default BaseBroker.extend({
  defaultBehaviors: _.extend({}, proto.defaultBehaviors, {
    afterCompleteResetPassword: redirectToSettingsAfterResetBehavior,
    afterCompleteSignIn: new SettingsIfSignedInBehavior(
      proto.defaultBehaviors.afterCompleteSignIn
    ),
    afterCompleteSignUp: new SettingsIfSignedInBehavior(
      proto.defaultBehaviors.afterCompleteSignUp
    ),
    afterForceAuth: new NavigateBehavior('settings'),
    afterResetPasswordConfirmationPoll: redirectToSettingsBehavior,
    afterSignIn: new NavigateBehavior('settings'),
    afterSignInConfirmationPoll: redirectToSettingsBehavior,
    afterSignUpConfirmationPoll: redirectToSettingsBehavior,
  }),

  defaultCapabilities: _.extend({}, proto.defaultCapabilities, {
    reuseExistingSession: true,
  }),

  type: CONTENT_SERVER_CONTEXT,
});
