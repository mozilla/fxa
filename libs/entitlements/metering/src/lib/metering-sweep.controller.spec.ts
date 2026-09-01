/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { BadRequestException, Logger } from '@nestjs/common';
import {
  EXCEPTION_FILTERS_METADATA,
  GUARDS_METADATA,
} from '@nestjs/common/constants';
import { Test } from '@nestjs/testing';

import { MeteringCloudTasksGuard } from './metering-cloud-tasks.guard';
import { MeteringExceptionFilter } from './metering-exception.filter';
import { MeteringSweepController } from './metering-sweep.controller';
import { MeteringSweepService } from './metering-sweep.service';
import type { SweepResult } from './metering.types';

const SWEEP_RESULT: SweepResult = {
  outcome: 'dispatched',
  candidates: 3,
  dispatched: 2,
  watermark: '2026-05-15T12:00:00.000Z',
};

describe('MeteringSweepController', () => {
  let meteringSweepController: MeteringSweepController;
  let meteringSweepService: jest.Mocked<Pick<MeteringSweepService, 'sweep'>>;

  beforeEach(async () => {
    meteringSweepService = {
      sweep: jest.fn().mockResolvedValue(SWEEP_RESULT),
    };

    const moduleRef = await Test.createTestingModule({
      controllers: [MeteringSweepController],
      providers: [
        { provide: MeteringSweepService, useValue: meteringSweepService },
        { provide: Logger, useValue: { error: jest.fn() } },
      ],
    })
      .overrideGuard(MeteringCloudTasksGuard)
      .useValue({ canActivate: () => true })
      .compile();

    meteringSweepController = moduleRef.get(MeteringSweepController);
  });

  it('registers MeteringCloudTasksGuard', () => {
    const guards =
      Reflect.getMetadata(GUARDS_METADATA, MeteringSweepController) ?? [];
    expect(guards).toContain(MeteringCloudTasksGuard);
  });

  it('registers MeteringExceptionFilter', () => {
    const filters =
      Reflect.getMetadata(
        EXCEPTION_FILTERS_METADATA,
        MeteringSweepController
      ) ?? [];
    expect(filters).toContain(MeteringExceptionFilter);
  });

  describe('sweep', () => {
    it('forwards the parsed request to the service and returns its result', async () => {
      const result = await meteringSweepController.sweep({
        clientId: 'vpn',
        slug: 'tokens',
      });

      expect(meteringSweepService.sweep).toHaveBeenCalledWith({
        clientId: 'vpn',
        slug: 'tokens',
      });
      expect(result).toEqual(SWEEP_RESULT);
    });

    it('rejects an invalid body without calling the service', async () => {
      await expect(
        meteringSweepController.sweep({ clientId: 'vpn' })
      ).rejects.toThrow(BadRequestException);

      expect(meteringSweepService.sweep).not.toHaveBeenCalled();
    });

    it('rejects a slug that fails schema validation', async () => {
      await expect(
        meteringSweepController.sweep({ clientId: 'vpn', slug: 'NOT VALID' })
      ).rejects.toThrow(BadRequestException);
    });
  });
});
