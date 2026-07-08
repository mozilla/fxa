import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AppService } from './app.service';

@ApiTags('Health Checks')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('__lbheartbeat__')
  @ApiOperation({ summary: 'Load balancer heartbeat' })
  @ApiResponse({ status: 200, description: 'Service is reachable' })
  __lbheartbeat__() {
    return this.appService.__lbheartbeat__();
  }

  @Get('__heartbeat__')
  @ApiOperation({ summary: 'Service heartbeat' })
  @ApiResponse({ status: 200, description: 'Service is healthy' })
  __heartbeat__() {
    return this.appService.__heartbeat__();
  }

  @Get('__version__')
  @ApiOperation({ summary: 'Version information' })
  @ApiResponse({ status: 200, description: 'Returns version info' })
  __version__() {
    return this.appService.__version__();
  }
}
