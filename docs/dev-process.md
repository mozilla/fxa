# Development Process Overview

We develop and deploy on a two-week iteration cycle.  You can view our current development
status and priorities on the [Firefox Teams page](https://wiki.mozilla.org/Firefox/Teams).

## Issue management

Most of our work takes place on [GitHub](https://github.com/mozilla/fxa).  We use labels and
milestones to keep things organised, and [waffle.io](https://waffle.io) to provide an overview
of bug status and activity:

* [Active issues for Firefox Accounts](https://waffle.io/mozilla/fxa)

Conventions that we follow for waffle:

* All incoming issues start out unlabeled and in the "triage" column in waffle.
* Things that are ready for someone to pick up and work on right now are labelled with
  "waffle:ready".  We try to keep the "ready" column roughly sorted in order of priority.
* Things that we want to keep track of, but don't plan to work on soon, are labelled
  with "waffle:later".  We periodically review the "later" column to see what should be
  promoted to "ready" and what should be closed.
* Things that are actively being worked on are labelled either "waffle:progress" or
  "waffle:review" depending on their status:
    * When you start working on somthing, assign it yourself and mark it "waffle:progress".
    * Once it's got a pull request with code ready for review, change it to "waffle:review".
* Issues that were recently closed out will automatically move to the "done" column.

The assignee of an issue is the person responsible for taking the next action on that
issue.  This might be the developer, the reviewer, or somebody else who is being
roped in for additional context.

* Issues in "waffle:progress" or "waffle:review" should always have an assignee;
  issues in other states generally shouldn't.
* We have an automated script to bump issues with an assignee that haven't seen
  any activity since the last development cycle.

Each two-week development iteration gets a milestone, to which we assign the issues
we plan to resolve in that period.  We use additional labels to organise our work into
broad initiatives:

* New feature initiatives should get a label named after them, which can be applied to
  all issues in the breakdown of that feature.  For example, ["avatars"](https://waffle.io/mozilla/fxa?label=avatars) or ["/firstrun"](https://waffle.io/mozilla/fxa?label=%2Ffirstrun).
  The feature will be considered done when all the labelled issues are closed.
* Bugfixes and improvements in existing features get the label ["quality"](https://waffle.io/mozilla/fxa?label=quality).
* Non-user-facing (though no less important!) cleanup tasks get the label ["chore"](https://waffle.io/mozilla/fxa?label=chore).
* Issues that need to be resolved before the release of a particular Firefox version
  are labelled with a 'FxVERSION' tag, e.g. ["Fx42"](https://waffle.io/mozilla/fxa?label=Fx42).

