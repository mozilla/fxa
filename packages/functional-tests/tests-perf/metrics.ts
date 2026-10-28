/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

type V8Range = { startOffset: number; endOffset: number; count: number };

export const median = (xs: number[]) => {
  const s = [...xs].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return Math.round(s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2);
};

// Same rule as the DevTools Coverage panel: innermost V8 range wins.
export function usedBytes(src: string, functions: { ranges: V8Range[] }[]) {
  const counts = new Uint32Array(src.length).fill(1);
  const ranges = functions
    .flatMap((f) => f.ranges)
    .sort((a, b) => a.startOffset - b.startOffset || b.endOffset - a.endOffset);
  for (const r of ranges) counts.fill(r.count, r.startOffset, r.endOffset);
  let used = 0;
  for (const c of counts) if (c > 0) used++;
  return used;
}
