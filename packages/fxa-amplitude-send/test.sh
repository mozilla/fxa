#!/bin/sh

TIME=`expr $(date +%s) \* 1000 - 60000`
SESSION="$TIME"

while read -r EVENT || [[ -n "$EVENT" ]]; do
  EVENT=`sed "s/__TIME__/$TIME/g" <<< "$EVENT"`
  EVENT=`sed "s/__SESSION__/$SESSION/g" <<< "$EVENT"`

  if [ "$EVENTS" = "" ]; then
    EVENTS="$EVENT"
  else
    EVENTS=`printf "$EVENTS\n$EVENT"`
  fi

  TIME=`expr $TIME + 1000`
done < ./fixtures.txt

export FXA_AMPLITUDE_HMAC_KEY="wibble"

./build/bin/python amplitude.py <<< "$EVENTS"

