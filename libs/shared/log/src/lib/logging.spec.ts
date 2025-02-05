/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { createLogging, ILogger } from './logging';

describe('logging - winston', () => {
  // TODO: Add tests to ensure logging format is compliant
  //       with ETLs
});

describe('logging - mozlog', () => {
  const mockDateString = '2025-02-04T21:24:00.000Z';
  const mockDate = new Date(mockDateString);

  const logSpy = jest.spyOn(console, 'log');
  const globalDateSpy = jest.spyOn(global, 'Date').mockImplementation(() => {
    return mockDate;
  });

  let logger: ILogger;

  beforeAll(() => {
    logger = createLogging({
      level: 'debug',
      name: 'fxa',
      target: 'mozlog',
    });
  });

  afterEach(() => {
    logSpy.mockReset();
  });

  afterAll(() => {
    logSpy.mockRestore();
    globalDateSpy.mockRestore();
  });

  it('creates a logger', () => {
    expect(logger).toBeDefined();
  });

  it('logs a debug message with string', () => {
    logger.debug('test', 'foo bar');

    expect(console.log).toBeCalledTimes(1);
    expect(console.log).toBeCalledWith(
      `${mockDateString}: DEBUG fxa.test {"msg":"foo bar"}`
    );
  });

  it('logs a debug message with payload', () => {
    logger.debug('test', { foo: 1, bar: 'two' });

    expect(console.log).toBeCalledTimes(1);
    expect(console.log).toBeCalledWith(
      `${mockDateString}: DEBUG fxa.test {"foo":1,"bar":"two"}`
    );
  });

  it('logs a debug message with array of things', () => {
    logger.debug('test', ['foo', 'bar', 1, ['baz'], null, { biz: 'buz' }]);

    expect(console.log).toBeCalledTimes(1);
    expect(console.log).toBeCalledWith(
      `${mockDateString}: DEBUG fxa.test {"msg":"foo bar 1 baz null {\\"biz\\":\\"buz\\"}"}`
    );
  });

  it('logs a debug message with number', () => {
    logger.debug('test', `1`);

    expect(console.log).toBeCalledTimes(1);
    expect(console.log).toBeCalledWith(
      `${mockDateString}: DEBUG fxa.test {"msg":"1"}`
    );
  });

  it('logs a info message', () => {
    logger.info('test', { foo: 1, bar: 'two' });
    expect(console.log).toBeCalledTimes(1);
    expect(console.log).toBeCalledWith(
      `${mockDateString}: INFO fxa.test {"foo":1,"bar":"two"}`
    );
  });

  it('logs a warn message', () => {
    logger.warn('test', { foo: 1, bar: 'two' });
    expect(console.log).toBeCalledTimes(1);
    expect(console.log).toBeCalledWith(
      `${mockDateString}: WARN fxa.test {"foo":1,"bar":"two"}`
    );
  });

  it('logs an error message', () => {
    const error = new Error('Boom');
    logger.error('test', error);

    expect(console.log).toBeCalledTimes(1);
    expect(console.log).toBeCalledWith(
      expect.stringMatching(
        new RegExp(
          `${mockDateString}: ERROR fxa.test {"error":"Boom","stack":"Error: Boom.*`
        )
      )
    );
  });
});
