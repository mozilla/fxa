local uid = KEYS[1]
local tokenId = ARGV[1]
local token = ARGV[2]
local recordLimit = tonumber(ARGV[3])
local expireTimespan = tonumber(ARGV[4])

local function hgetall(key)
  local kv = redis.call('hgetall', key)
  local result = {}
  local k
  for i, v in ipairs(kv) do
    if i % 2 == 1 then
      k = v
    else
      result[k] = v
    end
  end
  return result
end

local len = redis.call('hlen', uid)
if len >= 2 then
  -- prune tokens more than 1 day old
  local newToken = cjson.decode(token)
  local tokens = hgetall(uid)
  local toDel = {}
  for id, value in pairs(tokens) do
    local t = cjson.decode(value)
    if newToken["lastUsedAt"] - t["lastUsedAt"] > expireTimespan then
      table.insert(toDel, id)
      len = len - 1
    end
  end
  if len >= recordLimit then
    -- there's still too many tokens
    -- err on protecting the db from misbehavior
    redis.call('unlink', uid)
  elseif #toDel > 0 then
    redis.call('hdel', uid, unpack(toDel))
  end
end
redis.call('hset', uid, tokenId, token)
redis.call('pexpire', uid, expireTimespan)
