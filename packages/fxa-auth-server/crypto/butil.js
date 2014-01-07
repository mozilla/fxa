module.exports.buffersAreEqual = function buffersAreEqual(buffer1, buffer2) {
  var mismatch = buffer1.length - buffer2.length
  if (mismatch) {
    return false
  }
  for (var i = 0; i < buffer1.length; i++) {
    mismatch |= buffer1[i] ^ buffer2[i]
  }
  return mismatch === 0
}

module.exports.xorBuffers = function xorBuffers(buffer1, buffer2) {
  if (buffer1.length !== buffer2.length) {
    throw new Error(
      'XOR buffers must be same length (%d != %d)',
      buffer1.length,
      buffer2.length
    )
  }
  var result = Buffer(buffer1.length)
  for (var i = 0; i < buffer1.length; i++) {
    result[i] = buffer1[i] ^ buffer2[i]
  }
  return result
}
