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
  WELCOMING: '009800'
}


// These are labels that should exist on every repo, and that
// we use as part of our development management process.

STANDARD_LABELS = {
  // Issue lifecycle management labels, for waffle.
  'waffle:backlog': { color: COLORS.WAFFLE },
  'waffle:next': { color: COLORS.WAFFLE },
  'waffle:now': { color: COLORS.WAFFLE },
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
  'good-first-bug': { color: COLORS.WELCOMING },
  'WIP': { color: COLORS.INFO },
  // Cross-cutting concerns that we need to account for when
  // working with or reviewing the issue.
  'strings': { color: COLORS.INFO },
  'security': { color: COLORS.INFO },
  'ux': { color: COLORS.INFO },
},


WAFFLE_LABEL_ORDER =[
  'waffle:backlog',
  'waffle:next',
  'waffle:now',
  'waffle:progress',
  'waffle:review'
]


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
            return gh.issues.createLabel({
              repo: repo,
              name: label,
              color: STANDARD_LABELS[label].color
            })
          })
        } else if (curLabels[label].color !== STANDARD_LABELS[label].color) {
          p = p.then(function() {
            console.log("Updating '" + label + "' on " + repo)
            return gh.issues.updateLabel({
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
    // Clear duplicate waffle labels, to ensure issues are only on 1 column.
    for (var i = WAFFLE_LABEL_ORDER.length - 1; i >= 0; i--) {
      p = p.then((function(i) {
        var waffleLabel = WAFFLE_LABEL_ORDER[i];
        return function() {
          return gh.issues.repoIssues({
            repo: repo,
            labels: waffleLabel,
            filter: 'all',
            state: 'open'
          }).each(function (issue) {
            var labels = []
            var oldLabelsCount = 0;
            issue.labels.forEach(function(labelInfo) {
              if (labelInfo.name === waffleLabel || labelInfo.name.indexOf("waffle:") !== 0) {
                labels.push(labelInfo.name)
              } else {
                oldLabelsCount++
              }
            })
            if (oldLabelsCount) {
              console.log("Clearing old waffle labels on " + repo + " #" + issue.number)
              return gh.issues.edit({
                repo: repo,
                number: issue.number,
                labels: labels
              })
            }
          })
        }
      })(i))
    }
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
