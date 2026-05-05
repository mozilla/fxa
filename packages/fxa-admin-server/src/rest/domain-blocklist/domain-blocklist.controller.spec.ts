/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { BadRequestException, Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { MozLoggerService } from '@fxa/shared/mozlog';
import { DomainBlocklist } from 'fxa-shared/db/models/auth';
import { EventLoggingService } from '../../event-logging/event-logging.service';
import { AuditLogInterceptor } from '../../auth/audit-log.interceptor';
import { DomainBlocklistController } from './domain-blocklist.controller';

jest.mock('fxa-shared/db/models/auth', () => ({
  DomainBlocklist: {
    findAll: jest.fn(),
    addMany: jest.fn(),
    removeByDomain: jest.fn(),
    deleteAll: jest.fn(),
  },
}));

describe('DomainBlocklistController', () => {
  let controller: DomainBlocklistController;
  let logger: { debug: jest.Mock; error: jest.Mock; info: jest.Mock };

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
        DomainBlocklistController,
        EventLoggingService,
        AuditLogInterceptor,
        MockMozLoggerService,
        MockConfig,
        MockMetricsFactory,
      ],
    }).compile();

    controller = module.get<DomainBlocklistController>(
      DomainBlocklistController
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('list', () => {
    it('returns all entries', async () => {
      const entries = [
        { domain: 'evil.com', createdAt: 1000 },
        { domain: 'spam.net', createdAt: 900 },
      ];
      (DomainBlocklist.findAll as jest.Mock).mockResolvedValue(entries);

      const result = await controller.list();

      expect(result).toEqual(entries);
      expect(DomainBlocklist.findAll).toHaveBeenCalled();
    });
  });

  describe('add', () => {
    it('adds valid domains and logs', async () => {
      (DomainBlocklist.addMany as jest.Mock).mockResolvedValue(undefined);

      const result = await controller.add(
        ['evil.com', 'spam.net'],
        'admin@example.com'
      );

      expect(result).toEqual({ ok: true });
      expect(DomainBlocklist.addMany).toHaveBeenCalledWith([
        'evil.com',
        'spam.net',
      ]);
      expect(logger.info).toHaveBeenCalledWith('domainBlocklist.add', {
        user: 'admin@example.com',
        count: 2,
      });
    });

    it('strips leading @ and normalizes to lowercase', async () => {
      (DomainBlocklist.addMany as jest.Mock).mockResolvedValue(undefined);

      await controller.add(['@Evil.Com'], 'admin@example.com');

      expect(DomainBlocklist.addMany).toHaveBeenCalledWith(['evil.com']);
    });

    it('throws if domains is not an array', async () => {
      await expect(
        controller.add('evil.com' as any, 'admin@example.com')
      ).rejects.toThrow(BadRequestException);
    });

    it('throws if domains is an empty array', async () => {
      await expect(controller.add([], 'admin@example.com')).rejects.toThrow(
        BadRequestException
      );
    });

    it('throws if all entries are blank after trimming', async () => {
      await expect(
        controller.add(['   ', ''], 'admin@example.com')
      ).rejects.toThrow(BadRequestException);
    });

    it('throws if array exceeds 1000 entries', async () => {
      const big = Array.from({ length: 1001 }, (_, i) => `d${i}.com`);
      await expect(controller.add(big, 'admin@example.com')).rejects.toThrow(
        BadRequestException
      );
    });

    it('throws if a domain exceeds 253 characters', async () => {
      const long = 'a'.repeat(250) + '.com';
      await expect(controller.add([long], 'admin@example.com')).rejects.toThrow(
        BadRequestException
      );
    });

    it('throws if a domain label exceeds 63 characters', async () => {
      const longLabel = 'a'.repeat(64) + '.com';
      await expect(
        controller.add([longLabel], 'admin@example.com')
      ).rejects.toThrow(BadRequestException);
    });

    it('throws for invalid domain formats', async () => {
      await expect(
        controller.add(['not a domain'], 'admin@example.com')
      ).rejects.toThrow(BadRequestException);

      await expect(
        controller.add(['nodot'], 'admin@example.com')
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('remove', () => {
    it('removes an existing domain', async () => {
      (DomainBlocklist.removeByDomain as jest.Mock).mockResolvedValue(true);

      const result = await controller.remove('evil.com', 'admin@example.com');

      expect(result).toEqual({ removed: true });
      expect(DomainBlocklist.removeByDomain).toHaveBeenCalledWith('evil.com');
      expect(logger.info).toHaveBeenCalledWith('domainBlocklist.remove', {
        user: 'admin@example.com',
        domain: 'evil.com',
        removed: true,
      });
    });

    it('returns removed: false when domain not found', async () => {
      (DomainBlocklist.removeByDomain as jest.Mock).mockResolvedValue(false);

      const result = await controller.remove(
        'notfound.com',
        'admin@example.com'
      );

      expect(result).toEqual({ removed: false });
    });

    it('strips leading @ before lookup', async () => {
      (DomainBlocklist.removeByDomain as jest.Mock).mockResolvedValue(true);

      await controller.remove('@evil.com', 'admin@example.com');

      expect(DomainBlocklist.removeByDomain).toHaveBeenCalledWith('evil.com');
    });

    it('throws for empty domain', async () => {
      await expect(controller.remove('', 'admin@example.com')).rejects.toThrow(
        BadRequestException
      );

      await expect(
        controller.remove('   ', 'admin@example.com')
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('removeAll', () => {
    it('deletes all entries and logs', async () => {
      (DomainBlocklist.deleteAll as jest.Mock).mockResolvedValue(undefined);

      const result = await controller.removeAll('admin@example.com');

      expect(result).toEqual({ ok: true });
      expect(DomainBlocklist.deleteAll).toHaveBeenCalled();
      expect(logger.info).toHaveBeenCalledWith('domainBlocklist.removeAll', {
        user: 'admin@example.com',
      });
    });
  });
});
