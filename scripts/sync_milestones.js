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
      // Ignore milestones exported from AHA.
      if (item.title.indexOf('Firefox ') === 0) return milestones;
      if (item.title.indexOf('Fx ') === 0) return milestones;
      if (item.title.indexOf('Parking Lot') !== -1) return milestones;
      milestones[item.title] = item
      return milestones
    }, {})
  },

  // Ensure the given milestones exist in the given repo.
  // The milestones must be as return by getMilestonesByTitle().

  syncMilestones: function syncMilestones(gh, repo, milestones) {
    return P.all([
      milestones,
      module.exports.getMilestonesByTitle(gh, repo)
    ]).spread(function(theirs, ours) {
      return P.resolve(Object.keys(theirs)).each(function(title) {
        if (!ours.hasOwnProperty(title)) {
          // It doesn't exist at all, create it.
          console.log("Creating " + title + " in " + repo);
          return gh.issues.createMilestone({
            repo: repo,
            title: title,
            due_on: theirs[title].due_on,
            description: theirs[title].description
          })
        } else {
          // It already exists, see if we need to update it. 
          for (var k in {due_on: 1, description: 1}) {
            if (theirs[title][k] !== ours[title][k]) {
              console.log("Updating " + title + " in " + repo);
              return gh.issues.updateMilestone({
                repo: repo,
                number: ours[title].number,
                title: title,
                due_on: theirs[title].due_on,
                description: theirs[title].description,
              })
            }
          }
        }
      }).then(function() {
        return [theirs, ours]
      })
    }).spread(function(theirs, ours) {
      return P.resolve(Object.keys(ours)).each(function(title) {
        if (!theirs.hasOwnProperty(title)) {
          console.warn("Extra milestone in " + repo + ": " + title)
        }
      })
    })
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
      var due = new Date(milestone.due_on)
      if (due < now) {
        if (milestone.open_issues > 0) {
          console.warn("Old milestone with open issues in " + repo + ": " + milestone.title)
        } else {
          console.warn("Closing old milestone in " + repo + ": " + milestone.title)
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
  return module.exports.getTopLevelMilestones(gh).then(function(milestones) {
    return P.resolve(GH.ALL_REPOS).each(function(repo) {
      if (repo !== GH.TOP_LEVEL_REPO)  {
        return module.exports.closeOldMilestones(gh, repo).then(function() {
          module.exports.syncMilestones(gh, repo, milestones)
        })
      }
    })
  }).catch(function(err) {
    console.log(err)
  })
}
