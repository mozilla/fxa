#!/bin/bash -ex

adb reverse tcp:3030 tcp:3030 # Content server
adb reverse tcp:9000 tcp:9000 # Auth server
adb reverse tcp:9010 tcp:9010 # OAuth server
adb reverse tcp:1111 tcp:1111 # Profile server
adb reverse tcp:5000 tcp:5000 # Sync server
