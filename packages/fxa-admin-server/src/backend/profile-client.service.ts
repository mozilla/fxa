/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import superagent from 'superagent';

import { AppConfig } from '../config';

@Injectable()
export class ProfileClientService {
  private profileServerUrl: string;
  private profileServerToken: string;

  constructor(configService: ConfigService<AppConfig>) {
    const profileConfig = configService.get(
      'profileServer'
    ) as AppConfig['profileServer'];
    this.profileServerUrl = profileConfig.url;
    this.profileServerToken = profileConfig.secretBearerToken;
  }

  async deleteCache(uid: string) {
    const result = await superagent
      .delete(this.profileServerUrl + `/cache/${uid}`)
      .set('Authorization', 'Bearer ' + this.profileServerToken);
    return JSON.parse(result.text);
  }
}
