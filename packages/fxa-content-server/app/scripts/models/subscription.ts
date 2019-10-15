/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * A model to represent current subscription state, so that metrics can
 * associate events with products and plans.
 *
 * Tries to read data from the URL or, failing that, the resume token.
 */

import Backbone from 'backbone';
import Cocktail from '../lib/cocktail';
import ResumeTokenMixin from './mixins/resume-token';
import UrlMixin from './mixins/url';

const SUBSCRIBE_PRODUCT_PATHNAME_REGEXP = /^\/subscriptions\/products\/(\w+)/;

// Neither UrlMixin nor ResumeTokenMixin are classes or interfaces
interface IUrlMixin {
  getSearchParam(paramName: string): string | undefined;
  getPathname(): string;
}

interface IResumeTokenMixin {
  populateFromStringifiedResumeToken(resumeToken: string);
}

const RESUME_TOKEN_FIELDS = ['planId', 'productId'];
class SubscriptionModel extends Backbone.Model {
  window?: Window;
  resumeTokenFields?: string[];

  constructor(attrs = {}, options) {
    super(
      {
        planId: null,
        productId: null,
        ...attrs,
      },
      options
    );
  }

  initialize(attrs = {}, options: { window?: Window } = {}) {
    if (this.get('planId') && this.get('productId')) {
      // already set, no need to look anywhere else for the values.
      return;
    }

    this.window = options.window || window;
    this.resumeTokenFields = RESUME_TOKEN_FIELDS;

    this._setSubscriptionInfoFromUrl();
    if (this.get('productId')) {
      return;
    }

    this._setSubscriptionInfoFromResumeToken();
  }

  _setSubscriptionInfoFromUrl() {
    const productId = this._getProductIdFromPathname(this.getPathname());
    if (productId) {
      // If the user is browsing directly to /subscriptions/prod_*
      this.set('productId', productId);

      // only get the planId from the query params if the user is at
      // a product path. It's possible for the plan to not be
      // specified, in which case the default plan will be used.
      const planId = this.getSearchParam('plan');
      if (planId) {
        this.set('planId', planId);
      }
    }
  }

  _getProductIdFromPathname(pathname: string) {
    const result = SUBSCRIBE_PRODUCT_PATHNAME_REGEXP.exec(pathname);
    if (result) {
      return result[1];
    }
    return;
  }

  _setSubscriptionInfoFromResumeToken() {
    const resumeToken = this.getSearchParam('resume');
    if (resumeToken) {
      // this.resumeTokenFields is not set until the constructor
      // completes, and this method can be called from within
      // the constructor. Set the value
      this.populateFromStringifiedResumeToken(resumeToken);
    }
  }
}

interface SubscriptionModel extends IUrlMixin, IResumeTokenMixin {}

Cocktail.mixin(SubscriptionModel, ResumeTokenMixin, UrlMixin);

export default SubscriptionModel;
