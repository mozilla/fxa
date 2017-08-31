/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */


function Scope(arr) {
  if (arr instanceof Scope) {
    return arr;
  } else if (! (this instanceof Scope)) {
    return new Scope(arr);
  }
  if (! arr) {
    arr = [];
  } else if (typeof arr === 'string') {
    arr = arr.split(/\s+/);
  }
  var obj = {};
  for (var i = 0; i < arr.length; i++) {
    obj[arr[i]] = true;
  }
  this._values = obj;
}

Scope.prototype = {

  _values: undefined,

  has: function has(scope) {
    return Scope(scope).values().every(function(word) {
      if (! word || word.lastIndexOf(':') === word.length - 1) {
        return false;
      } else if (word in this._values || word + ':write' in this._values) {
        return true;
      } else {
        var parts = word.split(':');
        var suffix = parts.pop();
        if (suffix === 'write') {
          // pop the next one off
          // but still require this to be a 'write' scope
          if (parts.pop()) {
            parts.push('write');
          } else {
            // this was a weird scope. don't try to fix it, just say NO!
            return false;
          }
        }
        var prefix = parts.join(':');
        return prefix && this.has(prefix);
      }
    }, this);
  },

  values: function values() {
    return Object.keys(this._values);
  },

  toString: function toString() {
    return this.values().join(' ');
  },

  toJSON: function toJSON() {
    return this.values();
  }

};


module.exports = Scope;
