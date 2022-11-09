/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import BaseView from './base';
import CannotCreateAccountTemplate from 'templates/cannot_create_account.mustache';
import GeneralizedReactAppExperimentMixin from './mixins/generalized-react-app-experiment-mixin';
import Cocktail from 'cocktail';

const CannotCreateAccountView = BaseView.extend({
  template: CannotCreateAccountTemplate,
  className: 'cannot-create-account',
  setInitialContext(context) {
    context.set('isSync', this.relier.isSync());
  },
  beforeRender() {
    if (this.isInGeneralizedReactAppExperimentGroup()) {
      this.navigateAway('/beta/cannot_create_account?showNewReactApp=true');
    }
  },
});

Cocktail.mixin(CannotCreateAccountView, GeneralizedReactAppExperimentMixin);

export default CannotCreateAccountView;
