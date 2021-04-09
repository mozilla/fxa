/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

module.exports = {
  handler: async function (request, h) {
    const monogram = /^[a-zA-Z0-9]$/.test(request.params.id)
      ? request.params.id
      : '?';

    // Only Firefox understands context-* values
    const ua = request.headers['user-agent'] || '';
    const useContext = ua.includes('Firefox/');
    const fill = useContext ? 'context-fill #B2B2B4' : '#B2B2B4';
    // contex-fill-opacity doesn't work on Firefox when a fallback value is present
    const fillOpacity = useContext ? 'context-fill-opacity' : '0.7';

    return h
      .response(
        `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <mask id="monogram">
            <rect x="0" y="0" width="100%" height="100%" fill="white"/>
            <text
              x="50%" y="50%"
              dominant-baseline="central"
              text-anchor="middle"
              fill="black"
              font-family='-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", sans-serif'
              font-weight="700"
              font-size="4rem">${monogram.toUpperCase()}</text>
          </mask>
        </defs>
        <circle cx="50" cy="50" r="50" fill="${fill}" fill-opacity="${fillOpacity}" mask="url(#monogram)"/>
      </svg>`
      )
      .type('image/svg+xml; charset=UTF-8')
      .header('Cache-Control', 'public, max-age=604800, immutable')
      .header('Vary', 'user-agent');
  },
};
