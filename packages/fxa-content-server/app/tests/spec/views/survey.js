/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

 import _ from 'underscore';
 import $ from 'jquery';
 import { assert } from 'chai';
 import View from 'views/survey';

 describe('views/survey', function() {
   var view;

   function createView(options) {
     var viewOptions = _.extend(
       {
         surveyURL: 'https://www.surveygizmo.com/s3/5541940/pizza',
         viewName: 'survey',
       },
       options || {}
     );
     return new View(viewOptions);
   }

   beforeEach(function() {
     view = createView();
     return view.render().then(function() {
       $('#container').html(view.el);
     });
   });

   afterEach(function() {
     view.remove();
     view.destroy();
     $('#container').empty();
   });


   describe('render', function() {
     it('renders template', function() {
       assert.ok($('.survey-wrapper').length);
     });

     it('shows the iframe', function() {
       view = createView();

       return view.render().then(() => {
         assert.lengthOf(view.$('iframe'), 1);
       });
     });
   });

   describe('afterRender', () => {
     beforeEach(() => {
       return view.afterRender();
     });
   });
 });
