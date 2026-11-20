#!/usr/bin/env bash
# PreToolUse(Bash) hook. Rewrites test-runner and git-commit commands so their
# output passes through a trimmer before Claude sees it. The command itself,
# its exit status (pipefail), and the normal permission prompt are unchanged.
input=$(cat)
cmd=$(jq -r '.tool_input.command // empty' <<<"$input")
[[ -z "$cmd" || "$cmd" == *".claude/hooks/trim-"* ]] && exit 0

case "$cmd" in
  *"git commit"*)                   trimmer=trim-commit.sh ;;
  *"nx test"*|*"yarn test"*|*jest*) trimmer=trim-tests.sh ;;
  *) exit 0 ;;
esac

# Resolve the trimmer path here: the rewritten command runs in a shell that
# does not have CLAUDE_PROJECT_DIR. The closing brace sits on its own line so
# a trailing heredoc terminator survives.
trimmer_path="${CLAUDE_PROJECT_DIR:-$(cd "$(dirname "$0")/../.." && pwd)}/.claude/hooks/$trimmer"
quoted_trimmer_path=$(printf '%q' "$trimmer_path")
jq -n --arg c "set -o pipefail; { $cmd"$'\n'"} 2>&1 | $quoted_trimmer_path" '{
  hookSpecificOutput: {
    hookEventName: "PreToolUse",
    updatedInput: { command: $c }
  }
}'
