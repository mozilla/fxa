/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { BadRequestException } from '@nestjs/common';
import { Test } from '@nestjs/testing';

import { MeteringCloudTasksController } from './metering-cloud-tasks.controller';
import { MeteringCloudTasksGuard } from './metering-cloud-tasks.guard';
import { MeteringThresholdService } from './metering-threshold.service';

describe('MeteringCloudTasksController', () => {
  let controller: MeteringCloudTasksController;
  let meteringThresholdService: jest.Mocked<
    Pick<MeteringThresholdService, 'handleThresholdCheck'>
  >;

  beforeEach(async () => {
    meteringThresholdService = { handleThresholdCheck: jest.fn() };

    const moduleRef = await Test.createTestingModule({
      controllers: [MeteringCloudTasksController],
      providers: [
        {
          provide: MeteringThresholdService,
          useValue: meteringThresholdService,
        },
      ],
    })
      .overrideGuard(MeteringCloudTasksGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = moduleRef.get(MeteringCloudTasksController);
  });

  it('forwards a valid body to the threshold service', async () => {
    await controller.thresholdCheck({
      slug: 'bandwidth',
      userIdentifier: 'user-1',
    });

    expect(meteringThresholdService.handleThresholdCheck).toHaveBeenCalledWith({
      slug: 'bandwidth',
      userIdentifier: 'user-1',
    });
  });

  it('returns an empty body', async () => {
    const result = await controller.thresholdCheck({
      slug: 'bandwidth',
      userIdentifier: 'user-1',
    });

    expect(result).toBeUndefined();
  });

  it('rejects a body that fails schema validation with BadRequestException', async () => {
    await expect(
      controller.thresholdCheck({ slug: '!!!', userIdentifier: '' })
    ).rejects.toThrow(BadRequestException);
    expect(
      meteringThresholdService.handleThresholdCheck
    ).not.toHaveBeenCalled();
  });

  it('propagates a service rejection so Cloud Tasks retries', async () => {
    meteringThresholdService.handleThresholdCheck.mockRejectedValue(
      new Error('downstream failure')
    );

    await expect(
      controller.thresholdCheck({ slug: 'bandwidth', userIdentifier: 'user-1' })
    ).rejects.toThrow('downstream failure');
  });
});
