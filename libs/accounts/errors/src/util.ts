export function swapObjectKeysAndValues(obj: {
  [key: string]: string | number;
}) {
  const result: { [key: string | number]: string } = {};
  for (const key in obj) {
    result[obj[key]] = key;
  }
  return result;
}

// Parse a comma-separated list with allowance for varied whitespace
export function commaSeparatedListToArray(s: string) {
  return (s || '')
    .trim()
    .split(',')
    .map((c) => c.trim())
    .filter((c) => !!c);
}

/** Wait advertised on a 429 when no usable duration is available. */
export const DEFAULT_RETRY_AFTER_MS = 30_000;

/** Falls back to the default for a missing or non-positive wait. */
export function normalizeRetryAfterMs(retryAfterMs?: number): number {
  return Number.isFinite(retryAfterMs) && (retryAfterMs as number) > 0
    ? (retryAfterMs as number)
    : DEFAULT_RETRY_AFTER_MS;
}

/** Converts a millisecond wait to the whole seconds `Retry-After` requires. */
export function retryAfterHeaderValue(retryAfterMs?: number): string {
  return `${Math.ceil(normalizeRetryAfterMs(retryAfterMs) / 1000)}`;
}
