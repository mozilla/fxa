-- https://github.com/mozilla/fxa-auth-server/pull/2254 for packing scheme info
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
        -- Note that `token` and `oldToken` are slightly different. `token`
        -- comes from input and is an json object vs `oldToken` which comes
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
