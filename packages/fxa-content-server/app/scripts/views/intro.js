'use strict';

define([
  'views/base',
  'hgn!templates/intro'
  ],
  function(BaseView, IntroTemplate){
    var IntroView = BaseView.extend({
      template: IntroTemplate,
      className: 'intro'
    });

    return IntroView;
  }
);
