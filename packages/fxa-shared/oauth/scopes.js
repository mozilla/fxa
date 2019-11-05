/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { URL } = require('url');

// These character ranges are from the OAuth RFC,
// https://tools.ietf.org/html/rfc6749#section-3.3
const VALID_SCOPE_VALUE = /^[\x21\x23-\x5B\x5D-\x7E]+$/;

const VALID_SHORT_NAME_VALUE = /^[a-zA-Z0-9_]+$/;
const VALID_FRAGMENT_VALUE = /^#[a-zA-Z0-9_]+$/;

/**
 * A `ScopeSet` object represents a set of validated scope string values,
 * against which we can perform various membership checks and set-like
 * operations such as:
 *
 *  - Checking whether one set of scope values wholly or partly
 *    contains another set.
 *
 *  - Filtering out scope values that are (or are not) implied
 *    by another set.
 *
 *  - Aggregating values into a single set.
 *
 * A quick note on some terminology:
 *
 *  - A "scope" is a string value representing a particular capabilty
 *    that can be granted to client applications.  Such strings can be
 *    in one of two forms:
 *
 *     - a "short-name scope" such as "profile" or "profile:email"
 *     - a "URL-format scope" such as "https://identity.mozilla.com/apps/sync"
 *
 *  - We say that a scope "implies" another scope if it represents
 *    a strictly more general capability.  For example:
 *
 *     - the scope "profile" implies "profile:email" and "profile:avatar",
 *       but does not imply "basket" or "profile:write".
 *
 *     - the scope "profile:write" implies "profile" and "profile:email:write",
 *       but does not imply "basket" or "basket:write".
 *
 *     - the scope "https://identity.mozilla.com/apps/sync" implies
 *       "https://identity.mozilla.com/apps/sync/bookmarks", but does not
 *       imply "https://identity.mozilla.com/apps/lockbox".
 *
 *  - If a scope A implies scope B, then we say that B is a "sub-scope"
 *    of A, and that A is an "implicant" of B.  Any scope value has a
 *    finite number of implicants.
 *
 *  - We group individual scope values into sets represented by the
 *    `ScopeSet` object.
 *
 * We expect that the `ScopeSet` class will be used to process user-provided
 * data, so it's important that it provides efficient operations that do
 * not open potential DoS vectors.  In particular, we need to ensure
 * linear-time-or-better membership testing and merging of multiple `ScopeSet`
 * instances.
 *
 * Performance is achieved by using a simple trick: for any given scope value,
 * we can pre-compute a finite set of all possible implicants.  This allows us
 * to implement "A implies B" as a simple string lookup for "A" in the set of
 * implicants of "B".
 *
 * The tradeoff here is memory usage, as we have to store the full
 * set of implicants for each scope value in the set.  We expect that this
 * will not be too problematic in practice, because the size of this set is
 * linear in the length of the scope value. A more memory-friendly approach
 * could use a trie-like data structure to efficiently store all implicants
 * with prefix compression, at the cost of significant code complexity.
 *
 */
class ScopeSet {
  constructor(scopes = []) {
    // To support efficient lookups, we store the set of scopes and
    // their fully-expanded set of implicants in a bi-directional mapping.
    //
    // In one direction, we map each scope in this ScopeSet to its full set of
    // implicants.  If the scope string `s` is in `this._scopesToImplicants`,
    // then `s` is a member of this ScopeSet, and the corresponding value gives
    // all possible scopes that might imply it.
    this._scopesToImplicants = {};

    // In the other direction, we map every implicant of a scope in this
    // ScopeSet to the set of scopes that it implies.  If the scope string
    // `s` is in `this._implicantsToScopes`, then `s` implies at least one
    // of the scopes in this ScopeSet, and the corresponding value gives all
    // of the scopes that it implies.
    this._implicantsToScopes = {};

    // Creating `ScopeSet` instances is then a simple matter of building
    // up that bi-directional mapping, one scope value at a time.
    for (const s of scopes) {
      this._addScope(s, new Set(getImplicantValues(s)));
    }
  }

  /*
   * Check whether this `ScopeSet` contains the given scope.
   *
   */
  _hasScope(scope) {
    return scope in this._scopesToImplicants;
  }

  /*
   * Check whether this `ScopeSet` contains one of the given scopes.
   *
   */
  _hasSomeScope(scopes) {
    for (const scope of scopes) {
      if (this._hasScope(scope)) {
        return true;
      }
    }
    return false;
  }

  /*
   * Check whether something in this `ScopeSet` is implied by
   * the given scope.
   *
   */
  _hasImplicant(scope) {
    return scope in this._implicantsToScopes;
  }

