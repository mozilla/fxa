Communication with Firefox via WebChannels
==========================================

The preferred method for FxA to communicate with Firefox is with [WebChannels](https://developer.mozilla.org/en-US/docs/Mozilla/JavaScript_code_modules/WebChannel.jsm). WebChannels provide secure two-way communication between the browser and web content. Messages sent from content to the browser utilize `WebChannelMessageToChrome` custom events. Messages sent from the browser to content utilize `WebChannelMessageToContent` custom events.

`FirefoxAccountsCommands` have been deprecated.

### Context
WebChannels are used to communicate Sync related information when
`service=sync&context=<context>` query parameters are specified.
`<context>` should be one of:

* `iframe`
* `fx_desktop_v2`
* `fx_fennec_v1`

### Commands
A command is a `WebChannelMessageToChrome` custom event sent from FxA to the browser using the `account_updates` WebChannel.

Command format is explained in the section titled `Command/Request format`

#### fxaccounts:loaded
Sent on startup. Sent after the first screen is visible. No data is sent. No response is expected.

#### fxaccounts:can_link_account
Sent on signin or signup after a user has entered their credentials and submit the form. A response with an `ok` field is expected.

##### request data
```js
{
  email: <email>
}
```

##### response data
```js
{
  ok: (true|false)
}
```

#### fxaccounts:login
Sent when a user successfully authenticates with Firefox Accounts and sync can begin. This includes after a user signs up but before they verify their email address, after an account unlock, and after a password reset. No response is expected.

##### data
```js
{
  customizeSync: (true|false),
  declinedSyncEngines [<array of declined sync engines>],
  email: <email>,
  keyFetchToken: <key fetch token>,
  sessionToken: <session token>,
  uid: <user id>,
  unwrapBKey: <unwrap b key>,
  verified: (true|false),
  verifiedCanLinkAccount: (true|false)
}
```

* `customizeSync` - Should the user be shown the browser's `Customize Sync` dialog?
* `declinedSyncEngines` - An array of Sync engines the user has deselected.
* `email` - User's email address.
* `keyFetchToken` -
* `sessionToken` - The current session token that can be used to interact with FxA's auth server.
* `uid` - The user identifier.
* `unwrapBKey` - The key used to encrypt and decrypt the user's sync data.
* `verified` - Is the user verified?
* `verifiedCanLinkAccount` - Has the user verified they want to link accounts, if signing into a different account than previously signed in to?

###### Possible `declinedSyncEngines`

* bookmarks
* history
* passwords
* tabs
* desktop-addons
* desktop-preferences

#### fxaccounts:delete_account
Sent after the user successfully deletes their account. No response is expected.

##### data

```js
{
  email: <email>,
  uid: <user id>
}
```

* `email` - User's email address.
* `uid` - The user identifier.


#### fxaccount:change_password

Sent after the user successfully changes their password. No response is expected. A change password causes a user's `unwrapBKey` to change, all data that is sent with `fxaccounts:login` is sent with `fxaccounts:change_password`.

#### profile:change

Sent after the user changes their avatar or display name. No response is
expected.

##### data
```js
{
  uid: <user id>
}
```

* `uid` - The user identifier.

### Command/Request format

Each custom event is created as follows:

```
new CustomEvent('WebChannelMessageToChrome', {
  detail: {
    id: 'account_updates',
    message: {
      command: <command>,
      data: <data>,
      messageId: <message id>
    }
  }
});
```

* `command` is one of the commands specified below.
* `data` is an optional JavaScript object.
* `messageId` is an opaque identifier that should be specified when responding to to a message.


### Response format

Responses to FxA use the `WebChannelMessageToContent` custom event, which is handled by the `WebChannel.jsm` module's [`send` function](https://dxr.mozilla.org/mozilla-central/source/toolkit/modules/WebChannel.jsm#272). The `message` parameter should the following format:

```js
{
  command: <command>,
  data: <data>,
  messageId: <message id>
}
```

* `command` is one of the commands specified below.
* `data` is an optional JavaScript object.
* `messageId` is the message ID sent in the `WebChannelMessageToChrome` custom event.

### Command order for a signin/signup
1. fxaccounts:loaded
1. fxaccounts:can_link_account
1. fxaccounts:login
