# Experiment grouping rules

Experiment grouping rules decide whether a user is part of an experiment,
and if so, which group.

## Creating a new rule.

1. Copy [TEMPLATE.js](https://github.com/mozilla/fxa-content-server/tree/master/app/scripts/experiments/grouping-rules/TEMPLATE.js) to a new grouping rule file.
2. Change `ChangeMeGroupingRule` class name to another name.
3. Change `this.name` from `CHANGE_ME` in the constructor.
4. Fill in the `choose` function.
5. Include the new grouping rule file in [index.js](https://github.com/mozilla/fxa-content-server/tree/master/app/scripts/experiments/grouping-rules/index.js).
6. Access in views via `this.experiments.choose('name from 3')`

## `choose` recipes

The `subject` parameter contains data that can be used
to determine the value `choose` should return. See [lib/experiment.js->getExperimentGroup](https://github.com/mozilla/fxa-content-server/tree/master/app/scripts/lib/experiment.js) for the current list of
data passed to `choose`. If `choose` needs a field
not available by default, call [`getExperimentGroup`](https://github.com/mozilla/fxa-content-server/blob/5f1af068cf9c35ae4da28143750bf8f91fc5ae2d/app/scripts/lib/experiment.js#L191) with
the necessary field in the `additionalInfo` parameter.

### feature flag

Return a boolean value.

```js
choose (subject = {}) {
  return subject.firefoxVersion >= MIN_FIREFOX_VERSION;
}
```

### Phased rollout feature flag

Use `bernoulliTrial` to return a Boolean value.

```js
choose (subject = {}) {
  return this.bernoulliTrial(0.3, subject.uniqueUserId);
}
```

### A/B test

Use `uniformChoice` to return the bucket choice.

```js
choose (subject = {}) {
  const GROUPS = ['control', 'treatment'];
  return this.uniformChoice(GROUPS, subject.uniqueUserId);
}
```

### Phased rollout A/B test

Combine `bernoulliTrial` and `uniformChoice`.
First, use `bernoulliTrial` to determine if the user is
part of the experiment. If the user is part of the experiment,
use `uniformChoice` to determine which bucket.

```js
choose (subject = {}) {
  // first, determine if the user is part of the experiment.
  if (this.bernoulliTrial(0.3, subject.uniqueUserId)) {
    // User is part of the experiment, determine which bucket.
    const GROUPS = ['control', 'treatment'];
    return this.uniformChoice(GROUPS, subject.uniqueUserId);
  }
  return false;
}
```

### Recursive calls to other rules

`subject` will contain a reference to `experimentGroupingRules` which can
be used to recursively call other tests.

```js
choose (subject = {}) {
  const choice = this.uniformChoice(['recursive-rule-1', 'recursive-rule-2'], subject.uniqueUserId);
  return subject.experimentGroupingRules.choose(choice, subject);
}
```

### Mutually exclusive grouping rules

Recursive rules can be used to implement mutual exclusion amongst two or more grouping rules.

#### group_chooser.js

```js
constructor () {
  super();
  this.name = 'experiment-chooser';
}

choose (subject = {}) {
  return this.uniformChoice(['experiment-1', 'experiment-2'], subject.uniqueUserId);
}
```

#### experiment_1.js

```js
constructor () {
  super();
  this.name = 'experiment-1';
}

choose (subject = {}) {
  if (subject.experimentGroupingRules.choose('experiment-chooser') === this.name) {
    // user is part of the experiment-1, determine which bucket.
    const GROUPS = ['control', 'treatment'];
    return this.uniformChoice(GROUPS, subject.uniqueUserId);
  }
}
```

#### experiment_2.js

```js
constructor () {
  super();
  this.name = 'experiment-2';
}

choose (subject = {}) {
  if (subject.experimentGroupingRules.choose('experiment-chooser') === this.name) {
    // user is part of the experiment-2, determine which bucket.
    const GROUPS = ['control', 'treatment'];
    return this.uniformChoice(GROUPS, subject.uniqueUserId);
  }
}
```

#### view code

```js
if (this.isInExperimentGroup('experiment-2', 'treatment')) {
    // do something awesome here.
}
```
