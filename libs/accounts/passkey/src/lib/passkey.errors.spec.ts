/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { VError } from 'verror';
import {
  PasskeyError,
  PasskeyNotFoundError,
  PasskeyInvalidError,
  PasskeyAlreadyRegisteredError,
  PasskeyLimitReachedError,
  PasskeyCredentialInvalidError,
  PasskeyAuthenticationFailedError,
  PasskeyRegistrationFailedError,
  PasskeyVerificationFailedError,
  PasskeyUnsupportedAlgorithmError,
  PasskeyChallengeExpiredError,
} from './passkey.errors';

describe('PasskeyError', () => {
  describe('base class', () => {
    it('should create error with message, errno, and uid', () => {
      const error = new PasskeyError('Test error', {
        errno: 224,
        uid: 'test-uid',
      });

      expect(error).toBeInstanceOf(PasskeyError);
      expect(error).toMatchObject({
        message: 'Test error',
        errno: 224,
        uid: 'test-uid',
      });
    });

    it('should preserve cause error', () => {
      const cause = new Error('Underlying error');
      const error = new PasskeyError(
        'Test error',
        { errno: 224, uid: 'test-uid' },
        cause
      );

      expect(VError.cause(error)).toBe(cause);
    });
  });

  describe('PasskeyNotFoundError', () => {
    it('should extend PasskeyError', () => {
      const error = new PasskeyNotFoundError({ uid: 'user123' });
      expect(error).toBeInstanceOf(PasskeyError);
    });

    it('should have correct errno and properties', () => {
      const error = new PasskeyNotFoundError({
        uid: 'user123',
        credentialId: 'cred456',
      });

      expect(error).toMatchObject({
        message: 'Passkey not found',
        errno: 224,
        uid: 'user123',
        credentialId: 'cred456',
      });
    });

    it('should preserve cause', () => {
      const cause = new Error('DB error');
      const error = new PasskeyNotFoundError({ uid: 'user123' }, cause);
      expect(VError.cause(error)).toBe(cause);
    });
  });

  describe('PasskeyInvalidError', () => {
    it('should have correct errno and properties', () => {
      const error = new PasskeyInvalidError({ uid: 'user123' });

      expect(error).toMatchObject({
        message: 'Invalid passkey',
        errno: 225,
        uid: 'user123',
      });
    });
  });

  describe('PasskeyAlreadyRegisteredError', () => {
    it('should have correct errno and properties', () => {
      const error = new PasskeyAlreadyRegisteredError({
        uid: 'user123',
        credentialId: 'cred456',
      });

      expect(error).toMatchObject({
        message: 'Passkey already registered',
        errno: 226,
        uid: 'user123',
        credentialId: 'cred456',
      });
    });
  });

  describe('PasskeyLimitReachedError', () => {
    it('should have correct errno and properties', () => {
      const error = new PasskeyLimitReachedError({ uid: 'user123', limit: 5 });

      expect(error).toMatchObject({
        message: 'Maximum number of passkeys reached',
        errno: 227,
        uid: 'user123',
      });
      expect(error.context['limit']).toEqual(5);
    });
  });

  describe('PasskeyCredentialInvalidError', () => {
    it('should have correct errno and properties', () => {
      const error = new PasskeyCredentialInvalidError({ uid: 'user123' });

      expect(error).toMatchObject({
        message: 'Invalid passkey credential',
        errno: 228,
        uid: 'user123',
      });
    });
  });

  describe('PasskeyAuthenticationFailedError', () => {
    it('should have correct errno and properties', () => {
      const error = new PasskeyAuthenticationFailedError({
        uid: 'user123',
        credentialId: 'cred456',
      });

      expect(error).toMatchObject({
        message: 'Passkey authentication failed',
        errno: 229,
        uid: 'user123',
        credentialId: 'cred456',
      });
    });
  });

  describe('PasskeyRegistrationFailedError', () => {
    it('should have correct errno and properties', () => {
      const error = new PasskeyRegistrationFailedError({
        uid: 'user123',
        reason: 'Database error',
      });

      expect(error).toMatchObject({
        message: 'Passkey registration failed',
        errno: 230,
        uid: 'user123',
      });
      expect(error.context['reason']).toEqual('Database error');
    });
  });

  describe('PasskeyVerificationFailedError', () => {
    it('should have correct errno and properties', () => {
      const error = new PasskeyVerificationFailedError({
        uid: 'user123',
        credentialId: 'cred456',
      });

      expect(error).toMatchObject({
        message: 'Passkey verification failed',
        errno: 231,
        uid: 'user123',
        credentialId: 'cred456',
      });
    });
  });

  describe('PasskeyUnsupportedAlgorithmError', () => {
    it('should have correct errno and properties', () => {
      const error = new PasskeyUnsupportedAlgorithmError({
        algorithm: 'ES512',
        uid: 'user123',
      });

      expect(error).toMatchObject({
        message: 'Unsupported passkey algorithm',
        errno: 232,
        uid: 'user123',
      });
      expect(error.context['algorithm']).toEqual('ES512');
    });
  });

  describe('PasskeyChallengeExpiredError', () => {
    it('should have correct errno and properties', () => {
      const error = new PasskeyChallengeExpiredError({
        uid: 'user123',
        challengeId: 'challenge789',
      });

      expect(error).toMatchObject({
        message: 'Passkey challenge expired',
        errno: 238,
        uid: 'user123',
      });
      expect(error.context['challengeId']).toEqual('challenge789');
    });
  });
});
