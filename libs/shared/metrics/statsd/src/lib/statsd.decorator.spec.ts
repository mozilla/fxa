import { jest } from '@jest/globals';
import { CaptureTimingWithStatsD } from './statsd.decorator';
import { StatsD } from 'hot-shots';

class TestClass {
  public statsd: StatsD;

  constructor(private someCallback: (elapsed: number) => void) {
    this.statsd = new StatsD({
      mock: true,
    });
  }

  @CaptureTimingWithStatsD()
  syncMethod() {
    return 'Hello';
  }

  @CaptureTimingWithStatsD()
  async asyncMethod() {
    return new Promise((resolve) =>
      setTimeout(() => resolve('Async Hello'), 50)
    );
  }

  @CaptureTimingWithStatsD({
    handle(elapsed) {
      this.someCallback(elapsed);
    },
  })
  syncMethodWithCustomHandler() {
    return 'Custom Handler';
  }

  @CaptureTimingWithStatsD()
  syncMethodWithError() {
    throw new Error('Sync error');
  }

  @CaptureTimingWithStatsD()
  async asyncMethodWithError() {
    throw new Error('Async error');
  }
}

describe('CaptureTimingWithStatsD', () => {
  let instance: TestClass;
  let mockStatsD: StatsD;
  let mockCallback: jest.Mock;

  beforeEach(() => {
    mockCallback = jest.fn();
    instance = new TestClass(mockCallback);
    mockStatsD = instance.statsd;

    jest.spyOn(mockStatsD, 'timing');
  });

  it('should call statsd.timing for synchronous methods', () => {
    instance.syncMethod();
    expect(mockStatsD.timing).toHaveBeenCalledTimes(2);
    expect(mockStatsD.timing).toHaveBeenCalledWith(
      'TestClass_syncMethod',
      expect.any(Number),
      {
        sourceClass: 'TestClass',
        error: 'false',
      }
    );
  });

  it('should call statsd.timing for asynchronous methods', async () => {
    await instance.asyncMethod();
    expect(mockStatsD.timing).toHaveBeenCalledTimes(2);
    expect(mockStatsD.timing).toHaveBeenCalledWith(
      'TestClass_asyncMethod',
      expect.any(Number),
      {
        sourceClass: 'TestClass',
        error: 'false',
      }
    );
  });

  it('should call the callback function if a custom handler is provided', () => {
    instance.syncMethodWithCustomHandler();
    expect(mockCallback).toHaveBeenCalledTimes(1);
    expect(mockCallback).toHaveBeenCalledWith(expect.any(Number));
  });

  it('should track error=true for synchronous methods that throw', () => {
    expect(() => instance.syncMethodWithError()).toThrow('Sync error');
    expect(mockStatsD.timing).toHaveBeenCalledTimes(2);
    expect(mockStatsD.timing).toHaveBeenCalledWith(
      'TestClass_syncMethodWithError',
      expect.any(Number),
      {
        sourceClass: 'TestClass',
        error: 'true',
      }
    );
  });

  it('should track error=true for asynchronous methods that throw', async () => {
    await expect(instance.asyncMethodWithError()).rejects.toThrow('Async error');
    expect(mockStatsD.timing).toHaveBeenCalledTimes(2);
    expect(mockStatsD.timing).toHaveBeenCalledWith(
      'TestClass_asyncMethodWithError',
      expect.any(Number),
      {
        sourceClass: 'TestClass',
        error: 'true',
      }
    );
  });

  it('should track error=false for successful synchronous methods', () => {
    instance.syncMethod();
    expect(mockStatsD.timing).toHaveBeenCalledWith(
      'TestClass',
      expect.any(Number),
      {
        methodName: 'syncMethod',
        error: 'false',
      }
    );
  });

  it('should track error=false for successful asynchronous methods', async () => {
    await instance.asyncMethod();
    expect(mockStatsD.timing).toHaveBeenCalledWith(
      'TestClass',
      expect.any(Number),
      {
        methodName: 'asyncMethod',
        error: 'false',
      }
    );
  });
});
