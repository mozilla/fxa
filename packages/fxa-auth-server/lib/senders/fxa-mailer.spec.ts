/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { FxaMailer } from './fxa-mailer';
import { EmailSender } from '@fxa/accounts/email-sender';
import {
  EmailLinkBuilder,
  NodeRendererBindings,
} from '@fxa/accounts/email-renderer';

describe('lib/senders/fxa-mailer', () => {
  let fxaMailer: FxaMailer;
  let mockEmailSender: jest.Mocked<Pick<EmailSender, 'send' | 'buildHeaders'>>;
  let mockLinkBuilder: jest.Mocked<Pick<EmailLinkBuilder, 'buildPrivacyLink' | 'buildSupportLink' | 'buildPasswordChangeLink' | 'buildAccountSettingsLink' | 'buildMozillaSupportUrl'>>;
  let mockBindings: NodeRendererBindings;
  let mockConfig: any;

  beforeEach(() => {
    mockEmailSender = {
      send: jest.fn().mockResolvedValue({
        sent: true,
        messageId: 'test-message-id',
        message: 'Email sent',
        response: '250 OK',
      }),
      buildHeaders: jest.fn().mockReturnValue({}),
    };

    mockLinkBuilder = {
      buildPrivacyLink: jest.fn().mockReturnValue('https://privacy.link'),
      buildSupportLink: jest.fn().mockReturnValue('https://support.link'),
      buildPasswordChangeLink: jest.fn().mockReturnValue('https://password.link'),
      buildAccountSettingsLink: jest.fn().mockReturnValue('https://settings.link'),
      buildMozillaSupportUrl: jest.fn().mockReturnValue('https://mozilla.support'),
    };

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
    const baseOpts = {
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

    function stubRender() {
      jest.spyOn(fxaMailer as any, 'renderNewDeviceLogin').mockResolvedValue({
        subject: 'New sign-in to Test Client',
        html: '<html>test</html>',
        text: 'test',
        preview: 'test preview',
      });
    }

    describe('with cmsRpFromName', () => {
      it('should extract email address from sender config', async () => {
        stubRender();
        await fxaMailer.sendNewDeviceLoginEmail({
          ...baseOpts,
          cmsRpFromName: 'Mozilla AI',
        });

        expect(mockEmailSender.send).toHaveBeenCalledTimes(1);
        const sendArgs = mockEmailSender.send.mock.calls[0][0];
        expect(sendArgs.from).toBe('Mozilla AI <accounts@firefox.com>');
        expect(sendArgs.to).toBe('user@example.com');
      });

      it('should work with Firefox relying party name', async () => {
        stubRender();
        await fxaMailer.sendNewDeviceLoginEmail({
          ...baseOpts,
          cmsRpFromName: 'Firefox',
        });

        expect(mockEmailSender.send).toHaveBeenCalledTimes(1);
        const sendArgs = mockEmailSender.send.mock.calls[0][0];
        expect(sendArgs.from).toBe('Firefox <accounts@firefox.com>');
      });

      it('should work with Mozilla VPN relying party name', async () => {
        stubRender();
        await fxaMailer.sendNewDeviceLoginEmail({
          ...baseOpts,
          cmsRpFromName: 'Mozilla VPN',
        });

        expect(mockEmailSender.send).toHaveBeenCalledTimes(1);
        const sendArgs = mockEmailSender.send.mock.calls[0][0];
        expect(sendArgs.from).toBe('Mozilla VPN <accounts@firefox.com>');
      });
    });

    describe('without cmsRpFromName', () => {
      it('should use full sender config', async () => {
        stubRender();
        await fxaMailer.sendNewDeviceLoginEmail(baseOpts);

        expect(mockEmailSender.send).toHaveBeenCalledTimes(1);
        const sendArgs = mockEmailSender.send.mock.calls[0][0];
        expect(sendArgs.from).toBe('Firefox Accounts <accounts@firefox.com>');
      });
    });

    describe('with sender config without angle brackets', () => {
      it('should handle plain email address sender', async () => {
        mockConfig.sender = 'noreply@firefox.com';
        fxaMailer = new FxaMailer(
          mockEmailSender as any,
          mockLinkBuilder as any,
          mockConfig,
          mockBindings
        );

        jest.spyOn(fxaMailer as any, 'renderNewDeviceLogin').mockResolvedValue({
          subject: 'New sign-in to Test Client',
          html: '<html>test</html>',
          text: 'test',
          preview: 'test preview',
        });

        await fxaMailer.sendNewDeviceLoginEmail({
          ...baseOpts,
          cmsRpFromName: 'Mozilla Monitor',
        });

        expect(mockEmailSender.send).toHaveBeenCalledTimes(1);
        const sendArgs = mockEmailSender.send.mock.calls[0][0];
        expect(sendArgs.from).toBe('Mozilla Monitor <noreply@firefox.com>');
      });
    });
  });

  describe('canSend', () => {
    it('should return true when template is not in disable list', () => {
      expect(fxaMailer.canSend('newDeviceLogin')).toBe(true);
    });

    it('should return false when template is in disable list', () => {
      mockConfig.fxaMailerDisableSend = ['newDeviceLogin'];
      fxaMailer = new FxaMailer(
        mockEmailSender as any,
        mockLinkBuilder as any,
        mockConfig,
        mockBindings
      );
      expect(fxaMailer.canSend('newDeviceLogin')).toBe(false);
    });

    it('should return true for different template when one is disabled', () => {
      mockConfig.fxaMailerDisableSend = ['verifyLogin'];
      fxaMailer = new FxaMailer(
        mockEmailSender as any,
        mockLinkBuilder as any,
        mockConfig,
        mockBindings
      );
      expect(fxaMailer.canSend('verifyLogin')).toBe(false);
      expect(fxaMailer.canSend('newDeviceLogin')).toBe(true);
    });
  });
});
