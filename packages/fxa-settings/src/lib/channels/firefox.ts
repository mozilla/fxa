/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

export enum FirefoxCommand {
  AccountDeleted = 'fxaccounts:delete',
  ProfileChanged = 'profile:change',
  PasswordChanged = 'fxaccounts:change_password',
  FxAStatus = 'fxaccounts:fxa_status',
  Login = 'fxaccounts:login',
  Logout = 'fxaccounts:logout',
  Loaded = 'fxaccounts:loaded',
  Error = 'fxError',
  OAuthLogin = 'fxaccounts:oauth_login',
  CanLinkAccount = 'fxaccounts:can_link_account',
}

export interface FirefoxMessage {
  id: string;
  message?: {
    command: FirefoxCommand;
    data: Record<string, any> & {
      error?: {
        message: string;
        stack: string;
      };
    };
    messageId: string;
    error?: string;
  };
}

interface ProfileUid {
  uid: hexstring;
}

interface ProfileMetricsEnabled {
  metricsEnabled: boolean;
}

type Profile = ProfileUid | ProfileMetricsEnabled;
type FirefoxEvent = CustomEvent<FirefoxMessage | string>;

// This is defined in the Firefox source code:
// https://searchfox.org/mozilla-central/source/services/fxaccounts/tests/xpcshell/test_web_channel.js#348
type FxAStatusRequest = {
  service: 'sync'; // ex. 'sync'
  context: string; // ex. 'fx_desktop_v3'
};

export type FxAStatusResponse = {
  capabilities: {
    engines: string[];
    multiService: boolean;
    pairing: boolean;
    choose_what_to_sync?: boolean;
  };
  clientId?: string;
  signedInUser?: SignedInUser;
};

export type SignedInUser = {
  email: string;
  sessionToken: string;
  uid: string;
  verified: boolean;
};

export type FxALoginRequest = {
  email: string;
  keyFetchToken: hexstring;
  sessionToken: hexstring;
  uid: hexstring;
  unwrapBKey: string;
  verified: boolean;
  services?: {
    sync: {
      offeredEngines: string[];
      declinedEngines: string[];
    };
  };
};

// ref: [FxAccounts.sys.mjs](https://searchfox.org/mozilla-central/rev/82828dba9e290914eddd294a0871533875b3a0b5/services/fxaccounts/FxAccounts.sys.mjs#910)
export type FxALoginSignedInUserRequest = {
  authAt: number;
  email: string;
  keyFetchToken: hexstring;
  sessionToken: hexstring;
  uid: hexstring;
  unwrapBKey: string;
  verified: boolean;
};

export type FxAOAuthLogin = {
  action: string;
  code: string;
  redirect: string;
  state: string;
};

// ref: https://searchfox.org/mozilla-central/rev/82828dba9e290914eddd294a0871533875b3a0b5/services/fxaccounts/FxAccountsWebChannel.sys.mjs#230
export type FxACanLinkAccount = {
  email: string;
};

export class Firefox extends EventTarget {
  private broadcastChannel?: BroadcastChannel;
  readonly id: string;
  constructor() {
    super();
    this.id = 'account_updates';
    if (typeof BroadcastChannel !== 'undefined') {
      this.broadcastChannel = new BroadcastChannel('firefox_accounts');
      this.broadcastChannel.addEventListener('message', (event) =>
        this.handleBroadcastEvent(event)
      );
    }
    window.addEventListener('WebChannelMessageToContent', (event) =>
      this.handleFirefoxEvent(event as FirefoxEvent)
    );
  }

  private handleBroadcastEvent(event: MessageEvent) {
    console.debug('broadcast', event);
    const envelope = JSON.parse(event.data);
    this.dispatchEvent(
      new CustomEvent(envelope.name, { detail: envelope.data })
    );
  }

