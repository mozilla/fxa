/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */


// Script to check for unexpected collaborators in any of our repos.
// It takes the list of collaborators on the main 'fxa' repo as
// canonical, and prints a warning for collaborators on other repos
// who do not appear in this list.

var ghlib = require('./ghlib.js')
var P = require('bluebird')

module.exports = {

  getTopLevelCollaborators: function getTopLevelCollaborators(gh) {
    var repo = ghlib.TOP_LEVEL_REPO
    var collaborators = {}
    return gh.repos.getCollaborators({ repo: repo.name }).then(function(users) {
      return P.each(users, function(user) {
        collaborators[user.login] = true
      }).then(function() {
        return collaborators
      })
    })
  },

  auditCollaborators: function auditCollaborators(gh, collaborators, repo) {
    return gh.repos.getCollaborators({ repo: repo.name }).then(function(users) {
      return P.each(users, function(user) {
        if (! (user.login in collaborators)) {
          console.warn("Unexpected collaborator on " + repo.name + ": " + user.login)
        }
      })
    })
  }

}

if (require.main == module) {
  var gh = new ghlib.GH()
  var repos
  if (process.argv && process.argv.length > 2) {
    repos = process.argv.slice(2).map(function(nm) {
      return { owner: 'mozilla', name: nm }
    })
  } else {
    repos = ghlib.REPOS
  }
  return module.exports.getTopLevelCollaborators(gh).then(function(collabs) {
    P.resolve(repos).each(function(repo) {
      return module.exports.auditCollaborators(gh, collabs, repo)
    })
  }).catch(function(err) {
    console.log(err)
  })
}
