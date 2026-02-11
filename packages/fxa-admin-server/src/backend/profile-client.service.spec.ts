/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { ProfileClient } from '@fxa/profile/client';
import { Test, TestingModule } from '@nestjs/testing';
import { MockConfig, MockLogService, MockMetricsFactory } from '../mocks';
import { ProfileClientFactory } from './profile-client.service';

describe('ProfileClient Service', () => {
  let service: ProfileClient;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MockConfig,
        MockLogService,
        MockMetricsFactory,
        ProfileClientFactory,
      ],
    }).compile();

    service = module.get<ProfileClient>(ProfileClient);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
