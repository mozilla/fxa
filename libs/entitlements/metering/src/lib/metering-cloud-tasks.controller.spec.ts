/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { BadRequestException } from '@nestjs/common';
import { Test } from '@nestjs/testing';

import { MeteringCloudTaskGuard } from './metering-cloudtask.guard';
import { MeteringCloudTasksController } from './metering-cloud-tasks.controller';
import { MeteringThresholdService } from './metering-threshold.service';

describe('MeteringCloudTasksController', () => {
  let meteringCloudTasksController: MeteringCloudTasksController;
  let meteringThresholdService: jest.Mocked<MeteringThresholdService>;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [MeteringCloudTasksController],
      providers: [
        {
          provide: MeteringThresholdService,
          useValue: {
            handleThresholdCheck: jest.fn().mockResolvedValue('no-crossings'),
          },
        },
      ],
    })
      .overrideGuard(MeteringCloudTaskGuard)
      .useValue({ canActivate: () => true })
      .compile();

    meteringCloudTasksController = moduleRef.get(MeteringCloudTasksController);
    meteringThresholdService = moduleRef.get(MeteringThresholdService);
  });

  it('delegates a valid body to the handler and returns the outcome', async () => {
    meteringThresholdService.handleThresholdCheck.mockResolvedValue('crossings-dispatched');
    const result = await meteringCloudTasksController.thresholdCheck({
      slug: 'bandwidth',
      userIdentifier: 'user-1',
    });
    expect(meteringThresholdService.handleThresholdCheck).toHaveBeenCalledWith({
      slug: 'bandwidth',
      userIdentifier: 'user-1',
    });
    expect(result).toEqual({ outcome: 'crossings-dispatched' });
  });

  it('rejects bodies that fail schema validation with 400', async () => {
    await expect(
      meteringCloudTasksController.thresholdCheck({ slug: '!!!', userIdentifier: '' })
    ).rejects.toThrow(BadRequestException);
    expect(meteringThresholdService.handleThresholdCheck).not.toHaveBeenCalled();
  });
});
