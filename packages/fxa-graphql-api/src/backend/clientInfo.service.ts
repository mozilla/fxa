/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { ConfigService } from '@nestjs/config';
import { AppConfig } from '../config';
import { Injectable } from '@nestjs/common';
import { ClientInfo } from '../gql/dto/payload';

@Injectable()
export class ClientInfoService {
  private authServerUrl: string;

  constructor(configService: ConfigService<AppConfig>) {
    const authServerConfig = configService.get(
      'authServer'
    ) as AppConfig['authServer'];
    this.authServerUrl = authServerConfig.url;
  }

  async getClientInfo(clientId: string): Promise<ClientInfo> {
    const emptyClientInfo = {
      clientId: '',
      imageUri: '',
      serviceName: '',
      redirectUri: '',
      trusted: false,
    };

    if (!clientId) {
      return emptyClientInfo;
    }
    // TODO: Moved to using routine in shared libs instead of relying auth server
    const endpoint = `/client/${clientId}`;
    const response = await fetch(`${this.authServerUrl}${endpoint}`);

    if (response.status === 200) {
      const json = await response.json();
      return {
        clientId: json.id,
        serviceName: json.name,
        trusted: json.trusted,
        imageUri: json.image_uri,
        redirectUri: json.redirect_uri,
      };
    }

    if (response.status === 404) {
      return emptyClientInfo;
    }

    throw new Error(
      `Failed to fetch client info for client ID ${clientId}. Encountered unexpected error, ${response.status}.`
    );
  }
}
