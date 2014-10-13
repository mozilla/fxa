node_modules/.bin/bower install --config.interactive=false -s
if [ "$NODE_ENV" = "staging" ] ; then
  node_modules/.bin/ember build --environment=production
fi;
if [ "$NODE_ENV" = "production" ] ; then
  node_modules/.bin/ember build --environment=production
fi;
