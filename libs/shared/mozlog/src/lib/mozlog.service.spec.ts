/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { MozLoggerService } from './mozlog.service';

const mockMozLog = {
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn(),
  verbose: jest.fn(),
  trace: jest.fn(),
  warning: jest.fn(),
};
const mockMozLogLoggerFactory = jest.fn().mockReturnValue(mockMozLog);
const mockMozLogDefault = jest.fn().mockReturnValue(mockMozLogLoggerFactory);

jest.mock('mozlog', () => {
  return (...args: any) => {
    return mockMozLogDefault(...args);
  };
});

describe('MozLoggerService', () => {
  let service: MozLoggerService;

  const mockConfig = {
    app: 'fxa-test',
    level: 'info',
    fmt: 'heka',
  };
  const mockConfigService = {
    get: jest.fn().mockImplementation((key: string) => {
      if (key === 'log') {
        return mockConfig;
      }
      return null;
    }),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MozLoggerService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = await module.resolve<MozLoggerService>(MozLoggerService);
  });

  it('should be defined', async () => {
    expect(service).toBeDefined();
    expect(service).toBeInstanceOf(MozLoggerService);
    expect(mockMozLogDefault).toHaveBeenCalledWith(mockConfig);
    expect(mockMozLogLoggerFactory).toHaveBeenCalledWith('default');
  });

  it('sets context', () => {
    service.setContext('test');
    expect(mockMozLogLoggerFactory).toHaveBeenCalledWith('test');
  });

  it('logs info', () => {
    service.info('info', {});
    expect(mockMozLog.info).toBeCalledWith('', { message: 'info', '0': {} });
  });

  it('logs debug', () => {
    service.debug('debug', {});
    expect(mockMozLog.debug).toBeCalledWith('', { message: 'debug', '0': {} });
  });
  it('logs error', () => {
    service.error('error', {});
    expect(mockMozLog.error).toBeCalledWith('', { message: 'error', '0': {} });
  });

  it('logs warn', () => {
    service.warn('warn', {});
    expect(mockMozLog.warn).toBeCalledWith('', { message: 'warn', '0': {} });
  });

  it('logs verbose', () => {
    service.verbose('verbose', {});
    expect(mockMozLog.verbose).toBeCalledWith('', {
      message: 'verbose',
      '0': {},
    });
  });

  it('logs trace', () => {
    service.trace('trace', {});
    expect(mockMozLog.trace).toBeCalledWith('', { message: 'trace', '0': {} });
  });

  it('logs warning', () => {
    service.warn('warning', {});
    expect(mockMozLog.warn).toBeCalledWith('', { message: 'warning', '0': {} });
  });
});
