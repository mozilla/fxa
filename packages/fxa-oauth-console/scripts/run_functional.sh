node_modules/.bin/start-selenium > /dev/null 2>&1 &
SEL=$!

sleep 3
node_modules/.bin/intern-runner config=tests/functional/intern

kill $SEL
wait
