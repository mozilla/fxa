/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { assert } from 'chai';
import BaseView from 'views/base';
import Broker from 'models/auth_brokers/base';
import Cocktail from 'cocktail';
import DeviceBeingPairedMixin from 'views/pair/device-being-paired-mixin';
import TestTemplate from 'templates/test_template.mustache';

const REMOTE_METADATA = {
  city: 'Toronto',
  country: 'Canada',
  deviceType: 'desktop',
  family: 'Firefox',
  ipAddress: '1.1.1.1',
  OS: 'Windows',
  region: 'Ontario',
  ua: 'Firefox 1.0',
};

describe('views/pair/device-being-paired-mixin', () => {
  describe('setInitialContext', () => {
    let view;

    const PairingView = BaseView.extend({
      template: TestTemplate,
    });

    Cocktail.mixin(PairingView, DeviceBeingPairedMixin());

    beforeEach(() => {
      const broker = new Broker();
      broker.set('remoteMetaData', REMOTE_METADATA);
      view = new PairingView({
        broker,
      });
    });

    it('renders the template with info', () => {
      return view.render().then(() => {
        const deviceHtml = view.getContext().unsafeDeviceBeingPairedHTML;
        assert.isTrue(deviceHtml.includes('Firefox on Windows'));
        assert.isTrue(
          deviceHtml.includes('Toronto, Ontario, Canada (estimated)')
        );
        assert.isTrue(deviceHtml.includes('IP address: 1.1.1.1'));
      });
    });

    it('renders the template with location unknown', () => {
      const broker = new Broker();
      broker.set('remoteMetaData', {
        deviceType: 'desktop',
        family: 'Firefox',
        ipAddress: '1.1.1.1',
        OS: 'Windows',
        ua: 'Firefox 1.0',
      });
      view = new PairingView({
        broker,
      });
      return view.render().then(() => {
        const deviceHtml = view.getContext().unsafeDeviceBeingPairedHTML;
        assert.isTrue(deviceHtml.includes('Firefox on Windows'));
        assert.isTrue(deviceHtml.includes('Location unknown'));
        assert.isTrue(deviceHtml.includes('IP address: 1.1.1.1'));
      });
    });
  });
});