  /*
   * Check whether something in this `ScopeSet` is implied by
   * one of the given scopes.
   *
   */
  _hasSomeImplicant(scopes) {
    for (const scope of scopes) {
      if (scope in this._implicantsToScopes) {
        return true;
      }
    }
    return false;
  }

  /*
   * Iterate over the scopes in this `ScopeSet`, and their
   * corresponding sets of implicants.
   *
   */
  _iterScopes(cb) {
    for (const scope in this._scopesToImplicants) {
      cb(scope, this._scopesToImplicants[scope]);
    }
  }

  /*
   * Iterate over the implicants of this `ScopeSet`, and their
   * corresponding sets of implied scopes.
   *
   */
  _iterImplicants(cb) {
    for (const implicant in this._implicantsToScopes) {
      cb(implicant, this._implicantsToScopes[implicant]);
    }
  }

  /*
   * Iterate over the scopes in this `ScopeSet` that are implied by
   * the given scope.
   *
   */
  _iterImpliedScopes(implicant, cb) {
    const impliedScopes = this._implicantsToScopes[implicant];
    if (impliedScopes) {
      for (const impliedScope of impliedScopes) {
        cb(impliedScope);
      }
    }
  }

  /*
   * Search through the scopes in this `ScopeSet` to see whether
   * any matches the given predicate function.  The search terminates
   * at the first successful match.
   *
   */
  _searchScopes(cb) {
    for (const scope in this._scopesToImplicants) {
      if (cb(scope, this._scopesToImplicants[scope])) {
        return true;
      }
    }
    return false;
  }

  /*
   * Search through the implicants of this `ScopeSet` to see whether
   * any matches the given predicate function.  The search terminates
   * at the first successful match.
   *
   */
  _searchImplicants(cb) {
    for (const implicant in this._implicantsToScopes) {
      if (cb(implicant, this._implicantsToScopes[implicant])) {
        return true;
      }
    }
    return false;
  }

  /*
   * Add a scope to this `ScopeSet`.
   * The new scope may imply some scopes that are already in
   * the set, in which case the redundant scopes will be removed in
   * order to keep memory usage down and simplify further handling.
   *
   */
  _addScope(scope, implicants) {
    // If the scope is already implied by something in this `ScopeSet`,
    // then we can safely ignore it.
    if (this._hasSomeScope(implicants)) {
      return;
    }
    // If the new scope implies some scopes that are already in this
    // `ScopeSet`, then those scopes are now redundant and can be removed.
    this._iterImpliedScopes(scope, implied => {
      this._removeScope(implied);
    });
    // Add it into the bi-directional mapping.
    this._scopesToImplicants[scope] = implicants;
    for (const implicant of implicants) {
      if (! (implicant in this._implicantsToScopes)) {
        this._implicantsToScopes[implicant] = new Set();
      }
      this._implicantsToScopes[implicant].add(scope);
    }
  }

  /*
   * Remove a scope from this `ScopeSet`.
   *
   * This must maintain the bi-directional mapping between
   * scopes and their implicants.
   *
   */
  _removeScope(scope) {
    const implicants = this._scopesToImplicants[scope];
    for (const implicant of implicants) {
      const impliedScopes = this._implicantsToScopes[implicant];
      impliedScopes.delete(scope);
      if (impliedScopes.size === 0) {
        delete this._implicantsToScopes[implicant];
      }
    }
    delete this._scopesToImplicants[scope];
  }

  toString() {
    return this.toJSON().join(' ');
  }

  toJSON() {
    return this.getScopeValues();
  }

  /**
   * Get the list of scope strings in this `ScopeSet`.
   *
   */
  getScopeValues() {
    return Object.keys(this._scopesToImplicants);
  }

  /**
   * Get the list of all scope strings that imply a scope in this `ScopeSet`.
   *
   * This can be useful to reduce the operation of scope checking to
   * a simple string lookup.
   *
   */
  getImplicantValues() {
    return Object.keys(this._implicantsToScopes);
  }

  /**
   * Check whether this `ScopeSet` contains any scope values at all.
   *
   */
  isEmpty() {
    for (const _ in this._scopesToImplicants) {
      return false;
    }
    return true;
  }

  /**
   * Add scope values from another `ScopeSet`.
   *
   * `A.add(B)` modifies `A` in-place to add the scope values from `B`,
   * removing any redundant entries.
   *
   * Importantly, aggregating multiple `ScopeSet` instances into a single
   * set by repeatedly calling this method is linear in the number of
   * scope values being processed.  This means that it can be safely
   * used to aggregate user-provided data without hiding any "accidentally
   * quadratic" performance traps.
   *
   */
  add(other) {
    other = coerce(other)._iterScopes((scope, implicants) => {
      this._addScope(scope, implicants);
    });
  }

