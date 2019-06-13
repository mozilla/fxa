/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// This is a port to TypeScript of this fxa-content-server library:
// https://github.com/mozilla/fxa/blob/master/packages/fxa-content-server/app/scripts/lib/screen-info.js

// module to calculate screen dimentions given a window.

class ScreenInfo {
  clientHeight: number | undefined;
  clientWidth: number | undefined;
  devicePixelRatio: number | undefined;
  screenHeight: number | undefined;
  screenWidth: number | undefined;

  constructor(win?: Window) {
    if (!win) {
      return;
    }

    var documentElement = win.document.documentElement || {};
    var screen = win.screen || {};
  
    // for more information:
    // http://quirksmode.org/mobile/viewports.html and
    // http://quirksmode.org/mobile/viewports2.html
    this.clientHeight = documentElement.clientHeight;
    this.clientWidth = documentElement.clientWidth;
    this.devicePixelRatio = win.devicePixelRatio;
    this.screenHeight = screen.height;
    this.screenWidth = screen.width;
  }  
}

export default ScreenInfo;
