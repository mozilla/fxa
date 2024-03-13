/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Test, TestingModule } from '@nestjs/testing';
import { MockConfig, MockCloudTaskFactory, MockMetricsFactory } from '../mocks';
import { CloudTasks, CloudTasksService } from './cloud-tasks.service';
import { AccountTasks } from '@fxa/shared/cloud-tasks';

describe('CloudTasks Service', () => {
  let service: { accountTasks: AccountTasks };

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MockConfig, MockMetricsFactory, MockCloudTaskFactory],
    }).compile();

    service = module.get<CloudTasks>(CloudTasksService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(service.accountTasks).toBeDefined();
  });
});
