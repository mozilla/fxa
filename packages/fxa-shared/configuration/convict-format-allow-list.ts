/**
 * Defines a format of name 'allowlist' for convict configurations that parses and coerces an allow list. Allow list represent
 * wild card strings that can be used to validate allowed hostnames.
 */
export const format = {
  allowlist: {
    name: 'allowlist',
    validate: function validate(val: string) {
      const rules = val
        .split(',')
        .map((x) => x.trim())
        .filter((x) => !!x);

      rules.forEach((rule) => {
        // Prevent post fix rules, i.e foo.*
        if (/\.\*$/.test(rule)) {
          throw new Error('Rule cannot end with .*');
        }

        const fragments = rule.split('.').map((x) => x.trim());

        // Prevent empty rules ie '. .'
        if (fragments.some((x) => x === '')) {
          throw new Error('Rule cannot contain empty fragments.');
        }
      });
    },
    coerce: function coerce(val: string) {
      return val
        .split(',')
        .map((x) => x.trim())
        .filter((x) => !!x);
    },
  },
};

/**
 * Given an allowlist, determines if the provided url is valid.s
 * @param newLocation - An absolute or relative URL.
 * @param currentLocation - The current URL.
 * @param allowlist - An allow list previously validated by the above convict format type.
 * @returns true if url is allowed
 */
export function isAllowed(
  newLocation: string,
  currentLocation: string,
  allowlist: string[]
) {
  // If no allow list has been configured, exit.
  if (allowlist == null || allowlist.length === 0) {
    return true;
  }

  let url: URL;
  try {
    url = new URL(newLocation, currentLocation);
  } catch (err) {
    return false;
  }

  // If the url couldn't be parsed, exit false
  if (!url || !url?.hostname) {
    return false;
  }

  // If any of the checks in the allow list are valid, allow the redirect.
  return allowlist.some((x) => {
    // Just a single wildcard, short circuit and allow anything
    if (x === '*') {
      return true;
    }

    // Break checks and hostname on '.'. Reverse to evaluate from end to start.
    const checks = x.split('.').reverse();
    const parts = url.hostname.split('.').reverse();

    let i = 0;
    for (i = 0; i < Math.min(checks.length, parts.length); i++) {
      const re = new RegExp(`^${checks[i].replace(/\*/g, '[^.]*')}$`, 'ig');

      if (!re.test(parts[i])) {
        return false;
      }
    }

    // Making it this far indicates all checks passed
    if (checks.length === parts.length) {
      return true;
    }

    // There is a single remaining * check that has gone unprocessed. Allow this edge case.
    // e.g. *.baz.com will pass baz.com.
    if (parts.length < checks.length && checks[i] === '*') {
      return true;
    }

    // The are remaining parts that have gone unprocessed but the last check was *. Allow this edge case.
    // e.g. *.baz.com will pass foo.bar.baz.com
    if (parts.length > checks.length && checks[checks.length - 1] === '*') {
      return true;
    }

    return false;
  });
}
