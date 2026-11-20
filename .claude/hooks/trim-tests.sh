#!/usr/bin/env bash
# Trim Jest output before it reaches Claude: drop PASS suite lines and passing
# ticks, collapse blank runs. Failure blocks and the Tests:/Suites: summary pass through.
grep -vE '^\s*(PASS|✓|√) ' | cat -s
