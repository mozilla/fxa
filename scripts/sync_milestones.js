/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */


// Script to ensure we have standard milestones across all of our repos.
// It treats the milestones on the "fxa" repository as canonical and
// duplicates them into all the other repos.


var ghlib = require('./ghlib.js')
var P = require('bluebird')


module.exports = {

  // Get the milestones on the top-level "fxa" repo.
  // These are the canonical set of active milestones.

  getTopLevelMilestones: function getTopLevelMilestones(gh) {
    return module.exports.getMilestonesByTitle(gh, ghlib.TOP_LEVEL_REPO)
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
  // top-level milestones, which must be in the format returned by
  // getMilestonesByTitle().

  syncMilestones: function syncMilestones(gh, repo, milestones) {
    return P.all([
      milestones,
      module.exports.getMilestonesByTitle(gh, repo)
    ]).spread(function(theirs, ours) {
      // Ensure each of the canonical milestones has a corresponding
      // milestone in this repo, creating and/or updating as necessary.
      return P.resolve(Object.keys(theirs)).each(function(title) {
        var theirMilestone = theirs[title]
        var ourMilestone = module.exports.findMatchingMilestone(title, ours)
        if (! ourMilestone) {
          // It doesn't exist at all, create it.
          if (theirMilestone.state === 'open') {
            console.log("Creating '" + title + "' in " + repo.name)
            return gh.issues.createMilestone({
              repo: repo.name,
              title: title,
              due_on: theirMilestone.due_on,
              description: theirMilestone.description
            })
          }
        } else {
          // unfortunately some milestones wound up with duplicate
          // feature numbers, so check if we found the right thing.
          if (theirMilestone.title !== ourMilestone.title) {
            if (theirs[ourMilestone.title]) {
              return
            }
          }
          // It already exists, see if we need to update it. 
          for (var k in {title: 1, due_on: 1, description: 1, state: 1}) {
            if (theirMilestone[k] !== ourMilestone[k]) {
              if (theirMilestone.title !== ourMilestone.title) {
                ours[theirMilestone.title] = ourMilestone
                delete ours[ourMilestone.title]
              }
              console.log("Updating '" + title + "' in " + repo.name)
              return gh.issues.updateMilestone({
                repo: repo.name,
                number: ourMilestone.number,
                title: theirMilestone.title,
                due_on: theirMilestone.due_on,
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
      // Look for any extra milestones on this repo but not
      // in the canonical list.  They might need to be closed.
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
  // This matches on "FxA-NNN" feature number if present in the title,
  // otherwise falls back to a simple string compare.

  findMatchingMilestone: function findMatchingMilestone(title, milestones) {
    if (milestones[title]) {
      return milestones[title]
    }
    var featureRE = /(FxA-\d+):.*/
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
      if (! milestone.due_on) {
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
    return module.exports.getTopLevelMilestones(gh).then(function(milestones) {
      return P.resolve(ghlib.REPOS).each(function(repo) {
        if (repo.name !== ghlib.TOP_LEVEL_REPO.name)  {
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
