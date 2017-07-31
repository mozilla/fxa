/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

//  Some slightly-higher-level wrappers around github automation API.

const assert = require('assert')
const path = require('path')
const fs = require('fs')
const child_process = require('child_process')

const GitHubApi = require('github')
const P = require('bluebird')
const got = require('got')


// Read in configuration info from files.

var ROOT_DIR = path.normalize(path.dirname(__dirname))

var TOP_LEVEL_REPO = { owner: 'mozilla', name: 'fxa' }

var REPOS = fs.readFileSync(path.join(__dirname, 'repos.txt'), 'utf-8').split('\n').map(function (ln) {
  return ln.trim();
}).filter(function (ln) {
  return (ln && ln[0] !== '#');
}).map(function (repo) {
  var owner = 'mozilla'
  var parts = repo.split('/')
  if (parts.length === 2) {
    owner = parts[0];
    repo = parts[1];
  }
  return { owner: owner, name: repo };
});

var USERNAME_TO_EMAILS = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'contributors.json'))
)

var EMAIL_TO_USERNAME = {}
Object.keys(USERNAME_TO_EMAILS).forEach(function(username) {
  USERNAME_TO_EMAILS[username].forEach(function(email) {
    EMAIL_TO_USERNAME[email] = username
  })
})


function emailToUsername(email, defaultValue) {
  email = email.replace(/\s/g, '')
  if (EMAIL_TO_USERNAME[email]) {
    return EMAIL_TO_USERNAME[email]
  }
  if (email.indexOf("@") === -1) {
    return email
  }
  return defaultValue
}

var REPO_NAME_TO_OWNER = {}
REPOS.forEach(function (repo) {
  REPO_NAME_TO_OWNER[repo.name] = repo.owner
})

function getRepoOwner(name) {
  return REPO_NAME_TO_OWNER[name] || 'mozilla'
}

// Make a nicely promisified github API object.

function GH(options) {

  options = options || {}
  this._gh = P.promisifyAll(new GitHubApi({
    version: '3.0.0',
    host: options.host || 'api.github.com',
    debug: options.debug,
    timeout: options.timeout || 3000,
  }))

  var env = process.env
  var api_key = options.api_key || env.GITHUB_API_KEY
  if (api_key) {
    var username = options.username || env.GITHUB_USERNAME || env.USER
    this._gh.authenticate({
      type: 'basic',
      username: username,
      password: api_key
    })
  }

  var self = this

  // Expose the 'issues' API with promisified semantics, and with
  // a wrapper to fetch all result pages at once.
  var self = this
  this.issues = {}
  Object.keys(this._gh.issues).forEach(function(methodName) {
    if (typeof self._gh.issues[methodName] === 'function') {
      self.issues[methodName] = function(msg) {
        msg.owner = msg.owner || getRepoOwner(msg.repo)
        msg.per_page = msg.per_page || 30
        return new P(function(resolve, reject) {
          self._gh.issues[methodName](msg, function(err, res) {
            if (err) return reject(err)
            resolve(self._getAllPages(msg, res))
          })
        })
      }
    }
  })

  // Expose the 'repos' API with promisified semantics, and with
  // a wrapper to fetch all result pages at once.
  this.repos = {}
  Object.keys(this._gh.repos).forEach(function(methodName) {
    if (typeof self._gh.repos[methodName] === 'function') {
      self.repos[methodName] = function(msg) {
        msg.owner = msg.owner || getRepoOwner(msg.repo)
        msg.per_page = msg.per_page || 30
        return new P(function(resolve, reject) {
          self._gh.repos[methodName](msg, function(err, res) {
            if (err) return reject(err)
            resolve(self._getAllPages(msg, res))
          })
        })
      }
    }
  })

  // Expose the 'pullRequests' API with promisified semantics, and with
  // a wrapper to fetch all result pages at once.
  this.pullRequests = {}
  Object.keys(this._gh.pullRequests).forEach(function(methodName) {
    if (typeof self._gh.pullRequests[methodName] === 'function') {
      self.pullRequests[methodName] = function(msg) {
        msg.owner = msg.owner || getRepoOwner(msg.repo)
        msg.per_page = msg.per_page || 30
        return new P(function(resolve, reject) {
          self._gh.pullRequests[methodName](msg, function(err, res) {
            if (err) return reject(err)
            resolve(self._getAllPages(msg, res))
          })
        })
      }
    }
  })

  // Expose the 'gitdata' API with promisified semantics, and with
  // a wrapper to fetch all result pages at once.
  this.gitdata = {}
  Object.keys(this._gh.gitdata).forEach(function(methodName) {
    if (typeof self._gh.gitdata[methodName] === 'function') {
      self.gitdata[methodName] = function(msg) {
        msg.owner = msg.owner || getRepoOwner(msg.repo)
        msg.per_page = msg.per_page || 30
        return new P(function(resolve, reject) {
          self._gh.gitdata[methodName](msg, function(err, res) {
            if (err) return reject(err)
            resolve(self._getAllPages(msg, res))
          })
        })
      }
    }
  })
}

