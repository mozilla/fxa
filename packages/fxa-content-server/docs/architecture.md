# Firefox Accounts Content Server Architecture

## Purpose of Document

This is a starting point for developers and contributors of the Firefox Accounts Content Server. No overall architectural document exists for the entire Firefox Accounts ecosystem. The OAuth documentation is in the [fxa-oauth-server's wiki](https://github.com/mozilla/fxa-oauth-server/wiki/oauth-design). Documentation on how to integrate Firefox Accounts into a web site or app is on [MDN](https://developer.mozilla.org/) under the [Firefox Accounts section](https://developer.mozilla.org/Firefox_Accounts).

## Firefox Accounts is a client-server architecture w/ multiple servers.

### Content server [fxa-content-server](https://github.com/mozilla/fxa-content-server)

The user interface for all authentication flows, including OAuth, is served by the [fxa-content-server](https://github.com/mozilla/fxa-content-server/) at https://accounts.firefox.com. Users interact with the content server's web client.

### Auth server [fxa-auth-server](https://github.com/mozilla/fxa-auth-server)

The [auth server](https://github.com/mozilla/fxa-auth-server/) is a UI-less API server responsible for user authentication - sign up, sign in, and password reset. The auth server provisions new users and authenticates existing users. The auth server communicates with several other servers to deliver email and provide security.

### OAuth server [fxa-oauth-server](https://github.com/mozilla/fxa-oauth-server)

The [OAuth server](https://github.com/mozilla/fxa-oauth-server/) is a UI-less API server that implements OAuth for Firefox Accounts. It provides OAuth codes and tokens.

### Profile Server [fxa-profile-server](https://github.com/mozilla/fxa-profile-server)

The [profile Server](https://github.com/mozilla/fxa-profile-server/) is a UI-less API server that provides common profile-related data for a Firefox Account. This data will eventually include name, avatar, location, age, and gender. A user's profile data can be fetched by a relying party (RP) that holds a properly scoped OAuth token for the information.

## Content Server Architecture

The content server is a combination of two components, a server component and a client side web application.

### Server side Goals/Desired Quality Attributes

-   The server should contain very little "business" logic, the content server should only be responsible for serving UI.
-   Most content server work should be deferred to the web client.
-   The server should be able to deliver content in the user's preferred language.

### Web Client Goals/Desired Quality Attributes

-   Can be integrated into any Web capable system.
-   Can be extended to provide an interface to Web capable native applications, e.g., a native panel within a browser.
-   Can be opened by any modern browser or rendering engine that supports HTML5.

### Relier/Relying Party

The relier/relying party is an implicit component that is external to the Firefox Accounts content server. Reliers run in a multitude of contexts, not all web based. For example, Firefox Sync and Firefox Hello are two services built into Firefox that use Firefox Accounts to authenticate their users.

### Ways To Access Firefox Accounts.

#### Direct Access

Direct access is when a user enters the URL https://accounts.firefox.com into the URL bar of their browser.

#### OAuth Redirect

The OAuth redirect flow is used by web based RPs. A user visiting the RP is redirected from the RP to Firefox Accounts. Once the user successfully authenticates with Firefox Accounts, an [OAuth code](http://tools.ietf.org/html/rfc6749#section-1.3.1) is generated, and the user is sent back to the RP with the OAuth code. The RP uses returned code to fetch information about the user from the Firefox Accounts OAuth and Profile servers.

#### Firefox Sync

Firefox Sync is a one-off integration that is documented for completeness. Like the WebChannel, Sync uses [Custom Events](https://developer.mozilla.org/docs/Creating_Custom_Events_That_Can_Pass_Data) to create a two-way communication channel between the browser and Firefox Accounts.

### High Level Web Client Components

#### [Brokers](https://github.com/mozilla/fxa-content-server/tree/master/app/scripts/models/auth_brokers)

Brokers mediate communication between Firefox Accounts and the relier. A single broker is created per Firefox Accounts window. A broker communicates with the relier via the URL or a Channel.

#### [Channels](https://github.com/mozilla/fxa-content-server/tree/master/app/scripts/lib/channels)

A channel is a two way communication mechanism between the relier and Firefox Accounts. The method of communication is channel specific.

#### [Reliers](https://github.com/mozilla/fxa-content-server/tree/master/app/scripts/models/reliers)

The relier model holds and fetches data about the current relier.

#### [User](https://github.com/mozilla/fxa-content-server/blob/master/app/scripts/models/user.js)

A User holds and persists data about the current user interacting with Firefox Accounts. A user can have one or more Accounts.

#### [Account](https://github.com/mozilla/fxa-content-server/blob/master/app/scripts/models/account.js)

An Account abstracts interaction between the user's account and the profile server.

#### [Router](https://github.com/mozilla/fxa-content-server/blob/master/app/scripts/router.js)

The Router is responsible for reacting to URL changes and displaying the Views.

#### [Views](https://github.com/mozilla/fxa-content-server/tree/master/app/scripts/views)

Views represent either an entire screen or a portion of a screen. Users enter data into Views.

#### [Templates](https://github.com/mozilla/fxa-content-server/tree/master/app/scripts/templates)

A templates is a serialized HTML representation of a View. A view renders a template using data available to it and writes the rendered template to the DOM. Templates use the [mustache](http://mustache.github.io/) templating library.

#### Clients (fxa-js-client, fxa-oauth-client, fxa-profile-client)

Communication with external servers are done via client libraries.

##### [fxa-js-client](https://github.com/mozilla/fxa-js-client)

The fxa-js-client communicates with the Firefox Accounts [Auth Server](https://github.com/mozilla/fxa-auth-server/). The fxa-js-client is used for all aspects of authenticating a user - sign up, sign in, password reset, etc.

##### [oauth-client](https://github.com/mozilla/fxa-content-server/blob/master/app/scripts/lib/oauth-client.js)

The oauth-client communicates with the Firefox Accounts [OAuth Server](https://github.com/mozilla/fxa-oauth-server/). The OAuth client is used to fetch OAuth codes and tokens to send to the RP.

##### [profile-client](https://github.com/mozilla/fxa-content-server/blob/master/app/scripts/lib/profile-client.js)

The profile-client communicates with the Firefox Accounts [Profile Server](https://github.com/mozilla/fxa-profile-server/). This client allows a user to interact with their profile data.

### Layers/Tiers

The content server web client is made up of many layers. An item is only allowed to interact with a layer below it, but not with ancestors or siblings.

[app-start.js](https://github.com/mozilla/fxa-content-server/blob/master/app/scripts/lib/app-start.js) is where the fun begins. It creates several models and a router. The router is passed a reference to several models. The router creates views. Only views are allowed to interact with templates. Models and Views use functionality provided by lib modules. vendor are external components and should be fully self contained. The full application lifecycle is described in the section `Application lifecycle`.

```
   app-start            |
     router             |
                      views
     models             |   templates
      lib               |
     vendor             |
```

### Application lifecycle

When the application starts, [app-start.js](https://github.com/mozilla/fxa-content-server/blob/master/app/scripts/lib/app-start.js) takes care of setting up system-wide dependencies. app-start immediately determines the integration type and creates the appropriate [Broker](https://github.com/mozilla/fxa-content-server/blob/8561ec3c1d06763f454f4ac7cb8ef142eb0c01b0/app/scripts/lib/app-start.js#L234) and [Relier](https://github.com/mozilla/fxa-content-server/blob/8561ec3c1d06763f454f4ac7cb8ef142eb0c01b0/app/scripts/lib/app-start.js#L199). The broker is queried to check support of the current integration. If the integration is supported, other models and the [router](https://github.com/mozilla/fxa-content-server/blob/8561ec3c1d06763f454f4ac7cb8ef142eb0c01b0/app/scripts/lib/app-start.js#L315) are created. The router takes over and determines the initial View to display, based upon the browser's URL. The View writes a Template to the DOM. The user interacts with the View, either by filling out a form or clicking on links and buttons. A view can communicate with external servers using clients. A view that communicates with an external server determines the appropriate next step based on the server's response. A view can redirect to another view, display a status message, or send a command to the broker. Upon successful authentication with Firefox Accounts, the broker is notified, which in turn notifies the relier. The relier is responsible for the final fate of the Firefox Accounts window. It can either close the window or leave the window to be closed by the user.

### Deeper View of Components

#### Reliers

##### Base

BaseRelier is the generic interface for the other reliers. BaseRelier can be used as a null Relier object.

##### Relier

Relier is the default relier when neither OAuth nor FxDesktop are used. Used when the user directly browses to https://accounts.firefox.com.

##### OAuth

OAuthRelier is used for the OAuth flows. It keeps track of OAuth related information sent by OAuth reliers.

##### FxDesktop

FxDesktopRelier is used when interfacing with Firefox Desktop Sync.

#### Authentication Brokers

##### public

###### fx-desktop-v1

v1 of the Firefox Desktop authentication broker, communicates with Firefox using CustomEvents when
the user is attempting to authenticate for Sync.

###### fx-desktop-v2

v2 of the Fx Desktop authentication broker, it communicates with the browser using WebChannels.

###### fx-desktop-v3

v3 of the Fx Desktop authentication broker, it allows the uid of a user to change if the user's account has been deleted.

###### fx-fennec-v1

Interfaces with Firefox for Android when authenticating for Sync, it communicates with the browser
using WebChannels.

###### fx-firstrun-v1

Used by FxDesktop to embed FxA within an iframe on the firstrun page. Communicates with the browser using WebChannels.

###### fx-firstrun-v2

v2 of the firstrun authentication broker, used to enable "Choose what to Sync".

###### fx-ios-v1

Interfaces with Sync on Fx for iOS. Uses the same custom protocol as fx-desktop-v1.

###### fx-sync

A base class for all other Sync auth brokers to define common behaviors. Instantiated directly in the
verification tab for users that authenticate for Sync and verify in a 2nd browser.

###### oauth-redirect

RedirectAuthenticationBroker is used for redirect based OAuth flows. The RedirectAuthenticationBroker sends results to the OAuth relying party via the browser's URL.

###### web

Authentication broker used when a user browses directly to the site.

##### internal

These brokers are for internal use, as the base for public brokers.

###### base

The generic interface for other brokers. Used to define common shared behaviors.

###### fx-sync-channel

Base for brokers that communicate with Firefox.

###### fx-sync-web-channel

Generic interface used for Syncing with browsers that support web channels.

##### oauth

OAuthAuthenticationBroker provides functionality common to all OAuth related flows. The OAuthAuthenticationBroker saves OAuth data before verification, generates OAuth results, and sends the OAuth result to the OAuth relying party.

#### Channels

##### FxDesktop v1/Sync

Communication between Sync and Firefox Accounts is done via [custom DOM events](https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent) known as a `FirefoxAccountsCommand`.

##### WebChannel/Sync

Communication between the browser and FxA is done via a custom DOM event known as a `WebChannelMessageToChrome`.

##### postMessage

Communication between the FxA and the RP is done via [postMessage](https://developer.mozilla.org/en-US/docs/Web/API/window.postMessage).

### High Level Server Side Components

#### Application

The content server is a simple [NodeJS](http://nodejs.org/)/[Express](http://expressjs.com/) based application. The content server's primary responsibility is to deliver the web client, [Terms Of Service](https://github.com/mozilla/fxa-content-server/blob/master/server/templates/pages/src/terms.html), and [Privacy Policy](https://github.com/mozilla/fxa-content-server/blob/master/server/templates/pages/src/privacy.html) to users in their preferred locale. The content server's entry point is in [./server/bin/fxa-content-server.js](https://github.com/mozilla/fxa-content-server/blob/master/server/bin/fxa-content-server.js).

##### Additional Templates

Additional [handlebars](http://handlebarsjs.com/) templates are rendered by the server to serve [static pages](https://github.com/mozilla/fxa-content-server/tree/master/server/templates/pages/src) and [send email](https://github.com/mozilla/fxa-content-server/tree/master/server/templates/email). While the content server holds the templates for the emails, emails are delivered by the [fxa-auth-mailer](https://github.com/mozilla/fxa-auth-mailer/). The content server contains the email templates to make L10n simpler.

## UX/User flows

An up to date [flow diagram](http://is.gd/Sync_FxA_Latest_Desktop_UX_PDF) flow diagram is maintained by UX. Some integrations require subtle differences in expected behavior between screen transitions; a [Google docs spreadsheet](https://docs.google.com/a/mozilla.com/spreadsheets/d/16Uhb8vtGB_-krMbzaq0b3XYvTWePi_xgIElL7dquohA/) is maintained that outline where these differences exist.

## L10n/I18n

Mozilla's L10n community has done an incredible job of translating Firefox Accounts into over 20 languages. More information on how L10n works can be found in this [README](https://github.com/mozilla/fxa-content-server-l10n/blob/master/locale/README.md) in the [fxa-content-server-l10n](https://github.com/mozilla/fxa-content-server-l10n) repo.

## Contact

-   Developer mailing list: dev-fxacct@mozilla.org
-   IRC: #fxa in irc.mozilla.org

## Additional Resources

-   [APIs attached to Firefox Accounts](https://developer.mozilla.org/docs/Mozilla/APIs_attached_to_Firefox_Accounts)
-   [Firefox Accounts Auth Server API](https://github.com/mozilla/fxa-auth-server/blob/master/docs/api.md)
-   [Firefox Acocunts Auth Server Codebase](https://github.com/mozilla/fxa-auth-server/)
-   [Firefox Accounts OAuth Server API](https://github.com/mozilla/fxa-oauth-server/blob/master/docs/api.md)
-   [Firefox Accounts OAuth Server Codebase](https://github.com/mozilla/fxa-oauth-server/)
-   [Firefox Accounts Profile Server API](https://github.com/mozilla/fxa-profile-server/blob/master/docs/API.md)
-   [Firefox Accounts Profile Server Codebase](https://github.com/mozilla/fxa-profile-server/)
-   [OAuth 2.0 RFC 6749](http://tools.ietf.org/html/rfc6749)
-   [Firefox Accounts Pairing Flow](pairing-architecture.md)
