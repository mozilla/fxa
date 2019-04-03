## Creating Releases

1. Run `scripts/release.sh` if you're doing a major train bump,
   or `scripts/release.sh patch` if you're tagging a patch release.

2. Do a `git log`, check everything looks ok (including the changelog).

3. `git push` the train branch and the tag.
