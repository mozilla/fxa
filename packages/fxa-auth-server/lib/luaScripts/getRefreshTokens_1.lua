local uid = KEYS[1]
return redis.call('hgetall', uid)
