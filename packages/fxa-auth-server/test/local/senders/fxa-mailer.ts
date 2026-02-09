/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const ROOT_DIR = '../../..';

import { assert } from 'chai';
import sinon from 'sinon';
import { FxaMailer } from '../../../lib/senders/fxa-mailer';
import { EmailSender } from '@fxa/accounts/email-sender';
import {
  EmailLinkBuilder,
  NodeRendererBindings,
} from '@fxa/accounts/email-renderer';

describe('lib/senders/fxa-mailer', () => {
  let fxaMailer: FxaMailer;
  let mockEmailSender: sinon.SinonStubbedInstance<EmailSender>;
  let mockLinkBuilder: sinon.SinonStubbedInstance<EmailLinkBuilder>;
  let mockBindings: NodeRendererBindings;
  let mockConfig: any;

  beforeEach(() => {
    mockEmailSender = {
      send: sinon.stub().resolves({
        sent: true,
        messageId: 'test-message-id',
        message: 'Email sent',
        response: '250 OK',
      }),
      buildHeaders: sinon.stub().returns({}),
    } as any;

    mockLinkBuilder = {
      buildPrivacyLink: sinon.stub().returns('https://privacy.link'),
      buildSupportLink: sinon.stub().returns('https://support.link'),
      buildPasswordChangeLink: sinon.stub().returns('https://password.link'),
      buildAccountSettingsLink: sinon.stub().returns('https://settings.link'),
      buildMozillaSupportUrl: sinon.stub().returns('https://mozilla.support'),
    } as any;

    mockBindings = {} as any;

    mockConfig = {
      sender: 'Firefox Accounts <accounts@firefox.com>',
      fxaMailerDisableSend: [],
    };

    fxaMailer = new FxaMailer(
      mockEmailSender as any,
      mockLinkBuilder as any,
      mockConfig,
      mockBindings
    );
  });

  describe('sendNewDeviceLoginEmail', () => {
    describe('with cmsRpFromName', () => {
      it('should extract email address from sender config', async () => {
        const opts = {
          to: 'user@example.com',
          uid: 'test-uid',
          metricsEnabled: true,
          acceptLanguage: 'en',
          timeZone: 'America/New_York',
          cmsRpFromName: 'Mozilla AI',
          clientName: 'Test Client',
          device: 'Firefox on Mac',
          time: '10:00 AM',
          date: 'January 1, 2026',
          location: { city: 'San Francisco', stateCode: 'CA', country: 'USA' },
          showBannerWarning: false,
        };

        // Mock the rendering method
        sinon.stub(fxaMailer as any, 'renderNewDeviceLogin').resolves({
          subject: 'New sign-in to Test Client',
          html: '<html>test</html>',
          text: 'test',
          preview: 'test preview',
        });

        await fxaMailer.sendNewDeviceLoginEmail(opts);

        assert.isTrue(mockEmailSender.send.calledOnce);
        const sendArgs = mockEmailSender.send.getCall(0).args[0];

        // Should be "Mozilla AI <accounts@firefox.com>" not "Mozilla AI <Firefox Accounts <accounts@firefox.com>>"
        assert.equal(sendArgs.from, 'Mozilla AI <accounts@firefox.com>');
        assert.equal(sendArgs.to, 'user@example.com');
      });

      it('should work with Firefox relying party name', async () => {
        const opts = {
          to: 'user@example.com',
          uid: 'test-uid',
          metricsEnabled: true,
          acceptLanguage: 'en',
          timeZone: 'America/New_York',
          cmsRpFromName: 'Firefox',
          clientName: 'Test Client',
          device: 'Firefox on Mac',
          time: '10:00 AM',
          date: 'January 1, 2026',
          location: { city: 'San Francisco', stateCode: 'CA', country: 'USA' },
          showBannerWarning: false,
        };

        sinon.stub(fxaMailer as any, 'renderNewDeviceLogin').resolves({
          subject: 'New sign-in to Test Client',
          html: '<html>test</html>',
          text: 'test',
          preview: 'test preview',
        });

        await fxaMailer.sendNewDeviceLoginEmail(opts);

        assert.isTrue(mockEmailSender.send.calledOnce);
        const sendArgs = mockEmailSender.send.getCall(0).args[0];
        assert.equal(sendArgs.from, 'Firefox <accounts@firefox.com>');
      });

      it('should work with Mozilla VPN relying party name', async () => {
        const opts = {
          to: 'user@example.com',
          uid: 'test-uid',
          metricsEnabled: true,
          acceptLanguage: 'en',
          timeZone: 'America/New_York',
          cmsRpFromName: 'Mozilla VPN',
          clientName: 'Test Client',
          device: 'Firefox on Mac',
          time: '10:00 AM',
          date: 'January 1, 2026',
          location: { city: 'San Francisco', stateCode: 'CA', country: 'USA' },
          showBannerWarning: false,
        };

        sinon.stub(fxaMailer as any, 'renderNewDeviceLogin').resolves({
          subject: 'New sign-in to Test Client',
          html: '<html>test</html>',
          text: 'test',
          preview: 'test preview',
        });

        await fxaMailer.sendNewDeviceLoginEmail(opts);

        assert.isTrue(mockEmailSender.send.calledOnce);
        const sendArgs = mockEmailSender.send.getCall(0).args[0];
        assert.equal(sendArgs.from, 'Mozilla VPN <accounts@firefox.com>');
      });
    });

    describe('without cmsRpFromName', () => {
      it('should use full sender config', async () => {
        const opts = {
          to: 'user@example.com',
          uid: 'test-uid',
          metricsEnabled: true,
          acceptLanguage: 'en',
          timeZone: 'America/New_York',
          clientName: 'Test Client',
          device: 'Firefox on Mac',
          time: '10:00 AM',
          date: 'January 1, 2026',
          location: { city: 'San Francisco', stateCode: 'CA', country: 'USA' },
          showBannerWarning: false,
        };

        sinon.stub(fxaMailer as any, 'renderNewDeviceLogin').resolves({
          subject: 'New sign-in to Test Client',
          html: '<html>test</html>',
          text: 'test',
          preview: 'test preview',
        });

        await fxaMailer.sendNewDeviceLoginEmail(opts);

        assert.isTrue(mockEmailSender.send.calledOnce);
        const sendArgs = mockEmailSender.send.getCall(0).args[0];
        // Should use the full configured sender
        assert.equal(sendArgs.from, 'Firefox Accounts <accounts@firefox.com>');
      });
    });

    describe('with sender config without angle brackets', () => {
      it('should handle plain email address sender', async () => {
        // Test when sender is just an email address without a display name
        mockConfig.sender = 'noreply@firefox.com';
        fxaMailer = new FxaMailer(
          mockEmailSender as any,
          mockLinkBuilder as any,
          mockConfig,
          mockBindings
        );

        const opts = {
          to: 'user@example.com',
          uid: 'test-uid',
          metricsEnabled: true,
          acceptLanguage: 'en',
          timeZone: 'America/New_York',
          cmsRpFromName: 'Mozilla Monitor',
          clientName: 'Test Client',
          device: 'Firefox on Mac',
          time: '10:00 AM',
          date: 'January 1, 2026',
          location: { city: 'San Francisco', stateCode: 'CA', country: 'USA' },
          showBannerWarning: false,
        };

        sinon.stub(fxaMailer as any, 'renderNewDeviceLogin').resolves({
          subject: 'New sign-in to Test Client',
          html: '<html>test</html>',
          text: 'test',
          preview: 'test preview',
        });

        await fxaMailer.sendNewDeviceLoginEmail(opts);

        assert.isTrue(mockEmailSender.send.calledOnce);
        const sendArgs = mockEmailSender.send.getCall(0).args[0];
        // Should be "Mozilla Monitor <noreply@firefox.com>"
        assert.equal(sendArgs.from, 'Mozilla Monitor <noreply@firefox.com>');
      });
    });
  });

  describe('canSend', () => {
    it('should return true when template is not in disable list', () => {
      assert.isTrue(fxaMailer.canSend('newDeviceLogin'));
    });

    it('should return false when template is in disable list', () => {
      mockConfig.fxaMailerDisableSend = ['newDeviceLogin'];
      fxaMailer = new FxaMailer(
        mockEmailSender as any,
        mockLinkBuilder as any,
        mockConfig,
        mockBindings
      );

      assert.isFalse(fxaMailer.canSend('newDeviceLogin'));
    });

    it('should return true for different template when one is disabled', () => {
      mockConfig.fxaMailerDisableSend = ['verifyLogin'];
      fxaMailer = new FxaMailer(
        mockEmailSender as any,
        mockLinkBuilder as any,
        mockConfig,
        mockBindings
      );

      assert.isFalse(fxaMailer.canSend('verifyLogin'));
      assert.isTrue(fxaMailer.canSend('newDeviceLogin'));
    });
  });
});
