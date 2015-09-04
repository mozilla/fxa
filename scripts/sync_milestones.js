/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */


// Script to ensure we have standard milestones across all of our repos.
// It treats the milestones on the "fxa" repository as canonical and
// duplicates them into all the other repos.


GH = require('./gh.js')
P = require('bluebird')


module.exports = {

  getTopLevelMilestones: function getTopLevelMilestones(gh) {
    return module.exports.getMilestonesByTitle(gh, GH.TOP_LEVEL_REPO)
  },

  // Get the current set of milestones out of a repo, as a hash
  // mapping title to milestone info object.

  getMilestonesByTitle: function getTopLevelMilestones(gh, repo) {
    return gh.issues.getAllMilestones({
      repo: repo,
      state: 'open'
    }).reduce(function(milestones, item) {
      milestones[item.title] = item
      return milestones
    }, {})
  },

  // Ensure that a repo's milestones are consistent with the given
  // top-level milestones, which must be in the format returned by
  // getMilestonesByTitle().

  syncMilestones: function syncMilestones(gh, repo, milestones) {
    return P.all([
      milestones,
      module.exports.getMilestonesByTitle(gh, repo)
    ]).spread(function(theirs, ours) {
      return P.resolve(Object.keys(theirs)).each(function(title) {
        var theirMilestone = theirs[title]
        var ourMilestone = module.exports.findMatchingMilestone(title, ours)
        if (!ourMilestone) {
          // It doesn't exist at all, create it.
          console.log("Creating '" + title + "' in " + repo)
          return gh.issues.createMilestone({
            repo: repo,
            title: title,
            due_on: theirMilestone.due_on,
            description: theirMilestone.description
          })
        } else {
          // It already exists, see if we need to update it. 
          for (var k in {title: 1, due_on: 1, description: 1}) {
            if (theirMilestone[k] !== ourMilestone[k]) {
              console.log("Updating '" + title + "' in " + repo)
              if (theirMilestone.title !== ourMilestone.title) {
                ours[theirMilestone.title] = ourMilestone
                delete ours[ourMilestone.title]
              }
              return gh.issues.updateMilestone({
                repo: repo,
                number: ourMilestone.number,
                title: theirMilestone.title,
                due_on: theirMilestone.due_on,
                description: theirMilestone.description,
              })
            }
          }
        }
      }).then(function() {
        return [theirs, ours]
      })
    }).spread(function(theirs, ours) {
      return P.resolve(Object.keys(ours)).each(function(title) {
        if (!module.exports.findMatchingMilestone(title, theirs)) {
          if (ours[title].open_issues > 0) {
            console.warn("Extra milestone in " + repo + ": '" + title + "'")
          } else {
            console.warn("Deleting extra milestone in " + repo + ": '" + title + "'")
            return gh.issues.deleteMilestone({
              repo: repo,
              number: ours[title].number,
            })
          }
        }
      })
    })
  },

  // Find the milestone matching the one with the given title.
  // This matches on Aha! feature number if present in the title,
  // otherwise falls back to a simple string compare.

  findMatchingMilestone: function findMatchingMilestone(title, milestones) {
    var featureRE = /(FxA-\d+): .*/
    var featureMatch = featureRE.exec(title)
    if (!featureMatch) {
      return milestones[title]
    }
    var feature = featureMatch[1]
    for (var k in milestones) {
      featureMatch = featureRE.exec(k)
      if (featureMatch && featureMatch[1] === feature) {
        return milestones[k]
      }
    }
    return undefined
  },

  // Close out any past-due milestones in a repo.
  // If the milestone stuff has issues in it, a warning is
  // printed instead.

  closeOldMilestones: function(gh, repo, now) {
    if (!now) {
      now = new Date();
    }
    return gh.issues.getAllMilestones({
      repo: repo,
      state: 'open'
    }).each(function(milestone) {
      if (!milestone.due_on) {
        return
      }
      var due = new Date(milestone.due_on)
      if (due < now) {
        if (milestone.open_issues > 0) {
          console.warn("Old milestone with open issues in " + repo + ": '" + milestone.title + "'")
        } else {
          console.warn("Closing old milestone in " + repo + ": '" + milestone.title + "'")
          return gh.issues.updateMilestone({
            repo: repo,
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
  gh = new GH()
  return module.exports.closeOldMilestones(gh, GH.TOP_LEVEL_REPO).then(function() {
    return module.exports.getTopLevelMilestones(gh).then(function(milestones) {
      return P.resolve(GH.ALL_REPOS).each(function(repo) {
        if (repo !== GH.TOP_LEVEL_REPO)  {
          return module.exports.closeOldMilestones(gh, repo).then(function() {
            module.exports.syncMilestones(gh, repo, milestones)
          })
        }
      })
    })
  }).catch(function(err) {
    console.log(err)
  })
}
