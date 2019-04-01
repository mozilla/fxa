/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */


// Script to apply our standard set of labels to each repo, and
// do a bit of cleanup on the issues therein.

var ghlib = require('./ghlib.js')
var P = require('bluebird')

var COLORS = {
  STATUS: 'ededed',
  RESOLUTION: 'e6e6e6',
  ALERT: 'e11d21',
  WARNING: 'eb6420',
  INFO: '207de5',
  TARGET: 'd4c5f9',
  TARGET_QA_NEEDED: '55e09d',
  WELCOMING: '009800',
  // Rainbow colours for P0-P4.
  RED: 'dd1133',
  ORANGE: 'dd5511',
  YELLOW: 'dddd33',
  GREEN: '33dd33',
  BLUE: '3333dd',
}


// These are labels that should exist on every repo, and that
// we use as part of our development management process.

var STANDARD_LABELS = {
  // Issue lifecycle management labels, for waffle.
  'waffle:backlog': { color: COLORS.STATUS },
  'waffle:next': { color: COLORS.STATUS },
  'waffle:active': { color: COLORS.STATUS },
  'waffle:review': { color: COLORS.STATUS },
  'waffle:blocked': { color: COLORS.ALERT },
  // Issue deathcycle management labels, for reporting purposes.
  'resolved:fixed': { color: COLORS.RESOLUTION },
  'resolved:wontfix': { color: COLORS.RESOLUTION },
  'resolved:invalid': { color: COLORS.RESOLUTION },
  'resolved:duplicate': { color: COLORS.RESOLUTION },
  'resolved:worksforme': { color: COLORS.RESOLUTION },
  // For calling out really important stuff.
  'blocker': { color: COLORS.ALERT },
  'shipit': { color: COLORS.WARNING },
  'help wanted': { color: COLORS.WELCOMING },
  'WIP': { color: COLORS.INFO },
  // For grooming the backlog.
  'P0': { color: COLORS.RED },
  'P1': { color: COLORS.ORANGE },
  'P2': { color: COLORS.YELLOW },
  'P3': { color: COLORS.GREEN },
  'P4': { color: COLORS.BLUE },
  // Cross-cutting concerns that we need to account for when
  // working with or reviewing the issue.
  'i18n': { color: COLORS.INFO },
  'security': { color: COLORS.INFO },
  'ux': { color: COLORS.INFO },
  // Train-number labels, for scheduling.
  // XXX TODO: calculate appropriate set of train labels
  // based on current date, rather than hard-coding them here.
  'train-134': { color: COLORS.TARGET },
  'train-134:qa-needed': { color: COLORS.TARGET_QA_NEEDED },
  'train-135': { color: COLORS.TARGET },
  'train-135:qa-needed': { color: COLORS.TARGET_QA_NEEDED },
  'train-136': { color: COLORS.TARGET },
  'train-136:qa-needed': { color: COLORS.TARGET_QA_NEEDED },
  'train-137': { color: COLORS.TARGET },
  'train-137:qa-needed': { color: COLORS.TARGET_QA_NEEDED },
  'train-138': { color: COLORS.TARGET },
  'train-138:qa-needed': { color: COLORS.TARGET_QA_NEEDED },
  'train-139': { color: COLORS.TARGET },
  'train-139:qa-needed': { color: COLORS.TARGET_QA_NEEDED },
  'train-140': { color: COLORS.TARGET },
  'train-140:qa-needed': { color: COLORS.TARGET_QA_NEEDED },
  'train-141': { color: COLORS.TARGET },
  'train-141:qa-needed': { color: COLORS.TARGET_QA_NEEDED }
}


var WAFFLE_LABEL_ORDER = [
  'waffle:backlog',
  'waffle:next',
  'waffle:active',
  'waffle:review',
  'waffle:blocked'
]


var OBSOLETE_LABELS = {
  '❤❤': null,
  'z-later': null,
  'wontfix': null,
  'backlog': null,
  'good-first-bug': 'help wanted',
  'good first bug': 'good-first-bug',
  'strings': null,
  'waffle:now': 'waffle:active',
  'P1:now': null,
  'P2:next': null,
  'P3:backlog': null,
  'P5:wishlist': null,
  'P1': null,
  'P2': null,
  'P3': null,
  'P5': null,
  'train-93': null,
  'train-94': null,
  'train-95': null,
  'train-96': null,
  'train-97': null,
  'train-98': null,
  'train-99': null,
  'train-100': null,
  'train-101': null,
  'train-102': null,
  'train-103': null,
  'train-104': null,
  'train-105': null,
  'train-106': null,
  'train-107': null,
  'train-108': null,
  'train-109': null,
  'train-110': null,
  'train-111': null,
  'train-112': null,
  'train-113': null,
  'train-114': null,
  'train-115': null,
  'train-115:qa-needed': null,
  'train-116': null,
  'train-116:qa-needed': null,
  'train-117': null,
  'train-117:qa-needed': null,
  'train-118': null,
  'train-118:qa-needed': null,
  'train-119': null,
  'train-119:qa-needed': null,
  'train-120': null,
  'train-120:qa-needed': null,
  'train-121': null,
  'train-121:qa-needed': null,
  'train-122': null,
  'train-122:qa-needed': null,
  'train-123': null,
  'train-123:qa-needed': null,
  'train-124': null,
  'train-124:qa-needed': null,
  'train-125': null,
  'train-125:qa-needed': null,
  'train-126': null,
  'train-126:qa-needed': null,
  'train-127': null,
  'train-127:qa-needed': null,
  'train-128': null,
  'train-128:qa-needed': null,
  'train-129': null,
  'train-129:qa-needed': null,
  'train-130': null,
  'train-130:qa-needed': null,
  'train-131': null,
  'train-131:qa-needed': null,
  'train-132': null,
  'train-132:qa-needed': null,
  'train-133': null,
  'train-133:qa-needed': null
}


