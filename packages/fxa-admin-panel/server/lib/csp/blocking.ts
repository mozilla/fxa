/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// Middleware to take care of CSP. CSP headers are not sent unless config
// option 'csp.enabled' is set (default true).

import url from 'url';

function getOrigin(link: string) {
  const parsed = url.parse(link);
  return `${parsed.protocol}//${parsed.host}`;
}

/**
 * blockingCspMiddleware is where to declare rules that will cause a resource
 * to be blocked if it runs afowl of a rule.
 */
export default function cspBlocking(config: { [key: string]: any }) {
  const ADMIN_SERVER = getOrigin(config.get('servers.admin.url'));
  const HMR_WS_SERVER = getOrigin(config.get('servers.hmr_websocket.url'));
  const CDN_URL = config.get('staticResources.url');
  const PUBLIC_URL = config.get('listen.publicUrl');
  const HOT_RELOAD_WEBSOCKET = PUBLIC_URL.replace(/^http/, 'ws');

  //
  // Double quoted values
  //
  const NONE = "'none'";
  const SELF = "'self'";
  const UNSAFE_INLINE = "'unsafe-inline'";

  function addCdnRuleIfRequired(target: Array<string>) {
    if (CDN_URL !== PUBLIC_URL) {
      target.push(CDN_URL);
    }
    return target;
  }

  let connectSrc = [SELF, ADMIN_SERVER];
  let styleSrc = [SELF];
  // Permit unsafe-inline styles and connecting to the React WebSocket
  // at a different port in development so you can access 8091 with HMR
  if (process.env.NODE_ENV === 'development') {
    connectSrc.push(HMR_WS_SERVER);
    styleSrc.push(UNSAFE_INLINE);
  }

  const rules = {
    directives: {
      connectSrc: connectSrc,
      defaultSrc: [NONE],
      baseUri: [NONE],
      frameAncestors: [NONE],
      fontSrc: addCdnRuleIfRequired([SELF]),
      imgSrc: addCdnRuleIfRequired([SELF]),
      scriptSrc: addCdnRuleIfRequired([SELF]),
      styleSrc: addCdnRuleIfRequired(styleSrc),
      reportUri: config.get('csp.reportUri'),
    },
    reportOnly: false,
    // Sources are exported for unit tests
    Sources: {
      ADMIN_SERVER,
      CDN_URL,
      NONE,
      HOT_RELOAD_WEBSOCKET,
      PUBLIC_URL,
      SELF,
    },
  };

  if (config.get('env') === 'development') {
    rules.directives.connectSrc.push(HOT_RELOAD_WEBSOCKET);
  }

  return rules;
}
