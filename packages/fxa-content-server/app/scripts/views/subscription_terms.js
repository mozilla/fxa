/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import AuthErrors from '../lib/auth-errors';
import LegalCopyView from './legal_copy';
import Template from 'templates/subscription_terms.mustache';

const View = LegalCopyView.extend({
  className: 'subscription-terms',
  copyUrl: '/legal/subscription_terms',
  events: {
    'click #fxa-subscription-terms-back': 'back',
    'keyup #fxa-subscription-terms-back': 'backOnEnter',
  },
  fetchError: AuthErrors.toError('COULD_NOT_GET_SUBPLAT_TOS'),
  template: Template,
});

export default View;
