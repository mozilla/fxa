/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import mozlog from 'mozlog';

import { MozLoggerService } from './logger.service';

describe('LoggerService', () => {
  const methods = ['info', 'error', 'warn', 'debug', 'verbose'];
  let service: MozLoggerService;
  let mocklog: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          load: [
            () => ({
              env: 'development',
              log: { app: 'test' },
            }),
          ],
        }),
      ],
      providers: [MozLoggerService],
    }).compile();

    service = await module.resolve<MozLoggerService>(MozLoggerService);
    mocklog = {};
    for (const method of methods) {
      mocklog[method] = jest.fn();
    }
    (service as any).mozlog = mocklog;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('sets context', () => {
    const mockMozlog = jest.fn().mockReturnValue('test');
    (service as any).setLogfactory(mockMozlog);
    service.setContext('test');
    expect(mockMozlog).toBeCalledWith('test');
  });

  describe('handler', () => {
    for (const method of methods) {
      it('logs for ' + method, () => {
        (service as any)[method]('test', { test: 1234 });
        expect(mocklog[method]).toBeCalledWith('test', { test: 1234 });
      });
    }
  });
});
