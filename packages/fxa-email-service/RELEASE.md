## Creating Releases

### Get dependencies if missing

```
cargo install clog-cli
```

### Tag a new minor release 

* Update `Cargo.toml` and `Cargo.lock` with the new version.

* Generate the changelog:
```
clog -F --setversion $FXA_EMAIL_SERVICE_VERSION -i CHANGELOG.md -o CHANGELOG.md
```

* Commit and send the PR for review.

* If all good, create a tag from the PR that was merged into the master branch. 

*****

Additional docs:

* https://github.com/clog-tool/clog-cli#using-clog-from-the-command-line
