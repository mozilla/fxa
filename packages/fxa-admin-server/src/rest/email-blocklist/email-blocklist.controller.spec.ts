/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { BadRequestException, Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { Request } from 'express';
import { MozLoggerService } from '@fxa/shared/mozlog';
import { EmailBlocklist } from '@fxa/shared/db/mysql/legacy/models/auth';
import { EventLoggingService } from '../../event-logging/event-logging.service';
import { AuditLogInterceptor } from '../../auth/audit-log.interceptor';
import { DisableMatchingJobService } from '../account/disable-matching-job.service';
import { EmailBlocklistController } from './email-blocklist.controller';

jest.mock('@fxa/shared/db/mysql/legacy/models/auth', () => ({
  EmailBlocklist: {
    findAll: jest.fn(),
    addMany: jest.fn(),
    removeByRegex: jest.fn(),
    deleteAll: jest.fn(),
  },
}));

describe('EmailBlocklistController', () => {
  let controller: EmailBlocklistController;
  let logger: { debug: jest.Mock; error: jest.Mock; info: jest.Mock };
  const EMAILS = ['a@evil.com', 'b@spam.net', 'c@evil.com.example.org'];
  const JOB = {
    status: 'running',
    scanned: 0,
    total: 0,
    disabled: 0,
  };
  const jobs = {
    start: jest.fn().mockResolvedValue(JOB),
    get: jest.fn().mockResolvedValue(JOB),
  };
  // The emails that the predicate handed to the scan would disable.
  const matched = () => EMAILS.filter(jobs.start.mock.calls[0][0].test);

  beforeEach(async () => {
    logger = { debug: jest.fn(), error: jest.fn(), info: jest.fn() };

    const MockMozLoggerService: Provider = {
      provide: MozLoggerService,
      useValue: logger,
    };

    const MockConfig: Provider = {
      provide: ConfigService,
      useValue: {
        get: jest.fn().mockReturnValue({ authHeader: 'test' }),
      },
    };

    const MockMetricsFactory: Provider = {
      provide: 'METRICS',
      useFactory: () => undefined,
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailBlocklistController,
        EventLoggingService,
        AuditLogInterceptor,
        MockMozLoggerService,
        MockConfig,
        MockMetricsFactory,
        { provide: DisableMatchingJobService, useValue: jobs },
      ],
    }).compile();

    controller = module.get<EmailBlocklistController>(EmailBlocklistController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('list', () => {
    it('returns all entries', async () => {
      const entries = [
        { regex: '@evil\\.com$', createdAt: 1000 },
        { regex: '@spam\\.net$', createdAt: 900 },
      ];
      (EmailBlocklist.findAll as jest.Mock).mockResolvedValue(entries);

      const result = await controller.list();

      expect(result).toEqual(entries);
      expect(EmailBlocklist.findAll).toHaveBeenCalled();
    });
  });

  describe('add', () => {
    it('adds valid regexes and logs', async () => {
      (EmailBlocklist.addMany as jest.Mock).mockResolvedValue(undefined);

      const result = await controller.add(
        ['@evil\\.com$', '@spam\\.net$'],
        'admin@example.com'
      );

      expect(result).toEqual({ ok: true });
      expect(EmailBlocklist.addMany).toHaveBeenCalledWith([
        '@evil\\.com$',
        '@spam\\.net$',
      ]);
      expect(logger.info).toHaveBeenCalledWith('emailBlocklist.add', {
        user: 'admin@example.com',
        count: 2,
      });
    });

    it('trims whitespace and drops empty entries', async () => {
      (EmailBlocklist.addMany as jest.Mock).mockResolvedValue(undefined);

      await controller.add(
        ['  @evil\\.com$  ', '', '   '],
        'admin@example.com'
      );

      expect(EmailBlocklist.addMany).toHaveBeenCalledWith(['@evil\\.com$']);
    });

    it('throws if regexes is not an array', async () => {
      await expect(
        controller.add('@evil\\.com$' as any, 'admin@example.com')
      ).rejects.toThrow(BadRequestException);
    });

    it('throws if any entry is not a string', async () => {
      await expect(
        controller.add(['@evil\\.com$', 123 as any], 'admin@example.com')
      ).rejects.toThrow(BadRequestException);
    });

    it('throws if all entries are blank after trimming', async () => {
      await expect(
        controller.add(['   ', ''], 'admin@example.com')
      ).rejects.toThrow(BadRequestException);
    });

    it('throws if a regex exceeds 768 characters', async () => {
      const long = 'a'.repeat(769);
      await expect(controller.add([long], 'admin@example.com')).rejects.toThrow(
        BadRequestException
      );
    });

    it('throws for invalid regex syntax', async () => {
      await expect(
        controller.add(['(unclosed'], 'admin@example.com')
      ).rejects.toThrow(BadRequestException);
    });

    it('does not call addMany when validation fails', async () => {
      await expect(controller.add([], 'admin@example.com')).rejects.toThrow(
        BadRequestException
      );
      expect(EmailBlocklist.addMany).not.toHaveBeenCalled();
    });
  });

  describe('disableMatching', () => {
    const req = {} as Request;

    beforeEach(() => {
      (EmailBlocklist.findAll as jest.Mock).mockResolvedValue([
        { regex: '@evil\\.com$' },
        { regex: '@spam\\.net$' },
      ]);
    });

    it('starts a scan that matches a primary email against any of the regexes', async () => {
      const result = await controller.disableMatching(
        ['@evil\\.com$', '@spam\\.net$'],
        'admin@example.com',
        req
      );

      expect(result).toEqual(JOB);
      expect(jobs.start).toHaveBeenCalledWith(
        { test: expect.any(Function) },
        req,
        {
          page: 'email',
          event: 'emailBlocklist.disableMatching',
          user: 'admin@example.com',
          values: ['@evil\\.com$', '@spam\\.net$'],
        }
      );
      expect(matched()).toEqual(['a@evil.com', 'b@spam.net']);
    });

    it('ignores a regex that is not on the blocklist', async () => {
      await controller.disableMatching(
        ['@spam\\.net$', '.*'],
        'admin@example.com',
        req
      );

      expect(matched()).toEqual(['b@spam.net']);
      expect(jobs.start.mock.calls[0][2].values).toEqual(['@spam\\.net$']);
    });

    it('returns a finished job without a scan when no regex is on the blocklist', async () => {
      const result = await controller.disableMatching(
        ['.*'],
        'admin@example.com',
        req
      );

      expect(result).toEqual({
        status: 'done',
        scanned: 0,
        total: 0,
        disabled: 0,
      });
      expect(jobs.start).not.toHaveBeenCalled();
    });

    it('ignores non-string elements', async () => {
      await controller.disableMatching(
        [42, { regex: '@spam\\.net$' }, '@evil\\.com$'] as any,
        'admin@example.com',
        req
      );

      expect(matched()).toEqual(['a@evil.com']);
    });

    it('throws if regexes is not an array', async () => {
      await expect(
        controller.disableMatching(
          '@evil\\.com$' as any,
          'admin@example.com',
          req
        )
      ).rejects.toThrow(BadRequestException);
      expect(EmailBlocklist.findAll).not.toHaveBeenCalled();
    });

    it('rejects when the blocklist lookup fails', async () => {
      (EmailBlocklist.findAll as jest.Mock).mockRejectedValue(
        new Error('ECONNREFUSED')
      );

      await expect(
        controller.disableMatching(['@evil\\.com$'], 'admin@example.com', req)
      ).rejects.toThrow('ECONNREFUSED');
      expect(jobs.start).not.toHaveBeenCalled();
    });

    it('rejects when the scan cannot start', async () => {
      jobs.start.mockRejectedValueOnce(new Error('scan already running'));

      await expect(
        controller.disableMatching(['@evil\\.com$'], 'admin@example.com', req)
      ).rejects.toThrow('scan already running');
    });
  });

  describe('disableMatchingJob', () => {
    it('returns the email page scan', async () => {
      await expect(controller.disableMatchingJob()).resolves.toEqual(JOB);
      expect(jobs.get).toHaveBeenCalledWith('email');
    });
  });

  describe('remove', () => {
    it('removes an existing regex', async () => {
      (EmailBlocklist.removeByRegex as jest.Mock).mockResolvedValue(true);

      const result = await controller.remove(
        '@evil\\.com$',
        'admin@example.com'
      );

      expect(result).toEqual({ removed: true });
      expect(EmailBlocklist.removeByRegex).toHaveBeenCalledWith('@evil\\.com$');
      expect(logger.info).toHaveBeenCalledWith('emailBlocklist.remove', {
        user: 'admin@example.com',
        regex: '@evil\\.com$',
        removed: true,
      });
    });

    it('returns removed: false when regex not found', async () => {
      (EmailBlocklist.removeByRegex as jest.Mock).mockResolvedValue(false);

      const result = await controller.remove(
        '@notfound\\.com$',
        'admin@example.com'
      );

      expect(result).toEqual({ removed: false });
    });

    it('trims whitespace before lookup', async () => {
      (EmailBlocklist.removeByRegex as jest.Mock).mockResolvedValue(true);

      await controller.remove('  @evil\\.com$  ', 'admin@example.com');

      expect(EmailBlocklist.removeByRegex).toHaveBeenCalledWith('@evil\\.com$');
    });

    it('throws for empty regex', async () => {
      await expect(controller.remove('', 'admin@example.com')).rejects.toThrow(
        BadRequestException
      );

      await expect(
        controller.remove('   ', 'admin@example.com')
      ).rejects.toThrow(BadRequestException);
    });

    it('throws when regex is not a string', async () => {
      await expect(
        controller.remove(undefined as any, 'admin@example.com')
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('removeAll', () => {
    it('deletes all entries and logs', async () => {
      (EmailBlocklist.deleteAll as jest.Mock).mockResolvedValue(undefined);

      const result = await controller.removeAll('admin@example.com');

      expect(result).toEqual({ ok: true });
      expect(EmailBlocklist.deleteAll).toHaveBeenCalled();
      expect(logger.info).toHaveBeenCalledWith('emailBlocklist.removeAll', {
        user: 'admin@example.com',
      });
    });
  });
});
