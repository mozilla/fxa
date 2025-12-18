/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Test, TestingModule } from '@nestjs/testing';
import {
  MockConfig,
  MockDatabaseService,
  MockLogService,
  MockMetricsFactory,
  MockStatsDFactory,
} from '../mocks';
import {
  BouncesFactory,
  EmailLinkBuilderFactory,
  EmailSenderFactory,
  EmailService,
  FxaEmailRendererFactory,
} from './email.service';
import {
  EmailLinkBuilder,
  FxaEmailRenderer,
} from '@fxa/accounts/email-renderer';
import { Account } from 'fxa-shared/db/models/auth';
import { Bounces, EmailSender } from '@fxa/accounts/email-sender';

describe('Email Service', () => {
  let module: TestingModule;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      providers: [
        MockConfig,
        MockDatabaseService,
        MockMetricsFactory,
        MockStatsDFactory,
        MockLogService,
        BouncesFactory,
        EmailSenderFactory,
        EmailLinkBuilderFactory,
        FxaEmailRendererFactory,
        EmailService,
      ],
    }).compile();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('EmailSender should be defined', () => {
    const service = module.get(EmailSender);
    expect(service).toBeDefined();
  });

  it('FxaEmailRenderer should be defined', () => {
    const service = module.get(FxaEmailRenderer);
    expect(service).toBeDefined();
  });

  it('EmailLinkBuilder should be defined', () => {
    const service = module.get(EmailLinkBuilder);
    expect(service).toBeDefined();
  });

  it('EmailService should be defined', () => {
    const service = module.get(EmailService);
    expect(service).toBeDefined();
  });

  it('Bounces should be defined', () => {
    const service = module.get(Bounces);
    expect(service).toBeDefined();
  });

  it('Can send password change required email', async () => {
    const service = module.get(EmailService);
    const mailer = module.get(EmailSender);
    const renderer = module.get(FxaEmailRenderer);

    const renderPasswordChangeRequiredSpy = jest.spyOn(
      renderer,
      'renderPasswordChangeRequired'
    );
    const sendSpy = jest.spyOn(mailer, 'send').mockImplementation(() => {
      return Promise.resolve({
        sent: true,
      });
    });

    const email = 'foo@mozilla.com';
    await service.sendPasswordChangeRequired({
      uid: '0000',
      primaryEmail: { email },
      email,
      emails: [
        {
          email,
        },
        {
          email: 'foo+2@mozilla.com',
        },
      ],
      locale: 'en-us',
    } as unknown as Account);

    expect(renderPasswordChangeRequiredSpy).toHaveBeenCalledTimes(1);
    expect(sendSpy).toHaveBeenCalledTimes(2);
    expect(sendSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        from: 'Mozilla <no-reply@lcip.org>',
        headers: {
          'Content-Language': 'en-us',
          'X-Template-Name': 'passwordChangeRequired',
          'X-Template-Version': '4',
          'X-Uid': '0000',
        },
        to: 'foo@mozilla.com',
        version: 4,
        html: expect.stringContaining('<title>'),
      })
    );

    expect(sendSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        from: 'Mozilla <no-reply@lcip.org>',
        headers: {
          'Content-Language': 'en-us',
          'X-Template-Name': 'passwordChangeRequired',
          'X-Template-Version': '4',
          'X-Uid': '0000',
        },
        to: 'foo+2@mozilla.com',
        html: expect.anything(),
        text: expect.anything(),
      })
    );
  });

  it('Can send password password reset notification email', async () => {
    const service = module.get(EmailService);
    const mailer = module.get(EmailSender);
    const renderer = module.get(FxaEmailRenderer);

    const renderAdminResetAccountsSpy = jest.spyOn(
      renderer,
      'renderAdminResetAccounts'
    );
    const sendSpy = jest.spyOn(mailer, 'send').mockImplementation(() => {
      return Promise.resolve({
        sent: true,
      });
    });

    await service.sendPasswordResetNotification('foo-sre@mozilla.com', [
      { locator: 'foo@mozilla.com', status: 'Sucess' },
    ]);

    expect(renderAdminResetAccountsSpy).toHaveBeenCalledTimes(1);
    expect(sendSpy).toHaveBeenCalledTimes(1);
    expect(sendSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        from: 'Mozilla <no-reply@lcip.org>',
        headers: {
          'Content-Language': 'en',
          'X-Template-Name': 'adminResetAccounts',
          'X-Template-Version': '1',
        },
        subject: 'Fxa Admin: Accounts Reset',
        to: 'foo-sre@mozilla.com',
        html: expect.anything(),
        text: expect.anything(),
      })
    );
  });
});
