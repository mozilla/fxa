/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { BadRequestException, Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { MozLoggerService } from '@fxa/shared/mozlog';
import { FeatureFlag } from 'fxa-shared/db/models/auth';
import { EventLoggingService } from '../../event-logging/event-logging.service';
import { AuditLogInterceptor } from '../../auth/audit-log.interceptor';
import { FeatureFlagsController } from './feature-flags.controller';

jest.mock('fxa-shared/db/models/auth', () => ({
  FeatureFlag: {
    findAll: jest.fn(),
    findByName: jest.fn(),
    upsert: jest.fn(),
    remove: jest.fn(),
  },
}));

describe('FeatureFlagsController', () => {
  let controller: FeatureFlagsController;
  let logger: { debug: jest.Mock; error: jest.Mock; info: jest.Mock };

  beforeEach(async () => {
    logger = { debug: jest.fn(), error: jest.fn(), info: jest.fn() };
    (FeatureFlag.findByName as jest.Mock).mockResolvedValue(null);

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
        FeatureFlagsController,
        EventLoggingService,
        AuditLogInterceptor,
        MockMozLoggerService,
        MockConfig,
        MockMetricsFactory,
      ],
    }).compile();

    controller = module.get<FeatureFlagsController>(FeatureFlagsController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('list', () => {
    it('returns all flags', async () => {
      const flags = [
        {
          name: 'new-checkout',
          enabled: true,
          description: 'New checkout flow',
          updatedAt: 1000,
          updatedBy: 'admin@example.com',
        },
      ];
      (FeatureFlag.findAll as jest.Mock).mockResolvedValue(flags);

      const result = await controller.list();

      expect(result).toEqual(flags);
    });
  });

  describe('upsert', () => {
    it('saves a valid flag and logs', async () => {
      (FeatureFlag.upsert as jest.Mock).mockResolvedValue(undefined);

      const result = await controller.upsert(
        'new-checkout',
        true,
        'New checkout flow',
        'admin@example.com'
      );

      expect(result).toEqual({ ok: true });
      expect(FeatureFlag.upsert).toHaveBeenCalledWith(
        {
          name: 'new-checkout',
          enabled: true,
          description: 'New checkout flow',
        },
        'admin@example.com'
      );
      expect(logger.info).toHaveBeenCalledWith('featureFlags.change', {
        user: 'admin@example.com',
        name: 'new-checkout',
        action: 'created',
        from: null,
        to: { enabled: true, description: 'New checkout flow' },
      });
    });

    it('normalizes the name to lowercase and trims it', async () => {
      (FeatureFlag.upsert as jest.Mock).mockResolvedValue(undefined);

      await controller.upsert(
        '  New-Checkout  ',
        false,
        '',
        'admin@example.com'
      );

      expect(FeatureFlag.upsert).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'new-checkout' }),
        'admin@example.com'
      );
    });

    it('accepts a dotted name', async () => {
      (FeatureFlag.upsert as jest.Mock).mockResolvedValue(undefined);

      await controller.upsert('checkout.v2', false, '', 'admin@example.com');

      expect(FeatureFlag.upsert).toHaveBeenCalled();
    });

    it('treats a missing description as empty', async () => {
      (FeatureFlag.upsert as jest.Mock).mockResolvedValue(undefined);

      await controller.upsert(
        'new-checkout',
        false,
        undefined as any,
        'admin@example.com'
      );

      expect(FeatureFlag.upsert).toHaveBeenCalledWith(
        expect.objectContaining({ description: '' }),
        'admin@example.com'
      );
    });

    it('logs "enabled" when an off flag is switched on', async () => {
      (FeatureFlag.findByName as jest.Mock).mockResolvedValue({
        name: 'new-checkout',
        enabled: false,
        description: 'New checkout flow',
        updatedAt: 1000,
        updatedBy: 'someone@example.com',
      });

      await controller.upsert(
        'new-checkout',
        true,
        'New checkout flow',
        'admin@example.com'
      );

      expect(logger.info).toHaveBeenCalledWith(
        'featureFlags.change',
        expect.objectContaining({
          action: 'enabled',
          from: { enabled: false, description: 'New checkout flow' },
          to: { enabled: true, description: 'New checkout flow' },
        })
      );
    });

    it('logs "disabled" when an on flag is switched off', async () => {
      (FeatureFlag.findByName as jest.Mock).mockResolvedValue({
        name: 'new-checkout',
        enabled: true,
        description: '',
        updatedAt: 1000,
        updatedBy: 'someone@example.com',
      });

      await controller.upsert('new-checkout', false, '', 'admin@example.com');

      expect(logger.info).toHaveBeenCalledWith(
        'featureFlags.change',
        expect.objectContaining({ action: 'disabled' })
      );
    });

    it('logs "updated" when only the description changes', async () => {
      (FeatureFlag.findByName as jest.Mock).mockResolvedValue({
        name: 'new-checkout',
        enabled: true,
        description: 'Old wording',
        updatedAt: 1000,
        updatedBy: 'someone@example.com',
      });

      await controller.upsert(
        'new-checkout',
        true,
        'New wording',
        'admin@example.com'
      );

      expect(logger.info).toHaveBeenCalledWith(
        'featureFlags.change',
        expect.objectContaining({ action: 'updated' })
      );
    });

    it('throws if name is blank', async () => {
      await expect(
        controller.upsert('   ', true, '', 'admin@example.com')
      ).rejects.toThrow(BadRequestException);
    });

    it('throws if name exceeds 64 characters', async () => {
      await expect(
        controller.upsert('a'.repeat(65), true, '', 'admin@example.com')
      ).rejects.toThrow(BadRequestException);
    });

    it('throws if name contains illegal characters', async () => {
      await expect(
        controller.upsert('new_checkout!', true, '', 'admin@example.com')
      ).rejects.toThrow(BadRequestException);
    });

    it('throws if enabled is not a boolean', async () => {
      await expect(
        controller.upsert('new-checkout', 'yes' as any, '', 'admin@example.com')
      ).rejects.toThrow(BadRequestException);
    });

    it('rejects a name phrased as a negative', async () => {
      await expect(
        controller.upsert('disable-checkout', true, '', 'admin@example.com')
      ).rejects.toThrow(BadRequestException);
    });

    it('allows a name that merely contains a negative substring', async () => {
      (FeatureFlag.upsert as jest.Mock).mockResolvedValue(undefined);

      await controller.upsert('notifications', true, '', 'admin@example.com');

      expect(FeatureFlag.upsert).toHaveBeenCalled();
    });

    it('throws if description exceeds 255 characters', async () => {
      await expect(
        controller.upsert(
          'new-checkout',
          true,
          'a'.repeat(256),
          'admin@example.com'
        )
      ).rejects.toThrow(BadRequestException);
    });

    it('does not write when validation fails', async () => {
      await expect(
        controller.upsert('', true, '', 'admin@example.com')
      ).rejects.toThrow(BadRequestException);

      expect(FeatureFlag.upsert).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('removes the flag and logs', async () => {
      (FeatureFlag.findByName as jest.Mock).mockResolvedValue({
        name: 'new-checkout',
        enabled: true,
        description: 'New checkout flow',
        updatedAt: 1000,
        updatedBy: 'admin@example.com',
      });
      (FeatureFlag.remove as jest.Mock).mockResolvedValue(true);

      const result = await controller.remove(
        'New-Checkout',
        'admin@example.com'
      );

      expect(result).toEqual({ removed: true });
      expect(FeatureFlag.remove).toHaveBeenCalledWith('new-checkout');
      expect(logger.info).toHaveBeenCalledWith('featureFlags.change', {
        user: 'admin@example.com',
        name: 'new-checkout',
        action: 'deleted',
        from: { enabled: true, description: 'New checkout flow' },
        to: null,
        removed: true,
      });
    });

    it('reports removed false when the flag was absent', async () => {
      (FeatureFlag.remove as jest.Mock).mockResolvedValue(false);

      const result = await controller.remove('nope', 'admin@example.com');

      expect(result).toEqual({ removed: false });
    });

    it('throws if name is blank', async () => {
      await expect(
        controller.remove('  ', 'admin@example.com')
      ).rejects.toThrow(BadRequestException);
    });
  });
});
