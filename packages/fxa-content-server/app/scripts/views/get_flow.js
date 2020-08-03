/* eslint-disable camelcase */

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import Cocktail from '../lib/cocktail';
import FlowEventsMixin from './mixins/flow-events-mixin';
import Url from '../lib/url';
import BaseView from './base';
import Template from 'templates/redirect_loading.mustache';

class GetFlowView extends BaseView {
  mustAuth = true;
  template = Template;

  initialize() {
    // Flow events need to be initialized before the navigation
    // so the flow_id and flow_begin_time are propagated
    this.initializeFlowEvents();
  }

  afterRender() {
    const { redirect_to: redirectTo } = Url.searchParams(
      this.window.location.search
    );

    if (!redirectTo) {
      this.window.console.error(
        'This page requires a `redirect_to` path parameter'
      );
      return;
    }

    // Do not allow redirects to external addresses by
    // trying to parse it and expect an exception
    try {
      // eslint-disable-next-line no-new
      new URL(redirectTo);
      return this.window.console.error(
        '`redirect_to` must not be an absolute address'
      );
    } catch (error) {
      // noop
    }

    const {
      deviceId,
      flowBeginTime,
      flowId,
    } = this.metrics.getFlowEventMetadata();
    const broker = this.metrics.getFilteredValue('broker');
    const context = this.metrics.getFilteredValue('context');
    const isSampledUser = this.metrics.getFilteredValue('isSampledUser');
    const service = this.metrics.getFilteredValue('service');
    const uniqueUserId = this.metrics.getFilteredValue('uniqueUserId');

    let redirectPath = redirectTo;
    let redirectParams = {};
    if (redirectTo.includes('?')) {
      redirectPath = redirectTo.slice(0, redirectTo.indexOf('?'));
      redirectParams = Url.searchParams(redirectTo);
    }

    const queryString = Url.objToSearchString({
      deviceId,
      flowBeginTime,
      flowId,
      broker,
      context,
      isSampledUser,
      service,
      uniqueUserId,
      ...redirectParams,
    });

    const url = `${redirectPath}${queryString}`;

    // We need to `navigateAway` and not `navigate` here
    // because we are leaving the main content server app
    this.navigateAway(url);
  }
}

Cocktail.mixin(GetFlowView, FlowEventsMixin);

export default GetFlowView;