module.exports = {

  // Ensure that the given repo has our standard set of labels,
  // with appropriate colorization.

  makeStandardLabels: function makeStandardLabels(gh, repo) {
    return gh.issues.getLabels({ repo: repo.name }).then(function(labels) {
      var curLabels = {}
      labels.forEach(function(labelInfo) {
        curLabels[labelInfo.name] = labelInfo
      })
      var p = P.resolve(null);
      // Create any standard labels that are missing.
      Object.keys(STANDARD_LABELS).forEach(function(label) {
        if (! (label in curLabels)) {
          p = p.then(function() {
            console.log("Creating '" + label + "' on " + repo.name)
            return gh.issues.createLabel({
              repo: repo.name,
              name: label,
              color: STANDARD_LABELS[label].color
            })
          })
        } else if (curLabels[label].color !== STANDARD_LABELS[label].color) {
          p = p.then(function() {
            console.log("Updating '" + label + "' on " + repo.name)
            return gh.issues.updateLabel({
              repo: repo.name,
              oldname: label,
              name: label,
              color: STANDARD_LABELS[label].color
            })
          })
        }
      })
      return p;
    })
  },

  // Ensure that issues in the repo have appropriate standard labels applied,
  // based on any alternative labels they might have.

  fixupStandardLabels: function fixupStandardLabels(gh, repo) {
    var p = P.resolve(null);
    // Migrate any obsolete labels to their updated equivalent, if present.
    Object.keys(OBSOLETE_LABELS).forEach(function(oldLabel) {
      var newLabel = OBSOLETE_LABELS[oldLabel];
      if (newLabel) {
        p = p.then(function() {
          return gh.issues.getForRepo({
            repo: repo.name,
            labels: oldLabel,
            state: 'open'
          }).each(function (issue) {
            var labels = [];
            var hasNewLabel = false;
            issue.labels.forEach(function(labelInfo) {
              if (labelInfo.name !== oldLabel) {
                labels.push(labelInfo.name)
              }
              if (labelInfo.name === newLabel) {
                hasNewLabel = true;
              }
            })
            if (!hasNewLabel) {
              labels.push(newLabel);
              console.log("Updating " + oldLabel + " to " + newLabel + " on " + repo.name + " #" + issue.number);
              return gh.issues.edit({
                repo: repo.name,
                number: issue.number,
                labels: labels
              })
            }
          })
        })
      }
    });
    // Clear duplicate waffle labels, to ensure issues are only on 1 column.
    for (var i = WAFFLE_LABEL_ORDER.length - 1; i >= 0; i--) {
      p = p.then((function(i) {
        var waffleLabel = WAFFLE_LABEL_ORDER[i];
        return function() {
          return gh.issues.getForRepo({
            repo: repo.name,
            labels: waffleLabel,
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
              console.log("Clearing old waffle labels on " + repo.name + " #" + issue.number)
              return gh.issues.edit({
                repo: repo.name,
                number: issue.number,
                labels: labels
              })
            }
          })
        }
      })(i))
    }
    return p;
  },

  removeObsoleteLabels: function removeObsoleteLabels(gh, repo) {
    return gh.issues.getLabels({ repo: repo.name }).then(function(labels) {
      var curLabels = {}
      labels.forEach(function(labelInfo) {
        curLabels[labelInfo.name] = labelInfo
      })
      var p = P.resolve(null);
      // Delete any labels that should no longer be there.
      Object.keys(curLabels).forEach(function(label) {
        if (! (label in STANDARD_LABELS)) {
          var obsolete = false;
          // Waffle columns that no longer exist.
          if (label.indexOf('waffle:') === 0) {
            obsolete = true;
          }
          // Old Fx4X labels
          if (label.indexOf('Fx4') === 0) {
            obsolete = true;
          }
          // Old priority/status labels
          if (label in OBSOLETE_LABELS) {
            obsolete = true;
          }
          if (obsolete) {
            p = p.then(function() {
              console.log("Deleting '" + label + "' on " + repo.name)
              return gh.issues.deleteLabel({
                repo: repo.name,
                name: label
              });
            })
          }
        }
      })
      return p
    })
  }

}

if (require.main == module) {
  gh = new ghlib.GH()
  P.resolve(ghlib.REPOS).each(function(repo) {
    console.log("Checking labels in " + repo.name)
    return module.exports.makeStandardLabels(gh, repo)
      .then(function() {
        return module.exports.fixupStandardLabels(gh, repo)
      })
      .then(function() {
        return module.exports.removeObsoleteLabels(gh, repo)
      })
  }).catch(function(err) {
    console.log(err)
  })
}
