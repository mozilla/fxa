/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const P = require('bluebird')
const fs = require('fs');
const mustache = require('mustache');
const path = require('path');

const ghlib = require('./ghlib.js')

const template = fs.readFileSync(path.join(__dirname, 'templates', 'train_blog_post.mustache'), 'utf-8').toString();

var trainNumber = parseInt(process.argv[2]);
if (! trainNumber) {
  throw new Error('Usage: node ./scripts/train_summary.js <train-number>')
}

gh = new ghlib.GH()

// For now, only reporting on some specific top-level repos
// that get tagged as part of the train.

var TRAIN_REPOS = {
  'fxa-auth-server': {},
  'fxa-auth-mailer': {},
  'fxa-content-server': {},
  'fxa-auth-db-mysql': {},
  'fxa-oauth-server': {},
  'fxa-customs-server': {},
  'fxa-profile-server': {},
  'fxa-basket-proxy': {},
  'fxa-email-service': {},
}

console.warn("Updating repos...")
ghlib.ensureLocalRepos()
.then(function() {

  return P.each(ghlib.REPOS, function(repo) {
    // For now, we're only looking at repos we actually tag-and-release from.
    if (! (repo.name in TRAIN_REPOS)) {
      return
    }
    return ghlib.findTrainTag(repo, trainNumber).then(function(tag) {
      return ghlib.findPreviousTrainTag(repo, trainNumber).then(function (prevTag) {
        // No train cut on that repo this time around.
        if (!tag || !prevTag) {
            console.warn('Skipping ' + repo.name + ', no tag found...')
            return
        }
        console.warn('Examining ' + repo.name + '...')
        repoInfo = TRAIN_REPOS[repo.name]
        repoInfo.trainTag = tag
        return ghlib.getCommitInfoInTagRange(gh, repo, prevTag, tag).then(function(info) {
          repoInfo.commits = info.commits
          repoInfo.commitInfo = info.commitInfo
        })
      })
    })
  }).then(function () {
    var outfile = process.stdout

    var submittedByUser = {}
    var reviewedByUser = {}
    var commentedByUser = {}
    var milestoneCountsByTitle = {}
    const milestonesByTitle = [];
    const milestones = {};
    const contributors = [];
    const reposWithPRs = [];
    var totalPRs = 0
    var totalReviews = 0

    function incr(what, who) {
      if (! what[who]) {
        what[who] = 0
      }
      what[who] += 1
      return what[who]
    }

    function incrEach(what, whoList) {
      whoList.forEach(function (who) {
        return incr(what, who)
      })
    }

    // Gather all the commit stats, grouping by milestone.
    return P.each(Object.keys(TRAIN_REPOS), function(repoName) {
      var repoInfo = TRAIN_REPOS[repoName]
      if (!repoInfo.commits) {
        return
      }

      const prsHandled = new Set();

      return P.each(repoInfo.commits, function(commit) {
        commitInfo = repoInfo.commitInfo[commit];
        if (commitInfo.ignore) {
          return
        }

        if (!commitInfo.fromMerge) {
          // It's a top-level merge with reviewers, comments, etc.
          var milestone = 'No milestone';
          var prInfo = commitInfo.fromPR
          if (prInfo && prInfo.milestone) {
            milestone = prInfo.milestone.title
            incr(milestoneCountsByTitle, prInfo.milestone.title)
          }
          if (! milestones[milestone]) {
            milestones[milestone] = {
              name: milestone,
              prs: []
            }
          }
          if (prInfo) {
            if (prsHandled.has(prInfo.number)) {
              return;
            }

            milestones[milestone].prs.push({
              html_url: prInfo.html_url,
              message: commitInfo.message.split('\n')[0]
            })
            prsHandled.add(prInfo.number)

            incr(submittedByUser, prInfo.submitter)
            incrEach(reviewedByUser, prInfo.reviewers)
            incrEach(commentedByUser, prInfo.commenters)
          } /*else {
            currentCommitSummary.push('  * #<unknown> in ' + repoName)
            currentCommitSummary.push('      ' + commitInfo.message.replace(/\n/g,'\n      '))
          }*/
        }
      })
    })
    // Explicitly thank our community contributors, if any
    .then(function() {
      Object.keys(submittedByUser).forEach(function(username) {
        if (! ghlib.isCoreContributor(username)) {
          contributors.push({ username })
        }
      })
    })
    // Link to the changelogs for repos with changes
    .then(function() {
      return P.each(Object.keys(TRAIN_REPOS), function(repoName) {
        var repoInfo = TRAIN_REPOS[repoName]
        if (repoInfo.commits) {
          reposWithPRs.push({
            name: repoName,
            trainTag: repoInfo.trainTag
          })
        }
      })
    })
    // List some basic PR stats.
    .then(function () {
      Object.keys(submittedByUser).forEach(function(username) {
        totalPRs += submittedByUser[username]
      })
      Object.keys(reviewedByUser).forEach(function(username) {
        totalReviews += reviewedByUser[username]
      })
    })
    // List the features we contributed to, and their completion status.
    .then(function() {

      var titles = Object.keys(milestoneCountsByTitle)
      titles.sort()
      return ghlib.getMilestoneIssueCounts(gh, titles).then(function(milestoneIssueCounts) {
        var allCounts = Object.keys(milestoneIssueCounts).map(function(title) {
          return milestoneIssueCounts[title]
        })
        allCounts.push(milestoneCountsByTitle)
        var alignedNames = alignNames(titles)
        var alignedCounts = alignCounts.apply(null, allCounts)
        titles.forEach((title) => {
          if (title !== 'FxA-0: quality') {
            milestonesByTitle.push({
              title: alignedNames[title],
              closedIssues: milestoneIssueCounts[title].closed,
              percComplete: milestoneIssueCounts[title].perc_complete,
              totalIssues: milestoneIssueCounts[title].total,
            })
          }
        })
      })
    })
    .then(() => {
      const text = mustache.render(template, {
        author: 'XXX',
        authorUrl: 'XXX',
        contributors,
        milestones: sortMilestones(Object.keys(milestones)).map(milestone => milestones[milestone]),
        milestonesByTitle,
        repos: reposWithPRs,
        qualityCount: milestoneCountsByTitle['FxA-0: quality'],
        trainNumber,
      });

      outfile.write(text);
    })
  });
})
.catch(function(err) {
  console.error(err.stack || err);
  process.exit(1);
})


