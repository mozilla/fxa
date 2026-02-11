local function empty(t)
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
