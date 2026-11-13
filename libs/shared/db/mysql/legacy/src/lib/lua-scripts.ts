/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// Embedded so consumers that compile this lib need no .lua asset copy.
// Keyed as <commandName>_<numberOfKeys>.
export const LUA_SCRIPTS: Record<string, string> = {
  getAccessToken_1: `return redis.call('get', KEYS[1])
`,
  getAccessTokens_1: `local userId = KEYS[1]
local ids = redis.call('smembers', userId)
local results = {}
if #ids > 0 then
  local toDel = {}
  local values = redis.call('mget', unpack(ids))
  for i, value in ipairs(values) do
    if value then
      table.insert(results, value)
    else
      table.insert(toDel, ids[i])
    end
  end
  if #toDel > 0 then
    redis.call('srem', userId, unpack(toDel));
  end
end
return results
`,
  pruneSessionTokens_1: `local function empty(t)
  for _ in pairs(t) do
    return false
  end
  return true
end

local function decode(value)
  if not value then
    return {}
  end
  return cjson.decode(value)
end

local uid = KEYS[1]
local tokens = decode(redis.call('get', uid))
local tokenIds = decode(ARGV[1])

for _, id in ipairs(tokenIds) do
  tokens[id] = nil
end

if empty(tokens) then
  return redis.call('del', uid)
else
  local result = cjson.encode(tokens)
  return redis.call('set', uid, result)
end
`,
};
