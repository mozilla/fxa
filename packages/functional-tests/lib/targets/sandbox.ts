/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { TargetName } from ".";
import { BaseTarget, Credentials } from "./base";

const RELIER_CLIENT_ID = "dcdb5ae7add825d2";

/**
 * Sandbox target for running functional tests against agent sandbox VMs.
 *
 * All URLs are derived from FXA_SANDBOX_IP, with individual env var overrides.
 * This allows specifying a single VM IP to reach all services:
 *
 *   FXA_SANDBOX_IP=192.168.64.39 yarn test-sandbox tests/signin/signIn.spec.ts
 *
 * Environment variables (in priority order):
 *   FXA_SANDBOX_IP           - VM IP; all URLs derived from this (default: localhost)
 *   FXA_SANDBOX_AUTH_URL     - override auth server URL
 *   FXA_SANDBOX_CONTENT_URL  - override content server URL
 *   FXA_SANDBOX_EMAIL_URL    - override email API URL
 *   FXA_SANDBOX_RELIER_URL   - override test relier URL
 */
export class SandboxTarget extends BaseTarget {
  static readonly target = "sandbox";
  readonly name: TargetName = SandboxTarget.target;
  readonly contentServerUrl: string;
  readonly relierUrl: string;
  readonly relierClientID = RELIER_CLIENT_ID;

  constructor() {
    const ip = process.env.FXA_SANDBOX_IP || "localhost";
    const authUrl =
      process.env.FXA_SANDBOX_AUTH_URL || `http://${ip}:9000`;
    const emailUrl =
      process.env.FXA_SANDBOX_EMAIL_URL || `http://${ip}:9001`;
    super(authUrl, emailUrl);
    this.contentServerUrl =
      process.env.FXA_SANDBOX_CONTENT_URL || `http://${ip}:3030`;
    this.relierUrl =
      process.env.FXA_SANDBOX_RELIER_URL || `http://${ip}:8080`;
  }

  // No-op: sandbox VMs run with CUSTOMS_SERVER_URL="none", so rate limits
  // are never enforced. Avoids needing a Redis connection to the VM.
  async clearRateLimits() {}

  async createAccount(
    email: string,
    password: string,
    options = { lang: "en", preVerified: "true" }
  ): Promise<Credentials> {
    const { preVerified, ...filteredOptions } = options;
    const result = await this.authClient.signUp(
      email,
      password,
      filteredOptions
    );
    if (preVerified === "true") {
      const code = await this.emailClient.getVerifyCode(email);
      await this.authClient.verifyCode(result.uid, code);
    }
    await this.authClient.deviceRegister(
      result.sessionToken,
      "playwright",
      "tester"
    );
    return {
      email,
      password,
      verified: preVerified === "true",
      ...result,
    };
  }
}
