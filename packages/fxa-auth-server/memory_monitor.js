var inherits = require('util').inherits
var EventEmitter = require('events').EventEmitter

function MemoryMonitor(interval) {
  EventEmitter.call(this)
  this.interval = interval || 15000
  this.timer = null
}
inherits(MemoryMonitor, EventEmitter)

MemoryMonitor.prototype.start = function () {
  this.stop()
  this.timer = setTimeout(loop.bind(this), this.interval)
}

MemoryMonitor.prototype.stop = function () {
  clearTimeout(this.timer)
}

function loop() {
  this.emit('mem', process.memoryUsage())
  this.start()
}

module.exports = MemoryMonitor
