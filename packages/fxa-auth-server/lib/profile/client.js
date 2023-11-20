/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

import axios from 'axios';

const PATH_PREFIX = '/v1';

// Why is this subhub service vs "profile"?
const serviceName = 'subhub';

class Profile {
  constructor(log, config, error, statsd) {
    this.log = log;
    this.error = error;
    this.statsd = statsd;
    this.config = config;
    this.axiosInstance = axios.create({ baseURL: config.profileServer.url });

    // Authorization header is required for all requests to the profile server
    this.axiosInstance.defaults.headers.common[
      'Authorization'
    ] = `Bearer ${config.profileServer.secretBearerToken}`;
  }

  async makeRequest(endpoint, requestData, method) {
    if (!this.axiosInstance) {
      return;
    }

    try {
      await this.axiosInstance[method](endpoint, requestData);
      return {};
    } catch (err) {
      const response = err.response || {};
      if (err.errno > -1 || (response.status && response.status < 500)) {
        throw err;
      } else {
        throw this.error.backendServiceFailure(
          serviceName,
          method.toUpperCase(),
          { method: method.toUpperCase(), path: endpoint },
          err
        );
      }
    }
  }

  async deleteCache(uid) {
    try {
      return await this.makeRequest(
        `${PATH_PREFIX}/cache/${uid}`,
        {},
        'delete'
      );
    } catch (err) {
      this.log.error('profile.deleteCache.failed', { uid, err });
      throw err;
    }
  }

  async updateDisplayName(uid, name) {
    try {
      return await this.makeRequest(
        `${PATH_PREFIX}/_display_name/${uid}`,
        { name },
        'post'
      );
    } catch (err) {
      this.log.error('profile.updateDisplayName.failed', { uid, name, err });
      throw err;
    }
  }
}

module.exports = Profile;
