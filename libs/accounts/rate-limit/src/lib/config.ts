import { duration, unitOfTime } from 'moment';
import { IsArray, IsString } from 'class-validator';
import { BlockOn, Rule } from './models';
import { InvalidRule } from './error';
import { getKey } from './util';

/**
 * An injectable config class.
 */
export class RateLimitConfig {
  @IsString()
  @IsArray()
  rules!: Array<string> | string;

  @IsArray()
  ignoreIPs!: Array<string>;

  @IsArray()
  ignoreEmails!: Array<string>;

  @IsArray()
  ignoreUIDs!: Array<string>;
}

/**
 * Takes a set of rules in condensed format and parses them. This can be array with one line per rule,
 * or string with one rule per new line.
 *
 * Rules look like this:
 *
 *   ${action}:${blockOn}:${maxAttempts}:${windowDuration}:${banDuration}
 *
 * @param rules A string or array or rules. In the case of a string, rules can be separated with newlines.
 * @returns A set of rules grouped by action.
 */
export function parseConfigRules(
  rules: string[] | string
): Record<string, Rule[]> {
  // Allow arrays of rules, or rules separated by new lines.
  if (typeof rules === 'string') {
    rules = rules.split('\n');
  }

  // Loop overrules and group by the rule's action value.
  const ruleMap: Record<string, Rule[]> = {};
  const keys: Array<string> = [];
  let lineNumber = 0;
  for (let line of rules) {
    lineNumber++;
    // Clean up whitespace first.
    line = line.trim();

    // Allow for comments
    if (line.startsWith('#')) {
      continue;
    }

    // Skip over blank lines
    if (line.length === 0) {
      continue;
    }

    const parts = line.split(':').map((x) => x.trim());

    if (parts.length !== 5) {
      throw new InvalidRule(
        `Issue detected on line ${lineNumber}. Rules must have 5 parts separated delimited by :. `,
        line
      );
    }

    const rule = {
      action: parts[0] as string,
      blockingOn: parts[1] as BlockOn,
      maxAttempts: Number.parseInt(parts[2]),
      windowDurationInSeconds: convertDurationToSeconds(parts[3]),
      blockDurationInSeconds: convertDurationToSeconds(parts[4]),
    } satisfies Rule;

    // A couple sanity checks to catch bad rule configuration
    if (!/^[a-zA-Z]*$/.test(rule.action)) {
      throw new InvalidRule(
        `Actions can only contain characters a-zA-Z.`,
        line
      );
    }
    if (!/^ip$|^uid$|^email$/.test(rule.blockingOn)) {
      throw new InvalidRule(`Blocking on must be ip, email, or uid.`, line);
    }
    if (
      rule.maxAttempts.toString() === 'NaN' ||
      rule.maxAttempts < 1 ||
      rule.maxAttempts > 10000
    ) {
      throw new InvalidRule(
        `Max attempts must be a number between 1 and 10000.`,
        line
      );
    }
    if (
      rule.windowDurationInSeconds.toString() === 'NaN' ||
      rule.windowDurationInSeconds < 1
    ) {
      throw new InvalidRule(
        `Window duration must be a duration greater than 1 seconds.`,
        line
      );
    }
    if (
      rule.blockDurationInSeconds.toString() === 'NaN' ||
      rule.blockDurationInSeconds < 1
    ) {
      throw new InvalidRule(
        `Block duration must be a duration greater than 1 seconds.`,
        line
      );
    }

    // Add the rule to the map.
    if (ruleMap[rule.action]) {
      ruleMap[rule.action].push(rule);
    } else {
      ruleMap[rule.action] = [rule];
    }

    keys.push(getKey('attempts', rule, 'check'));
  }

  checkForDuplicates(keys);

  return ruleMap;
}

function checkForDuplicates(arr: (string | number)[]) {
  const seen = new Set();
  const duplicates = new Set();

  for (const value of arr) {
    if (seen.has(value)) {
      duplicates.add(value);
    } else {
      seen.add(value);
    }
  }

  if (duplicates.size > 0) {
    throw new Error(
      'Invalid configuration! Duplicates detected: \n' +
        Array.from(duplicates).join('\n')
    );
  }
}

/**
 * Uses duration notation to parse a human readable value into seconds. e.g.
 *  '1 minute' would turin be returned as 60
 *  '1 hour' returns 3600
 * @param val Human readable duration. Eg. 15 minutes
 * @returns The number of seconds in that duration.
 */
function convertDurationToSeconds(val: string) {
  const time = val
    .trim()
    .slice(0, 1000)
    .replace(/[^0-9\.\s]*$/g, '');
  let unit = val
    .trim()
    .slice(0, 1000)
    .replace(/^[0-9\.\s]*/g, '') as unitOfTime.Base;
  if (!unit) {
    unit = 'ms';
  }
  return duration(time, unit).asSeconds();
}
