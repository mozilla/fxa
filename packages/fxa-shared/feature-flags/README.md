# FxA feature-flagging

- [What do you mean, "feature-flagging"?](#what-do-you-mean-feature-flagging)
- [How is feature-flagging implemented?](#how-is-feature-flagging-implemented)
- [How can I see the current state for all feature flags?](#how-can-i-see-the-current-state-for-all-feature-flags)
- [How do I configure a new feature flag?](#how-do-i-configure-a-new-feature-flag)
- [How do I edit the configuration for an existing feature flag?](#how-do-i-edit-the-configuration-for-an-existing-feature-flag)
- [What should I do if I made a mistake when configuring a feature flag?](#what-should-i-do-if-i-made-a-mistake-when-configuring-a-feature-flag)
- [How do I change the validation rules for a feature flag?](#how-do-i-change-the-validation-rules-for-a-feature-flag)
- [How do I use a feature flag in the content server?](#how-do-i-use-a-feature-flag-in-the-content-server)
- [How do I use a feature flag in the auth server?](#how-do-i-use-a-feature-flag-in-the-auth-server)

## What do you mean, "feature-flagging"?

Historically,
the FxA team has carried out development work
on feature branches,
only merging to `master`
after a given feature has been completed
and code-reviewed.
Then,
every two weeks,
all of the merged features
from the current iteration
are bundled together as a "train",
progressed through QA
and eventually deployed to production.
Occasionally there are also point releases
to address specific issues
but broadly speaking,
this two-week cycle
defines how quickly
any given feature
can make it to production.

In the future,
we'd like to move towards
a process of continuous deployment,
where features are pushed to production
a matter of minutes
after they're merged,
hidden behind a feature flag
that can be used to control rollout
(or rollback).
This approach also facilitates
mainline development,
where engineers merge their work directly to `master`
in regular, smaller chunks
and releases are cut from
dedicated branches off `master`.
There's a much longer discussion
to be had around mainline development,
which is out of scope for this readme.

Anyway,
to return to the original question,
feature-flagging is the mechanism
by which we can move
from the state of affairs in the first paragraph
to the bright new future of the second.

## How is feature-flagging implemented?

There was a lot of discussion
about the different options,
some of which was captured in the [feature doc](https://docs.google.com/document/d/1pRQuK7GWM3zEZLObZCByDxU_cImduICHrL6SaPSoUkU/edit#heading=h.itc4v4xvi73s).
After trialling implementations
based on LaunchDarkly (3rd-party, paid-for service)
and Unleash (open-source, self-hosted service),
we decided a home-baked implementation,
based on Redis and some scripting,
would be sufficient for our requirements.
Long term we plan to include feature-flagging
in the UI for an FxA admin panel.

Most of the code for feature-flagging
is in the `fxa-shared` package,
including both application code
for reading flags
and scripting that writes them.

For reference,
here are links to the relevant pull requests:

- [feat(feature-flags): implement a common api for feature-flagging](https://github.com/mozilla/fxa-shared/pull/45)
- [feat(feature-flags): wire in experiments to the feature-flag api](https://github.com/mozilla/fxa-content-server/pull/7060)

This demo of the Redis-based implementation
may also be of interest:

- [Feature-flagging for FxA using Redis](https://vimeo.com/321952464)

## How can I see the current state for all feature flags?

You can read the current state from Redis
using [`scripts/feature-flags.js`](../scripts/feature-flags.js)
in this package.

The script assumes
that the Redis instance
you want to connect to
is running on the local host
on port 6379.
If that's not the case,
you can overwrite those defaults
using the environment variables
`REDIS_HOST` and `REDIS_PORT`.

To fetch the current flags,
run the script with the argument `read`:

```
node scripts/feature-flags read
```

It will pretty-print
the JSON-serialised flags
to `stdout`.

## How do I configure a new feature flag?

Using the [same script](#how-can-i-see-the-current-state-for-all-feature-flags),
you can add data for a flag
by giving it the argument `merge`
and piping the JSON-serialised flag
to `stdin`:

```
echo '{"foo":{"rolloutRate":1}}' | node scripts/feature-flags merge
```

However,
this command will fail
if the data is not
[valid according to the schema](#how-do-i-change-the-validation-rules-for-a-feature-flag).
With validation in place,
you should be able to run
the above command successfully
and then read the flag back
using `node scripts/feature-flags read`.

## How do I edit the configuration for an existing feature flag?

This is the same process
as [configuring a new flag](#how-do-i-configure-a-new-feature-flag).
The `merge` command is not very intelligent,
so it will clobber the existing value
for your flag with whatever you specify.
It's your responsibility to make sure
you check the existing value of the flag with `read`
and include any properties as necessary.

## What should I do if I made a mistake when configuring a feature flag?

There is limited protection
against user error
with the `revert` command:

```
node scripts/feature-flags revert
```

Note that `revert` does not implement an undo stack.
Instead it just goes back to the previous state,
so reverting twice is a NOP.

## How do I change the validation rules for a feature flag?

Validation rules are defined using [JSON Schema](https://json-schema.org/),
in [`feature-flags/schema.json`](schema.json)
in this package.
For development work
you can just make local changes to this file
but if your changes are meant for production,
you'll need to open a pull request
to get the changes reviewed
and merged back to `master`.

## How do I use a feature flag in the content server?

If you're writing client-side code,
the feature flags are all available
via the `config.featureFlags` property
set in [`app/scripts/lib/config-loader.js`](https://github.com/mozilla/fxa/blob/master/packages/fxa-content-server/app/scripts/lib/config-loader.js).
Typically,
you'd be expected to access them
from code in the [`app/scripts/lib/experiments/grouping-rules`](https://github.com/mozilla/fxa/tree/master/packages/fxa-content-server/app/scripts/lib/experiments/grouping-rules) directory
and there are many examples there
of experiments that use feature flags.

If you're writing back-end code,
you should load the feature-flags module
like so:

```js
let featureFlags;
const featureFlagConfig = config.get('featureFlags');
if (featureFlagConfig.enabled) {
  featureFlags = require('fxa-shared').featureFlags(featureFlagConfig, logger);
} else {
  featureFlags = { get: () => ({}) };
}
```

And use it like so:

```js
let flags;
try {
  flags = await featureFlags.get();
} catch (err) {
  logger.error('featureFlags.error', err);
  flags = {};
}
```

You can find an example of this
in the route handler
in [`server/lib/routes/get-index.js`](https://github.com/mozilla/fxa/blob/master/packages/fxa-content-server/server/lib/routes/get-index.js).

## How do I use a feature flag in the auth server?

The auth server has not been integrated
with the feature-flagging code yet,
so you'll need to do [that](https://github.com/mozilla/fxa/issues/475) first.
