# Communication with OAuth WebChannels

OAuth WebChannels is an extension of the [FxA WebChannel Desktop Flow](fx-webchannel.md).
It consists of similar messages as the Desktop flow. Some behaviours in the OAuth flow are different.

This flow currently supports the following messages:

-   'fxaccounts:fxa_status'
-   'fxaccounts:oauth_login'

The `fxa_status` message in the OAuth flow supports specifying a custom list of Sync engines that the app supports.
See [fx-webchannel.md](fx-webchannel.md) for details of engine capabilities.

## Communication with GeckoView applications

To enable this feature in applications with GeckoView we ship a WebExtension
as part of the [firefox-accounts](https://github.com/mozilla-mobile/android-components/blob/master/components/service/firefox-accounts/README.md) Android component.

```
 * Communication channel is established from web content to this class via webextension, as follows:
 * [fxa-web-content] <--js events--> [fxawebchannel.js webextension] <--port messages--> [WebChannelFeature]
 *
 * [fxa-web-channel]            [WebChannelFeature]         Notes:
 *     fxa-status       ------>          |                  web content requests account status & device capabilities
 *        |             <------ fxa-status-response         this class responds, based on state of [accountManager]
 *     oauth-login      ------>                             authentication completed within fxa web content, this class receives OAuth code & state
```
