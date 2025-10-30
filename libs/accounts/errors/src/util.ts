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
