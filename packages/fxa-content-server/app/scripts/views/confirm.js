'use strict';

define([
  'views/base',
  'hgn!templates/confirm',
  'lib/session'
  ],
  function(BaseView, ConfirmTemplate, Session){
    var ConfirmView = BaseView.extend({
      template: ConfirmTemplate,
      className: 'confirm',

      context: function() {
        return {
          email: Session.email
        };
      }
    });

    return ConfirmView;
  }
);