  /**
   * Check whether one set of scopes wholly contains another.
   *
   * A set of scopes `A` contains another set `B` if every scope value
   * in `B` is implied by some scope value in `A`.  In other words,
   * `A` represents a strictly more general set of capabilities
   * than `B`.
   *
   */
  contains(other) {
    return ! coerce(other)._searchScopes((scope, implicants) => {
      return ! this._hasSomeScope(implicants);
    });
  }

  /**
   * Check whether one set of scopes intersects with another.
   *
   * A set of scopes `A` intersects another set `B` if there is some scope
   * value in `B` that is implied by a scope value in `A`, or there is
   * some scope value in `A` that is implied by a scope value in `B`.
   *
   */
  intersects(other) {
    other = coerce(other);
    return (
      other._searchImplicants(implicant => {
        return this._hasScope(implicant);
      }) ||
      this._searchImplicants(implicant => {
        return other._hasScope(implicant);
      })
    );
  }

  /**
   * Find the subset of scopes from this `ScopeSet` that are implied
   * by another set.
   *
   * `A.filtered(B)` returns the largest subset of scope values
   * from `A` that are implied by some scope value in `B`.  It
   * returns a new `ScopeSet` instance.
   *
   * It's useful to think of `A.filtered(B)` as checking a set
   * of requested capabilities in `A` against a set of allowed
   * capabilities in `B`.  The result will be the subset of the
   * requested capabilities that are actually allowed.
   *
   * Note that it does *not* behave strictly like classical set
   * intersection, in that there may exist a scope implied by
   * both `A` and `B` which is not in `A.filtered(B)`.
   * Consider for example:
   *
   *    A = 'profile:email:write'
   *    B = 'profile'
   *
   *`A.filtered(B)` in this case will be empty, as 'profile' is a read-only
   * scope that cannot imply any ':write' scopes.  There is a scope that
   * is implied by both `A` and `B` ('profile:email') but since it is not
   * directly a member of `A`, it will not appear in the result.
   *
   */
  filtered(other) {
    other = coerce(other);
    const result = new ScopeSet();
    this._iterScopes((scope, implicants) => {
      if (other._hasSomeScope(implicants)) {
        result._addScope(scope, implicants);
      }
    });
    return result;
  }

  /**
   * Find the subset of scopes from this `ScopeSet` that are not implied
   * by another set.
   *
   * `A.difference(B)` returns the largest subset of scope values
   * from `A` that are *not* implied by a scope in `B`; these are
   * precisely those scope values that would have been removed by
   * `A.filtered(B)`. It returns a new `ScopeSet` object.
   *
   */
  difference(other) {
    other = coerce(other);
    const result = new ScopeSet();
    this._iterScopes((scope, implicants) => {
      if (! other._hasSomeScope(implicants)) {
        result._addScope(scope, implicants);
      }
    });
    return result;
  }

  /**
   * Get the combined set of scope values implied by either this `ScopeSet`
   * or another.
   *
   * `A.union(B)` returns the smallest set of scope values that are implied
   * either `A` or `B` (or both).  It returns a new `ScopeSet` object.
   *
   */
  union(other) {
    other = coerce(other);
    const result = new ScopeSet();
    this._iterScopes((scope, implicants) => {
      result._addScope(scope, implicants);
    });
    other._iterScopes((scope, implicants) => {
      result._addScope(scope, implicants);
    });
    return result;
  }
}

/**
 * A little helper function for coercing different
 * kinds of input data into a `ScopeSet` instance.
 *
 */
function coerce(scopes) {
  if (scopes instanceof ScopeSet) {
    return scopes;
  }
  // If we receive a string, assume it's a single scope.
  // We deliberately do not attempt to split the string on whitespace here,
  // because we want to force callers to explicitly choose between
  // exports.fromString() or exports.fromURLEncodedString depending on
  // what encoding they expect to have received the string in.
  if (typeof scopes === 'string') {
    return new ScopeSet([scopes]);
  }
  return new ScopeSet(scopes);
}

/**
 * An iterator yielding all implicants of the given scope value.
 *
 */
function getImplicantValues(value) {
  if (value.startsWith('https:')) {
    return getImplicantValuesForURLScope(value);
  } else {
    return getImplicantValuesForShortScope(value);
  }
}