GH.prototype._getAllPages = function _getAllPages(msg, curPage, acc) {
  var self = this
  acc = acc || []
  acc = acc.concat(curPage)
  if (!this._gh.hasNextPage(curPage)) {
    return P.resolve(acc)
  }
  return self._gh.getNextPageAsync(curPage, msg.headers).then(function (nextPage) {
    return self._getAllPages(msg, nextPage, acc)
  })
}


// Resolve a PR to its containing milestone,
// via the references issue if necessary.

function prToMilestone(gh, repo, pr) {
  return P.resolve().then(function() {
    if (pr && pr.id) {
      return pr
    }
    return gh.pullRequests.get({ repo: repo.name, number: pr })
      .then(function (prs) {
        return prs[0]
      })
  }).then(function (pr) {
    if (pr.milestone) {
      return pr.milestone
    }
    if (pr.body) {
      // See if it's linked to an issue with a milestone.
      // XXX TODO: cross-repo references
      var re = /(Fix|Fixes|Fix for|Closes|Connects|Connects to|Ref:|References|Related to)\s*\#([0-9]+)/im
      var match = re.exec(pr.body)
      if (match) {
        return gh.issues.get({ repo: repo.name, number: parseInt(match[2], 10) })
          .then(function(issues) {
            if (!issues.length) { return null }
            return issues[0].milestone
          })
      }
    }
    return null
  })
}



// Ensure we have a local checkout of all our repos.

var REPOS_DIR = path.join(ROOT_DIR, "repos")
if (!isDirectory(REPOS_DIR)) {
  fs.mkdirSync(REPOS_DIR)
}

function ensureLocalRepos() {
  return P.each(REPOS, function(repo) {
    var repoDir = path.join(REPOS_DIR, repo.name);
    return P.resolve().then(function() {
      if (!isDirectory(repoDir)) {
        return sh(['git', 'clone', 'https://github.com/' + repo.owner + '/' + repo.name, repoDir])
      }
    }).then(function() {
      return git(repo, ['fetch', 'origin'])
    })
  })
}

function getCommitAuthorsInDateRange(repo, start, end) {
  var since = "--since='" + (new Date(start) + '') + "'"
  var before = "--before='" + (new Date(end) + '') + "'"
  return git(repo, ['log', '--no-merges', '--pretty=%ae', since, before, 'origin/master']).map(function(email) {
    return emailToUsername(email)
  })
}

function getCommitInfoInDateRange(gh, repo, startDate, endDate) {
  var since = "--since='" + (new Date(startDate) + '') + "'"
  var before = "--before='" + (new Date(endDate) + '') + "'"
  var gitargs = [since, before, 'origin/master']
  return _getCommitInfo(gh, repo, gitargs)
}

function getCommitInfoInTagRange(gh, repo, startTag, endTag) {
  var gitargs = [startTag + '..' + endTag]
  return _getCommitInfo(gh, repo, gitargs)
}

