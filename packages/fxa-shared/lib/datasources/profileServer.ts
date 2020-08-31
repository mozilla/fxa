/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { DataSource, DataSourceConfig } from 'apollo-datasource';
import AuthClient from 'fxa-auth-client';
import superagent from 'superagent';
import { Container } from 'typedi';

import { configContainerToken, fxAccountClientToken } from '../constants';
import { Context } from '../server';

export class ProfileServerSource extends DataSource {
  private authClient: AuthClient;
  private oauthToken: String | undefined;
  private oauthClientId: string;
  private profileServerUrl: string;

  constructor(private token: string = '') {
    super();
    this.authClient = Container.get(fxAccountClientToken);
    const config = Container.get(configContainerToken).getProperties();
    this.oauthClientId = config.oauth.clientId;
    this.profileServerUrl = config.profileServer.url;
  }

  initialize(config: DataSourceConfig<Context>) {
    this.token = config.context.token;
  }

  // Attempt to avoid re-fetches of tokens for multiple mutations in a request
  private async fetchToken() {
    if (this.oauthToken) {
      return this.oauthToken;
    }
    const result = await this.authClient.createOAuthToken(
      this.token,
      this.oauthClientId,
      {
        scope: 'profile:write clients:write',
      }
    );
    this.oauthToken = result.access_token;
    return this.oauthToken;
  }

  private async profilePostRequest(
    path: string,
    data: object
  ): Promise<superagent.Response> {
    const accessToken = await this.fetchToken();
    return superagent
      .post(this.profileServerUrl + path)
      .send(data)
      .set('Authorization', 'Bearer ' + accessToken);
  }

  public async updateDisplayName(name: string) {
    const result = await this.profilePostRequest('/display_name', {
      displayName: name,
    });
    return result.text === '{}';
  }

  public async avatarUpload(contentType: string, file: any): Promise<string> {
    const accessToken = await this.fetchToken();
    const result = await superagent
      .post(this.profileServerUrl + '/avatar/upload')
      .set('Content-Type', contentType)
      .set('Authorization', 'Bearer ' + accessToken)
      .send(file);
    return result.body.url;
  }
}
