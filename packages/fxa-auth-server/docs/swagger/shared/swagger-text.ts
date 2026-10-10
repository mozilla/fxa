/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/** Holds the place of a `\n` escape, so only the raw parts expand into a line
 * break, and the break arrives after the indentation scan and the trim. */
const LINE_BREAK = '\0';

/**
 * Tagged template that strips the common indentation from a multi-line string.
 *
 * Reads the raw strings, so a regular expression in a description keeps its
 * backslashes. `\n` still becomes a line break, and `` \` ``, `\$` and `\{`
 * still escape the template syntax. An interpolated value is inserted as it
 * is, so a `\n` inside a value stays literal. A trailing backslash is not a
 * line continuation. A line at column 0 sets the common indentation to zero,
 * where the `dedent` package reads the indented lines only.
 */
export default function swaggerText(
  strings: TemplateStringsArray,
  ...values: unknown[]
): string {
  const text = strings.raw
    .map((part) => part.replace(/\\([`${])/g, '$1').replace(/\\n/g, LINE_BREAK))
    .reduce((acc, part, i) => acc + String(values[i - 1]) + part);
  const lines = text.split('\n');
  const indents = lines.flatMap(
    (line) => /^[ \t]*(?=\S)/.exec(line)?.[0].length ?? []
  );
  const indent = indents.length ? Math.min(...indents) : 0;
  return lines
    .map((line) => (/^[ \t]/.test(line) ? line.slice(indent) : line))
    .join('\n')
    .trim()
    .replaceAll(LINE_BREAK, '\n');
}
