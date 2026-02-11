/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Mix into views that have a modal child view. Overrides showChildView
 * to show the child view in a modal.
 */
export default {
  initialize(options = {}) {
    this._createView = options.createView;
  },

  showChildView(ChildView, options = {}) {
    // an extra element is needed to attach the child view to, the extra element
    // is removed from the DOM when the view is destroyed. Without it, .child-view
    // is removed from the DOM and a 2nd child view cannot be displayed.
    this.$('.child-view').append('<div>');
    options.el = this.$('.child-view > div');
    const childView = this._createView(ChildView, options);
    return childView.render().then(() => this.trackChildView(childView));
  },
};
