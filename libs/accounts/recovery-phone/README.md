# recovery-phone

Recovery phone account library for FxA that handles recovery phone functionality and database operations.

## Building

Run `nx build recovery-phone` to build the library.

## Running unit tests

Run `nx test-unit accounts-recovery-phone` to execute the unit tests via [Jest](https://jestjs.io).

## Running integration tests

Run `nx test-integration accounts-recovery-phone` to execute the integration tests via [Jest](https://jestjs.io).

## Testing webhook callbacks for message status updates

Important Tip! To manually test webhook callbacks isn't super straight forward. Per Twilio's docs the best way to manually test is as follows.

1. Use ngrok to reverse proxy: ngrok http 9000
2. Whatever url ngrok spits out, update the auth server configuration to use this value plus `/v1/recovery_phone/status` as the twilio webHook url value. eg.
   `RECOVERY_PHONE__TWILIO__WEBHOOK_URL=https://YOUR_NGROK_SUBDOMAIN.ngrok-free.app/v1/recovery_phone/status`
3. Start up the server again `dotenv -- yarn restart auth --update-env`. Or the whole stack if you are starting from scratch `dotenv -- yarn start`.
4. Create an account
5. Enable 2FA
6. Register a recovery phone
7. Watch the logs, you'll see twilio making the call back to the `/v1/recovery_phone/status` end point.

(Based on, https://www.twilio.com/en-us/blog/test-your-webhooks-locally-with-ngrok-html)

Also it's good to note that there are some caveats about configuration for webhooks. If you have an twilio authToken in used, the webhook will validate
the `X-Twilio-Signature` header. If you are using twilio API keys, then we need the fxaPublicKey/fxaPrivateKey pair set in the config. Reach
out to a teammate for this value, or generate one yourself. There's a method that will do this in the `util.ts`. And make sure this key pair
is in the config!

## Configuration & Twilio Client Modes

In order to use this library, we must configure Twilio. Twilio is unique in that the client can essentially operate in two different modes and these
modes are dictated by the credentials passed to the client.

There is a 'testing' mode and a 'default' mode. The testing mode cannot send messages to real phone numbers, but it can send messages to 'magic' testing
numbers that are reserved and maintained by Twilio for testing purposes and are free to send SMS to. The default mode can send out real text messages,
but cannot send messages to 'magic' testing numbers.

This design results in a scenario where we often have to switch between testing and default modes. In order to make this easy, we've added a 'credentialMode'
to signal which credentials set should be used.

The config class can be found in `src/lib/twilio-config.ts`. An example application of this config can be found in `packages/fxa-auth-server/config/index.ts`, and
auth-server's read me has some doc on how to configure its env for Twilio.