function _getCommitInfo(gh, repo, gitargs) {

  info = {
    commits: [],
    commitInfo: {}
  }

  var gitcmd = ['log', '--pretty="%H %ae"'].concat(gitargs)

  // Find all the commits included in this range.
  return git(repo, gitcmd).each(function(logline) {
    var bits = logline.split(' ')
    var commit = bits[0]
    info.commits.push(commit)
    info.commitInfo[commit] = {
      parents: [],
      children: [],
      author: emailToUsername(bits.slice(1).join(' ')),
      message: ''
    }
    // Find the parents of the commit, so we can build graph structure.
    return git(repo, ['rev-list', '--parents', '-n', '1', commit]).then(function(parents) {
      assert.equal(parents.length, 1)
      parents = parents[0].split(' ').slice(1)
      if (parents.length === 0) {
        console.warn('Warning: no parents for ' + commit)
      } else if (parents.length > 2) {
        console.warn('Warning: too many parents for ' + commit)
      }
      info.commitInfo[commit].parents = parents
    })
    // And get the commit message for future reference.
    .then(function() {
       return git(repo, ['log', '--pretty=%B', commit + '...' + commit + '~1']).then(function (msg) {
         info.commitInfo[commit].message = msg.join('\n')
       }).catch(function(err) {
         console.warn('Warning: could not get commit message for ' + commit)
       })
    })
  })
  // Now reverse the parent links, so we have child links as well.
  .then(function() {
     return P.each(info.commits, function(commit) {
       info.commitInfo[commit].parents.forEach(function(parentCommit) {
         if (info.commitInfo[parentCommit]) {
           info.commitInfo[parentCommit].children.push(commit)
         }
       })
     })
  })
  // Now we can find out which commits are covered by merges, and hence
  // don't need to be shown at the top level.
  .then(function() {
     return P.each(info.commits, function(commit) {
       commitInfo = info.commitInfo[commit];
       // Is it a merge commit?
       // If so, we'll assume it's right-hand parent was from a PR.
       if (commitInfo.parents.length === 2) {
         if (info.commitInfo[commitInfo.parents[1]]) {
           info.commitInfo[commitInfo.parents[1]].fromMerge = commit
         }
       }
       // If I have one child, and it was from a PR, then so was I.
       if (commitInfo.children.length === 1) {
         childFromMerge = info.commitInfo[commitInfo.children[0]].fromMerge
         if (childFromMerge) {
            commitInfo.fromMerge = childFromMerge
         }
       }
     })
  })
  // For all top-level commits, try to find the corresponding PR,
  // so we can get reviewers, milestone, etc.
  .then(function() {
     return P.each(info.commits, function(commit) {
       commitInfo = info.commitInfo[commit];
       if (commitInfo.fromMerge) {
         return
       }
       // Look for PR number references in the commit message.
       var patterns = [
         /#([0-9]+)/mg,
         /github.com\/[a-zA-Z0-9\/_-]+\/pull\/([0-9]+)/mg,
       ]
       var refs = []
       patterns.forEach(function(pattern) {
         var match = pattern.exec(commitInfo.message)
         while (match) {
           refs.push(parseInt(match[1], 10))
           var match = pattern.exec(commitInfo.message)
         }
       });
       return P.resolve().then(function () {
         if (refs.length === 0) {
           return findPullRequestForCommit(gh, repo, commit).then(function(pr) {
             if (pr) {
               return getPullRequestData(gh, repo, commit, pr).then(function(pr) {
                 commitInfo.fromPR = pr
               })
             }
           })
         } else {
           return P.each(refs, function(ref) {
             // Did we already find it from a previous ref?
             if (commitInfo.fromPR) {
               return
             }
             // Hopefully, it was a direct reference to a PR.
             return gh.pullRequests.get({ repo: repo.name, number: ref }).then(function (prs) {
               return prs[0];
             }).catch(function (err) {
               if (err.code !== 404) {
                 throw err;
               }
               // 404 means it was not a reference to a PR.
               // Maybe it was a reference to an issue instead?
               return findPullRequestForIssue(gh, repo, ref, commit).then(function(pr) {
                 if (!pr) { throw err; }
                 return pr
               })
             }).then(function(pr) {
               return getPullRequestData(gh, repo, commit, pr).then(function(pr) {
                 commitInfo.fromPR = pr
               })
             })
           })
         }
       }).then(function() {
         if (!commitInfo.fromPR) {
           if ((/Release v[0-9\.]+/).test(commitInfo.message.trim())) {
             commitInfo.ignore = true
           } else {
             console.warn('Warning: commit with no PR:', commit)
             console.warn('         ' + (commitInfo.message.split('\n')[0] || '<no commit msg>'))
           }
         } else {
           var pr = commitInfo.fromPR
           if (!pr.milestone) {
             console.warn('Warning: PR with no milestone:', pr.html_url)
           }
           if (!pr.reviewers || pr.reviewers.length === 0) {
             console.warn('Warning: PR committed without review:', pr.html_url)
           }
         }
       })
     })
  })
  // OK, we can return that graph of commit info
  .then(function () {
    return info
  })
}


function isDirectory(path) {
  try {
    return fs.statSync(path).isDirectory();
  } catch (err) {
    if (!err || err.code !== 'ENOENT') {
      throw err;
    }
    return false
  }
}

function sh(cmd, options) {
  cmd = cmd.join(' ');
  return new P(function(resolve, reject) {
    child_process.exec(cmd, options, function(err, stdout, stderr) {
      if (err) {
        return reject(err);
      }
      resolve(stdout.split('\n').map(function(ln) {
        return ln.trim();
      }).filter(function(ln) {
        return !!ln
      }));
    });
  });
}

