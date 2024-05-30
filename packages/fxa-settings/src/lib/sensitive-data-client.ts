/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/**
 * Class representing a client for handling sensitive data.
 *
 * @class
 */
export class SensitiveDataClient {
  /**
   * Object to store sensitive data.
   * @private
   */
  private sensitiveData: { [key: string]: object } = {};

  /**
   * Create a SensitiveDataClient.
   * @constructor
   */
  constructor() {
    this.sensitiveData = {};
  }

  /**
   * Set data in the sensitiveData object.
   * @param {string} key - The key under which the data should be stored.
   * @param {any} value - The data to be stored.
   */
  setData(key: string, value: any): void {
    this.sensitiveData[key] = value;
  }

  /**
   * Get data from the sensitiveData object.
   * @param {string} key - The key under which the data is stored.
   * @return {any} The data stored under the provided key.
   */
  getData(key: string): any {
    return this.sensitiveData[key];
  }
}