function alignNames(names /* ... */) {
  var maxNameLen = 0
  var alignedNames = {}
  Array.prototype.forEach.call(arguments, function(names) {
    names.forEach(function(name) {
      maxNameLen = Math.max(maxNameLen, name.length)
      alignedNames[name] = ''
    })
  })
  Object.keys(alignedNames).forEach(function(name) {
    alignedNames[name] = name + ':'
    var spaces = maxNameLen + 1 - name.length
    while (spaces > 0) {
      alignedNames[name] += ' '
      spaces--
    }
  })
  return alignedNames
}

function alignCounts(counts /* ... */) {
  var maxCount = 0
  var alignedCounts = {}
  Array.prototype.forEach.call(arguments, function(counts) {
    Object.keys(counts).forEach(function(key) {
      maxCount = Math.max(maxCount, counts[key])
      alignedCounts[counts[key]] = ''
    })
  })

  function digits(n) {
    d = 0
    while (n >= 1) {
      d++
      n = n / 10
    }
    return Math.max(d, 1)
  }

  Object.keys(alignedCounts).forEach(function(count) {
    var spaces = digits(maxCount) - digits(count)
    alignedCounts[count] = '' + count
    while (spaces) {
      alignedCounts[count] = ' ' + alignedCounts[count]
      spaces--
    }
  })
  return alignedCounts
}

// Try to put them in a sensible order.
// Nicely-formatted "FxA-NN: title" milestones go first in number order,
// followed by other things in alphabetical order.
function sortMilestones(milestones) {
  return milestones.sort(function(a, b) {
    if (a.indexOf('FxA-') === 0) {
      if (b.indexOf('FxA-') === 0) {
        return parseInt(a.split('-')[1], 10) - parseInt(b.split('-')[1], 10)
      }
      return -1
    }
    if (b.indexOf('FxA-') === 0) {
      return 1
    }
    if (b === '' || a < b) {
      return -1
    }
    return 1
  })
}