/**
 * Our "short-name scopes" are things like:
 *
 *   * "openid"
 *   * "profile"
 *   * "profile:write"
 *   * "profile:display_name:write"
 *
 * The scope value is a colon-separated list of
 * alphanumeric strings.  The special value "write"
 * may appear as the last component to indicate write
 * access, otherwise access is read-only.
 *
 * Implication is essentially the prefix relationship
 * on the name components, with the additional rule
 * only "write" scopes can imply other "write" scopes.
 *
 */
function* getImplicantValuesForShortScope(value) {
  if (! VALID_SCOPE_VALUE.test(value)) {
    throw new Error('Invalid scope value: ' + value);
  }
  // Parse it into its colon-separated name components,
  // and handle the special "write" flag if present.
  let hasWrite = false;
  const names = value.split(':');
  names.forEach(name => {
    if (! VALID_SHORT_NAME_VALUE.test(name)) {
      throw new Error('Invalid scope value: ' + value);
    }
  });
  if (names[names.length - 1] === 'write') {
    hasWrite = true;
    names.pop();
    // Disallow "write" as a standalone scope.
    if (names.length === 0) {
      throw new Error('Invalid scope value: ' + value);
    }
  }
  // All prefixes of the name component list will imply this scope.
  // In addition, a read-only scope will be implied by the corresponding
  // write sope, but not vice-versa.
  while (names.length > 0) {
    yield names.join(':') + ':write';
    if (! hasWrite) {
      yield names.join(':');
    }
    names.pop();
  }
}

/**
 * Our "url-format scopes" are things like:
 *
 *   * "https://identity.mozilla.com/apps/oldsync"
 *   * "https://identity.mozilla.com/apps/oldsync/bookmarks#read"
 *
 * We'll accept basically any sanely-formed, canonicalized https://
 * URL, and scope implication boils down to checking whether one
 * URL is a child of another.
 *
 */
function* getImplicantValuesForURLScope(value) {
  if (! VALID_SCOPE_VALUE.test(value)) {
    throw new Error('Invalid scope value: ' + value);
  }
  const url = new URL(value);
  // Only https:// URLs are allowed.
  if (url.protocol !== 'https:') {
    throw new Error('Invalid scope value: ' + value);
  }
  // No credentials or query params are allowed.
  if (url.username || url.password || url.query) {
    throw new Error('Invalid scope value: ' + value);
  }
  // The pathname must be non-empty and not end in a slash.
  if (! url.pathname || url.pathname.endsWith('/')) {
    throw new Error('Invalid scope value: ' + value);
  }
  // The hash fragment must be alphnumeric.
  if (url.hash && ! VALID_FRAGMENT_VALUE.test(url.hash)) {
    throw new Error('Invalid scope value: ' + value);
  }
  // The URL must round-trip cleanly through a URL parse,
  // to avoid any ambiguity in parsing.
  if (url.href !== value) {
    throw new Error('Invalid scope value: ' + value);
  }
  // All parent resource URLs will imply this scope.
  // If it has a hash fragment, then this scope will also be
  // implied by parent URLs with that same hash fragment.
  const pathParts = url.pathname.split('/');
  while (pathParts.length > 1) {
    yield new URL(pathParts.join('/'), url).href;
    if (url.hash) {
      yield new URL(pathParts.join('/') + url.hash, url).href;
    }
    pathParts.pop();
  }
}

module.exports = {
  /**
   * Parse a list of strings into a Scope object.
   *
   */
  fromArray(scopesArray) {
    return new ScopeSet(scopesArray);
  },

  /**
   * Parse a space-delimited string into a Scope object.
   *
   * This function implements the semantics defined in RFC6749, where
   * the "scope" input string represents a space-delimited list of
   * case-sensitive strings identifying individual scope values.
   *
   */
  fromString(scopesString) {
    // Split the string by one or more space characters.
    return new ScopeSet(
      scopesString.split(/ +/).filter(scopeString => {
        return !! scopeString;
      })
    );
  },

  /**
   * Parse a url-encoded string into a Scope object.
   *
   * This function parses a Scope from a "scope" input string
   * that has been url-encoded, as you might receive in the query
   * parameter of an OAuth authorizaton request.  The list is thus
   * delimited by `+` rather than ` `, and any percent-encoded
   * characters in the scopes will be expanded.
   *
   */
  fromURLEncodedString(encodedScopesString) {
    // Split the string by a literal plus character.
    return new ScopeSet(
      encodedScopesString
        .split(/\+/)
        .filter(encodedScopeString => {
          return !! encodedScopeString;
        })
        .map(encodedScopeString => {
          return decodeURIComponent(encodedScopeString);
        })
    );
  },
};
