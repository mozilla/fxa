local userId = KEYS[1]
local tokenId = KEYS[2]
local token = ARGV[1]
local ttl = ARGV[2]
local args = {token}
if ttl then
  table.insert(args, 'PX')
  table.insert(args, ttl)
end
redis.call('set', tokenId, unpack(args))
return redis.call('sadd', userId, tokenId)
