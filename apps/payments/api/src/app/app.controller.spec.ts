import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let app: TestingModule;

  beforeAll(async () => {
    app = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();
  });

  describe('service status endpoints', () => {
    it('__heartbeat__ should return empty object', () => {
      const appController = app.get<AppController>(AppController);
      expect(appController.__heartbeat__()).toEqual({});
    });

    it('__lbheartbeat__ should return empty object', () => {
      const appController = app.get<AppController>(AppController);
      expect(appController.__lbheartbeat__()).toEqual({});
    });

    it('__version__ should return version object', () => {
      const appController = app.get<AppController>(AppController);
      expect(appController.__version__()).toEqual({ version: '0.0.0' });
    });
  });
});
