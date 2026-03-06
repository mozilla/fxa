/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { config, getExtraHeaders } from './config';
import type {
  Account,
  Email,
  BlockStatus,
  RelyingPartyDto,
  RelyingPartyUpdateDto,
  RelyingPartyCreatedDto,
  RotateSecretDto,
  AccountDeleteResponse,
  AccountDeleteTaskStatus,
  AccountResetResponse,
} from 'fxa-admin-server/src/types';

function baseUrl() {
  return config.servers.admin.url;
}

function buildHeaders(): Record<string, string> {
  return {
    'Content-Type': 'application/json',
    ...getExtraHeaders(config),
  };
}

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${baseUrl()}${path}`, {
    ...options,
    headers: {
      ...buildHeaders(),
      ...(options?.headers || {}),
    },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(`API error ${res.status}: ${text}`);
  }
  return res.json();
}

function buildQs(params: Record<string, string | undefined>): string {
  const parts = Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== '')
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v!)}`);
  return parts.length ? '?' + parts.join('&') : '';
}

export const adminApi = {
  // ---- Account ----

  getAccountByEmail(
    email: string,
    autoCompleted = false
  ): Promise<Account | null> {
    return apiFetch(
      `/api/account/by-email?email=${encodeURIComponent(email)}&autoCompleted=${autoCompleted}`
    );
  },

  getAccountByUid(uid: string): Promise<Account | null> {
    return apiFetch(`/api/account/by-uid?uid=${encodeURIComponent(uid)}`);
  },

  getAccountByPhone(
    phoneNumber: string,
    autoCompleted = false
  ): Promise<Account[]> {
    return apiFetch(
      `/api/account/by-recovery-phone?phoneNumber=${encodeURIComponent(phoneNumber)}&autoCompleted=${autoCompleted}`
    );
  },

  getEmailsLike(search: string): Promise<Email[]> {
    return apiFetch(
      `/api/account/emails-like?search=${encodeURIComponent(search)}`
    );
  },

  getPhonesLike(search: string): Promise<{ phoneNumber: string }[]> {
    return apiFetch(
      `/api/account/recovery-phones-like?search=${encodeURIComponent(search)}`
    );
  },

  getDeleteStatus(taskNames: string[]): Promise<AccountDeleteTaskStatus[]> {
    const qs = taskNames
      .map((t) => `taskNames=${encodeURIComponent(t)}`)
      .join('&');
    return apiFetch(`/api/account/delete-status?${qs}`);
  },

  remove2FA(uid: string): Promise<boolean> {
    return apiFetch('/api/account/remove-2fa', {
      method: 'POST',
      body: JSON.stringify({ uid }),
    });
  },

  unverifyEmail(email: string): Promise<boolean> {
    return apiFetch('/api/account/unverify-email', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  disableAccount(uid: string): Promise<boolean> {
    return apiFetch('/api/account/disable', {
      method: 'POST',
      body: JSON.stringify({ uid }),
    });
  },

  enableAccount(uid: string): Promise<boolean> {
    return apiFetch('/api/account/enable', {
      method: 'POST',
      body: JSON.stringify({ uid }),
    });
  },

  editLocale(uid: string, locale: string): Promise<boolean> {
    return apiFetch('/api/account/edit-locale', {
      method: 'POST',
      body: JSON.stringify({ uid, locale }),
    });
  },

  deleteRecoveryPhone(uid: string): Promise<boolean> {
    return apiFetch('/api/account/delete-recovery-phone', {
      method: 'POST',
      body: JSON.stringify({ uid }),
    });
  },

  recordSecurityEvent(uid: string, name: string): Promise<boolean> {
    return apiFetch('/api/account/record-security-event', {
      method: 'POST',
      body: JSON.stringify({ uid, name }),
    });
  },

  unlinkAccount(uid: string): Promise<boolean> {
    return apiFetch('/api/account/unlink', {
      method: 'POST',
      body: JSON.stringify({ uid }),
    });
  },

  unsubscribeFromMailingLists(uid: string): Promise<boolean> {
    return apiFetch('/api/account/unsubscribe-mailing-lists', {
      method: 'POST',
      body: JSON.stringify({ uid }),
    });
  },

  deleteAccounts(locators: string[]): Promise<AccountDeleteResponse[]> {
    return apiFetch('/api/account/delete', {
      method: 'POST',
      body: JSON.stringify({ locators }),
    });
  },

  resetAccounts(
    locators: string[],
    notificationEmail: string
  ): Promise<AccountResetResponse[]> {
    return apiFetch('/api/account/reset', {
      method: 'POST',
      body: JSON.stringify({ locators, notificationEmail }),
    });
  },

  // ---- Email bounce ----

  clearEmailBounce(email: string): Promise<boolean> {
    return apiFetch('/api/email-bounce/clear', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  // ---- Rate limiting ----

  getRateLimits(params: {
    ip?: string;
    email?: string;
    uid?: string;
  }): Promise<BlockStatus[]> {
    return apiFetch(`/api/rate-limits${buildQs(params)}`);
  },

  clearRateLimits(params: {
    ip?: string;
    email?: string;
    uid?: string;
  }): Promise<number> {
    return apiFetch('/api/rate-limits/clear', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  },

  // ---- Relying parties ----

  getRelyingParties(): Promise<RelyingPartyDto[]> {
    return apiFetch('/api/relying-parties');
  },

  createRelyingParty(
    relyingParty: RelyingPartyUpdateDto
  ): Promise<RelyingPartyCreatedDto> {
    return apiFetch('/api/relying-parties', {
      method: 'POST',
      body: JSON.stringify(relyingParty),
    });
  },

  updateRelyingParty(
    id: string,
    relyingParty: RelyingPartyUpdateDto
  ): Promise<boolean> {
    return apiFetch(`/api/relying-parties/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: JSON.stringify(relyingParty),
    });
  },

  deleteRelyingParty(id: string): Promise<boolean> {
    return apiFetch(`/api/relying-parties/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
  },

  rotateRelyingPartySecret(id: string): Promise<RotateSecretDto> {
    return apiFetch(
      `/api/relying-parties/${encodeURIComponent(id)}/rotate-secret`,
      {
        method: 'POST',
      }
    );
  },

  deletePreviousRelyingPartySecret(id: string): Promise<boolean> {
    return apiFetch(
      `/api/relying-parties/${encodeURIComponent(id)}/previous-secret`,
      { method: 'DELETE' }
    );
  },
};
