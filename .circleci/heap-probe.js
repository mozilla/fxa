/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// Benchmark only. Preloaded into every Node process through NODE_OPTIONS
// (--require). Tracks the process's peak V8 heap and writes it, with the heap
// limit and peak RSS, to $HEAP_PROBE_DIR/<pid>.json when the process exits.
const fs = require('fs');
const path = require('path');
const v8 = require('v8');

const dir = process.env.HEAP_PROBE_DIR;
if (dir) {
  let peakHeap = 0;
  const sample = () => {
    peakHeap = Math.max(peakHeap, v8.getHeapStatistics().used_heap_size);
  };
  setInterval(sample, 250).unref();
  process.on('exit', () => {
    sample();
    try {
      fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(
        path.join(dir, `${process.pid}.json`),
        JSON.stringify({
          argv: process.argv.slice(1).join(' ').slice(0, 300),
          cwd: process.cwd(),
          peakHeapMb: Math.round(peakHeap / 2 ** 20),
          heapLimitMb: Math.round(v8.getHeapStatistics().heap_size_limit / 2 ** 20),
          maxRssMb: Math.round(process.resourceUsage().maxRSS / 1024),
        })
      );
    } catch (err) {
      // Never let the probe break the build.
    }
  });
}
