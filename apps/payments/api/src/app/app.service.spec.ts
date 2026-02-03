import { Test } from '@nestjs/testing';
import { AppService } from './app.service';

describe('AppService', () => {
  let service: AppService;

  beforeAll(async () => {
    const app = await Test.createTestingModule({
      providers: [AppService],
    }).compile();

    service = app.get<AppService>(AppService);
  });

  describe('service status endpoints', () => {
    it('__heartbeat__ should return empty object', () => {
      expect(service.__heartbeat__()).toEqual({});
    });

    it('__lbheartbeat__ should return empty object', () => {
      expect(service.__lbheartbeat__()).toEqual({});
    });

    it('__version__ should return version object', () => {
      expect(service.__version__()).toEqual({ version: '0.0.0' });
    });
  });
});
