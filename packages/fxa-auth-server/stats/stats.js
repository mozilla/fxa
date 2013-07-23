module.exports = function (os) {

  function Stats(backend) {
    this.hostname = os.hostname()
    this.pid = process.pid
    this.backend = backend
  }

  Stats.prototype.mem = function (usage) {
    this.backend.mem(this.hostname, this.pid, usage)
  }

  Stats.prototype.request = function (event) {
    this.backend.request(this.hostname, this.pid, event)
  }

  return Stats
}
