declare module 'fxa-js-client' {
  export = FxAccountClient;
}

declare function FxAccountClient(
  uri: string,
  config: any
): FxAccountClient.Client;

declare namespace FxAccountClient {
  export type MetricContext = {
    deviceId?: string;
    entrypoint?: string;
    entrypointExperiment?: string;
    entrypointVariation?: string;
    flowId?: string;
    flowBeginTime?: number;
    productId?: string;
    planId?: string;
    utmCampaign?: number;
    utmContent?: number;
    utmMedium?: number;
    utmSource?: number;
    utmTerm?: number;
  };

  export interface Client {
    sessionStatus(
      sessionToken: string
    ): Promise<{ state: string; uid: string }>;
    attachedClients(sessionToken: string): Promise<any[]>;
    attachedClientDestroy(sessionToken: string, clientInfo: any): Promise<any>;
    checkTotpTokenExists(
      sessionToken: string
    ): Promise<{ exists: boolean; verified: boolean }>;
    recoveryKeyExists(sessionToken: string): Promise<{ exists: boolean }>;
    account(sessionToken: string): Promise<any>;
    createOAuthToken(
      sessionToken: string,
      clientId: string,
      options?: {
        scope?: string;
        ttl?: number;
        access_type?: 'online' | 'offline';
      }
    ): Promise<{
      access_token: string;
      refresh_token?: string;
      id_token?: string;
      scope: string[];
      auth_at?: number;
      token_type: string;
      expires_in: number;
    }>;
    createTotpToken(
      sessionToken: string,
      metricOptions: MetricContext
    ): Promise<{ qrCodeUrl: string; secret: string; recoveryCodes: string[] }>;
    deleteTotpToken(sessionToken: string): Promise<any>;
    recoveryEmailCreate(sessionToken: string, email: string): Promise<any>;
    recoveryEmailDestroy(sessionToken: string, email: string): Promise<any>;
    recoveryEmailSetPrimaryEmail(
      sessionToken: string,
      email: string
    ): Promise<any>;
    recoveryEmailSecondaryResendCode(
      sessionToken: string,
      email: string
    ): Promise<any>;
    replaceRecoveryCodes(
      sessionToken: string
    ): Promise<{ recoveryCodes: string[] }>;
    verifyTotpCode(
      sessionToken: string,
      code: string,
      options?: { service: string }
    ): Promise<{ success: boolean }>;
  }
}
