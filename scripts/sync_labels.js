/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */


// Script to apply our standard set of labels to each repo, and
// do a bit of cleanup on the issues therein.

GH = require('./gh.js')
P = require('bluebird')

COLORS = {
  WAFFLE: 'ededed',
  RESOLUTION: 'e6e6e6',
  THEME: 'eb6420',
  ALERT: 'e11d21',
  INFO: '207de5',
  TARGET: 'd4c5f9',
}


// These are labels that should exist on every repo, and that
// we use as part of our development management process.

STANDARD_LABELS = {
  // Issue lifecycle management labels, for waffle.
  'waffle:later': { color: COLORS.WAFFLE },
  'waffle:ready': { color: COLORS.WAFFLE },
  'waffle:progress': { color: COLORS.WAFFLE },
  'waffle:review': { color: COLORS.WAFFLE },
  // Issue deathcycle management labels, for reporting purposes.
  'resolved:fixed': { color: COLORS.RESOLUTION },
  'resolved:wontfix': { color: COLORS.RESOLUTION },
  'resolved:invalid': { color: COLORS.RESOLUTION },
  'resolved:duplicate': { color: COLORS.RESOLUTION },
  'resolved:worksforme': { color: COLORS.RESOLUTION },
  // Labels for active initiatives.  There are ongoing initiatives
  // like "chore" and "quality"
  'chore': { color: COLORS.THEME },
  'quality': { color: COLORS.THEME },
  // For calling out really important stuff.
  'blocker': { color: COLORS.ALERT },
  'good-first-bug': { color: '009800' },
  // Firefox version targets by which issues have to land.
  'Fx40': { color: COLORS.TARGET },
  'Fx41': { color: COLORS.TARGET },
  'Fx42': { color: COLORS.TARGET },
  'Fx43': { color: COLORS.TARGET },
  // Cross-cutting concerns that we need to account for when
  // working with or reviewing the issue.
  'strings': { color: COLORS.INFO },
  'security': { color: COLORS.INFO },
  'ux': { color: COLORS.INFO },
},


// These are old label names that we're maintaining for
// compatibility with existing workflows.

ALTERNATE_LABELS = {
  'waffle:later': [ 'z-later', 'backlog' ],
  'waffle:ready': [ 'ready' ],
  'waffle:progress': [ 'waffle:in progress', 'waffle:wip', 'WIP' ],
  'waffle:review': [ 'waffle:in review', 'waffle:needs review' ],
  'resolved:fixed': [ 'fixed' ],
  'resolved:wontfix': [ 'wontfix' ],
  'resolved:invalid': [ 'invalid' ],
  'resolved:duplicate': [ 'duplicate' ],
  'resolved:worksforme': [ 'worksforme' ],
  'good-first-bug': [ 'good first bug', 'help wanted' ],
  'chore': [ 'cleanup' ],
},

module.exports = {

  // Ensure that the given repo has our standard set of labels,
  // with appropriate colorization.

  makeStandardLabels: function makeStandardLabels(gh, repo) {
    return gh.issues.getLabels({ repo: repo }).then(function(labels) {
      var curLabels = {}
      labels.forEach(function(labelInfo) {
        curLabels[labelInfo.name] = labelInfo
      })
      var p = P.resolve(null);
      Object.keys(STANDARD_LABELS).forEach(function(label) {
        if (! (label in curLabels)) {
          p = p.then(function() {
            console.log("Creating '" + label + "' on " + repo)
            gh.issues.createLabel({
              repo: repo,
              name: label,
              color: STANDARD_LABELS[label].color
            })
          })
        } else if (curLabels[label].color !== STANDARD_LABELS[label].color) {
          p = p.then(function() {
            console.log("Updating '" + label + "' on " + repo)
            gh.issues.updateLabel({
              repo: repo,
              name: label,
              color: STANDARD_LABELS[label].color
            })
          })
        }
      })
      return p
    })
  },

  // Ensure that issues in the repo have appropriate standard labels applied,
  // based on any alternative labels they might have.

  fixupStandardLabels: function fixupStandardLabels(gh, repo) {
    var p = P.resolve(null);
    Object.keys(ALTERNATE_LABELS).forEach(function(stdLabel) {
      ALTERNATE_LABELS[stdLabel].forEach(function(altLabel) {
        p = p.then(function() {
          return gh.issues.repoIssues({
            repo: repo,
            labels: altLabel,
            filter: 'all',
            state: 'open'
          }).each(function (issue) {
            var labels = []
            issue.labels.forEach(function(labelInfo) {
              labels.push(labelInfo.name)
            })
            if (labels.indexOf(stdLabel) === -1) {
              labels.push(stdLabel)
              console.log("Adding '" + stdLabel + "' to " + repo + " #" + issue.number)
              return gh.issues.edit({
                repo: repo,
                number: issue.number,
                labels: labels
              })
            }
          })
        })
      })
    })
    return p;
  }

}

if (require.main == module) {
  gh = new GH()
  P.resolve(GH.ALL_REPOS).each(function(repo) {
    console.log("Checking labels in " + repo)
    return module.exports.makeStandardLabels(gh, repo)
      .then(function() {
        return module.exports.fixupStandardLabels(gh, repo)
      })
  }).catch(function(err) {
    console.log(err)
  })
}
