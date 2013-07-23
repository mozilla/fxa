module.exports = function () {
	function noop() {}

	function NullStats() {}

	NullStats.prototype.mem = noop
	NullStats.prototype.request = noop

	return NullStats
}
