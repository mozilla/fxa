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
         if (/^\+44/.test(num)) {
           return num;
         }
         return `+44${num}`;
       },
       pattern: /^(?:\+44)?\d{10,10}$/,
       prefix: '+44'
     },
     RO: {
       format(num) {
         // +40 7xx xxxxxx
         return num.slice(0, 3) + ' ' + num.slice(3, 6) + ' ' + num.slice(6, 12);
       },
       normalize(num) {
         // allow +40 country code prefix
         // as well as an extra 0 before the 7 prefix.
         const prefix = /^(\+40)?0?/;
         if (prefix.test(num)) {
           num = num.replace(prefix, '');
         }
         return `+40${num}`;
       },
       // +407xxxxxxxx, allow leading 0 for sloppiness.
       pattern: /^(?:\+40)?0?7\d{8,8}$/,
       // The country code is +40, all mobile phones have a 7 prefix.
       prefix: '+407'

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
       pattern: /^(\+?1)?[2-9]\d{9,9}$/, // allow for a +1 or 1 prefix before the area code, area codes are all 2-9
       prefix: '+1'
     }
   };

   // alias CA (Canada) to use the same info as the US.
   module.exports.CA = module.exports.US;
 });
