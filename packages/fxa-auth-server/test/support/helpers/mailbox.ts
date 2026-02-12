/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { EventEmitter } from 'events';

export interface EmailData {
  headers: {
    'x-verify-code'?: string;
    'x-recovery-code'?: string;
    'x-verify-short-code'?: string;
    'x-signin-verify-code'?: string;
    'x-password-forgot-otp'?: string;
    'x-account-change-verify-code'?: string;
    'x-unblock-code'?: string;
    'x-template-name'?: string;
    'x-link'?: string;
    'x-service-id'?: string;
    to?: string;
    cc?: string;
    [key: string]: string | undefined;
  };
  text?: string;
  html?: string;
  subject?: string;
}

export interface Mailbox {
  waitForEmail: (email: string) => Promise<EmailData | EmailData[]>;
  waitForCode: (email: string) => Promise<string>;
  waitForMfaCode: (email: string) => Promise<string>;
  eventEmitter: EventEmitter;
}

const MAX_RETRIES = 20;
const RETRY_DELAY_MS = 1000;

export function createMailbox(
  host = 'localhost',
  port = 9001,
  printLogs = false
): Mailbox {
  const eventEmitter = new EventEmitter();

  function log(...args: unknown[]): void {
    if (printLogs) {
      console.log(...args);
    }
  }

  async function fetchMail(email: string): Promise<EmailData[] | null> {
    const url = `http://${host}:${port}/mail/${encodeURIComponent(email)}`;
    log('checking mail', url);

    const response = await fetch(url, { method: 'GET' });

    if (!response.ok) {
      throw new Error(`Mail fetch failed: ${response.status}`);
    }

    const body = await response.text();

    try {
      const json = JSON.parse(body);
      return json && json.length > 0 ? json : null;
    } catch {
      return null;
    }
  }

  async function deleteMail(email: string): Promise<void> {
    const url = `http://${host}:${port}/mail/${encodeURIComponent(email)}`;
    log('deleting mail', url);
    await fetch(url, { method: 'DELETE' });
  }

  async function waitForEmail(email: string): Promise<EmailData | EmailData[]> {
    const username = email.split('@')[0];

    for (let tries = MAX_RETRIES; tries > 0; tries--) {
      log('mail status tries', tries);

      const mail = await fetchMail(username);

      if (mail && mail.length > 0) {
        await deleteMail(username);
        // Match old mailbox.js behavior: return single object when only one
        // email, return the full array when multiple emails are queued.
        const result = mail.length === 1 ? mail[0] : mail;
        eventEmitter.emit('email:message', email, result);
        return result;
      }

      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
    }

    const error = new Error(`Timeout waiting for email: ${email}`);
    eventEmitter.emit('email:error', email, error);
    throw error;
  }

  async function waitForCode(email: string): Promise<string> {
    const result = await waitForEmail(email);
    const emailData = Array.isArray(result) ? result[0] : result;
    const code =
      emailData.headers['x-verify-code'] ||
      emailData.headers['x-recovery-code'] ||
      emailData.headers['x-verify-short-code'] ||
      emailData.headers['x-password-forgot-otp'];

    if (!code) {
      throw new Error('Email did not contain a verification code');
    }

    return code;
  }

  async function waitForMfaCode(email: string): Promise<string> {
    const result = await waitForEmail(email);
    const emailData = Array.isArray(result) ? result[0] : result;
    const code = emailData.headers['x-account-change-verify-code'];

    if (!code) {
      throw new Error('Email did not contain an MFA verification code');
    }

    return code;
  }

  return {
    waitForEmail,
    waitForCode,
    waitForMfaCode,
    eventEmitter,
  };
}
