/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */


// Script to ensure we have standard milestones across all of our repos.
// It treats the milestones on the "fxa" repository as canonical and
// duplicates them into all the other repos.


var ghlib = require('./ghlib.js')
var P = require('bluebird')

var ACTIVE_FEATURE_LABELS = {
  "designin": true,
  "defined": true,
  "building": true,
  "shipping": true,
  "measuring": true
}

var FEATURE_NUMBER_RE = /(FxA-\d+): .*/

module.exports = {

  // Synthesize the list of current milestones, based on issues
  // active in the fxa-features repo.

  getCurrentMilestones: function getCurrentMilestones(gh) {
    return gh.issues.getForRepo({ repo: 'fxa-features' }).filter(function(feature) {
      // Filter to only those features in an "active" state.
      for (var i = 0; i < feature.labels.length; i++) {
        if (ACTIVE_FEATURE_LABELS[feature.labels[i].name]) {
          return true
        }
      }
      return false
    }).map(function(feature) {
      // Figure out the name of the corresponding milestone.
      // We try to make it like `FxA-N: feature title`, where
      // N is either the issue number, or a legacy Aha! card number.
      var title
      var featureNumMatch = FEATURE_NUMBER_RE.exec(feature.title)
      if (! featureNumMatch) {
        title = 'FxA-' + feature.number + ': ' + feature.title
      } else {
        title = feature.title
      }
      return {
        title: title,
        state: 'open',
        description: feature.url
      }
    }).reduce(function(milestones, item) {
      milestones[item.title] = item
      return milestones
    }, {
      // This milestone should always exist.
      'FxA-0: quality': {
        title: 'FxA-0: quality',
        state: 'open',
        description: 'general quality improvements'
      }
    })
  },

  // Get the current set of milestones out of a repo, as a hash
  // mapping title to milestone info object.

  getMilestonesByTitle: function getTopLevelMilestones(gh, repo) {
    return gh.issues.getMilestones({
      repo: repo.name,
      state: 'open'
    }).reduce(function(milestones, item) {
      milestones[item.title] = item
      return milestones
    }, {}).then(function(milestones) {
      return gh.issues.getMilestones({
        repo: repo.name,
        state: 'closed'
      }).reduce(function(milestones, item) {
        if (! milestones[item.title]) {
          milestones[item.title] = item
        }
        return milestones
      }, milestones)
    })
  },

  // Ensure that a repo's milestones are consistent with the given
  // set of milestones, as returned by getCurrentMilestones().

  syncMilestones: function syncMilestones(gh, repo, milestones) {
    return P.all([
      milestones,
      module.exports.getMilestonesByTitle(gh, repo)
    ]).spread(function(theirs, ours) {
      // For each of their milestones, ensure we have a corresponding one.
      return P.resolve(Object.keys(theirs)).each(function(title) {
        var theirMilestone = theirs[title]
        var ourMilestone = module.exports.findMatchingMilestone(title, ours)
        if (!ourMilestone) {
          // It doesn't exist at all, create it.
          console.log("Creating '" + title + "' in " + repo.name)
          return gh.issues.createMilestone({
            repo: repo.name,
            title: title,
            description: theirMilestone.description
          })
        } else {
          // It already exists, see if we need to update it. 
          for (var k in {title: 1, description: 1, state: 1}) {
            if (theirMilestone[k] !== ourMilestone[k]) {
              console.log("Updating '" + title + "' in " + repo.name)
              if (theirMilestone.title !== ourMilestone.title) {
                ours[theirMilestone.title] = ourMilestone
                delete ours[ourMilestone.title]
              }
              return gh.issues.updateMilestone({
                repo: repo.name,
                number: ourMilestone.number,
                title: theirMilestone.title,
                description: theirMilestone.description,
                state: theirMilestone.state
              })
            }
          }
        }
      }).then(function() {
        return [theirs, ours]
      })
    }).spread(function(theirs, ours) {
      // For each of our milestones that's not in their list, close it out.
      return P.resolve(Object.keys(ours)).each(function(title) {
        if (! module.exports.findMatchingMilestone(title, theirs)) {
          if (ours[title].state !== 'closed') {
            if (ours[title].open_issues > 0) {
              console.warn("Extra milestone in " + repo.name + ": '" + title + "'")
            } else {
              console.warn("Closing extra milestone in " + repo.name + ": '" + title + "'")
              return gh.issues.updateMilestone({
                repo: repo.name,
                title: title,
                number: ours[title].number,
                state: 'closed'
              })
            }
          }
        }
      })
    })
  },

  // Find the milestone matching the one with the given title.
  // This matches on 'FxA-N' feature number if present in the title,
  // otherwise falls back to a simple string compare.

  findMatchingMilestone: function findMatchingMilestone(title, milestones) {
    var featureMatch = FEATURE_NUMBER_RE.exec(title)
    if (!featureMatch) {
      return milestones[title]
    }
    var feature = featureMatch[1]
    for (var k in milestones) {
      featureMatch = FEATURE_NUMBER_RE.exec(k)
      if (featureMatch && featureMatch[1] === feature) {
        return milestones[k]
      }
    }
    return undefined
  },

  // Close out any past-due milestones in a repo.
  // If the milestone still has issues in it, a warning is
  // printed instead.

  closeOldMilestones: function(gh, repo, now) {
    if (!now) {
      now = new Date();
    }
    return gh.issues.getMilestones({
      repo: repo.name,
      state: 'open'
    }).each(function(milestone) {
      if (!milestone.due_on) {
        return
      }
      var due = new Date(milestone.due_on)
      if (due < now) {
        if (milestone.open_issues > 0) {
          console.warn("Old milestone with open issues in " + repo.name + ": '" + milestone.title + "'")
        } else {
          console.warn("Closing old milestone in " + repo.name + ": '" + milestone.title + "'")
          return gh.issues.updateMilestone({
            repo: repo.name,
            number: milestone.number,
            title: milestone.title,
            due_on: milestone.due_on,
            description: milestone.description,
            state: 'closed'
          })
        }
      }
    })
  }

}

if (require.main == module) {
  gh = new ghlib.GH()
  return module.exports.closeOldMilestones(gh, ghlib.TOP_LEVEL_REPO).then(function() {
    return module.exports.getCurrentMilestones(gh).then(function(milestones) {
      return P.resolve(ghlib.REPOS).each(function(repo) {
        return module.exports.closeOldMilestones(gh, repo).then(function() {
          module.exports.syncMilestones(gh, repo, milestones)
        })
      })
    })
  }).catch(function(err) {
    console.log(err)
  })
}
