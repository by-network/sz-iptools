const exec = require('child_process').exec
const SzIPCalculator = require('../IPCalculator')

module.exports = {
  getInterfaces: (filter, options, callback) => {
    return getInterfaces(filter, options, callback)
  },
  getAddresses: (iface, options, callback) => {
    return getAddresses(iface, options, callback)
  }
}

// ===== PUBLIC METHODS =====

/**
 * @name getInterfaces
 * @description Get network interfaces of the linux server.
 * @param {object|string} filter - optional - Object containing key -> value of network object to filter interfaces returned
 * @param {object} options - optional - Object containing options for request
 * @param {function} callback Callback function
 * @author Guilherme Somenzi <guilherme@somenzi.me>
 * @constructor (filter, options, callback)
 * @constructor (options, callback)
 * @constructor (callback)
 */
function getInterfaces (filter, options, callback) {
  // If filter is "all" return all interfaces
  if (typeof filter === 'string' && filter === 'all') filter = {}
  // If filter is string and not "all"
  if (typeof filter === 'string' && filter !== 'all') filter = {name: filter}
  // If just callback passed
  if ((typeof filter === 'function') && (typeof options === 'undefined') && (typeof callback === 'undefined')) {
    callback = filter
    filter = {}
    options = {}
  }
  // If just filter and callback passed
  if ((typeof options === 'function') && (typeof callback === 'undefined')) {
    callback = options
    options = {}
  }
  // Mount command
  mountCmd('ip link list', options, (err, cmd) => {
    if (err) return callback(err)
    // Exec command ip link list
    exec(cmd, (err, stdout, stderr) => {
      if (err) return callback(err)
      // Parses from command stdout
      parseInterfacesFromCmd(stdout.trim(), (err, ifaces) => {
        if (err) return callback(err, null)
        let promises = []
        for (let i = ifaces.length-1; i >= 0; i--) {
          // If name passed in filter object
          if (filter.hasOwnProperty('name') && ifaces[i].name.trim().indexOf(filter.name) === -1) {
            ifaces.splice(i, 1)
          } else if (filter.hasOwnProperty('type') && ifaces[i].type.trim().indexOf(filter.type) === -1) {
            ifaces.splice(i, 1)
          } else if (filter.hasOwnProperty('mtu') && ifaces[i].mtu !== parseInt(filter.mtu)) {
            ifaces.splice(i, 1)
          } else if (options.exclude && options.exclude.indexOf(ifaces[i].name.trim()) > -1) {
            // Removes excluded interfaces
            ifaces.splice(i, 1)
          } else {
            // Perpares getAddresses for all interfaces
            promises.push(new Promise((resolve, reject) => {
              getAddresses(ifaces[i].name, {getIpData: options.getIpData || null}, (err, addresses) => {
                if (err) return reject(err)
                return resolve(addresses)
              })
            }))
          }
        }
        // Gets all interfaces's addresses
        Promise.all(promises).then((res) => {
          for (let i = 0; i < ifaces.length; i++) {
            ifaces[i].addresses = res[i]
          }
          return callback(null, ifaces)
        }, (err) => {
          return callback(err, null)
        })
      })
    })
  })
}

/**
 * @name getAddresses
 * @description Get network interfaces of the linux server.
 * @param {string} iface Interface name
 * @param {object} options - optional - Object containing options for request
 * @param {function} callback Callback function
 * @author Guilherme Somenzi <guilherme@somenzi.me>
 * @constructor (iface, options, callback)
 * @constructor (iface, callback)
 */
function getAddresses (iface, options, callback) {
  // If just filter and callback passed
  if ((typeof options === 'function') && (typeof callback === 'undefined')) {
    callback = options
    options = {}
  }
  if (!options) options = {}
  if (!options.args) options.args = []
  options.args.push('| grep inet')
  mountCmd('ip addr list ' + iface, options, (err, cmd) => {
    if (err) return callback(err, null)
    exec(cmd, (err, stdout, stderr) => {
      if (err && (!stdout && !stderr)) return callback(null, [])
      if (err) return callback(err)
      parseAddressesFromCmd(stdout.trim(), options.getIpData || false, (err, addresses) => {
        if (err) return callback(err, null)
        return callback(null, addresses)
      })
    })
  })
}

// ===== PRIVATE METHODS =====

function parseInterfacesFromCmd (string, callback) {
  let ifaces = []
  let lines = string.split('\n')
  for (let i = 0; i < lines.length; i++) {
    lines[i] = lines[i].trim().split(/\s+/)
    if (!isNaN(lines[i][0].replace(':', ''))) {
      // Docker interfaces have name@something
      let parsed = {index: lines[i][0].replace(':', ''), name: lines[i][1].replace(/.$/, '').split('@')[0]}
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
      ifaces.push(parsed)
    }
  }
  return callback(null, ifaces)
}

function parseAddressesFromCmd (string, getIpData, callback) {
  let addresses = []
  let lines = string.split('\n')
  for (var i = 0; i < lines.length; i++) {
    let words = lines[i].trim().split(/\s+/)
    if (words[0] === 'inet') {
      if (getIpData) {
        SzIPCalculator.getIpData(words[1], (err, ipData) => {
          if (err) return callback(err, null)
          addresses.push(ipData)
        })
      } else {
        addresses.push(words[1])
      }
    }
  }
  return callback(null, addresses)
}

function mountCmd (command, options, callback) {
  let finalCmd = command
  // Increment with arguments
  if (options.args && typeof (options.args) === 'object') {
    for (var i = 0; i < options.args.length; i++) {
      finalCmd = finalCmd + ' ' + options.args[i].trim()
    }
  }
  // Increment with sudo if necessary
  if (options.sudo && (options.sudo === 'true' || options.sudo === true)) finalCmd = 'sudo ' + finalCmd
  return callback(null, finalCmd)
}
