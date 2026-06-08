/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const SENTRY_DSN = process.env.SENTRY__CLIENT_DSN;

/**
 * Strip URL query parameters, tokens, and session IDs from error
 * messages to avoid leaking sensitive data to Sentry.
 */
function sanitizeMessage(message: string): string {
  return message
    .replace(/https?:\/\/\S+/g, (url) => {
      try {
        const parsed = new URL(url);
        return `${parsed.origin}${parsed.pathname}`;
      } catch {
        return '[redacted-url]';
      }
    })
    .replace(
      /\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/gi,
      '[redacted-uuid]'
    )
    .replace(/\b[0-9a-f]{32,}\b/gi, '[redacted-token]')
    .replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z]{2,}\b/gi, '[redacted-email]');
}

/**
 * Report a warning-level event to the payments-next Sentry project.
 * Uses the Sentry envelope API directly — no SDK dependency needed.
 * No-ops silently when SENTRY__CLIENT_DSN is not set (local dev).
 * Sanitizes messages to strip URLs, tokens, and session IDs.
 */
export async function reportToSentry(
  message: string,
  tags: Record<string, string> = {}
): Promise<void> {
  if (!SENTRY_DSN) return;

  const dsnUrl = new URL(SENTRY_DSN);
  const projectId = dsnUrl.pathname.replace(/^\//, '');
  const sentryKey = dsnUrl.username;
  const envelopeUrl = `https://${dsnUrl.host}/api/${projectId}/envelope/`;
  const eventId = crypto.randomUUID().replace(/-/g, '');

  const envelope = [
    JSON.stringify({ event_id: eventId }),
    JSON.stringify({ type: 'event' }),
    JSON.stringify({
      event_id: eventId,
      message: sanitizeMessage(message),
      level: 'warning',
      tags: { source: 'functional-tests', ...tags },
    }),
  ].join('\n');

  await fetch(envelopeUrl, {
    method: 'POST',
    body: envelope,
    headers: {
      'X-Sentry-Auth': `Sentry sentry_key=${sentryKey}, sentry_version=7`,
    },
  }).catch((err) => {
    // eslint-disable-next-line no-console
    console.debug('Sentry report failed:', err);
  });
}
