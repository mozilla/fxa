#!/bin/bash
#
# Connection banner for the stack job. The SSH host and port are assigned by
# CircleCI's gateway and not visible to the job, hence no ssh line here.

set -euo pipefail

cat <<'BANNER'

================================================================================
  FxA stack is up!   Notes: .circleci/README.md (Interactive stack)
================================================================================

  From your machine, on the branch this job built (or pass its PR number):
  - Stop your local pm2 stack first: `yarn stop`
  - Forward the ports: `yarn pr-debug --tunnel`
  - Open http://localhost:3030. You are now on the CI servers for this commit.

  For logs, open a shell beside the tunnel: `yarn pr-debug --ssh`
  then `yarn pm2 log` on the box.

  Sign up with an @restmail.net address; read the mail at
  http://localhost:9001/mail/<local-part> (blocks until mail arrives).

  The job holds the stack up for the next step's duration whether or not you
  are connected, then CircleCI's limits apply: it shuts down about ten minutes
  after the last SSH session closes, two hours per job at most.

================================================================================

BANNER
