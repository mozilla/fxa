#!/usr/bin/env bash

echo "Restarting hekad via circus"

mkdir -p /home/app/hekad
if pgrep -f circusd
then
    circusctl restart hekad
else
    nohup /usr/bin/circusd --daemon /home/app/circus.ini > /home/app/circusd.log 2>&1 &
fi

echo "DONE"
