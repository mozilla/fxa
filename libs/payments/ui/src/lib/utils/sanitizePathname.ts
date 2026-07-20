/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Sanitizes a pathname to prevent open redirect vulnerabilities.
 * 
 * This function ensures that the pathname:
 * 1. Is a relative path (not an absolute URL)
 * 2. Starts with a forward slash
 * 3. Cannot navigate to external domains
 * 
 * @param pathname - The pathname to sanitize (may come from untrusted client input)
 * @returns A safe, normalized pathname that always starts with '/'
 * @throws Error if the pathname cannot be safely normalized
 * 
 * @example
 * sanitizePathname('/en/vpn/monthly/checkout/cart123/start') // => '/en/vpn/monthly/checkout/cart123/start'
 * sanitizePathname('https://evil.com/phishing') // => throws Error
 * sanitizePathname('../../../etc/passwd') // => '/etc/passwd' (safe, but won't match any routes)
 */
export function sanitizePathname(pathname: string): string {
  if (!pathname || typeof pathname !== 'string') {
    throw new Error('Invalid pathname: must be a non-empty string');
  }

  // If it looks like an absolute URL, extract only the pathname
  try {
    if (pathname.includes('://') || pathname.startsWith('//')) {
      // This could be an external URL - reject it
      throw new Error('Absolute URLs are not allowed');
    }
  } catch (error) {
    throw new Error(`Invalid pathname: ${error instanceof Error ? error.message : 'unknown error'}`);
  }

  // Normalize the pathname by parsing it as a URL
  // Using a dummy base ensures we only get the pathname part
  let normalizedPath: string;
  try {
    const url = new URL(pathname, 'http://localhost');
    normalizedPath = url.pathname;
  } catch (error) {
    // If URL parsing fails, reject it
    throw new Error('Invalid pathname format');
  }

  // Ensure the path starts with '/'
  if (!normalizedPath.startsWith('/')) {
    throw new Error('Pathname must start with /');
  }

  return normalizedPath;
}
