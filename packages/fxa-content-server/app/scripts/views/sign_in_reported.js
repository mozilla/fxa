/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * An extremely small view that thanks the user for reporting
 * a suspicious sign-in attempt.
 */
import BaseView from './base';
import Template from 'templates/sign_in_reported.mustache';

export default BaseView.extend({
  template: Template,
});
