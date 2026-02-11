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
    expect(mockMozLogLoggerFactory).toHaveBeenCalledWith('MozLoggerService');
  });

  it('sets context', () => {
    service.setContext('test');
    expect(mockMozLogLoggerFactory).toHaveBeenCalledWith('test');
  });

  it('logs info', () => {
    service.info('info');
    expect(mockMozLog.info).toBeCalledWith('info', {});
  });

  it('logs info with data', () => {
    service.info('info', { foo: 'bar', baz: 1 });
    expect(mockMozLog.info).toBeCalledWith('info', { foo: 'bar', baz: 1 });
  });

  it('logs info for atypical message', () => {
    service.info({ weird: 'message' }, { foo: 'bar', baz: 1 });
    expect(mockMozLog.info).toBeCalledWith('', {
      message: { weird: 'message' },
      '0': { foo: 'bar', baz: 1 },
    });
  });

  it('logs info for atypical number of args', () => {
    service.info({ weird: 'message' }, { foo: 'bar' }, { baz: 1 });
    expect(mockMozLog.info).toBeCalledWith('', {
      message: { weird: 'message' },
      '0': { foo: 'bar' },
      '1': { baz: 1 },
    });
  });

  it('logs debug', () => {
    service.debug('debug', { foo: 'bar', baz: 1 });
    expect(mockMozLog.debug).toBeCalledWith('debug', { foo: 'bar', baz: 1 });
  });
  it('logs error', () => {
    service.error('error', { foo: 'bar', baz: 1 });
    expect(mockMozLog.error).toBeCalledWith('error', { foo: 'bar', baz: 1 });
  });

  it('logs warn', () => {
    service.warn('warn', { foo: 'bar', baz: 1 });
    expect(mockMozLog.warn).toBeCalledWith('warn', { foo: 'bar', baz: 1 });
  });

  it('logs verbose', () => {
    service.verbose('verbose', { foo: 'bar', baz: 1 });
    expect(mockMozLog.verbose).toBeCalledWith('verbose', {
      foo: 'bar',
      baz: 1,
    });
  });

  it('logs trace', () => {
    service.trace('trace', { foo: 'bar', baz: 1 });
    expect(mockMozLog.trace).toBeCalledWith('trace', { foo: 'bar', baz: 1 });
  });

  it('logs warning', () => {
    service.warn('warning', { foo: 'bar', baz: 1 });
    expect(mockMozLog.warn).toBeCalledWith('warning', { foo: 'bar', baz: 1 });
  });
});
