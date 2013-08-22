(function(window, document, undefined) {
	var primaryTextAttr = 'primary-text';
	var secondaryTextAttr = 'secondary-text';
	var locationAttr = 'location';

	var styleActiveAttr = 'active';
	var overlay;

	xtag.register('x-alert', {
		onInsert: function() {
			var self = this;
			var actionsSelector = '.x-alert-actions';
			var overlaySelector = '.x-alert-overlay';

			if (xtag.query(self, actionsSelector).length === 0) {
				self.innerHTML += '<div class="' + actionsSelector.substring(1) + '"></div>';
			}

			if (!overlay) {
				overlay = document.createElement('div');
				overlay.className = overlaySelector.substring(1);
				document.body.appendChild(overlay);
			}

			var actions = xtag.query(self, actionsSelector)[0];
			['secondary', 'primary'].forEach(function(type) {
				var selector = '.x-alert-' + type;

				// insert a primary and secondary button if not already present
				if (xtag.query(self, selector).length === 0 && self[type + 'Text']) {
					var button = document.createElement('a');
					button.href= '#' + type;
					button.className = selector.substring(1);
					button.innerHTML = self[type + 'Text'];

					actions.appendChild(button);
					button.addEventListener('click', function(event) {
						event.preventDefault();
						self.hide(type);
					});
				}
			});

			self.show();
		},

		setters: {
			primaryText: function(primaryText) {
				this.setAttribute(primaryTextAttr, primaryText);
			},

			secondaryText: function(secondaryText) {
				this.setAttribute(secondaryTextAttr, secondaryText);
			},

			location: function(location) {
				this.setAttribute(locationAttr, location);
			}
		},

		getters: {
			primaryText: function() {
				// defaults to OK
				return this.getAttribute(primaryTextAttr) || 'OK';
			},

			secondaryText: function() {
				return this.getAttribute(secondaryTextAttr);
			},

			location: function() {
				var location = this.getAttribute(locationAttr);

				// default location is center
				if (location !== 'top' && location !== 'bottom') {
					location = 'center';
				}

				return location;
			}
		},

		methods: {
			/**
			 * Shows this alert, triggering a show event.
			 */
			show: function() {
				var self = this;

				// only shown if not already shown
				if (!this.getAttribute(styleActiveAttr)) {
					this.setAttribute(styleActiveAttr, 'true');
					overlay.setAttribute(styleActiveAttr, 'true');

					// center the alert relative to the window
					self.style.left = ( window.innerWidth / 2 - self.offsetWidth / 2 ) + 'px';
					if (self.location === 'center') {
						self.style.top = ( window.innerHeight / 2 - self.offsetHeight / 2 ) + 'px';
					}

					xtag.fireEvent(self, 'show');
				}
			},

			/**
			 * Hides this alert, triggering a hide event.
			 */
			hide: function(type) {
				var self = this;

				// only hide if not already hidden
				if (this.getAttribute(styleActiveAttr)) {
					this.removeAttribute(styleActiveAttr);
					overlay.removeAttribute(styleActiveAttr);
					xtag.fireEvent(self, 'hide', { buttonType: type });
				}
			}
		}
	});
})(this, this.document);
