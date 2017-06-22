/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const assert = require('assert')
const P = require('bluebird')
const ghlib = require('./ghlib.js')

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
}

console.log("Updating repos...")
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
            console.log('Skipping ' + repo.name + ', no tag found...')
            return
        }
        console.log('Examining ' + repo.name + '...')
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

    outfile.write('\n\n')
    outfile.write('Hi All,\n')
    outfile.write('\n')
    outfile.write('This week we shipped FxA train-' + trainNumber + ' to production,\n')
    outfile.write('with the following highlights:\n')
    outfile.write('\n')

    var submittedByUser = {}
    var reviewedByUser = {}
    var commentedByUser = {}
    var milestonesByTitle = {}
    var commitsByMilestone = {}

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
      var currentCommitSummary = []
      return P.each(repoInfo.commits, function(commit) {
        commitInfo = repoInfo.commitInfo[commit];
        if (commitInfo.ignore) {
          return
        }
        if (!commitInfo.fromMerge) {
          // It's a top-level merge with reviewers, comments, etc.
          var milestone = '';
          var prInfo = commitInfo.fromPR
          if (prInfo && prInfo.milestone) {
            milestone = prInfo.milestone.title
            incr(milestonesByTitle, prInfo.milestone.title)
          }
          if (! commitsByMilestone[milestone]) {
            commitsByMilestone[milestone] = []
          }
          currentCommitSummary = []
          commitsByMilestone[milestone].push(currentCommitSummary)
          if (prInfo) {
            currentCommitSummary.push('  * #' + prInfo.number + ' in ' + repoName)
            currentCommitSummary.push('    ' + prInfo.html_url)
            currentCommitSummary.push('    Submitter: ' + prInfo.submitter)
            currentCommitSummary.push('    Reviewers: ' + prInfo.reviewers.join(','))
            currentCommitSummary.push('    Commenters: ' + prInfo.commenters.join(','))
            currentCommitSummary.push('      ' + commitInfo.message.replace(/\n/g,'\n      '))
            incr(submittedByUser, prInfo.submitter)
            incrEach(reviewedByUser, prInfo.reviewers)
            incrEach(commentedByUser, prInfo.commenters)
          } else {
            currentCommitSummary.push('  * #<unknown> in ' + repoName)
            currentCommitSummary.push('      ' + commitInfo.message.replace(/\n/g,'\n      '))
          }
        } else {
           // It's part of a broader PR, print summary indented for visual nesting.
           currentCommitSummary.push('        * ' + commitInfo.message.replace(/\n/g,'\n          '))
        }
      })
    })
    // Print out commit summaries grouped by milestone
    .then(function() {
      // Try to put them in a sensible order.
      // Nicely-formatted "FxA-NN: title" milestones go first in number order,
      // followed by other things in alphabetical order.
      var sortedMilestones = Object.keys(commitsByMilestone).sort(function(a, b) {
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
      sortedMilestones.forEach(function(milestone) {
        outfile.write('\n----\n')
        outfile.write(milestone || 'No milestone')
        outfile.write('\n')
        commitsByMilestone[milestone].forEach(function(commitSummary) {
          outfile.write('\n')
          outfile.write(commitSummary.join('\n'))
          outfile.write('\n')
        })
      })
    })
    // Explicitly thank our community contributors, if any
    .then(function() {
      var contributors = []
      Object.keys(submittedByUser).forEach(function(username) {
        if (! ghlib.isCoreContributor(username)) {
          contributors.push(username)
        }
      })
      if (contributors.length > 0) {
        outfile.write('\n\n')
        outfile.write('Special thanks go to the following community contributors,\n')
        outfile.write('who have code shipping in this train:\n')
        outfile.write('\n')
        contributors.forEach(function(username) {
          outfile.write('  * ' + username + '\n')
        })
      }
    })
    // Link to the changelogs for repos with changes
    .then(function() {
      outfile.write('\n\n')
      outfile.write('As always, you can find more details in the changelogs for each repo:\n')
      outfile.write('\n')
      return P.each(Object.keys(TRAIN_REPOS), function(repoName) {
        var repoInfo = TRAIN_REPOS[repoName]
        if (repoInfo.commits) {
          outfile.write('  https://github.com/mozilla/')
          outfile.write(repoName + '/blob/' + repoInfo.trainTag + '/CHANGELOG.md\n')
        }
      })
    })
    // Sign off as though this were written by a real person.
    .then(function () {
      outfile.write('\n\n')
      outfile.write('There are also detailed PR metrics included below if you\'re interested.\n')
      outfile.write('\n\n')
      outfile.write('  Cheers,\n')
      outfile.write('\n')
      outfile.write('    Ryan\n')
      outfile.write('\n')
    })
    // List some basic PR stats.
    .then(function () {
      outfile.write('\n\n')
      outfile.write('------------\n\n')
      var totalPRs = 0
      Object.keys(submittedByUser).forEach(function(username) {
        totalPRs += submittedByUser[username]
      })
      var totalReviews = 0
      Object.keys(reviewedByUser).forEach(function(username) {
        totalReviews += reviewedByUser[username]
      })
      outfile.write('This train we had a total of ' + totalPRs + ' PRs')
      outfile.write(' and ' + totalReviews + ' reviews.\n')
    })
    // List the features we contributed to, and their completion status.
    .then(function() {
      outfile.write('That includes work on the following features:\n')
      outfile.write('\n')
      var titles = Object.keys(milestonesByTitle)
      titles.sort()
      return ghlib.getMilestoneIssueCounts(gh, titles).then(function(milestoneIssueCounts) {
        var allCounts = Object.keys(milestoneIssueCounts).map(function(title) {
          return milestoneIssueCounts[title]
        })
        allCounts.push(milestonesByTitle)
        var alignedNames = alignNames(titles)
        var alignedCounts = alignCounts.apply(null, allCounts)
        return P.each(titles, function(title) {
          if (title !== 'FxA-0: quality') {
            var count = milestonesByTitle[title]
            var closedIssues = milestoneIssueCounts[title].closed
            var totalIssues = milestoneIssueCounts[title].total
            var percComplete = milestoneIssueCounts[title].perc_complete
            outfile.write('  * ' + alignedNames[title] + ' ')
            outfile.write(alignedCounts[count] + ' PRs ')
            outfile.write('(now ' + alignedCounts[closedIssues])
            outfile.write(' /' + alignedCounts[totalIssues])
            outfile.write(' = ' + alignedCounts[percComplete] + '% complete)\n')
          }
        })
        .then(function() {
          var count = milestonesByTitle['FxA-0: quality']
          outfile.write('\n')
          outfile.write('Along with ' + count + ' general quality improvements.\n')
        })
      })
    })
    // If enabled, this would list contributors by number of commits, prs, reviews.
    // This didn't seem helpful in practice but I'm leaving it here for now in
    // case we want to experiment with it any further.
    .then(function () {
      return true
      outfile.write('\n')
      outfile.write('And it\'s all thanks to the following contributors:\n')
      outfile.write('\n')
      var usernames = Object.keys(Object.assign(
        {},
        submittedByUser,
        reviewedByUser,
        commentedByUser
      ))
      usernames.sort()
      var alignedNames = alignNames(usernames)
      var alignedCounts = alignCounts(submittedByUser, reviewedByUser, commentedByUser, { 0: 0 })
      return P.each(usernames, function(username) {
        if (username === 'GitCop' || username === 'coveralls') {
          // lol nope
          return
        }
        outfile.write('  * ')
        outfile.write(alignedNames[username])
        outfile.write('  ')
        outfile.write(alignedCounts[submittedByUser[username] || 0] + ' PRs submitted, ')
        outfile.write(alignedCounts[reviewedByUser[username] || 0] + ' reviewed, ')
        outfile.write(alignedCounts[commentedByUser[username] || 0] + ' touched\n')
      })
    })
    // And a blank line, everyone loves trailing blank lines.
    .then(function() {
      outfile.write('\n')
    })
  });
})
.catch(function(err) {
  console.log(err.stack || err);
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
