#!/bin/sh

PATCH_SRC="lib/db/patch.js"
PREV_LEVEL=`grep '^module.exports.level = [1-9][0-9]*;$' "$PATCH_SRC" | cut -d ' ' -f 3 | cut -d ';' -f 1`

if [ "$PREV_LEVEL" = "" ]; then
  echo "Failed to parse $PATCH_SRC, aborting."
  exit 1
fi

if [ `expr $PREV_LEVEL` -lt 100 ]; then
  PREV_LEVEL_PADDED="0$PREV_LEVEL"
else
  PREV_LEVEL_PADDED="$PREV_LEVEL"
fi

NEW_LEVEL=`expr $PREV_LEVEL + 1`

if [ `expr $NEW_LEVEL` -lt 100 ]; then
  NEW_LEVEL_PADDED="0$NEW_LEVEL"
else
  NEW_LEVEL_PADDED="$NEW_LEVEL"
fi

FWD_SCHEMA="lib/db/schema/patch-$PREV_LEVEL_PADDED-$NEW_LEVEL_PADDED.sql"
REV_SCHEMA="lib/db/schema/patch-$NEW_LEVEL_PADDED-$PREV_LEVEL_PADDED.sql"

if [ -f "$FWD_SCHEMA" -o -f "$REV_SCHEMA" ]; then
  echo "Migration already exists for patch level $NEW_LEVEL, aborting."
  exit 1
fi

printf "Generating migration boilerplate for patch level $NEW_LEVEL..."

echo "SET NAMES utf8mb4 COLLATE utf8mb4_bin;\n" > "$FWD_SCHEMA"
echo "CALL assertPatchLevel('$PREV_LEVEL');\n" >> "$FWD_SCHEMA"
echo "-- TODO: Implement your forward migration here\n" >> "$FWD_SCHEMA"
echo "UPDATE dbMetadata SET value = '$NEW_LEVEL' WHERE name = 'schema-patch-level';" >> "$FWD_SCHEMA"

echo "-- SET NAMES utf8mb4 COLLATE utf8mb4_bin;\n" > "$REV_SCHEMA"
echo '-- -- TODO: Implement your *commented-out* reverse migration here\n' >> "$REV_SCHEMA"
echo "-- UPDATE dbMetadata SET value = '$PREV_LEVEL' WHERE name = 'schema-patch-level';" >> "$REV_SCHEMA"

sed -i '' "s/^module.exports.level = $PREV_LEVEL;\$/module.exports.level = $NEW_LEVEL;/" $PATCH_SRC

printf " done!\n\n"

git status

