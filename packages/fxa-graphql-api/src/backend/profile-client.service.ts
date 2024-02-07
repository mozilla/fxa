/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import AuthClient from 'fxa-auth-client';
import superagent from 'superagent';

import { AppConfig } from '../config';
import { Avatar } from '../gql/model/avatar';
import { AuthClientService } from './auth-client.service';

@Injectable()
export class ProfileClientService {
  private oauthClientId: string;
  private profileServerUrl: string;

  constructor(
    configService: ConfigService<AppConfig>,
    @Inject(AuthClientService) private authAPI: AuthClient
  ) {
    const oauthConfig = configService.get('oauth') as AppConfig['oauth'];
    const profileConfig = configService.get(
      'profileServer'
    ) as AppConfig['profileServer'];
    this.oauthClientId = oauthConfig.clientId;
    this.profileServerUrl = profileConfig.url;
  }

  private async fetchToken(headers: Headers, token: string) {
    const result = await this.authAPI.createOAuthToken(
      token,
      this.oauthClientId,
      {
        scope: 'profile:write clients:write',
      },
      headers
    );
    return result.access_token;
  }

  private async profilePostRequest(
    headers: Headers,
    token: string,
    path: string,
    data: object
  ): Promise<superagent.Response> {
    const accessToken = await this.fetchToken(headers, token);
    return superagent
      .post(this.profileServerUrl + path)
      .send(data)
      .set('Authorization', 'Bearer ' + accessToken);
  }

  public async updateDisplayName(
    headers: Headers,
    token: string,
    name: string
  ) {
    const result = await this.profilePostRequest(
      headers,
      token,
      '/display_name',
      {
        displayName: name,
      }
    );
    return result.text === '{}';
  }

  public async avatarUpload(
    headers: Headers,
    token: string,
    contentType: string,
    file: any
  ): Promise<Avatar> {
    const accessToken = await this.fetchToken(headers, token);
    const result = await superagent
      .post(this.profileServerUrl + '/avatar/upload')
      .set('Content-Type', contentType)
      .set('Authorization', 'Bearer ' + accessToken)
      .send(file);
    return result.body;
  }

  public async avatarDelete(headers: Headers, token: string, id?: string) {
    const accessToken = await this.fetchToken(headers, token);
    const result = await superagent
      .delete(this.profileServerUrl + '/avatar/' + id)
      .set('Authorization', 'Bearer ' + accessToken);

    return result.text === '{}';
  }

  public async getProfile(headers: Headers, token: string) {
    const accessToken = await this.fetchToken(headers, token);
    const result = await superagent
      .get(this.profileServerUrl + '/profile')
      .set('Authorization', 'Bearer ' + accessToken);
    return JSON.parse(result.text);
  }
}
