local tokenId = KEYS[1]
local _, _, prefix = tokenId:find('(%a+:)')
local value = redis.call('get', tokenId)
if value then
  local token = cjson.decode(value)
  redis.call('srem', prefix..token.userId, tokenId)
  return redis.call('del', tokenId)
end
