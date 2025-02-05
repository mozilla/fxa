/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import Transport from 'winston-transport';

/**
 * Key that winston uses to hold data passed to logger
 */
const splat = Symbol.for('splat');

/**
 * Transport that strives to be mostly backwards compatible with mozlog
 */
export class MozLogConsoleTransport extends Transport {
  private name;

  constructor(
    opts: Transport.TransportStreamOptions & {
      name: string;
    }
  ) {
    super(opts);
    this.name = opts.name;
  }

  override log(info: any, callback: () => void) {
    setImmediate(() => this.emit('logged', info));
    const logLine = formatMozlog(this.name, info);
    console.log(logLine);
    callback();
  }
}

// These are legacy implementations ported from mozlog. The goal here is to ensure the winston logger
// produces a similar output. This is a work in progress. The current implemention most addresses the
// json payload printed out by the logger
// See https://github.com/mozilla/mozlog/ for exact details

/**
 * Converts winston logger data into backwards compatible mozlog output
 * @param baseName The name of the current logger
 * @param info The winston info object
 * @returns A string formatted log line
 */
function formatMozlog(baseName: string, info: any) {
  let type = info.message || 'unknown';

  const extractSplat = (splatValue: any): string | any => {
    if (splatValue == null) {
      return 'null';
    }
    if (typeof splatValue === 'string') {
      return splatValue;
    }
    if (typeof splatValue === 'number') {
      return '' + splatValue;
    }
    if (typeof splatValue === 'object') {
      if (splatValue instanceof Error) {
        // For some reason winston appends the error message to the info.message.
        // Doing this 'breaks' the mozlog 'type', so a correction is made
        // to the 'type' variable in the above scope.
        type = info.message.replace(' ' + splatValue.message, '');
        return {
          error: splatValue.message,
          stack: splatValue.stack,
        };
      }
      if (splatValue instanceof Array) {
        const transformed = splatValue.map((x) => extractSplat(x));
        if (transformed.length === 1) {
          return transformed[0];
        }
        return transformed;
      }
      return splatValue;
    }
    return '';
  };

  // Formatting logic based around formatting found on github.com/mozilla/mozlog
  const mozPayload = (() => {
    const extracted = extractSplat(info[splat]);
    if (typeof extracted === 'string') {
      return { msg: extracted };
    }
    if (extracted instanceof Array) {
      return { msg: extracted.map((x) => serialize(x)).join(' ') };
    }
    return extracted;
  })();

  return `${
    info.timestamp
  }: ${info.level?.toUpperCase()} ${baseName}.${type} ${json(mozPayload)}`;
}

// Again these are ported legacy implementation. May as well keep them just incase they
// addressed known edge cases
function json(obj: any) {
  const seen: any[] = [];
  return JSON.stringify(
    obj,
    function filter(key, val) {
      if (Buffer.isBuffer(this[key])) {
        // `val` in this case is the toJSON result on Buffer, an array of 8-bit
        // integers. Instead, the hex format is more compact and just as useful.
        // A string value would not match the object check below, so return now.
        return this[key].toString('hex');
      }

      if (typeof val === 'object' && val != null) {
        if (seen.indexOf(val) !== -1) {
          return '[Circular]';
        }
        seen.push(val);
      }
      return val;
    },
    0
  );
}
function serialize(val: any) {
  var t = typeof val;
  if (t === 'number' || t === 'string' || t === 'boolean') {
    // val is fine
  } else if (val instanceof Error) {
    val = String(val);
  } else if (Buffer.isBuffer(val)) {
    val = val.toString('hex');
  } else {
    val = json(val);
  }
  return val;
}
