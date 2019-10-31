/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import md5 = require('js-md5');

class BaseGroupingRule {
  public name: string = '';
  public deprecated: boolean = false;

  /**
   * Return a 32 bit hash of `key`
   *
   * @param {String} key
   * @returns {Number}
   */
  public hash(key: string): number {
    // md5 returns 32 hex bytes, we want 32 bits. 32bits = 8 hex bytes.
    const hash = md5(`${this.name}:${key}`).substr(0, 8);
    return parseInt(hash, 16);
  }

  /**
   * Return a number in the range [0,1], using `key` as a stable identifier.
   * The same number is always returned for the same `key`.
   *
   * @param {String} key
   * @returns {Number}
   */
  public luckyNumber(key: string): number {
    // hash returns a 32 bit value, divide by 2^32 to
    // ensure the number is between 0 and 1.
    return this.hash(key) / 0xffffffff;
  }

  /**
   * Decide membership in a trial using `key` as a stable identifier.
   *
   * @param {Number} percent in the range [0,1]
   * @param {String} key
   * @returns {Boolean}
   */
  public bernoulliTrial(percent: number, key: string): boolean {
    return this.luckyNumber(key) <= percent;
  }

  /**
   * Make a uniform choice amongst `choices` using `key` as a stable identifier.
   *
   * @param {String[]} choices
   * @param {String} key
   * @returns {String}
   */
  public uniformChoice(choices: string[], key: string): string {
    return choices[this.hash(key) % choices.length];
  }

  /**
   * Use `subject` data to make a choice.
   *
   * @param {Object} subject data used to decide
   */
  public choose(subject: object): string | boolean {
    if (this.deprecated) {
      throw new Error(`Experiment deprecated: ${this.name}`);
    }
    throw new Error('choose must be overridden');
  }

  /**
   * Is this a test email?
   *
   * @param {String} email
   * @returns {Boolean}
   */
  public isTestEmail(email: string): boolean {
    return (
      /.+@softvision\.(com|ro)$/.test(email) ||
      /.+@mozilla\.(com|org)$/.test(email)
    );
  }
}

export default BaseGroupingRule;
