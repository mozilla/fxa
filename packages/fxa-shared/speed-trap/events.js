/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

class Events {
  init(options) {

    if (!options || !options.performance) {
      throw new Error('options.performance is required!')
    }

    this.performance = options.performance;
    this.baseTime = options.performance.timing.timeOrigin;
    this.events = [];
  }

  capture(name) {
    this.events.push({
      type: name,
      offset: this.performance.now(),
    });
  }

  get() {
    return this.events;
  }

  clear() {
    this.events = [];
  }
}

export default new Events();
