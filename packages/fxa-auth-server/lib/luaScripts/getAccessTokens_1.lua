local userId = KEYS[1]
local tokenIds = redis.call('smembers', userId)
local result = {}
if tokenIds then
  for _, tokenId in ipairs(tokenIds) do
    local t = redis.call('get', tokenId)
    if t then
      table.insert(result, t)
    else
      redis.call('srem', userId, tokenId);
    end
  end
end
return result
