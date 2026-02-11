/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

class Timers {
  init(options) {
    this.completed = {};
    this.running = {};
    this.baseTime = Date.now();
  }

  start(name) {
    var start = Date.now();
    if (typeof this.running[name] === 'number') {
      throw new Error(name + ' timer already started');
    }

    this.running[name] = start;
  }

  stop(name) {
    var stop = Date.now();

    if (typeof this.running[name] !== 'number') {
      throw new Error(name + ' timer not started');
    }

    if (!this.completed[name]) this.completed[name] = [];
    var start = this.running[name];

    this.completed[name].push({
      start: start - this.baseTime,
      stop: stop - this.baseTime,
      elapsed: stop - start,
    });

    this.running[name] = null;
    delete this.running[name];
  }

  get(name) {
    if (!name) return this.completed;
    return this.completed[name];
  }

  clear() {
    this.completed = {};
    this.running = {};
  }
}

export default new Timers();
