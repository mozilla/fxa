/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

 /**
  * Country->phone number info.
  */
 define((require, exports, module) => {
   'use strict';

   /**
    * Each country entry should have the fields listed below.
    */
   /**
    * Format a normalized phone number, expects country code prefix.
    *
    * @method format
    * @param {String} num phone number to format.
    * @return {String} phone number formatted for country
    */

   /**
    * Normalize a string accepted by `pattern` to the full phone number,
    * including country code prefix.
    *
    * @method normalize
    * @param {String} num phone number to convert
    * @return {String} full phone number with country code prefix
    */

   /**
    * Pattern used for input validation
    *
    * @property pattern
    * @type {RegExp}
    */

   /**
    * Country code prefix
    * @property prefix
    * @type {String}
    */

   module.exports = {
     GB: {
       format (num) {
         // +44 1234 567890
         return num.slice(0, 3) + ' ' + num.slice(3, 7) + ' ' + num.slice(7, 14);
       },
       normalize (num) {
         if (/\+44/.test(num)) {
           return num;
         }
         return `+44${num}`;
       },
       pattern: /^(?:\+44)?\d{10,10}$/,
       prefix: '+44'
     },
     US: {
       format (num) {
         // Americans don't use country codes, drop the country code prefix
         // 123-456-7890
         return num.slice(2, 5) + '-' + num.slice(5, 8) + '-' + num.slice(8);
       },
       normalize (num) {
         if (/^\+1/.test(num)) {
           return num;
         } else if (/^1/.test(num) && num.length === 11) {
           return `+${num}`;
         }
         return `+1${num}`;
       },
       pattern: /^(?:\+?1)?\d{10,10}$/, // allow for a +1 or 1 prefix before the area code
       prefix: '+1'
     }
   };
 });
