import { Test, TestingModule } from '@nestjs/testing';
import { HealthController } from './health.controller';
import { version } from '../version';

describe('Health Controller', () => {
  let controller: HealthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
    }).compile();

    controller = module.get<HealthController>(HealthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return heartbeat', () => {
    expect(controller.heartbeat()).toStrictEqual({});
  });

  it('should return the version', () => {
    const source = controller.versionData().source;
    expect(source).toBe(version.source);
  });
});
