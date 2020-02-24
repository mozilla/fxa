local id = KEYS[1]
local exists = redis.call('exists', id)
if exists then
  redis.call('del', id)
end
return exists
