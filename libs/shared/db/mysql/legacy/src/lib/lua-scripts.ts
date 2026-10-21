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
  getSessionTokens_1: `-- https://github.com/mozilla/fxa-auth-server/pull/2254 for packing scheme info
local REDIS_SESSION_TOKEN_PROPERTIES = {
  'lastAccessTime',
  'location',
  'uaBrowser',
  'uaBrowserVersion',
  'uaOS',
  'uaOSVersion',
  'uaDeviceType',
  'uaFormFactor'
}
local REDIS_SESSION_TOKEN_LOCATION_PROPERTIES = {
  'city',
  'state',
  'stateCode',
  'country',
  'countryCode'
}

local function unpackArray(keys, values)
  local result = {}
  for i, k in ipairs(keys) do
    result[k] = values[i]
  end
  return result
end

local function unpackSessions(value)
  if not value then
    return {}
  end
  local result = {}
  local tokens = cjson.decode(value)
  for id, values in pairs(tokens) do
    if type(values) == 'table' and values[1] then
      -- it's an array
      local token = unpackArray(REDIS_SESSION_TOKEN_PROPERTIES, values)
      if type(token.location) == 'table' then
        token.location = unpackArray(REDIS_SESSION_TOKEN_LOCATION_PROPERTIES, token.location)
      end
      result[id] = token
    else
      -- it's a value or object
      result[id] = values
    end
  end
  return result
end

local uid = KEYS[1]
local value = redis.call('get', uid)
local ok, sessions = pcall(unpackSessions, value)
if ok then
  return cjson.encode(sessions)
else
  redis.call('del', uid)
  return '{}'
end
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
  touchSessionToken_1: `-- https://github.com/mozilla/fxa-auth-server/pull/2254 for packing scheme info
local REDIS_SESSION_TOKEN_PROPERTIES = {
  'lastAccessTime',
  'location',
  'uaBrowser',
  'uaBrowserVersion',
  'uaOS',
  'uaOSVersion',
  'uaDeviceType',
  'uaFormFactor'
}
local REDIS_SESSION_TOKEN_LOCATION_PROPERTIES = {
  'city',
  'state',
  'stateCode',
  'country',
  'countryCode'
}

local function packToken(token, oldToken)
  local result = {}
  for i, name in ipairs(REDIS_SESSION_TOKEN_PROPERTIES) do
    if name == 'location' and type(token[name]) == 'table' then
      local location = token[name]
      local r = {}
      for j, n in ipairs(REDIS_SESSION_TOKEN_LOCATION_PROPERTIES) do
        r[j] = location[n]
      end
      result[i] = r
    else
      if token[name] then
        result[i] = token[name]
      else
        -- Note that \`token\` and \`oldToken\` are slightly different. \`token\`
        -- comes from input and is an json object vs \`oldToken\` which comes
        -- from redis and is an array of session values.
        result[i] = oldToken[i]
      end
    end
  end
  return result
end

local function decode(value)
  if not value then
    return {}
  end
  return cjson.decode(value)
end

local uid = KEYS[1]
local update = cjson.decode(ARGV[1])
local tokens = decode(redis.call('get', uid))

local oldToken = tokens[update.id]
if not oldToken then
    oldToken = {}
end

tokens[update.id] = packToken(update, oldToken)

local result = cjson.encode(tokens)
return redis.call('set', uid, result)
`,
};
