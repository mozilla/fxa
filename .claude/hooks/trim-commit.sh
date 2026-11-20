#!/usr/bin/env bash
# Trim git commit output before it reaches Claude: drop lint-staged's JSON event
# stream (its non-TTY renderer) and npm/git chatter. Errors, diffstat, and the
# commit line pass through.
grep -vE '^\{"event":|^(npm notice|hint:|\s*$)' | cat -s
