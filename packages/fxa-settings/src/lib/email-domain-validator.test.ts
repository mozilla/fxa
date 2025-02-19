/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { checkEmailDomain } from './email-domain-validator';
import { AuthUiErrors } from './auth-errors/auth-errors';
import topEmailDomains from 'fxa-shared/email/topEmailDomains';
import { resolveDomain } from './email-domain-validator-resolve-domain';

jest.mock('./email-domain-validator-resolve-domain', () => ({
  resolveDomain: jest.fn(),
}));

describe('checkEmailDomain', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  it('should throw EMAIL_REQUIRED if no domain is present', async () => {
    await expect(checkEmailDomain('invalidEmail')).rejects.toBe(
      AuthUiErrors.EMAIL_REQUIRED
    );
  });

  it('should skip validation for known top domains', async () => {
    jest.spyOn(topEmailDomains, 'has').mockReturnValue(true);
    await expect(checkEmailDomain('user@popular.com')).resolves.toBeUndefined();
  });

  it('should allow submission on a successful MX record lookup', async () => {
    (resolveDomain as jest.Mock).mockResolvedValueOnce({ result: 'MX' });
    await expect(
      checkEmailDomain('user@valid-mx.com')
    ).resolves.toBeUndefined();
    expect(resolveDomain).toHaveBeenCalledWith('valid-mx.com');
  });

  it('should throw MX_LOOKUP_WARNING on a successful A record lookup', async () => {
    (resolveDomain as jest.Mock).mockResolvedValueOnce({ result: 'A' });
    await expect(checkEmailDomain('user@only-a.com')).rejects.toBe(
      AuthUiErrors.MX_LOOKUP_WARNING
    );
  });

  it('should throw INVALID_EMAIL_DOMAIN on a result of none', async () => {
    (resolveDomain as jest.Mock).mockResolvedValueOnce({ result: 'none' });
    await expect(checkEmailDomain('user@no-records.com')).rejects.toBe(
      AuthUiErrors.INVALID_EMAIL_DOMAIN
    );
  });

  it('should resolve when the domain is marked as skip', async () => {
    (resolveDomain as jest.Mock).mockResolvedValueOnce({ result: 'skip' });
    await expect(checkEmailDomain('user@skip.com')).resolves.toBeUndefined();
  });

  it('should allow submission on resolveDomain failure', async () => {
    (resolveDomain as jest.Mock).mockRejectedValueOnce(
      new Error('Network Error')
    );
    await expect(
      checkEmailDomain('user@server-down.com')
    ).resolves.toBeUndefined();
  });

  it('should reject immediately if the domain has previously failed', async () => {
    (resolveDomain as jest.Mock).mockResolvedValueOnce({ result: 'none' });
    await expect(checkEmailDomain('user@failed.com')).rejects.toBe(
      AuthUiErrors.INVALID_EMAIL_DOMAIN
    );
    await expect(checkEmailDomain('user@failed.com')).rejects.toBe(
      AuthUiErrors.INVALID_EMAIL_DOMAIN
    );
  });

  it('should resolve if the domain was previously resolved with an A record', async () => {
    (resolveDomain as jest.Mock).mockResolvedValueOnce({ result: 'A' });
    await expect(checkEmailDomain('user@prev-a.com')).rejects.toBe(
      AuthUiErrors.MX_LOOKUP_WARNING
    );
    await expect(checkEmailDomain('user@prev-a.com')).resolves.toBeUndefined();
    expect(resolveDomain).toHaveBeenCalledTimes(1);
  });
  it('should resolve if the domain was previously resolved with an MX record', async () => {
    (resolveDomain as jest.Mock).mockResolvedValueOnce({ result: 'MX' });
    await expect(checkEmailDomain('user@prev-a.com')).resolves.toBeUndefined();
    await expect(checkEmailDomain('user@cool.com')).resolves.toBeUndefined();
    expect(resolveDomain).toHaveBeenCalledTimes(1);
  });
});
