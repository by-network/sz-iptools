<<<<<<< HEAD
const fs = require('fs')
const exec = require('child_process').exec
const SzIPCalculator = require('../IPCalculator')

module.exports = {
  getInterfaces: (filter, options, callback) => {
    return getInterfaces(filter, options, callback)
  },
  getAddresses: (iface, options, callback) => {
    return getAddresses(iface, options, callback)
  },
  addAddress: (ip, netmask, dev, options, callback) => {
    return addAddress(ip, netmask, dev, options, callback)
  },
  delAddress: (ip, netmask, dev, options, callback) => {
    return delAddress(ip, netmask, dev, options, callback)
  },
  getDnsServers: (callback) => {
    return getDnsServers(callback)
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
      if (err && (!stdout && !stderr)) return callback(null, [])
      if (err) return callback(err)
      // Parses from command stdout
      parseInterfacesFromCmd(stdout.trim(), (err, ifaces) => {
        if (err) return callback(err, null)
        let promises = []
        for (let i = ifaces.length - 1; i >= 0; i--) {
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
 * @description Get network interfaces of linux server.
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
    options = {sudo: false}
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

/**
 * @name addAddress
 * @description Add a specific IPv4 address from network interface.
 * @param {string} ip IPv4 address without netmask
 * @param {string|number} netmask Netmask for the IP address
 * @param {string} dev Network interface target for add the IP address
 * @param {object} options - optional - Object containing options for request
 * @param {function} callback Callback function
 * @author Guilherme Somenzi <guilherme@somenzi.me>
 * @constructor (ip, netmask, dev, options, callback)
 * @constructor (ip, netmask, dev, callback)
 * @constructor (ip, dev, options, callback)
 * @constructor (ip, dev, callback)
 */
function addAddress (ip, netmask, dev, options, callback) {
  if ((typeof dev === 'function') && (!callback)) {
    callback = dev
    dev = netmask
    netmask = null
    options = {sudo: false}
  }
  if ((typeof options === 'function') && (typeof dev === 'object') && (!callback)) {
    callback = options
    options = dev
    dev = netmask
    netmask = null
  }
  if ((typeof options === 'function') && (typeof dev === 'string') && (!callback)) {
    callback = options
    options = dev
  }
  // Checks if ip passed already have netmask
  SzIPCalculator.getIpData(ip, (err, ipData) => {
    if (err) return callback(err, null)
    if (ipData.info.haveNetmask && netmask) return callback(new Error('IP address have netmask. Two netmasks informed.'))
    if (ipData.info.haveNetmask && !netmask) netmask = ipData.netmask.string
    if (ipData.info.haveNetmask) ip = ip.split('/')[0]
    // With right ip format, checks if is a valid ip address
    SzIPCalculator.isIPv4(ip + '/' + netmask, (err, validIpv4) => {
      if (err) return callback(err, null)
      if (!validIpv4) return callback(new Error('The IP address and the network mask does not form a valid IPv4 address: ' + ip + '/' + netmask))
      hasThisIp(ip, netmask, dev, (err, alreadyHasIp) => {
        if (err) return callback(err, null)
        // If already has the ip address
        if (alreadyHasIp) {
          getAddresses(dev, {sudo: false, getIpData: options.getIpData || false}, (err, addresses) => {
            if (err) return callback(err, null)
            return callback(null, addresses)
          })
          // If NOT has the ip address then add
        } else {
          mountCmd('ip addr add ' + ip + '/' + netmask + ' dev ' + dev, options, (err, cmd) => {
            if (err) return callback(err, null)
            exec(cmd, (err, stdout, stderr) => {
              if (err) return callback(err)
              getAddresses(dev, {sudo: false, getIpData: options.getIpData || false}, (err, addresses) => {
                if (err) return callback(err, null)
                return callback(null, addresses)
              })
            })
          })
        }
      })
    })
  })
}

/**
 * @name delAddress
 * @param {string} ip IPv4 address without netmask
 * @param {string|number} netmask Netmask for the IP address
 * @param {string} dev Network interface target for remove the IP address
 * @param {object} options - optional - Object containing options for request
 * @param {function} callback Callback function
 * @author Guilherme Somenzi <guilherme@somenzi.me>
 * @constructor (ip, netmask, dev, options, callback)
 * @constructor (ip, netmask, dev, callback)
 * @constructor (ip, dev, options, callback)
 * @constructor (ip, dev, callback)
 */
function delAddress (ip, netmask, dev, options, callback) {
  if ((typeof dev === 'function') && (!callback)) {
    callback = dev
    dev = netmask
    netmask = null
    options = {sudo: false}
  }
  if ((typeof options === 'function') && (typeof dev === 'object') && (!callback)) {
    callback = options
    options = dev
    dev = netmask
    netmask = null
  }
  if ((typeof options === 'function') && (typeof dev === 'string') && (!callback)) {
    callback = options
    options = dev
  }
  // Checks if ip passed already have netmask
  SzIPCalculator.getIpData(ip, (err, ipData) => {
    if (err) return callback(err, null)
    if (ipData.info.haveNetmask && netmask) return callback(new Error('IP address have netmask. Two netmasks informed.'))
    if (ipData.info.haveNetmask && !netmask) netmask = ipData.netmask.string
    if (ipData.info.haveNetmask) ip = ip.split('/')[0]
    // With right ip format, checks if is a valid ip address
    SzIPCalculator.isIPv4(ip + '/' + netmask, (err, validIpv4) => {
      if (err) return callback(err, null)
      if (!validIpv4) return callback(new Error('The IP address and the network mask does not form a valid IPv4 address: ' + ip + '/' + netmask))
      hasThisIp(ip, netmask, dev, (err, alreadyHasIp) => {
        if (err) return callback(err, null)
        // If already has the ip address
        if (alreadyHasIp) {
          mountCmd('ip addr del ' + ip + '/' + netmask + ' dev ' + dev, options, (err, cmd) => {
            if (err) return callback(err, null)
            exec(cmd, (err, stdout, stderr) => {
              if (err) return callback(err)
              getAddresses(dev, {sudo: false, getIpData: options.getIpData || false}, (err, addresses) => {
                if (err) return callback(err, null)
                return callback(null, addresses)
              })
            })
          })
          // If NOT has the ip address then add
        } else {
          getAddresses(dev, {sudo: false, getIpData: options.getIpData || false}, (err, addresses) => {
            if (err) return callback(err, null)
            return callback(null, addresses)
          })
        }
      })
    })
  })
}

/**
 * @name getDnsServers
 * @param {function} callback Callback function
 * @author Guilherme Somenzi <guilherme@somenzi.me>
 * @constructor (callback)
 */
function getDnsServers (callback) {
  fs.access('/etc/resolv.conf', fs.constants.R_OK, (err) => {
    if (err) return callback(new Error('Unable to access file /etc/resolv.conf. Permission denied.'), null)
    fs.readFile('/etc/resolv.conf', {encoding: 'utf8'}, (err, data) => {
      if (err) return callback(err, null)
      parseServersFromContent(data, (err, servers) => {
        if (err) return callback(err, null)
        return callback(null, servers)
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
      // Parses name and index
      // Docker interfaces have name@something
      let parsed = {index: lines[i][0].replace(':', ''), name: lines[i][1].replace(/.$/, '').split('@')[0]}
      // Parses mtu
      if ((lines[i].indexOf('mtu') > -1) && !isNaN(lines[i].indexOf('mtu') > -1)) parsed.mtu = parseInt(lines[i][lines[i].indexOf('mtu') + 1])
      // Parses qdisc
      if ((lines[i].indexOf('qdisc') > -1)) parsed.qdisc = lines[i][lines[i].indexOf('qdisc') + 1]
      // Parses state
      if ((lines[i].indexOf('state') > -1)) parsed.state = lines[i][lines[i].indexOf('state') + 1]
      // Parses mode
      if ((lines[i].indexOf('mode') > -1)) parsed.mode = lines[i][lines[i].indexOf('mode') + 1]
      // Parses group
      if ((lines[i].indexOf('group') > -1)) parsed.group = lines[i][lines[i].indexOf('group') + 1]
      // Parses master
      if ((lines[i].indexOf('master') > -1)) parsed.master = lines[i][lines[i].indexOf('master') + 1]
      let line2 = lines[i + 1].trim().split(/\s+/)
      parsed.type = line2[0].replace('link/', '')
      parsed.mac = line2[1]
      if ((line2.indexOf('brd') > -1)) parsed.brd = line2[line2.indexOf('brd') + 1]
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

function parseServersFromContent (content, callback) {
  let servers = []
  let lines = content.split('\n')
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim().substr(0, 10) === 'nameserver') servers.push(lines[i].trim().split(/\s+/)[lines[i].trim().split(/\s+/).length - 1])
  }
  return callback(null, servers)
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

function hasThisIp (ip, netmask, dev, callback) {
  getAddresses(dev, {}, (err, addresses) => {
    if (err) return callback(err, null)
    SzIPCalculator.convertNetmaskToCidr(netmask, (err, cidr) => {
      if (err) return callback(err, null)
      for (var i = 0; i < addresses.length; i++) {
        if (addresses[i] === ip + '/' + cidr) return callback(null, true)
      }
      return callback(null, false)
    })
  })
}
=======
const fs = require('fs')
const exec = require('child_process').exec
const SzIPCalculator = require('../IPCalculator')

module.exports = {
  getInterfaces: (filter, options, callback) => {
    return getInterfaces(filter, options, callback)
  },
  getAddresses: (iface, options, callback) => {
    return getAddresses(iface, options, callback)
  },
  addAddress: (ip, netmask, dev, options, callback) => {
    return addAddress(ip, netmask, dev, options, callback)
  },
  delAddress: (ip, netmask, dev, options, callback) => {
    return delAddress(ip, netmask, dev, options, callback)
  },
  getDnsServers: (callback) => {
    return getDnsServers(callback)
  },
  getNetworkManagerProcs: (callback) => {
    return getNetworkManagerProcs(callback)
  },
  killNetworkManagerProcs: (options, callback) => {
    return killNetworkManagerProcs(options, callback)
  },
  getDhclientProcs: (callback) => {
    return getDhclientProcs(callback)
  },
  killDhclientProcs: (iface, options, callback) => {
    return killDhclientProcs(iface, options, callback)
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
      if (err && (!stdout && !stderr)) return callback(null, [])
      if (err) return callback(err)
      // Parses from command stdout
      parseInterfacesFromCmd(stdout.trim(), (err, ifaces) => {
        if (err) return callback(err, null)
        let promises = []
        for (let i = ifaces.length - 1; i >= 0; i--) {
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
 * @description Get network interfaces of linux server.
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
    options = {sudo: false}
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

/**
 * @name addAddress
 * @description Add a specific IPv4 address from network interface.
 * @param {string} ip IPv4 address without netmask
 * @param {string|number} netmask Netmask for the IP address
 * @param {string} dev Network interface target for add the IP address
 * @param {object} options - optional - Object containing options for request
 * @param {function} callback Callback function
 * @author Guilherme Somenzi <guilherme@somenzi.me>
 * @constructor (ip, netmask, dev, options, callback)
 * @constructor (ip, netmask, dev, callback)
 * @constructor (ip, dev, options, callback)
 * @constructor (ip, dev, callback)
 */
function addAddress (ip, netmask, dev, options, callback) {
  if ((typeof dev === 'function') && (!callback)) {
    callback = dev
    dev = netmask
    netmask = null
    options = {sudo: false}
  }
  if ((typeof options === 'function') && (typeof dev === 'object') && (!callback)) {
    callback = options
    options = dev
    dev = netmask
    netmask = null
  }
  if ((typeof options === 'function') && (typeof dev === 'string') && (!callback)) {
    callback = options
    options = dev
  }
  // Checks if ip passed already have netmask
  SzIPCalculator.getIpData(ip, (err, ipData) => {
    if (err) return callback(err, null)
    if (ipData.info.haveNetmask && netmask) return callback(new Error('IP address have netmask. Two netmasks informed.'))
    if (ipData.info.haveNetmask && !netmask) netmask = ipData.netmask.string
    if (ipData.info.haveNetmask) ip = ip.split('/')[0]
    // With right ip format, checks if is a valid ip address
    SzIPCalculator.isIPv4(ip + '/' + netmask, (err, validIpv4) => {
      if (err) return callback(err, null)
      if (!validIpv4) return callback(new Error('The IP address and the network mask does not form a valid IPv4 address: ' + ip + '/' + netmask))
      hasThisIp(ip, netmask, dev, (err, alreadyHasIp) => {
        if (err) return callback(err, null)
        // If already has the ip address
        if (alreadyHasIp) {
          getAddresses(dev, {sudo: false, getIpData: options.getIpData || false}, (err, addresses) => {
            if (err) return callback(err, null)
            return callback(null, addresses)
          })
          // If NOT has the ip address then add
        } else {
          mountCmd('ip addr add ' + ip + '/' + netmask + ' dev ' + dev, options, (err, cmd) => {
            if (err) return callback(err, null)
            exec(cmd, (err, stdout, stderr) => {
              if (err) return callback(err)
              getAddresses(dev, {sudo: false, getIpData: options.getIpData || false}, (err, addresses) => {
                if (err) return callback(err, null)
                return callback(null, addresses)
              })
            })
          })
        }
      })
    })
  })
}

/**
 * @name delAddress
 * @param {string} ip IPv4 address without netmask
 * @param {string|number} netmask Netmask for the IP address
 * @param {string} dev Network interface target for remove the IP address
 * @param {object} options - optional - Object containing options for request
 * @param {function} callback Callback function
 * @author Guilherme Somenzi <guilherme@somenzi.me>
 * @constructor (ip, netmask, dev, options, callback)
 * @constructor (ip, netmask, dev, callback)
 * @constructor (ip, dev, options, callback)
 * @constructor (ip, dev, callback)
 */
function delAddress (ip, netmask, dev, options, callback) {
  if ((typeof dev === 'function') && (!callback)) {
    callback = dev
    dev = netmask
    netmask = null
    options = {sudo: false}
  }
  if ((typeof options === 'function') && (typeof dev === 'object') && (!callback)) {
    callback = options
    options = dev
    dev = netmask
    netmask = null
  }
  if ((typeof options === 'function') && (typeof dev === 'string') && (!callback)) {
    callback = options
    options = dev
  }
  // Checks if ip passed already have netmask
  SzIPCalculator.getIpData(ip, (err, ipData) => {
    if (err) return callback(err, null)
    if (ipData.info.haveNetmask && netmask) return callback(new Error('IP address have netmask. Two netmasks informed.'))
    if (ipData.info.haveNetmask && !netmask) netmask = ipData.netmask.string
    if (ipData.info.haveNetmask) ip = ip.split('/')[0]
    // With right ip format, checks if is a valid ip address
    SzIPCalculator.isIPv4(ip + '/' + netmask, (err, validIpv4) => {
      if (err) return callback(err, null)
      if (!validIpv4) return callback(new Error('The IP address and the network mask does not form a valid IPv4 address: ' + ip + '/' + netmask))
      hasThisIp(ip, netmask, dev, (err, alreadyHasIp) => {
        if (err) return callback(err, null)
        // If already has the ip address
        if (alreadyHasIp) {
          mountCmd('ip addr del ' + ip + '/' + netmask + ' dev ' + dev, options, (err, cmd) => {
            if (err) return callback(err, null)
            exec(cmd, (err, stdout, stderr) => {
              if (err) return callback(err)
              getAddresses(dev, {sudo: false, getIpData: options.getIpData || false}, (err, addresses) => {
                if (err) return callback(err, null)
                return callback(null, addresses)
              })
            })
          })
          // If NOT has the ip address then add
        } else {
          getAddresses(dev, {sudo: false, getIpData: options.getIpData || false}, (err, addresses) => {
            if (err) return callback(err, null)
            return callback(null, addresses)
          })
        }
      })
    })
  })
}

/**
 * @name getDnsServers
 * @description Gets DNS servers used on system. Parses from /etc/resolv/conf.
 * @param {function} callback Callback function
 * @author Guilherme Somenzi <guilherme@somenzi.me>
 * @constructor (callback)
 */
function getDnsServers (callback) {
  fs.access('/etc/resolv.conf', fs.constants.R_OK, (err) => {
    if (err) return callback(new Error('Unable to access file /etc/resolv.conf. Permission denied.'), null)
    fs.readFile('/etc/resolv.conf', {encoding: 'utf8'}, (err, data) => {
      if (err) return callback(err, null)
      parseServersFromContent(data, (err, servers) => {
        if (err) return callback(err, null)
        return callback(null, servers)
      })
    })
  })
}

/**
 * @name getNetworkManagerProcs
 * @description Gets an array of NetworkManager processes.
 * @param {function} callback Callback function
 * @author Guilherme Somenzi <guilherme@somenzi.me>
 * @constructor (callback)
 */
function getNetworkManagerProcs (callback) {
  getProcesses('NetworkManager', (err, procs) => {
    if (err) return callback(err, null)
    return callback(null, procs)
  })
}

/**
 * @name killNetworkManagerProcs
 * @description Tries to stop NetworkManager service and kill pendant processes. Returns array of NetworkManager processes after command.
 * @param {object} options - optional - Object containing options for request
 * @param {function} callback Callback function
 * @author Guilherme Somenzi <guilherme@somenzi.me>
 * @constructor (options, callback)
 * @constructor (callback)
 */
function killNetworkManagerProcs (options, callback) {
  let promises = []
  if (typeof options === 'function') {
    callback = options
    options = {sudo: false}
  }
  // STOP SERVICE
  let stopCmd = 'systemctl stop NetworkManager'
  exec('which systemctl', (err, stdout, stderr) => {
    if (err) stopCmd = 'service NetworkManager stop'
    mountCmd(stopCmd, options, (err, cmd) => {
      if (err) return callback(err, null)
      exec(cmd, (err, stdout, stderr) => {
        if (err) return callback(err, null)
        // Get pendent processes
        getNetworkManagerProcs((err, procs) => {
          if (err) return callback(err, null)
          if (procs.length > 0) {
            for (let i = 0; i < procs.length; i++) {
              promises.push(new Promise((resolve, reject) => {
                mountCmd('kill -9 ' + procs[i].pid, options, (err, cmd) => {
                  if (err) return reject(err)
                  exec(cmd, (err, stdout, stderr) => {
                    if (err) return reject(err)
                    return resolve(stdout)
                  })
                })
              }))
            }
            // Kill all processes
            Promise.all(promises)
              .then(res => {
                setTimeout(() => {
                  getNetworkManagerProcs((err, nmProcs) => {
                    if (err) return callback(err, null)
                    return callback(null, nmProcs)
                  })
                }, 500)
              })
              .catch(err => {
                return callback(err, null)
              })
          } else {
            return callback(null, [])
          }
        })
      })
    })
  })
}

/**
 * @name getDhclientProcs
 * @description Gets an array of dhclient processes.
 * @param {function} callback Callback function
 * @author Guilherme Somenzi <guilherme@somenzi.me>
 * @constructor (callback)
 */
function getDhclientProcs (callback) {
  getProcesses('dhclient', (err, procs) => {
    if (err) return callback(err, null)
    for (let i = 0; i < procs.length; i++) {
      procs[i].interface = procs[i].args[procs[i].args.length-1]
    }
    return callback(null, procs)
  })
}

/**
 * @name killDhclientProcs
 * @description Tries to kill dhclient processes for specific or all interfaces. Returns array of dhclient processes after command.
 * @param {object} options - optional - Object containing options for request
 * @param {function} callback Callback function
 * @author Guilherme Somenzi <guilherme@somenzi.me>
 * @constructor (interface, options, callback)
 * @constructor (interface, callback)
 */
function killDhclientProcs (iface, options, callback) {
  let promises = []
  if (typeof iface !== 'string') return callback(new TypeError('Error parsing interface name. You must to pass interface name to command.'))
  if (typeof options === 'function') {
    callback = options
    options = {sudo: false}
  }
  getDhclientProcs((err, procs) => {
    if (err) return callback(err, null)
    if (procs.length === 0) return callback(null, [])
    for (let i = 0; i < procs.length; i++) {
      if (procs[i].interface === iface || iface === 'all' || iface === '*') {
        promises.push(new Promise((resolve, reject) => {
          mountCmd('kill -9 ' + procs[i].pid, options, (err, cmd) => {
            if (err) return reject(err)
            exec(cmd, (err, stdout, stderr) => {
              if (err) return reject(err)
              return resolve(stdout)
            })
          })
        }))
      }
    }
    // Kill all processes
    Promise.all(promises)
      .then(res => {
        setTimeout(() => {
          getDhclientProcs((err, dhclientProcs) => {
            if (err) return callback(err, null)
            return callback(null, dhclientProcs)
          })
        }, 500)
      })
      .catch(err => {
        return callback(err, null)
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
      // Parses name and index
      // Docker interfaces have name@something
      let parsed = {index: lines[i][0].replace(':', ''), name: lines[i][1].replace(/.$/, '').split('@')[0]}
      // Parses mtu
      if ((lines[i].indexOf('mtu') > -1) && !isNaN(lines[i].indexOf('mtu') > -1)) parsed.mtu = parseInt(lines[i][lines[i].indexOf('mtu') + 1])
      // Parses qdisc
      if ((lines[i].indexOf('qdisc') > -1)) parsed.qdisc = lines[i][lines[i].indexOf('qdisc') + 1]
      // Parses state
      if ((lines[i].indexOf('state') > -1)) parsed.state = lines[i][lines[i].indexOf('state') + 1]
      // Parses mode
      if ((lines[i].indexOf('mode') > -1)) parsed.mode = lines[i][lines[i].indexOf('mode') + 1]
      // Parses group
      if ((lines[i].indexOf('group') > -1)) parsed.group = lines[i][lines[i].indexOf('group') + 1]
      // Parses master
      if ((lines[i].indexOf('master') > -1)) parsed.master = lines[i][lines[i].indexOf('master') + 1]
      let line2 = lines[i + 1].trim().split(/\s+/)
      parsed.type = line2[0].replace('link/', '')
      parsed.mac = line2[1]
      if ((line2.indexOf('brd') > -1)) parsed.brd = line2[line2.indexOf('brd') + 1]
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

function parseServersFromContent (content, callback) {
  let servers = []
  let lines = content.split('\n')
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim().substr(0, 10) === 'nameserver') servers.push(lines[i].trim().split(/\s+/)[lines[i].trim().split(/\s+/).length - 1])
  }
  return callback(null, servers)
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

function getProcesses (name, callback) {
  if (typeof name === 'function') {
    callback = name
    name = null
  }
  let options = {sudo: false}
  if (typeof name === 'string' && name.length > 0) options.args = ['|grep', name]
  let procs = []
  mountCmd('ps ax', {sudo: false}, (err, cmd) => {
    if (err) return callback(err, null)
    exec(cmd, (err, stdout, stderr) => {
      if (err) return callback(err)
      let lines = stdout.trim().split('\n')
      for (let i = 0; i < lines.length; i++) {
        lines[i] = lines[i].trim().split(/\s+/)
        // Parses args
        let args = []
        if (lines[i].length > 5) {
          for (let k = 5; k < lines[i].length; k++) {
            args.push(lines[i][k])
          }
        }
        if (name) {
          // Filters by process name - after slashes, just name
          if (lines[i][4].trim().toLowerCase().split('/')[lines[i][4].trim().toLowerCase().split('/').length - 1] === name.toLowerCase()) procs.push({pid: lines[i][0], name: lines[i][4], args: args})
        } else {
          // If no filter, just push
          procs.push({pid: lines[i][0], name: lines[i][4], args: args})
        }
      }
      return callback(null, procs)
    })
  })
}

function hasThisIp (ip, netmask, dev, callback) {
  getAddresses(dev, {}, (err, addresses) => {
    if (err) return callback(err, null)
    SzIPCalculator.convertNetmaskToCidr(netmask, (err, cidr) => {
      if (err) return callback(err, null)
      for (var i = 0; i < addresses.length; i++) {
        if (addresses[i] === ip + '/' + cidr) return callback(null, true)
      }
      return callback(null, false)
    })
  })
}
>>>>>>> development
