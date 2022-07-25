/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import superagent from 'superagent';

type AnyObject = Record<string, any>;

type CheckOptions = {
  email: string;
  ip: string;
  action: string;
  headers?: AnyObject;
  query?: AnyObject;
  payload?: AnyObject;
};

type CheckResponse = {
  block: boolean;
  blockReason?: string;
  suspect?: boolean;
  unblock?: boolean;
  retryAfter?: number;
};

@Injectable()
export class CustomsService {
  private customsUrl: string;

  constructor(configService: ConfigService) {
    const customsUrl = configService.get<string>('customsUrl');
    if (!customsUrl) {
      throw new Error('No customs URL provided.');
    }
    this.customsUrl = customsUrl;
  }

  async check(options: CheckOptions): Promise<CheckResponse> {
    if (this.customsUrl === 'none') {
      return { block: false };
    }
    const result = await superagent
      .post(this.customsUrl + '/check')
      .send(options)
      .ok((res) => res.status < 600);
    if (result.status < 200 || result.status >= 300) {
      console.log({ result });
      throw new Error('Customs server failed to respond as expected.');
    }
    const response = result.body as CheckResponse;
    if (response.block) {
      if (response.retryAfter) {
        // TODO: Create a localized retryAfter value like fxa-auth-server does.
        throw new HttpException(
          {
            code: 429,
            error: 'Too Many Requests',
            errno: 114,
            message: 'Client has sent too many requests',
          },
          HttpStatus.TOO_MANY_REQUESTS
        );
      }

      const errorStr = 'The request was blocked for security reasons';
      throw new BadRequestException(
        { error: 'Request blocked', errno: 125, code: 400, message: errorStr },
        errorStr
      );
    }
    return result.body;
  }
}
