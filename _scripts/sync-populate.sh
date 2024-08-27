#!/bin/bash -e

# This will populate sync's tokenserver db with minimal state to ensure the token server is
# functional. Note, that sync will start and autmatically setup the database schemas. Once
# this happens, we can then run these inserts to setup the initial database state required
# for run sync to serve requrest from firefox.

_scripts/check-url.sh localhost:8000/__heartbeat__

RETRY=240
echo "waiting on tokenserver db to be created."
for i in $(eval echo "{1..$RETRY}"); do
    db=$(docker exec mydb mysql --silent --skip-column-names -e 'SELECT SCHEMA_NAME FROM information_schema.SCHEMATA WHERE SCHEMA_NAME = "tokenserver";')
    if [ -z "$db" ]; then
        echo -e -n "\r   ...no response, retry attempt $i of $RETRY"
        sleep 1
    else
        echo ""
        echo "sync db exists! populating..."

        docker exec mydb mysql -e 'INSERT INTO tokenserver.services (service, pattern) VALUES ("sync-1.5", "{node}/1.5/{uid}")'
        docker exec mydb mysql -e 'INSERT INTO tokenserver.nodes (service, node, available, capacity, current_load, backoff, downed, id) VALUES ((select id from tokenserver.services limit 1), "http://localhost:8000", 100, 100, 0, 0, 0, 800)'

        echo "done populating sync database state!"

        echo "token.nodes:"
        docker exec mydb mysql -e 'select * from tokenserver.nodes;'

        echo "tokenserver.services:"
        docker exec mydb mysql -e 'select * from tokenserver.services;'

        exit 0
    fi
done

echo "tokenserver database was never created.... giving up!"
