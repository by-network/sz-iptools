var exec = require('child_process').exec

module.exports = {
  getInterfaces: (filter, callback) => {
    return getInterfaces(filter, callback)
  }
}

// ===== PUBLIC METHODS =====

function getInterfaces (filter, callback) {
  if (typeof filter === 'function' && !callback) callback = filter; filter = {}
  if (typeof filter === 'string') filter = {name: filter}
  exec('ip link list', (err, stdout, stderr) => {
    if (err) return callback(err)
    parseLinks(stdout.trim(), (err, interfaces) => {
      let interfacesFiltradas = []
      if (err) return callback(err, null)
      if (JSON.stringify(filter) === JSON.stringify({})) return callback(null, interfaces)
      if (filter.hasOwnProperty('name')) {
        for (let i = 0; i < interfaces.length; i++) {
          if (interfaces[i].name.indexOf(filter.name) > -1) {
            interfacesFiltradas.push(interfaces[i])
          }
        }
      }
      return callback(null, interfacesFiltradas)
    })
  })
}

// ===== PRIVATE METHODS =====

function parseLinks (string, callback) {
  let interfaces = []
  let lines = string.split('\n')
  for (let i = 0; i < lines.length; i++) {
    lines[i] = lines[i].trim().split(/\s+/)
    if (!isNaN(lines[i][0].replace(':', ''))) {
      let parsed = {index: lines[i][0].replace(':', ''), name: lines[i][1].replace(/.$/, '')}
      if ((lines[i].indexOf('mtu') > -1) && !isNaN(lines[i].indexOf('mtu') > -1)) {
        parsed.mtu = parseInt(lines[i][lines[i].indexOf('mtu') + 1])
      }
      if ((lines[i].indexOf('qdisc') > -1)) {
        parsed.qdisc = lines[i][lines[i].indexOf('qdisc') + 1]
      }
      if ((lines[i].indexOf('state') > -1)) {
        parsed.state = lines[i][lines[i].indexOf('state') + 1]
      }
      if ((lines[i].indexOf('mode') > -1)) {
        parsed.mode = lines[i][lines[i].indexOf('mode') + 1]
      }
      if ((lines[i].indexOf('group') > -1)) {
        parsed.group = lines[i][lines[i].indexOf('group') + 1]
      }
      if ((lines[i].indexOf('master') > -1)) {
        parsed.master = lines[i][lines[i].indexOf('master') + 1]
      }
      let line2 = lines[i + 1].trim().split(/\s+/)
      parsed.type = line2[0].replace('link/', '')
      parsed.mac = line2[1]
      if ((line2.indexOf('brd') > -1)) {
        parsed.brd = line2[line2.indexOf('brd') + 1]
      }
      interfaces.push(parsed)
    }
  }
  return callback(null, interfaces)
}