function git(repo, args) {
  var repoDir = path.join(REPOS_DIR, repo.name);
  var cmd = ['git'];
  cmd.push.apply(cmd, args);
  return sh(cmd, { cwd: repoDir });
}


function findTrainTag(repo, trainNumber){
  return git(repo, ['tag', '-l', 'v[01].' + trainNumber + '.*']).then(function (tags) {
    if (!tags.length) {
      return null
    }
    // We assume point releases will be listed in chronological order, oldest first.
    // XXX TODO: actually parse them and check for this.
    return tags[tags.length - 1]
  })
}

function findPreviousTrainTag(repo, trainNumber) {
  if (trainNumber <= 1) {
    return null
  }
  return findTrainTag(repo, trainNumber - 1).then(function (tag) {
    if (tag) {
      return tag
    }
    return findPreviousTrainTag(repo, trainNumber - 1)
  })
}

function findPullRequestForIssue(gh, repo, issueNumber, commit) {
  // See if we can find any cross-referenced pull-requests.
  var accept = { Accept: 'application/vnd.github.mockingbird-preview' };
  return gh.issues.getEventsTimeline({ repo: repo.name, issue_number: issueNumber, headers: accept}).then(function(events) {
    var refedBy = []
    return P.each(events, function(evt) {
      if (evt.event === 'cross-referenced' && evt.source && evt.source.type === 'issue') {
        var bits = evt.source.issue.url.split('/')
        var prNum = parseInt(bits[bits.length - 1], 10)
        return gh.pullRequests.get({ repo: repo.name, number: prNum }).then(function(prs) {
          refedBy.push(prs[0])
        }).catch(function(err) {
           // 404 == not a PR
           if (err.code !== 404) {
             throw err;
           }
        })
      }
    }).then(function() {
      // If referenced by precisely one PR, that's the one.
      if (refedBy.length >= 1) {
        if (refedBy.length > 1) {
          console.warn('Warning: found multiple PRs for issue #' + issueNumber + ', arbitrarily picking the first');
        }
        return refedBy[0];
      }
      if (! commit) { return null; }
      return findPullRequestForCommit(gh, repo, commit);
    })
  })
}

function findPullRequestForCommit(gh, repo, commit) {
  // Fine, fine, we'll cheat.  Fetch the HTML of the page
  // for displaying the commit, and grep it for PR references.
  return got('https://github.com/' + repo.owner + '/' + repo.name + '/branch_commits/' + commit).then(function(res) {
    var pattern = /\/pull\/([0-9]+)/mg
    var refs = []
    var match = pattern.exec(res.body)
    while (match) {
      refs.push(parseInt(match[1], 10))
      var match = pattern.exec(commitInfo.message)
    }
    if (refs.length === 1) {
      return refs[0]
    }
    if (refs.length > 1) {
      console.warn('Warning: found multiple PRs for commit ' + commit);
    }
    return null;
  });
}

function getPullRequestData(gh, repo, mergeCommit, pr) {
  return P.resolve().then(function() {
    if (pr && pr.id) {
      return pr
    }
    return gh.pullRequests.get({ repo: repo.name, number: pr })
      .then(function (prs) {
        return prs[0]
      })
  }).then(function (pr) {
    return prToMilestone(gh, repo, pr).then(function (milestone) {
      pr.milestone = milestone
    }).then(function () {
      // Let's figure out who was involved in the PR.
      pr.submitter = pr.user.login
      pr.reviewers = {}
      pr.commenters = {}
      return gh.pullRequests.getComments({ repo: repo.name, number: pr.number }).each(function(cmt) {
        // We collect all commenters.
        // Anyone who left an r+ comment is also a reviewer.
        pr.commenters[cmt.user.login] = true
        if (/r\+/.exec(cmt.body)) {
          pr.reviewers[cmt.user.login] = true
        }
      }).then(function() {
        // There are also issue-level comments, if not left as part of an explicit review.
        return gh.issues.getComments({ repo: repo.name, number: pr.number }).each(function(cmt) {
          pr.commenters[cmt.user.login] = true
          if (/r\+/.exec(cmt.body)) {
            pr.reviewers[cmt.user.login] = true
          }
        })
      }).then(function() {
        // The merger was a reviewer
        if (pr.merged_by && pr.merged_by.login) {
          pr.reviewers[pr.merged_by.login] = true
        }
        // Anyone assigned but not the author, is a reviewer,
        // as long as they actually commented in some fashion.
        pr.assignees.forEach(function(user) {
          if (pr.commenters[user.login]) {
            pr.reviewers[user.login] = true
          }
        })
      }).then(function() {
        // There's the new, explicit "reviews" api but we don't always use it.
        var accept = { Accept: 'application/vnd.github.black-cat-preview' };
        return gh.pullRequests.getReviews({ repo: repo.name, number: pr.number, headers: accept}).each(function(review) {
          pr.reviewers[review.user.login] = true
        })
      }).then(function() {
        // Other metadata is in the merge commit.
        return gh.gitdata.getCommit({ repo: repo.name, sha: mergeCommit }).each(function(commit) {
          // The author and commiter are potential reviwers
          if (commit.author && commit.author.email) {
            pr.reviewers[emailToUsername(commit.author.email, pr.submitter)] = true
          }
          if (commit.committer && commit.committer.email) {
            pr.reviewers[emailToUsername(commit.committer.email, pr.submitter)] = true
          }
          // And the commit message might mention r=some,people
          if (commit.message) {
            var match = /r=([@a-zA-Z0-9_,-]+)/.exec(commit.message)
            if (match) {
              match[1].split(',').forEach(function(username) {
                while (username[0] === '@') {
                  username = username.substr(1)
                }
                pr.reviewers[username] = true
              })
            }
          }
        })
      }).then(function() {
        // XXX TODO: look for new "review" metadata on github
      }).then(function() {
        // However, the submitter themselves is never a reviewer.
        delete pr.reviewers[pr.submitter]
      })
    }).then(function () {
      pr.reviewers = Object.keys(pr.reviewers).filter(function (x) { return x })
      pr.commenters[pr.submitter] = true
      pr.reviewers.forEach(function(reviewer) {
        pr.commenters[reviewer] = true
      })
      pr.commenters = Object.keys(pr.commenters).filter(function (x) { return x })
      return pr
    })
  })
}

