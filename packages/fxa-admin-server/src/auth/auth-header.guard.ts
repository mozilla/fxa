import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Request } from 'express';
import { Observable } from 'rxjs';

import { AppConfig } from '../config';

@Injectable()
export class GqlAuthHeaderGuard implements CanActivate {
  private authHeader: string;

  constructor(configService: ConfigService<AppConfig>) {
    this.authHeader = configService.get('authHeader') as string;
  }

  canActivate(
    context: ExecutionContext
  ): boolean | Promise<boolean> | Observable<boolean> {
    const ctx = GqlExecutionContext.create(context);
    const request = ctx.getContext().req as Request;
    const username = request.get(this.authHeader);
    if (username) {
      (request as any).user = username;
    }
    return !!username;
  }
}
