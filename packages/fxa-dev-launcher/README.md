# fxa-dev-launcher

### Firefox Accounts Custom Profiles for Firefox

**Use `npm start` to start Firefox with local server configurations.**
Available options:

- `FXA_ENV=local` or `latest` or `stable` or `stage` or `content` (NOTE: `local` is default).
- `DISABLE_E10S=true` - add this flag to turn off E10S. (NOTE: `false` by default).
- `FXA_DESKTOP_CONTEXT` - `context=` value. (NOTE: `fx_desktop_v2` is default).
- `FIREFOX_BIN=/Applications/FirefoxNightly.app/Contents/MacOS/firefox-bin npm start`
- `FIREFOX_DEBUGGER=true` - open the [Browser Toolbox](https://developer.mozilla.org/en-US/docs/Tools/Browser_Toolbox) on start (NOTE: `false` by default for speed).
- `FXA_DESKTOP_CONTEXT` - context value for the fxa-content-server: `context=[value]` (NOTE: `fx_desktop_v3` is default).

### Basic Usage Example in OS X

- Download node.js
- install it by following the steps in the `.pkg` installer.
- Open Terminal and Run commands:
- `git clone https://github.com/vladikoff/fxa-dev-launcher.git`
- `cd fxa-dev-launcher`
- `npm install`
- `FXA_ENV=latest npm start`

The above will start a firefox talking to `latest.dev.lcip.org`