function isCoreContributor(username) {
  return (username in USERNAME_TO_EMAILS)
}

function getMilestoneIssueCounts(gh, titles) {
  if (typeof titles === 'string') {
    titles = [titles]
  }

  var milestoneIssueCounts = {}
  titles.forEach(function(title) {
    milestoneIssueCounts[title] = {
      open: 0,
      closed: 0,
      total: 0
    }
  })

  return P.each(REPOS, function(repo) {
    var done = {}
    return gh.issues.getMilestones({
      repo: repo.name,
      state: 'open'
    }).each(function(milestone) {
      if (milestone.title in milestoneIssueCounts) {
        milestoneIssueCounts[milestone.title].open += milestone.open_issues
        milestoneIssueCounts[milestone.title].closed += milestone.closed_issues
        milestoneIssueCounts[milestone.title].total += milestone.open_issues + milestone.closed_issues
        done[milestone.title] = true
      }
    }).then(function() {
      // Also look at closed milestones, but be careful
      // we don't get confused by ones that share a name.
      return gh.issues.getMilestones({
        repo: repo.name,
        state: 'closed'
      }).each(function(milestone) {
        if (milestone.title in milestoneIssueCounts && !(milestone.title in done)) {
          milestoneIssueCounts[milestone.title].open += milestone.open_issues
          milestoneIssueCounts[milestone.title].closed += milestone.closed_issues
          milestoneIssueCounts[milestone.title].total += milestone.open_issues + milestone.closed_issues
          done[milestone.title] = true
        }
      })
    })
  })
  .then(function() {
    Object.keys(milestoneIssueCounts).forEach(function(title) {
      var stats = milestoneIssueCounts[title]
      stats.perc_remaining = Math.round(100 * stats.open / stats.total)
      stats.perc_complete = Math.round(100 * stats.closed / stats.total)
    })
    return milestoneIssueCounts
  })
}

module.exports = {
  REPOS: REPOS,
  TOP_LEVEL_REPO: TOP_LEVEL_REPO,
  USERNAME_TO_EMAILS: USERNAME_TO_EMAILS,
  EMAIL_TO_USERNAME: EMAIL_TO_USERNAME,
  GH: GH,
  REPOS_DIR: REPOS_DIR,
  emailToUsername: emailToUsername,
  prToMilestone: prToMilestone,
  ensureLocalRepos: ensureLocalRepos,
  getCommitAuthorsInDateRange: getCommitAuthorsInDateRange,
  getCommitInfoInDateRange: getCommitInfoInDateRange,
  getCommitInfoInTagRange: getCommitInfoInTagRange,
  isDirectory: isDirectory,
  sh: sh,
  git: git,
  findTrainTag: findTrainTag,
  findPreviousTrainTag: findPreviousTrainTag,
  getPullRequestData: getPullRequestData,
  isCoreContributor: isCoreContributor,
  getMilestoneIssueCounts: getMilestoneIssueCounts
}
