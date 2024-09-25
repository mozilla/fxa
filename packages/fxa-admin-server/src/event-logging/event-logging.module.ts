/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
 const start = Date.now();
 let last = start;
 const l = (step: string) => {
   const tick = Date.now();
   console.log(`!!! event-logging-module:`, {
     step,
     delta: tick - last,
     elapsed: tick - start,
   });
   last = tick;
 };

 import { Module } from '@nestjs/common';
 l('@nestjs/common');

 import { EventLoggingService } from './event-logging.service';
 l('./event-logging.service');


@Module({
  providers: [EventLoggingService],
  exports: [EventLoggingService],
})
export class EventLoggingModule {}
