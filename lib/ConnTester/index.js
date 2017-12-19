const net = require('net')
const socket = new net.Socket()

module.exports = {
  test: (host, port, timeout, callback) => {
    return test(host, port, timeout, callback)
  }
}

// ===== PUBLIC METHODS =====

/**
 * @name test
 * @description Try to connect to TCP port. Pass true to callback if can connect, otherwise, false is passed
 * @param {string} host Host or IP to connect
 * @param {number} port TCP port to be tested on host
 * @param {number} timeout - optional - Timeout to wait for connection in milliseconds. After that, false is passed to callback. default is 10000
 * @param {function} callback Callback function
 * @author Guilherme Somenzi <guilherme@somenzi.me>
 */
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
