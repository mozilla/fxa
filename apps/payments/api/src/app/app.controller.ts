import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('__lbheartbeat__')
  __lbheartbeat__() {
    return this.appService.__lbheartbeat__();
  }

  @Get('__heartbeat__')
  __heartbeat__() {
    return this.appService.__heartbeat__();
  }

  @Get('__version__')
  __version__() {
    return this.appService.__version__();
  }
}
