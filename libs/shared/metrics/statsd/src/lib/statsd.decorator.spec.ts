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
    expect(mockStatsD.timing).toHaveBeenCalledTimes(1);
    expect(mockStatsD.timing).toHaveBeenCalledWith(
      'TestClass_syncMethod',
      expect.any(Number),
      {
        sourceClass: 'TestClass',
      }
    );
  });

  it('should call statsd.timing for asynchronous methods', async () => {
    await instance.asyncMethod();
    expect(mockStatsD.timing).toHaveBeenCalledTimes(1);
    expect(mockStatsD.timing).toHaveBeenCalledWith(
      'TestClass_asyncMethod',
      expect.any(Number),
      {
        sourceClass: 'TestClass',
      }
    );
  });

  it('should call the callback function if a custom handler is provided', () => {
    instance.syncMethodWithCustomHandler();
    expect(mockCallback).toHaveBeenCalledTimes(1);
    expect(mockCallback).toHaveBeenCalledWith(expect.any(Number));
  });
});
