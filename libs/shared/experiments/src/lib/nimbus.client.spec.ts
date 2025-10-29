/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Test } from '@nestjs/testing';
import { NimbusClient } from './nimbus.client';
import { MockNimbusClientConfig, NimbusClientConfig } from './nimbus.config';
import { MockStatsDProvider } from '@fxa/shared/metrics/statsd';
import {
  NimbusContextFactory,
  NimbusEnrollmentFactory,
  NimbusResultFactory,
} from './nimbus.factories';
import {
  NimbusClientFetchExperimentsHandledError,
  NimbusClientFetchExperimentsUnexpectedError,
} from './nimbus.errors';

describe('NimbusClient', () => {
  let nimbusClient: NimbusClient;

  const mockNimbusClientConfig = MockNimbusClientConfig;
  const mockContext = NimbusContextFactory();
  const mockEnrollment = NimbusEnrollmentFactory();
  const mockResult = NimbusResultFactory({
    Enrollments: [mockEnrollment],
  });
  const nimbusUserId = mockEnrollment.nimbus_user_id;
  const mockFetchExperimentsParams = {
    clientId: nimbusUserId,
    context: mockContext,
  };

  beforeEach(async () => {
    global.fetch = jest.fn();

    const module = await Test.createTestingModule({
      providers: [
        NimbusClient,
        {
          provide: NimbusClientConfig,
          useValue: mockNimbusClientConfig,
        },
        MockStatsDProvider,
      ],
    }).compile();

    nimbusClient = module.get(NimbusClient);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('fetchExperiments', () => {
    beforeEach(() => {
      (fetch as jest.Mock).mockResolvedValue({
        json: () => Promise.resolve(mockResult),
        ok: true,
        status: 200,
      });
    });

    it('successfully returns experiments from Nimbus', async () => {
      const result = await nimbusClient.fetchExperiments(
        mockFetchExperimentsParams
      );
      expect(result).toEqual(mockResult);
      expect(fetch).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          body: JSON.stringify({
            client_id: nimbusUserId,
            context: mockContext,
          }),
        })
      );
    });

    it('successfully calls with preview enabled', async () => {
      mockNimbusClientConfig.previewEnabled = true;
      const expectedUrl =
        mockNimbusClientConfig.apiUrl + '?nimbus_preview=true';
      await nimbusClient.fetchExperiments(mockFetchExperimentsParams);
      expect(fetch).toHaveBeenCalledWith(expectedUrl, expect.anything());
    });

    it('successfully calls with preview disabled', async () => {
      mockNimbusClientConfig.previewEnabled = false;
      const expectedUrl =
        mockNimbusClientConfig.apiUrl + '?nimbus_preview=false';
      await nimbusClient.fetchExperiments(mockFetchExperimentsParams);
      expect(fetch).toHaveBeenCalledWith(expectedUrl, expect.anything());
    });

    it('throws a handled error', async () => {
      const errorData = { message: 'Handled error' };
      const expectedError = new NimbusClientFetchExperimentsHandledError(
        errorData,
        mockFetchExperimentsParams
      );
      (fetch as jest.Mock).mockResolvedValue({
        json: () => Promise.resolve(errorData),
        ok: false,
        status: 400,
      });
      await expect(
        nimbusClient.fetchExperiments(mockFetchExperimentsParams)
      ).rejects.toThrow(expectedError);
    });

    it('throws unhandled error', async () => {
      const unexpectedError = new Error('unexpected error');
      const expectedError = new NimbusClientFetchExperimentsUnexpectedError(
        unexpectedError,
        mockFetchExperimentsParams
      );
      (fetch as jest.Mock).mockRejectedValue(unexpectedError);
      await expect(
        nimbusClient.fetchExperiments(mockFetchExperimentsParams)
      ).rejects.toThrow(expectedError);
    });
  });
});
