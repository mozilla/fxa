# Firefox Accounts Server

The Firefox Accounts server provides a shared authentication and management infrastructure for the Mozilla Cloud Services ecosystem. It is a HTTP API through which a user-agent can manage:

- user account details, such as email address and password
- the list of devices connected to the account
- the master encryption keys used by services connected to the account

There is no UI provided by this server. It is expected that user interaction will happen through Firefox or a hosted website, which will use the API provided by this server.

## Concepts

Each user of the service creates an **account** which has a unique id. Access to the account is authenticated by an email/password pair and uses the [Secure Remote Password protocol](https://en.wikipedia.org/wiki/Secure_Remote_Password_protocol) to avoid revealing the password to the server. Note that our SRP protocol ordering is slightly different from the sample on wikipedia, but the variables are the same.

The user connects one or more **devices** to their account. Each device performs the SRP authentication protocol to obtain one or more opaque **authentication tokens**, which are then used to make [Hawk signed requests](https://github.com/hapijs/hawk/) when interacting with the server API. This token exchange means the device does not need to keep the the user's password in persistent storage.

Once connected, each device can fetch the user's **encryption keys**. The server maintains two keys for each account, called **kA** and **kB**. kA is known to the server, and is intended for encrypting data that must be recoverable in the event of password reset. kB is stored encrypted by the user's password, and is intended for more secure encryption at the cost of unrecoverability when the password is forgotten.

Each connected device can also request a **signed identity certificate**, which it can use to authenticate to other services via the [BrowserID protocol](https://login.persona.org/). In this sense the Firefox Accounts server acts as a [BrowserID Identity Provider](https://developer.mozilla.org/en-US/Persona/Identity_Provider_Overview) for the user.

## API

All server functionality is exposed via a HTTP API. It is JSON based and vaguely restful. A detailed description is available [here](./api.md) and a prose overview of the design and cryptogaphic details is available [here](https://wiki.mozilla.org/Identity/AttachedServices/KeyServerProtocol).

## Logging

We log several events for analytical and metrics purposes:

### Activity Events

We emit activity events for metrics purposes.
These events contain the `uid` of the account to be able to better understand new user activity.

#### Available events

- account.created - [Account is created](api.md#post-v1accountcreate)
- account.verified - [Account is verified](api.md#post-v1recovery_emailverify_code)
- account.login - [Account login event](api.md#post-v1accountlogin)
- account.confirmed - [Account login is confirmed](api.md#post-v1recovery_emailverify_code)
- account.keyfetch - [Sync encryption keys have been fetched](api.md#get-v1accountkeys)
- account.signed - [Certificate signed](api.md#post-v1certificatesign)
- account.reset - [Account reset event](api.md#post-v1accountreset)
- account.deleted - [Account is deleted](api.md#post-v1accountdestroy)
- device.created - Device record is created
- device.updated - Device record is updated
- device.deleted - Device record is deleted

#### Activity event structure

Activity events are JSON data
containg the following fields:

- `event`
- `time`
- `uid`
- `userAgent`
- `account_created_at` (optional)
- `device_id` (optional)
- `service` (optional)

##### Example event

```
{
  "event": "account.created",
  "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.10; rv:50.0) Gecko/20100101 Firefox/50.0",
  "time": 1471258615891,
  "uid": "6bf1375cf2b4439bb36d02479c35ef0d"
}
```

### Flow events

Flow events are used to analyse
end-to-end user journeys
through the sign-up/sign-in flow.
For each activity event,
a flow event is also emited.
There are also further flow events
that do not correspond to an activity event.
In addition to the data that is present on activity events,
these events also have a metrics context
that includes `flowId` and `flowBeginTime` properties.

#### Flow event structure

Flow events are JSON data
containg the following fields:

- `event`
- `flow_id`
- `flow_time`
- `time`
- `userAgent`

##### Example event

```
{
  "event": "account.created",
  "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.10; rv:50.0) Gecko/20100101 Firefox/50.0",
  "time": 1471258615891,
  "flow_id": "1386176a76f4359d30aea806400ebbf8af1fb0040891ff32cd0d5cc5038f6d58",
  "flow_time": 11948
}
```
