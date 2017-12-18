const net = require('net')
const socket = new net.Socket()

module.exports = {
  test: (host, port, timeout, callback) => {
    return test(host, port, timeout, callback)
  }
}

function test (host, port, timeout, callback) {
  if (typeof timeout === 'function' && !callback) {
    callback = timeout
    timeout = 10000
  }
  socket.setTimeout(timeout)
  socket.connect(port, host)

  socket.on('connect', () => {
    socket.destroy()
    return callback(null, true)
  })

  socket.on('error', (err) => {
    if (err) socket.destroy(); return callback(err, null)
  })

  socket.on('timeout', function (err) {
    if (err) console.log(err)
    socket.destroy()
    return callback(null, false)
  })
}
