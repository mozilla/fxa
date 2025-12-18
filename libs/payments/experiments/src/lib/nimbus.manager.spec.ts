/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Test } from '@nestjs/testing';
import {
  NimbusClient,
  MockNimbusClientConfigProvider,
  NimbusEnrollmentFactory,
  NimbusContextFactory,
  generateNimbusId,
} from '@fxa/shared/experiments';
import { MockStatsDProvider } from '@fxa/shared/metrics/statsd';
import { NimbusManager } from './nimbus.manager';
import { SubPlatNimbusResultFactory } from './nimbus.factories';
import { faker } from '@faker-js/faker/.';
import {
  MockNimbusManagerConfig,
  NimbusManagerConfig,
} from './nimbus.manager.config';
import { Logger } from '@nestjs/common';

jest.mock('@fxa/shared/experiments', () => {
  const originalModule = jest.requireActual('@fxa/shared/experiments');

  //Mock the default export and named export 'foo'
  return {
    __esModule: true,
    ...originalModule,
    generateNimbusId: jest.fn(),
  };
});
const mockedGenerateNimbusId = jest.mocked(generateNimbusId);

describe('NimbusClient', () => {
  let nimbusClient: NimbusClient;
  let nimbusManager: NimbusManager;

  const mockNimbusManagerConfig = MockNimbusManagerConfig;

  beforeEach(async () => {
    global.fetch = jest.fn();

    const module = await Test.createTestingModule({
      providers: [
        NimbusClient,
        MockNimbusClientConfigProvider,
        MockStatsDProvider,
        {
          provide: NimbusManagerConfig,
          useValue: mockNimbusManagerConfig,
        },
        NimbusManager,
        {
          provide: Logger,
          useValue: {
            error: jest.fn(),
            log: jest.fn(),
          },
        },
      ],
    }).compile();

    nimbusClient = module.get(NimbusClient);
    nimbusManager = module.get(NimbusManager);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('fetchExperiments', () => {
    const mockContext = NimbusContextFactory();
    const mockEnrollment = NimbusEnrollmentFactory();
    const mockFetchExperimentsResult = SubPlatNimbusResultFactory({
      Enrollments: [mockEnrollment],
    });
    const nimbusUserId = mockEnrollment.nimbus_user_id;
    const mockFetchExperimentsParams = {
      nimbusUserId,
      language: mockContext.language || undefined,
      region: mockContext.region || undefined,
    };

    beforeEach(() => {
      mockNimbusManagerConfig.enabled = true;
      jest
        .spyOn(nimbusClient, 'fetchExperiments')
        .mockResolvedValue(mockFetchExperimentsResult);
    });

    it('successfully returns experiments data', async () => {
      const result = await nimbusManager.fetchExperiments(
        mockFetchExperimentsParams
      );
      expect(result).toEqual(mockFetchExperimentsResult);
      expect(nimbusClient.fetchExperiments).toHaveBeenCalledWith({
        clientId: nimbusUserId,
        context: mockContext,
      });
    });

    it('returns null if not enabled', async () => {
      mockNimbusManagerConfig.enabled = false;
      const result = await nimbusManager.fetchExperiments(
        mockFetchExperimentsParams
      );
      expect(result).toBeNull();
    });

    it('throws an error', async () => {
      const expectedError = new Error('unexpected error');
      jest
        .spyOn(nimbusClient, 'fetchExperiments')
        .mockRejectedValue(expectedError);
      await expect(
        nimbusManager.fetchExperiments(mockFetchExperimentsParams)
      ).rejects.toThrow(expectedError);
    });
  });

  describe('generateNimbusId', () => {
    const mockFxaUid = faker.string.uuid();
    const mockNimbusUserId = faker.string.uuid();
    const mockHeaderExperimentId = faker.string.uuid();
    beforeEach(() => {
      mockedGenerateNimbusId.mockReturnValue(mockNimbusUserId);
    });

    it('successfully returns nimbus user id using fxaUid', () => {
      const result = nimbusManager.generateNimbusId(mockFxaUid);
      expect(result).toEqual(mockNimbusUserId);
      expect(mockedGenerateNimbusId).toHaveBeenCalledWith(
        mockNimbusManagerConfig.namespace,
        mockFxaUid
      );
    });

    it('successfully returns nimbus user id using header experiment id', () => {
      const result = nimbusManager.generateNimbusId(
        undefined,
        mockHeaderExperimentId
      );
      expect(result).toEqual(mockHeaderExperimentId);
      expect(mockedGenerateNimbusId).not.toHaveBeenCalled();
    });

    it('successfully returns nimbus user id newly generated', () => {
      const result = nimbusManager.generateNimbusId();
      expect(result).toEqual(mockNimbusUserId);
      expect(mockedGenerateNimbusId).toHaveBeenCalledWith(
        mockNimbusManagerConfig.namespace
      );
    });
  });
});
