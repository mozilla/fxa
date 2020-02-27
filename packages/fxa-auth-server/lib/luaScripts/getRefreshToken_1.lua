local uid = KEYS[1]
local tokenId = ARGV[1]
return redis.call('hget', uid, tokenId)