  private handleFirefoxEvent(event: FirefoxEvent) {
    console.debug('webchannel', event);
    try {
      const detail =
        typeof event.detail === 'string'
          ? (JSON.parse(event.detail) as FirefoxMessage)
          : event.detail;
      if (detail.id !== this.id) {
        return;
      }
      const message = detail.message;
      if (message) {
        if (message.error || message.data.error) {
          const error = {
            message: message.error || message.data.error?.message,
            stack: message.data.error?.stack,
          };
          this.dispatchEvent(
            new CustomEvent(FirefoxCommand.Error, { detail: error })
          );
        } else {
          this.dispatchEvent(
            new CustomEvent(message.command, { detail: message.data })
          );
        }
      }
    } catch (e) {
      // TODO: log and ignore
    }
  }

  private formatEventDetail(
    command: FirefoxCommand,
    data: any,
    messageId: string = ''
  ) {
    const detail = {
      id: this.id,
      message: {
        command,
        data,
        messageId,
      },
    };

    // Firefox Desktop and Fennec >= 50 expect the detail to be
    // sent as a string and fxios as an object.
    // See https://bugzilla.mozilla.org/show_bug.cgi?id=1275616 and
    // https://bugzilla.mozilla.org/show_bug.cgi?id=1238128
    if (navigator.userAgent.toLowerCase().includes('fxios')) {
      return detail;
    }
    return JSON.stringify(detail);
  }

  // send a message to the browser chrome
  send(command: FirefoxCommand, data: any, messageId?: string) {
    const detail = this.formatEventDetail(command, data, messageId);
    window.dispatchEvent(
      new CustomEvent('WebChannelMessageToChrome', {
        detail,
      })
    );
  }

  // broadcast a message to other tabs
  broadcast(name: FirefoxCommand, data: any) {
    this.broadcastChannel?.postMessage(JSON.stringify({ name, data }));
  }

  accountDeleted(uid: hexstring) {
    this.send(FirefoxCommand.AccountDeleted, { uid });
    this.broadcast(FirefoxCommand.AccountDeleted, { uid });
  }

  passwordChanged(
    email: string,
    uid: hexstring,
    sessionToken: hexstring,
    verified: boolean,
    keyFetchToken?: hexstring,
    unwrapBKey?: hexstring
  ) {
    this.send(FirefoxCommand.PasswordChanged, {
      email,
      uid,
      sessionToken,
      verified,
      keyFetchToken,
      unwrapBKey,
    });
    this.broadcast(FirefoxCommand.PasswordChanged, {
      uid,
    });
  }

  profileChanged(profile: Profile) {
    this.send(FirefoxCommand.ProfileChanged, profile);
    this.broadcast(FirefoxCommand.ProfileChanged, profile);
  }

  fxaStatus(options: FxAStatusRequest) {
    this.send(FirefoxCommand.FxAStatus, options);
  }

  fxaLogin(options: FxALoginRequest) {
    this.send(FirefoxCommand.Login, options);
  }

  fxaLoginSignedInUser(options: FxALoginSignedInUserRequest) {
    this.send(FirefoxCommand.Login, options);
  }

  fxaLogout(options: { uid: string }) {
    this.send(FirefoxCommand.Logout, options);
  }

  fxaLoaded(options: any) {
    this.send(FirefoxCommand.Loaded, options);
  }

  fxaOAuthLogin(options: FxAOAuthLogin) {
    this.send(FirefoxCommand.OAuthLogin, options);
  }

  fxaCanLinkAccount(options: FxACanLinkAccount) {
    this.send(FirefoxCommand.Login, options);
  }
}

// Some non-firefox legacy browsers can't extend EventTarget.
// For those we can safely return a mock instance that
// implements the interface but does nothing because
// this functionality is only meant for firefox.
let canUseEventTarget = true;
try {
  new EventTarget();
} catch (e) {
  canUseEventTarget = false;
}
function noop() {}
export const firefox = canUseEventTarget
  ? new Firefox()
  : // otherwise a mock
    (Object.fromEntries(
      Object.getOwnPropertyNames(Firefox.prototype)
        .map((name) => [name, noop])
        .concat([
          ['addEventListener', noop],
          ['removeEventListener', noop],
          ['dispatchEvent', noop],
        ])
    ) as unknown as Firefox);

export default firefox;
